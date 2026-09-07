'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puck, type Data } from '@puckeditor/core';
import { pageSpecToPuck, puckConfig } from '@/lib/puck-config';
import { evaluatePageSpec } from '@/lib/quality';
import type { MarketingBrief, PageSpec } from '@/lib/page-spec';

const initialBrief:MarketingBrief={
  productName:'',audience:'',goal:'Thu thập lead',usp:'',cta:'Nhận tư vấn',price:'',referenceUrl:'',brandColor:'#2563eb',tone:'Chuyên nghiệp, rõ ràng',heroImageUrl:'',heroImageAlt:'',extra:''
};

function slugify(value:string){
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
}

export default function Home(){
  const [brief,setBrief]=useState(initialBrief);
  const [spec,setSpec]=useState<PageSpec|null>(null);
  const [data,setData]=useState<Data|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [editorKey,setEditorKey]=useState(0);
  const [restored,setRestored]=useState(false);
  const [publishSlug,setPublishSlug]=useState('');
  const [publishing,setPublishing]=useState(false);
  const [publishError,setPublishError]=useState('');
  const [publishedUrl,setPublishedUrl]=useState('');
  const [uploadingAsset,setUploadingAsset]=useState(false);
  const [assetError,setAssetError]=useState('');

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('lp-studio-draft');
      if(!raw) return;
      const draft=JSON.parse(raw);
      if(draft?.brief) setBrief({...initialBrief,...draft.brief});
      if(draft?.spec) setSpec(draft.spec);
      if(draft?.data){setData(draft.data);setEditorKey(k=>k+1);setRestored(true);}
      if(draft?.publishSlug) setPublishSlug(draft.publishSlug);
      if(draft?.publishedUrl) setPublishedUrl(draft.publishedUrl);
    }catch{}
  },[]);

  const ready=useMemo(()=>Boolean(brief.productName.trim()&&brief.audience.trim()&&brief.cta.trim()),[brief]);
  const quality=useMemo(()=>spec?evaluatePageSpec(spec):null,[spec]);
  const set=(key:keyof MarketingBrief,value:string)=>setBrief(prev=>({...prev,[key]:value}));

  function persistDraft(nextData:Data|null=data,nextSpec:PageSpec|null=spec,nextPublishedUrl=publishedUrl,nextBrief:MarketingBrief=brief){
    localStorage.setItem('lp-studio-draft',JSON.stringify({brief:nextBrief,spec:nextSpec,data:nextData,publishSlug,publishedUrl:nextPublishedUrl,savedAt:new Date().toISOString()}));
  }

  async function uploadHero(file:File){
    setUploadingAsset(true);setAssetError('');
    try{
      const form=new FormData();form.append('file',file);
      const res=await fetch('/api/assets',{method:'POST',body:form});
      const json=await res.json();
      if(!res.ok) throw new Error(json.error||'Không thể upload ảnh');
      const nextBrief={...brief,heroImageUrl:json.url,heroImageAlt:brief.heroImageAlt||brief.productName};
      setBrief(nextBrief);
      persistDraft(data,spec,publishedUrl,nextBrief);
    }catch(e:any){setAssetError(e.message||'Không thể upload ảnh.');}
    finally{setUploadingAsset(false);}
  }

  async function generate(){
    setLoading(true);setError('');setPublishError('');
    try{
      const res=await fetch('/api/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(brief)});
      const json=await res.json();
      if(!res.ok) throw new Error(json.error||'Không thể generate');
      const nextSpec=json.spec as PageSpec;
      const nextData=pageSpecToPuck(nextSpec);
      const nextSlug=publishSlug||slugify(brief.productName);
      setSpec(nextSpec);
      setData(nextData);
      setPublishSlug(nextSlug);
      setPublishedUrl('');
      setEditorKey(k=>k+1);
      localStorage.setItem('lp-studio-draft',JSON.stringify({brief,spec:nextSpec,data:nextData,publishSlug:nextSlug,publishedUrl:'',savedAt:new Date().toISOString()}));
    }catch(e:any){setError(e.message||'Có lỗi xảy ra');}
    finally{setLoading(false);}
  }

  function saveDraft(next:Data){
    setData(next);
    persistDraft(next,spec,publishedUrl);
    setRestored(false);
  }

  async function publish(){
    if(!spec||!data) return;
    const safeSlug=slugify(publishSlug||brief.productName);
    if(safeSlug.length<2){setPublishError('Hãy nhập slug hợp lệ trước khi publish.');return;}
    setPublishing(true);setPublishError('');
    try{
      const res=await fetch('/api/publish',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({slug:safeSlug,brief,spec,puckData:data})
      });
      const json=await res.json();
      if(!res.ok) throw new Error(json.error||'Không thể publish');
      setPublishSlug(safeSlug);
      setPublishedUrl(json.publicUrl);
      localStorage.setItem('lp-studio-draft',JSON.stringify({brief,spec,data,publishSlug:safeSlug,publishedUrl:json.publicUrl,savedAt:new Date().toISOString()}));
    }catch(e:any){setPublishError(e.message||'Không thể publish landing page.');}
    finally{setPublishing(false);}
  }

  function exportJson(){
    const payload=JSON.stringify({brief,spec,puckData:data},null,2);
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download=`${brief.productName||'landing-page'}.json`;a.click();URL.revokeObjectURL(a.href);
  }

  return <>
    <header className="topbar"><div className="brand">RUN <span>LP Studio</span></div><div className="badge">V1.3 · Brief → Assets → AI → Edit → QA → Publish</div></header>
    <main className="workspace">
      <aside className="brief">
        <h1>1. Marketing Brief</h1>
        <p className="lead">Nhập thông tin cốt lõi. AI chỉ tạo PageSpec; giao diện production được dựng từ component đã duyệt.</p>
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
        <div style={{padding:12,border:'1px solid #263249',borderRadius:10,background:'#172033',marginBottom:12}}>
          <strong style={{display:'block',marginBottom:8,fontSize:12}}>Hero image</strong>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploadingAsset} onChange={e=>{const file=e.target.files?.[0];if(file) uploadHero(file)}} style={{width:'100%',fontSize:11,color:'#9aa7bd'}} />
          {uploadingAsset&&<div className="hint">Đang upload lên Vercel Blob...</div>}
          {assetError&&<div className="error">{assetError}</div>}
          {brief.heroImageUrl&&<div style={{marginTop:10}}><img src={brief.heroImageUrl} alt={brief.heroImageAlt||''} style={{width:'100%',maxHeight:160,objectFit:'cover',borderRadius:8,display:'block'}} /><div className="field" style={{marginTop:8,marginBottom:0}}><label>Alt text</label><input value={brief.heroImageAlt||''} onChange={e=>set('heroImageAlt',e.target.value)} placeholder="Mô tả ảnh cho SEO/accessibility" /></div></div>}
        </div>
        <div className="field"><label>URL tham khảo</label><input value={brief.referenceUrl||''} onChange={e=>set('referenceUrl',e.target.value)} placeholder="https://..." /></div>
        <div className="field"><label>Nội dung bổ sung</label><textarea value={brief.extra||''} onChange={e=>set('extra',e.target.value)} placeholder="FAQ, thông tin liên hệ, proof, yêu cầu pháp lý..." /></div>
        <button className="primary" disabled={!ready||loading} onClick={generate}>{loading?'AI đang xây PageSpec...':'✨ Generate Landing Page'}</button>
        {error&&<div className="error">{error}</div>}
        <div className="hint">AI key chỉ chạy server-side qua <b>ANTHROPIC_API_KEY</b>.</div>
        {spec&&<div className="status"><strong>✓ PageSpec hợp lệ</strong> · {spec.sections.length} sections · {spec.seo.schemaTypes.length} schema types</div>}
        {quality&&<div style={{marginTop:12,padding:12,border:'1px solid #263249',borderRadius:10,background:'#172033'}}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:8}}><strong>2. Quality Gate</strong><strong style={{color:quality.score>=85?'#23c483':quality.score>=70?'#fbbf24':'#ff6b6b'}}>{quality.score}/100</strong></div><div style={{display:'grid',gap:5}}>{quality.checks.map(c=><div key={c.id} style={{fontSize:11,color:c.ok?'#8ee6bd':'#ffb0b0'}}>{c.ok?'✓':'•'} {c.label}</div>)}</div><div className="hint">V1.3 Quality Gate kiểm tra PageSpec. Vòng sau sẽ bổ sung Lighthouse + HTML runtime audit.</div></div>}
        {data&&spec&&<div style={{marginTop:12,padding:12,border:'1px solid #35518a',borderRadius:10,background:'#111b31'}}>
          <strong style={{display:'block',marginBottom:8}}>3. Publish</strong>
          <div className="field" style={{marginBottom:8}}><label>Public slug</label><input value={publishSlug} onChange={e=>{setPublishSlug(slugify(e.target.value));setPublishedUrl('')}} placeholder="vibe-code-hosting" /></div>
          <button className="primary" disabled={publishing} onClick={publish}>{publishing?'Đang publish...':'🚀 Publish Landing Page'}</button>
          {publishError&&<div className="error">{publishError}</div>}
          {publishedUrl&&<div style={{marginTop:10,fontSize:12,lineHeight:1.6,color:'#b8c8e8'}}>✓ Public URL<br/><a href={publishedUrl} target="_blank" rel="noreferrer" style={{color:'#8fb0ff',wordBreak:'break-all'}}>{publishedUrl}</a></div>}
        </div>}
      </aside>
      <section className="canvas">
        {!data?<div className="empty"><div className="empty-card"><h2>Brief → AI → Editor</h2><p>Điền ba trường bắt buộc bên trái rồi Generate. Kết quả sẽ mở trực tiếp trong visual editor để Marketing kéo thả và sửa nội dung mà không cần chạm vào HTML/CSS.</p></div></div>:
        <div className="editor-wrap">
          <Puck key={editorKey} config={puckConfig} data={data} onChange={setData} onPublish={saveDraft} headerTitle={brief.productName||'Landing Page'} viewports={[{width:1440,height:'auto',label:'Desktop'},{width:768,height:'auto',label:'Tablet'},{width:375,height:'auto',label:'Mobile'}]} />
          <div className="specbar"><button className="secondary" onClick={()=>data&&saveDraft(data)}>Lưu draft</button><button className="secondary" onClick={()=>{data&&saveDraft(data);window.open('/preview','_blank')}}>Preview</button><button className="secondary" disabled={publishing} onClick={publish}>Publish</button><button className="secondary" onClick={exportJson}>Export JSON</button></div>
        </div>}
      </section>
    </main>
  </>;
}
