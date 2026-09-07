import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import { getPublishedPage } from '@/lib/published-page';
import PublicRenderer from './public-renderer';

export const dynamic='force-dynamic';

type Props={params:Promise<{slug:string}>};

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;
  const page=await getPublishedPage(slug);
  if(!page) return {title:'Landing page không tồn tại'};
  const seo=page.spec.seo;
  return {
    title:seo.title||page.spec.page.name,
    description:seo.description||undefined,
    openGraph:{
      title:seo.ogTitle||seo.title||page.spec.page.name,
      description:seo.ogDescription||seo.description||undefined,
      type:'website'
    },
    robots:{index:true,follow:true}
  };
}

export default async function PublishedLandingPage({params}:Props){
  const {slug}=await params;
  const page=await getPublishedPage(slug);
  if(!page) notFound();

  return <main style={{margin:0,minHeight:'100vh',background:'#fff',color:'#0f172a'}}>
    <PublicRenderer data={page.puckData as Data} />
  </main>;
}
