export const dynamic='force-dynamic';

export async function GET(){
  const base=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,'');
  const lines=[
    'User-agent: *',
    'Allow: /share/',
    'Disallow: /api/',
    'Disallow: /preview'
  ];
  if(base) lines.push(`Sitemap: ${base}/sitemap.xml`);
  return new Response(lines.join('\n'),{headers:{'content-type':'text/plain; charset=utf-8','cache-control':'public, max-age=0, s-maxage=3600'}});
}
