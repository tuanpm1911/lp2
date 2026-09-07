import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime='nodejs';
export const maxDuration=60;

const RequestSchema=z.object({
  productName:z.string().min(1),
  audience:z.string().default(''),
  usp:z.string().default(''),
  tone:z.string().default('professional, modern'),
  brandColor:z.string().default('#2563eb'),
  assetType:z.enum(['hero','section','og']).default('hero'),
  concept:z.string().default(''),
  mode:z.enum(['draft','final']).default('draft')
});

function specFor(assetType:'hero'|'section'|'og',mode:'draft'|'final'){
  if(assetType==='og') return {size:'1200x630',quality:mode==='final'?'high':'medium',count:mode==='final'?1:2};
  if(assetType==='section') return {size:'1536x1024',quality:mode==='final'?'high':'medium',count:mode==='final'?1:2};
  return {size:mode==='final'?'2048x1152':'1536x1024',quality:mode==='final'?'high':'medium',count:mode==='final'?1:2};
}

function promptFor(input:z.infer<typeof RequestSchema>){
  const placement=input.assetType==='hero'
    ?'A premium landing-page hero visual. Keep the main subject primarily on the RIGHT half and preserve generous clean negative space on the LEFT for headline, supporting copy and CTA. The composition must remain strong after responsive cropping.'
    :input.assetType==='og'
      ?'A clean social sharing / Open Graph visual with one strong focal point, readable at small preview size. Do not render any text; the website will overlay metadata separately.'
      :'A polished supporting visual for a modern landing-page section. Keep composition simple, focused and immediately understandable.';

  return `Create a high-end commercial marketing image for a real production landing page.

PRODUCT: ${input.productName}
TARGET AUDIENCE: ${input.audience||'business customers'}
CORE VALUE / USP: ${input.usp||'communicate the product value visually without literal text'}
BRAND TONE: ${input.tone}
BRAND ACCENT: ${input.brandColor} (use only as a subtle visual accent; do not force the entire image into this color)
ASSET PURPOSE: ${input.assetType}
${input.concept?`CREATIVE DIRECTION FROM MARKETING: ${input.concept}`:''}

COMPOSITION:
${placement}

QUALITY BAR:
- premium commercial art direction suitable for a modern technology / digital-service landing page
- visually believable materials, lighting, depth and perspective
- sophisticated, clean, contemporary, not generic stock photography
- clear subject hierarchy and strong conversion-oriented visual storytelling
- realistic details and natural imperfections when people or physical objects appear
- avoid over-rendered CGI, plastic skin, clutter, excessive neon, cyberpunk clichés and random futuristic holograms unless explicitly relevant
- no logos, no brand marks, no watermarks, no UI text, no captions, no illegible pseudo-text
- do not invent numerical claims, awards, certifications, prices or product screenshots
- leave enough breathing room so the website copy remains the visual priority

The output should look like an image selected by a senior art director for a premium campaign, not like a generic AI illustration.`;
}

export async function POST(request:Request){
  try{
    const input=RequestSchema.parse(await request.json());
    const apiKey=process.env.OPENAI_API_KEY;
    if(!apiKey) return NextResponse.json({error:'Server chưa cấu hình OPENAI_API_KEY.'},{status:500});

    const imageSpec=specFor(input.assetType,input.mode);
    const prompt=promptFor(input);
    const response=await fetch('https://api.openai.com/v1/images/generations',{
      method:'POST',
      headers:{'content-type':'application/json','authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({
        model:'gpt-image-2',
        prompt,
        size:imageSpec.size,
        quality:imageSpec.quality,
        n:imageSpec.count
      })
    });
    const result=await response.json();
    if(!response.ok){
      const message=result?.error?.message||'OpenAI image generation failed.';
      return NextResponse.json({error:message,code:result?.error?.code||null},{status:response.status});
    }

    const generated=Array.isArray(result?.data)?result.data:[];
    if(!generated.length) throw new Error('OpenAI không trả về ảnh.');

    const images=[] as Array<{url:string;pathname:string;size:string;quality:string;alt:string}>;
    for(let index=0;index<generated.length;index++){
      const b64=generated[index]?.b64_json;
      if(!b64) continue;
      const buffer=Buffer.from(b64,'base64');
      const blob=await put(
        `generated/${Date.now()}-${input.assetType}-${index+1}.png`,
        buffer,
        {access:'public',contentType:'image/png',addRandomSuffix:true}
      );
      images.push({
        url:blob.url,
        pathname:blob.pathname,
        size:imageSpec.size,
        quality:imageSpec.quality,
        alt:`${input.productName} - ${input.assetType} visual`
      });
    }

    if(!images.length) throw new Error('Không thể lưu ảnh được tạo vào Vercel Blob.');
    return NextResponse.json({
      ok:true,
      model:'gpt-image-2',
      mode:input.mode,
      assetType:input.assetType,
      prompt,
      images
    });
  }catch(error:any){
    console.error('generate image error',error);
    return NextResponse.json({error:error?.message||'Không thể tạo ảnh.'},{status:500});
  }
}
