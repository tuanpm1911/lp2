import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime='nodejs';

const MAX_BYTES=8*1024*1024;
const ALLOWED=new Set(['image/jpeg','image/png','image/webp','image/avif']);

function safeName(name:string){
  const clean=name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');
  return clean||'image';
}

export async function POST(request:Request){
  try{
    const form=await request.formData();
    const file=form.get('file');
    if(!(file instanceof File)) return NextResponse.json({error:'Thiếu file ảnh.'},{status:400});
    if(!ALLOWED.has(file.type)) return NextResponse.json({error:'Chỉ hỗ trợ JPG, PNG, WebP hoặc AVIF.'},{status:400});
    if(file.size>MAX_BYTES) return NextResponse.json({error:'Ảnh tối đa 8MB.'},{status:400});

    const pathname=`assets/${Date.now()}-${safeName(file.name)}`;
    const blob=await put(pathname,file,{access:'public',addRandomSuffix:true});
    return NextResponse.json({ok:true,url:blob.url,pathname:blob.pathname,size:file.size,type:file.type});
  }catch(error:any){
    console.error('asset upload error',error);
    const message=String(error?.message||'Không thể upload ảnh.');
    return NextResponse.json({error:/blob|token|store|oidc|unauthorized|forbidden/i.test(message)?'Vercel Blob chưa được kết nối đúng với project.':message},{status:500});
  }
}
