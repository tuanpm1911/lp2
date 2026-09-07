import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PageSpecSchema } from '@/lib/page-spec';
import { normalizeSlug } from '@/lib/published-page';

export const runtime='nodejs';

const PublishSchema=z.object({
  slug:z.string().min(2).max(100),
  brief:z.record(z.string(),z.unknown()).default({}),
  spec:PageSpecSchema,
  puckData:z.unknown()
});

export async function POST(request:Request){
  try{
    const parsed=PublishSchema.parse(await request.json());
    const slug=normalizeSlug(parsed.slug);
    if(slug.length<2){
      return NextResponse.json({error:'Slug không hợp lệ.'},{status:400});
    }

    const payload={
      version:1 as const,
      slug,
      publishedAt:new Date().toISOString(),
      brief:parsed.brief,
      spec:parsed.spec,
      puckData:parsed.puckData
    };

    const blob=await put(
      `published/${slug}.json`,
      JSON.stringify(payload),
      {
        access:'public',
        contentType:'application/json; charset=utf-8',
        addRandomSuffix:false,
        allowOverwrite:true
      }
    );

    const origin=new URL(request.url).origin;
    return NextResponse.json({
      ok:true,
      slug,
      publicUrl:`${origin}/share/${slug}`,
      storageUrl:blob.url,
      publishedAt:payload.publishedAt
    });
  }catch(error:any){
    console.error('publish error',error);
    const message=String(error?.message||'Không thể publish landing page.');
    const blobMissing=/blob|token|store|oidc|unauthorized|forbidden/i.test(message);
    return NextResponse.json({
      error:blobMissing
        ?'Vercel Blob chưa được kết nối đúng với project. Hãy tạo/kết nối Blob store trong Vercel Storage rồi publish lại.'
        :message
    },{status:500});
  }
}
