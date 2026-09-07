import { NextResponse } from 'next/server';

export const runtime='nodejs';

function attr(html:string,tag:string,name:string){
  const re=new RegExp(`<${tag}[^>]*\\b${name}=["']([^"']*)["'][^>]*>`,'i');
  return html.match(re)?.[1]||'';
}

function meta(html:string,key:string,value:string){
  const re1=new RegExp(`<meta[^>]*${key}=["']${value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'][^>]*content=["']([^"']*)["'][^>]*>`,'i');
  const re2=new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${key}=["']${value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'][^>]*>`,'i');
  return html.match(re1)?.[1]||html.match(re2)?.[1]||'';
}

export async function POST(request:Request){
  try{
    const body=await request.json();
    const slug=String(body?.slug||'').toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,80);
    if(!slug) return NextResponse.json({error:'Thiếu slug.'},{status:400});

    const url=new URL(`/share/${slug}`,request.url);
    const response=await fetch(url,{cache:'no-store',headers:{'user-agent':'RUN-LP-Studio-Audit/1.0'}});
    const html=await response.text();
    if(!response.ok) return NextResponse.json({error:`Public page trả về HTTP ${response.status}.`},{status:502});

    const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()||'';
    const description=meta(html,'name','description');
    const canonical=html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]||html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1]||'';
    const ogTitle=meta(html,'property','og:title');
    const ogDescription=meta(html,'property','og:description');
    const h1Count=(html.match(/<h1\b/gi)||[]).length;
    const imageTags=html.match(/<img\b[^>]*>/gi)||[];
    const imagesWithAlt=imageTags.filter(tag=>/\balt=["'][^"']*["']/i.test(tag)).length;
    const ids=[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
    const duplicateIds=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
    const lang=attr(html,'html','lang');
    const hasViewport=Boolean(meta(html,'name','viewport'));
    const hasJsonLd=/type=["']application\/ld\+json["']/i.test(html);
    const bytes=Buffer.byteLength(html,'utf8');

    const checks=[
      {id:'http',label:'HTTP 200',ok:true,severity:'error'},
      {id:'title',label:'Title 20–65 ký tự',ok:title.length>=20&&title.length<=65,severity:'error',value:title},
      {id:'description',label:'Meta description 70–170 ký tự',ok:description.length>=70&&description.length<=170,severity:'error',value:description},
      {id:'canonical',label:'Có canonical URL',ok:Boolean(canonical),severity:'error',value:canonical},
      {id:'og-title',label:'Có Open Graph title',ok:Boolean(ogTitle),severity:'warning'},
      {id:'og-description',label:'Có Open Graph description',ok:Boolean(ogDescription),severity:'warning'},
      {id:'h1',label:'Đúng 1 thẻ H1',ok:h1Count===1,severity:'error',value:String(h1Count)},
      {id:'image-alt',label:'Mọi ảnh đều có thuộc tính alt',ok:imageTags.length===imagesWithAlt,severity:'warning',value:`${imagesWithAlt}/${imageTags.length}`},
      {id:'duplicate-id',label:'Không có duplicate ID',ok:duplicateIds.length===0,severity:'warning',value:duplicateIds.join(', ')},
      {id:'lang',label:'HTML có lang',ok:Boolean(lang),severity:'info',value:lang},
      {id:'viewport',label:'Có viewport meta',ok:hasViewport,severity:'error'},
      {id:'jsonld',label:'Có JSON-LD',ok:hasJsonLd,severity:'warning'},
      {id:'html-size',label:'HTML dưới 500KB',ok:bytes<500*1024,severity:'info',value:`${Math.round(bytes/1024)}KB`}
    ];
    const weights:{[key:string]:number}={error:12,warning:6,info:3};
    const total=checks.reduce((sum,c)=>sum+weights[c.severity],0);
    const earned=checks.reduce((sum,c)=>sum+(c.ok?weights[c.severity]:0),0);

    return NextResponse.json({
      ok:true,
      url:url.toString(),
      score:Math.round(earned/total*100),
      checks,
      summary:{titleLength:title.length,descriptionLength:description.length,h1Count,imageCount:imageTags.length,htmlBytes:bytes}
    });
  }catch(error:any){
    console.error('runtime audit error',error);
    return NextResponse.json({error:error?.message||'Không thể audit public page.'},{status:500});
  }
}
