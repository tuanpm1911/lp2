import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import { getPublishedPage } from '@/lib/published-page';
import PublicRenderer from './public-renderer';

export const dynamic='force-dynamic';

type Props={params:Promise<{slug:string}>};

function publicUrl(slug:string,canonical?:string){
  if(canonical&&/^https?:\/\//i.test(canonical)) return canonical;
  const base=process.env.NEXT_PUBLIC_SITE_URL;
  return base?new URL(`/share/${slug}`,base).toString():undefined;
}

function faqItems(data:unknown){
  const content=(data as any)?.content;
  if(!Array.isArray(content)) return [];
  const faq=content.find((item:any)=>item?.type==='FAQAccordion');
  const raw=faq?.props?.items;
  if(typeof raw!=='string') return [];
  return raw.split('\n').map((line:string)=>{
    const [question,...answerParts]=line.split('|');
    return {question:question?.trim(),answer:answerParts.join('|').trim()};
  }).filter((item:{question?:string;answer?:string})=>item.question&&item.answer);
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;
  const page=await getPublishedPage(slug);
  if(!page) return {title:'Landing page không tồn tại',robots:{index:false,follow:false}};
  const seo=page.spec.seo;
  const canonical=publicUrl(slug,seo.canonical);
  const heroImage=typeof page.brief.heroImageUrl==='string'?page.brief.heroImageUrl:undefined;
  return {
    title:seo.title||page.spec.page.name,
    description:seo.description||undefined,
    alternates:canonical?{canonical}:undefined,
    openGraph:{
      title:seo.ogTitle||seo.title||page.spec.page.name,
      description:seo.ogDescription||seo.description||undefined,
      type:'website',
      url:canonical,
      images:heroImage?[{url:heroImage,alt:typeof page.brief.heroImageAlt==='string'?page.brief.heroImageAlt:page.spec.page.name}]:undefined
    },
    robots:{index:true,follow:true}
  };
}

export default async function PublishedLandingPage({params}:Props){
  const {slug}=await params;
  const page=await getPublishedPage(slug);
  if(!page) notFound();

  const canonical=publicUrl(slug,page.spec.seo.canonical);
  const faqs=faqItems(page.puckData);
  const graph:any[]=[{
    '@type':'WebPage',
    name:page.spec.seo.title||page.spec.page.name,
    description:page.spec.seo.description||undefined,
    url:canonical
  }];
  if(faqs.length){
    graph.push({
      '@type':'FAQPage',
      mainEntity:faqs.map(item=>({
        '@type':'Question',
        name:item.question,
        acceptedAnswer:{'@type':'Answer',text:item.answer}
      }))
    });
  }
  const jsonLd={'@context':'https://schema.org','@graph':graph};

  return <main style={{margin:0,minHeight:'100vh',background:'#fff',color:'#0f172a'}}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}} />
    <PublicRenderer data={page.puckData as Data} />
  </main>;
}
