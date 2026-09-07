'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puck, type Data } from '@puckeditor/core';
import { pageSpecToPuck, puckConfig } from '@/lib/puck-config';
import type { MarketingBrief, PageSpec } from '@/lib/page-spec';

const initialBrief:MarketingBrief={
  productName:'',audience:'',goal:'Thu thập lead',usp:'',cta:'Nhận tư vấn',price:'',referenceUrl:'',brandColor:'#2563eb',tone:'Chuyên nghiệp, rõ ràng',extra:''
};

export default function Home(){
  const [brief,setBrief]=useState(initialBrief);
  const [spec,setSpec]=useState<PageSpec|null>(null);
  const [data,setData]=useState<Data|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [editorKey,setEditorKey]=useState(0);
  const [restored,setRestored]=useState(false);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('lp-studio-draft');
      if(!raw) return;
      const draft=JSON.parse(raw);
      if(draft?.brief) setBrief({...initialBrief,...draft.brief});
      if(draft?.spec) setSpec(draft.spec);
      if(draft?.data){setData(draft.data);setEditorKey(k=>k+1);setRestored(true);}
    }catch{}
  },[]);

  const ready=useMemo(()=>Boolean(brief.productName.trim()&&brief.audience.trim()&&brief.cta.trim()),[brief]);
  const set=(key:keyof MarketingBrief,value:string)=>setBrief(prev=>({...prev,[key]:value}));

  async function generate(){
    setLoading(true);setError('');
    try{
      const res=await fetch('/api/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(brief)});
      const json=await res.json();
      if(!res.ok) throw new Error(json.error||'Không thể generate');
      const nextSpec=json.spec as PageSpec;
      const nextData=pageSpecToPuck(nextSpec);
      setSpec(nextSpec);
      setData(nextData);
      setEditorKey(k=>k+1);
      localStorage.setItem('lp-studio-draft',JSON.stringify({brief,spec:nextSpec,data:nextData,savedAt:new Date().toISOString()}));
    }catch(e:any){setError(e.message||'Có lỗi xảy ra');}
    finally{setLoading(false);}
  }

  function saveDraft(next:Data){
    setData(next);
    localStorage.setItem('lp-studio-draft',JSON.stringify({brief,spec,data:next,savedAt:new Date().toISOString()}));
    setRestored(false);
  }

  function exportJson(){
    const payload=JSON.stringify({brief,spec,puckData:data},null,2);
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download=`${brief.productName||'landing-page'}.json`;a.click();URL.revokeObjectURL(a.href);
  }

  return <>
    <header className="topbar"><div className="brand">RUN <span>LP Studio</span></div><div className="badge">V1.1 · Structured Page Builder</div></header>
    <main className="workspace">
      <aside className="brief">
        <h1>1. Marketing Brief</h1>
        <p className="lead">Nhập thông tin cốt lõi. AI chỉ tạo cấu trúc và nội dung PageSpec; giao diện production được dựng từ component đã duyệt.</p>
        {restored&&<div className="status"><strong>✓ Đã khôi phục draft gần nhất</strong></div>}
        <div className="field"><label>Tên sản phẩm *</label><input value={brief.productName} onChange={e=>set('productName',e.target.value)} placeholder="VD: Vibe Code Hosting" /></div>
        <div className="field"><label>Khách hàng mục tiêu *</label><textarea value={brief.audience} onChange={e=>set('audience',e.target.value)} placeholder="Ai sẽ đọc landing page? Họ đang gặp vấn đề gì?" /></div>
        <div className="grid2">
          <div className="field"><label>Mục tiêu</label><select value={brief.goal} onChange={e=>set('goal',e.target.value)}><option>Thu thập lead</option><option>Bán hàng trực tiếp</option><option>Đăng ký dùng thử</option><option>Đặt lịch tư vấn</option><option>Ra mắt sản phẩm</option></select></div>
          <div className="field"><label>CTA *</label><input value={brief.cta} onChange={e=>set('cta',e.target.value)} /></div>
        </div>
        <div className="field"><label>USP / Lợi ích</label><textarea value={brief.usp} onChange={e=>set('usp',e.target.value)} placeholder="Mỗi dòng một USP. Chỉ nhập claim đã được phép sử dụng." /></div>
        <div className="grid2">
          <div className="field"><label>Giá</label><input value={brief.price||''} onChange={e=>set('price',e.target.value)} placeholder="VD: 99.000đ/tháng" /></div>
          <div className="field"><label>Brand color</label><input value={brief.brandColor||''} onChange={e=>set('brandColor',e.target.value)} /></div>
        </div>
        <div className="field"><label>Tone</label><input value={brief.tone||''} onChange={e=>set('tone',e.target.value)} /></div>
        <div className="field"><label>URL tham khảo</label><input value={brief.referenceUrl||''} onChange={e=>set('referenceUrl',e.target.value)} placeholder="https://..." /></div>
        <div className="field"><label>Nội dung bổ sung</label><textarea value={brief.extra||''} onChange={e=>set('extra',e.target.value)} placeholder="FAQ, thông tin liên hệ, proof, yêu cầu pháp lý..." /></div>
        <button className="primary" disabled={!ready||loading} onClick={generate}>{loading?'AI đang xây PageSpec...':'✨ Generate Landing Page'}</button>
        {error&&<div className="error">{error}</div>}
        <div className="hint">V1 yêu cầu Vercel Environment Variable <b>ANTHROPIC_API_KEY</b>. API key không được lưu trong browser.</div>
        {spec&&<div className="status"><strong>✓ PageSpec hợp lệ</strong> · {spec.sections.length} sections · {spec.seo.schemaTypes.length} schema types</div>}
      </aside>
      <section className="canvas">
        {!data?<div className="empty"><div className="empty-card"><h2>Brief → AI → Editor</h2><p>Điền ba trường bắt buộc bên trái rồi Generate. Kết quả sẽ mở trực tiếp trong visual editor để Marketing kéo thả và sửa nội dung mà không cần chạm vào HTML/CSS.</p></div></div>:
        <div className="editor-wrap">
          <Puck key={editorKey} config={puckConfig} data={data} onChange={setData} onPublish={saveDraft} headerTitle={brief.productName||'Landing Page'} viewports={[{width:1440,height:'auto',label:'Desktop'},{width:768,height:'auto',label:'Tablet'},{width:375,height:'auto',label:'Mobile'}]} />
          <div className="specbar"><button className="secondary" onClick={()=>data&&saveDraft(data)}>Lưu draft</button><button className="secondary" onClick={()=>{data&&saveDraft(data);window.open('/preview','_blank')}}>Preview</button><button className="secondary" onClick={exportJson}>Export JSON</button></div>
        </div>}
      </section>
    </main>
  </>;
}
