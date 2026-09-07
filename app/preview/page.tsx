'use client';

import { useEffect, useState } from 'react';
import { Render, type Data } from '@puckeditor/core';
import { puckConfig } from '@/lib/puck-config';

export default function PreviewPage(){
  const [data,setData]=useState<Data|null>(null);
  const [name,setName]=useState('Landing Page Preview');

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('lp-studio-draft');
      if(!raw) return;
      const draft=JSON.parse(raw);
      if(draft?.data) setData(draft.data);
      if(draft?.brief?.productName) setName(draft.brief.productName);
    }catch{}
  },[]);

  if(!data) return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',fontFamily:'system-ui',background:'#f8fafc',color:'#0f172a',padding:24}}><div style={{maxWidth:520,textAlign:'center'}}><h1>Chưa có draft để preview</h1><p>Quay lại LP Studio, Generate landing page và nhấn “Lưu draft”, sau đó mở Preview.</p><a href="/" style={{color:'#2563eb',fontWeight:700}}>← Quay lại LP Studio</a></div></main>;

  return <main style={{background:'#fff',minHeight:'100vh'}}>
    <div style={{position:'sticky',top:0,zIndex:999,padding:'9px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,background:'rgba(2,6,23,.94)',color:'#fff',fontFamily:'system-ui',backdropFilter:'blur(12px)'}}>
      <strong>{name} · Preview</strong>
      <a href="/" style={{color:'#bfdbfe',fontSize:13,fontWeight:700}}>← Editor</a>
    </div>
    <Render config={puckConfig} data={data} />
  </main>;
}
