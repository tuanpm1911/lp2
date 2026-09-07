import { NextResponse } from 'next/server';
import { PageSpecSchema, type MarketingBrief } from '@/lib/page-spec';

export const maxDuration = 60;

const SYSTEM = `You are the Landing Page Architect for an internal marketing page builder.
Return VALID JSON ONLY. Never return HTML, CSS, JavaScript, Markdown or code fences.
Use only these component names: HeroSplit, HeroCentered, ProblemSolution, BenefitCards, FeatureGrid, HowItWorks, StatsStrip, Testimonials, PricingTable, FAQAccordion, LeadForm, FinalCTA, Footer.
Do not invent testimonials, customer counts, awards, certifications, prices or performance claims that were not provided.
Build a concise conversion flow, normally 6-10 sections. Always include HeroSplit near the top and FinalCTA near the end. Footer may be included.
Each section must have id, component, variant, purpose, props, images, analytics.
For props use plain strings and arrays suitable for the component. For FAQ use items as [{question,answer}]. For benefits use items as string[].
If the brief contains heroImageUrl, use that exact URL in the HeroSplit section image data and use heroImageAlt as alt text. Never replace an uploaded image URL with an invented URL.
SEO must include title, description, canonical, ogTitle, ogDescription, ogImageRequirement, schemaTypes.
Output shape exactly:
{"page":{"name":"","locale":"vi-VN","conversionGoal":"","primaryCTA":{"label":"","href":"#contact","event":"cta_click"}},"seo":{"title":"","description":"","canonical":"","ogTitle":"","ogDescription":"","ogImageRequirement":"1200x630","schemaTypes":[]},"sections":[],"qualityHints":{"primaryMessage":"","mainObjections":[],"proofRequired":[],"mobileNotes":[]}}`;

function cleanJson(text:string){
  const fenced=text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw=(fenced?.[1]||text).trim();
  const start=raw.indexOf('{');
  const end=raw.lastIndexOf('}');
  return start>=0&&end>start?raw.slice(start,end+1):raw;
}

export async function POST(req:Request){
  try{
    const brief=(await req.json()) as MarketingBrief;
    if(!brief.productName?.trim()||!brief.audience?.trim()||!brief.cta?.trim()){
      return NextResponse.json({error:'Thiếu Tên sản phẩm, Khách hàng mục tiêu hoặc CTA.'},{status:400});
    }
    const apiKey=process.env.ANTHROPIC_API_KEY;
    if(!apiKey) return NextResponse.json({error:'Server chưa cấu hình ANTHROPIC_API_KEY.'},{status:500});

    const response=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'content-type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({
        model:process.env.ANTHROPIC_MODEL||'claude-sonnet-5',
        max_tokens:7000,
        system:SYSTEM,
        messages:[{role:'user',content:`Create the best PageSpec for this approved marketing brief.\n${JSON.stringify(brief,null,2)}`}]
      })
    });
    const data=await response.json();
    if(!response.ok) throw new Error(data?.error?.message||'Anthropic API error');
    const text=(data?.content||[]).filter((x:any)=>x.type==='text').map((x:any)=>x.text).join('\n');
    const parsed=JSON.parse(cleanJson(text));
    const spec=PageSpecSchema.parse(parsed);
    return NextResponse.json({spec});
  }catch(error:any){
    console.error(error);
    return NextResponse.json({error:error?.message||'Không thể tạo landing page.'},{status:500});
  }
}
