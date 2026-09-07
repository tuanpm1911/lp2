'use client';

import { useState } from 'react';
import { Puck, type Data } from '@puckeditor/core';
import { demoData, demoSpec } from '@/lib/demo-page';
import { puckConfig } from '@/lib/puck-config';
import { evaluatePageSpec } from '@/lib/quality';

export default function DemoStudioPage(){
  const [data,setData]=useState<Data>(demoData);
  const quality=evaluatePageSpec(demoSpec);

  function reset(){setData(demoData);}
  function download(){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify({spec:demoSpec,puckData:data},null,2)],{type:'application/json'}));
    a.download='vibe-code-hosting-demo.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return <main style={{minHeight:'100vh',background:'#e9eef7'}}>
    <header style={{height:58,padding:'0 16px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,background:'#0b1020',color:'#fff',fontFamily:'system-ui'}}>
      <div><strong>LP Studio · Demo Editor</strong><span style={{marginLeft:10,fontSize:12,color:'#9aa7bd'}}>Không cần Anthropic / OpenAI key</span></div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <span style={{fontSize:12,color:quality.score>=85?'#8ee6bd':'#fbbf24'}}>Quality {quality.score}/100</span>
        <a href="/demo" target="_blank" style={{padding:'8px 11px',border:'1px solid #334155',borderRadius:8,color:'#dbeafe',fontSize:12,fontWeight:800,textDecoration:'none'}}>Xem Demo LP</a>
        <button onClick={reset} style={{padding:'8px 11px',border:'1px solid #334155',borderRadius:8,background:'#172033',color:'#fff',fontWeight:800,cursor:'pointer'}}>Reset</button>
        <button onClick={download} style={{padding:'8px 11px',border:0,borderRadius:8,background:'#2563eb',color:'#fff',fontWeight:800,cursor:'pointer'}}>Export JSON</button>
      </div>
    </header>
    <div style={{height:'calc(100vh - 58px)'}}>
      <Puck config={puckConfig} data={data} onChange={setData} onPublish={setData} headerTitle="Vibe Code Hosting · Demo" viewports={[{width:1440,height:'auto',label:'Desktop'},{width:768,height:'auto',label:'Tablet'},{width:375,height:'auto',label:'Mobile'}]} />
    </div>
  </main>;
}
