import type { Metadata } from 'next';
import PublicRenderer from '@/app/share/[slug]/public-renderer';
import { demoData, demoSpec } from '@/lib/demo-page';

export const metadata:Metadata={
  title:demoSpec.seo.title,
  description:demoSpec.seo.description,
  robots:{index:false,follow:false}
};

export default function DemoLandingPage(){
  return <main style={{margin:0,minHeight:'100vh',background:'#fff',color:'#0f172a'}}>
    <div style={{position:'sticky',top:0,zIndex:999,padding:'9px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,background:'rgba(2,6,23,.94)',color:'#fff',fontFamily:'system-ui',backdropFilter:'blur(12px)'}}>
      <strong>LP Studio · Demo không cần API key</strong>
      <div style={{display:'flex',gap:14,alignItems:'center'}}>
        <a href="/demo/studio" style={{color:'#bfdbfe',fontSize:13,fontWeight:800}}>Mở Visual Editor</a>
        <a href="/" style={{color:'#94a3b8',fontSize:13,fontWeight:700}}>LP Studio</a>
      </div>
    </div>
    <PublicRenderer data={demoData} />
  </main>;
}
