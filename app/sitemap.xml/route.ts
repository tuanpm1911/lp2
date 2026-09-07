import { list } from '@vercel/blob';

export const runtime='nodejs';
export const dynamic='force-dynamic';

function xmlEscape(value:string){
  return value.replace(/[<>&'\"]/g,char=>({ '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;' }[char]||char));
}

export async function GET(){
  const base=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,'');
  const urls:string[]=[];
  if(base){
    try{
      const {blobs}=await list({prefix:'published/',limit:1000});
      for(const blob of blobs){
        const match=blob.pathname.match(/^published\/(.+)\.json$/);
        if(!match) continue;
        const loc=`${base}/share/${match[1]}`;
        urls.push(`<url><loc>${xmlEscape(loc)}</loc><lastmod>${new Date(blob.uploadedAt).toISOString()}</lastmod></url>`);
      }
    }catch(error){
      console.error('sitemap blob error',error);
    }
  }
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
  return new Response(xml,{headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=0, s-maxage=300'}});
}
