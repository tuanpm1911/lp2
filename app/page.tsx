'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puck, type Data } from '@puckeditor/core';
import { pageSpecToPuck, puckConfig } from '@/lib/puck-config';
import { evaluatePageSpec } from '@/lib/quality';
import type { MarketingBrief, PageSpec } from '@/lib/page-spec';

type RuntimeAudit={score:number;checks:Array<{id:string;label:string;ok:boolean;severity:string;value?:string}>};
type GeneratedImage={url:string;pathname:string;size:string;quality:string;alt:string};

const initialBrief:MarketingBrief={productName:'',audience:'',goal:'Thu thập lead',usp:'',cta:'Nhận tư vấn',price:'',referenceUrl:'',brandColor:'#2563eb',tone:'Chuyên nghiệp, rõ ràng',heroImageUrl:'',heroImageAlt:'',extra:''};
const slugify=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);

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
  const [imageConcept,setImageConcept]=useState('');
  const [imageMode,setImageMode]=useState<'draft'|'final'>('draft');
  const [generatingImage,setGeneratingImage]=useState(false);
  const [imageGenError,setImageGenError]=useState('');
  const [generatedImages,setGeneratedImages]=useState<GeneratedImage[]>([]);
  const [auditing,setAuditing]=useState(false);
  const [auditError,setAuditError]=useState('');
  const [runtimeAudit,setRuntimeAudit]=useState<RuntimeAudit|null>(null);

  useEffect(()=>{try{const raw=localStorage.getItem('lp-studio-draft');if(!raw)return;const draft=JSON.parse(raw);if(draft?.brief)setBrief({...initialBrief,...draft.brief});if(draft?.spec)setSpec(draft.spec);if(draft?.data){setData(draft.data);setEditorKey(k=>k+1);setRestored(true)}if(draft?.publishSlug)setPublishSlug(draft.publishSlug);if(draft?.publishedUrl)setPublishedUrl(draft.publishedUrl)}catch{}},[]);

  const ready=useMemo(()=>Boolean(brief.productName.trim()&&brief.audience.trim()&&brief.cta.trim()),[brief]);
  const quality=useMemo(()=>spec?evaluatePageSpec(spec):null,[spec]);
  const set=(key:keyof MarketingBrief,value:string)=>setBrief(prev=>({...prev,[key]:value}));
  const persistDraft=(nextData:Data|null=data,nextSpec:PageSpec|null=spec,nextPublishedUrl=publishedUrl,nextBrief:MarketingBrief=brief)=>localStorage.setItem('lp-studio-draft',JSON.stringify({brief:nextBrief,spec:nextSpec,data:nextData,publishSlug,publishedUrl:nextPublishedUrl,savedAt:new Date().toISOString()}));

  async function uploadHero(file:File){setUploadingAsset(true);setAssetError('');try{const form=new FormData();form.append('file',file);const res=await fetch('/api/assets',{method:'POST',body:form});const json=await res.json();if(!res.ok)throw new Error(json.error||'Không thể upload ảnh');chooseHero({url:json.url,pathname:json.pathname,size:'uploaded',quality:'original',alt:brief.heroImageAlt||brief.productName})}catch(e:any){setAssetError(e.message||'Không thể upload ảnh.')}finally{setUploadingAsset(false)}}

  function chooseHero(image:GeneratedImage){
    const nextBrief={...brief,heroImageUrl:image.url,heroImageAlt:image.alt||brief.productName};
    setBrief(nextBrief);persistDraft(data,spec,publishedUrl,nextBrief);
  }

  async function generateImage(){
    if(!brief.productName.trim()){setImageGenError('Hãy nhập tên sản phẩm trước.');return}
    setGeneratingImage(true);setImageGenError('');
    try{
      const res=await fetch('/api/generate-image',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({productName:brief.productName,audience:brief.audience,usp:brief.usp,tone:brief.tone,brandColor:brief.brandColor,assetType:'hero',concept:imageConcept,mode:imageMode})});
      const json=await res.json();if(!res.ok)throw new Error(json.error||'Không thể tạo ảnh');setGeneratedImages(json.images||[]);
      if(imageMode==='final'&&json.images?.[0])chooseHero(json.images[0]);
    }catch(e:any){setImageGenError(e.message||'Không thể tạo ảnh.')}finally{setGeneratingImage(false)}
  }

  async function generate(){setLoading(true);setError('');setPublishError('');setRuntimeAudit(null);setAuditError('');try{const res=await fetch('/api/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(brief)});const json=await res.json();if(!res.ok)throw new Error(json.error||'Không thể generate');const nextSpec=json.spec as PageSpec;const nextData=pageSpecToPuck(nextSpec,brief);const nextSlug=publishSlug||slugify(brief.productName);setSpec(nextSpec);setData(nextData);setPublishSlug(nextSlug);setPublishedUrl('');setEditorKey(k=>k+1);localStorage.setItem('lp-studio-draft',JSON.stringify({brief,spec:nextSpec,data:nextData,publishSlug:nextSlug,publishedUrl:'',savedAt:new Date().toISOString()}))}catch(e:any){setError(e.message||'Có lỗi xảy ra')}finally{setLoading(false)}}
  function saveDraft(next:Data){setData(next);persistDraft(next,spec,publishedUrl);setRestored(false)}
  async function publish(){if(!spec||!data)return;const safeSlug=slugify(publishSlug||brief.productName);if(safeSlug.length<2){setPublishError('Hãy nhập slug hợp lệ trước khi publish.');return}setPublishing(true);setPublishError('');setRuntimeAudit(null);setAuditError('');try{const res=await fetch('/api/publish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slug:safeSlug,brief,spec,puckData:data})});const json=await res.json();if(!res.ok)throw new Error(json.error||'Không thể publish');setPublishSlug(safeSlug);setPublishedUrl(json.publicUrl);localStorage.setItem('lp-studio-draft',JSON.stringify({brief,spec,data,publishSlug:safeSlug,publishedUrl:json.publicUrl,savedAt:new Date().toISOString()}))}catch(e:any){setPublishError(e.message||'Không thể publish landing page.')}finally{setPublishing(false)}}
  async function auditPublished(){if(!publishSlug)return;setAuditing(true);setAuditError('');try{const res=await fetch('/api/audit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slug:publishSlug})});const json=await res.json();if(!res.ok)throw new Error(json.error||'Không thể audit');setRuntimeAudit(json)}catch(e:any){setAuditError(e.message||'Không thể audit public page.')}finally{setAuditing(false)}}
  function exportJson(){const payload=JSON.stringify({brief,spec,puckData:data},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download=`${brief.productName||'landing-page'}.json`;a.click();URL.revokeObjectURL(a.href)}

  return <>
    <header className="topbar"><div className="brand">RUN <span>LP Studio</span></div><div className="badge">V1.5 · GPT-Image-2 Creative Studio</div></header>
    <main className="workspace">
      <aside className="brief">
        <h1>1. Marketing Brief</h1><p className="lead">Brief → Brand Kit → AI image → PageSpec → Visual Editor → QA → Publish.</p>
        {restored&&<div className="status"><strong>✓ Đã khôi phục draft gần nhất</strong></div>}
        <div className="field"><label>Tên sản phẩm *</label><input value={brief.productName} onChange={e=>set('productName',e.target.value)} placeholder="VD: Vibe Code Hosting" /></div>
        <div className="field"><label>Khách hàng mục tiêu *</label><textarea value={brief.audience} onChange={e=>set('audience',e.target.value)} placeholder="Ai đọc LP? Pain point là gì?" /></div>
        <div className="grid2"><div className="field"><label>Mục tiêu</label><select value={brief.goal} onChange={e=>set('goal',e.target.value)}><option>Thu thập lead</option><option>Bán hàng trực tiếp</option><option>Đăng ký dùng thử</option><option>Đặt lịch tư vấn</option><option>Ra mắt sản phẩm</option></select></div><div className="field"><label>CTA *</label><input value={brief.cta} onChange={e=>set('cta',e.target.value)} /></div></div>
        <div className="field"><label>USP / Lợi ích</label><textarea value={brief.usp} onChange={e=>set('usp',e.target.value)} placeholder="Mỗi dòng một USP đã được duyệt." /></div>
        <div className="grid2"><div className="field"><label>Giá</label><input value={brief.price||''} onChange={e=>set('price',e.target.value)} /></div><div className="field"><label>Brand color</label><input value={brief.brandColor||''} onChange={e=>set('brandColor',e.target.value)} /></div></div>
        <div className="field"><label>Tone</label><input value={brief.tone||''} onChange={e=>set('tone',e.target.value)} /></div>

        <div style={{padding:12,border:'1px solid #35518a',borderRadius:10,background:'#111b31',marginBottom:12}}>
          <strong style={{display:'block',fontSize:12}}>2. GPT-Image-2 Creative Studio</strong>
          <div className="hint">AI tạo ảnh theo Brief + Brand Kit + mục đích Hero. Không chèn logo/text giả vào ảnh.</div>
          <div className="field" style={{marginTop:10}}><label>Creative direction (tuỳ chọn)</label><textarea value={imageConcept} onChange={e=>setImageConcept(e.target.value)} placeholder="VD: chủ doanh nghiệp Việt Nam dùng laptop trong studio sáng, hiện đại, photorealistic..." /></div>
          <div className="grid2"><button className={imageMode==='draft'?'primary':'secondary'} onClick={()=>setImageMode('draft')}>Draft · 2 ảnh</button><button className={imageMode==='final'?'primary':'secondary'} onClick={()=>setImageMode('final')}>Final · High</button></div>
          <button className="primary" disabled={generatingImage} onClick={generateImage} style={{marginTop:8}}>{generatingImage?'GPT-Image-2 đang tạo ảnh...':'✨ Generate Hero Image'}</button>
          {imageGenError&&<div className="error">{imageGenError}</div>}
          {generatedImages.length>0&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>{generatedImages.map((img,i)=><button key={img.url} onClick={()=>chooseHero(img)} style={{border:brief.heroImageUrl===img.url?'2px solid #7aa0ff':'1px solid #263249',padding:4,borderRadius:8,background:'#0b1020',cursor:'pointer'}}><img src={img.url} alt={img.alt} style={{width:'100%',aspectRatio:'3 / 2',objectFit:'cover',borderRadius:5,display:'block'}}/><span style={{display:'block',fontSize:9,color:'#9aa7bd',padding:4}}>{img.quality} · chọn ảnh {i+1}</span></button>)}</div>}
          <div style={{margin:'10px 0',borderTop:'1px solid #263249'}} />
          <label style={{fontSize:10,color:'#aab6cb'}}>Hoặc upload ảnh riêng</label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploadingAsset} onChange={e=>{const file=e.target.files?.[0];if(file)uploadHero(file)}} style={{width:'100%',fontSize:11,color:'#9aa7bd',marginTop:6}} />
          {assetError&&<div className="error">{assetError}</div>}
          {brief.heroImageUrl&&<div style={{marginTop:10}}><img src={brief.heroImageUrl} alt={brief.heroImageAlt||''} style={{width:'100%',maxHeight:160,objectFit:'cover',borderRadius:8}}/><div className="field" style={{marginTop:8,marginBottom:0}}><label>Alt text</label><input value={brief.heroImageAlt||''} onChange={e=>set('heroImageAlt',e.target.value)} /></div></div>}
        </div>

        <div className="field"><label>URL tham khảo</label><input value={brief.referenceUrl||''} onChange={e=>set('referenceUrl',e.target.value)} /></div>
        <div className="field"><label>Nội dung bổ sung</label><textarea value={brief.extra||''} onChange={e=>set('extra',e.target.value)} /></div>
        <button className="primary" disabled={!ready||loading} onClick={generate}>{loading?'AI đang xây PageSpec...':'3. Generate Landing Page'}</button>
        {error&&<div className="error">{error}</div>}
        <div className="hint">Cần <b>ANTHROPIC_API_KEY</b> cho Page Architect và <b>OPENAI_API_KEY</b> cho GPT-Image-2. Cả hai chỉ chạy server-side.</div>
        {quality&&<div style={{marginTop:12,padding:12,border:'1px solid #263249',borderRadius:10,background:'#172033'}}><div style={{display:'flex',justifyContent:'space-between'}}><strong>4. PageSpec Quality</strong><strong style={{color:quality.score>=85?'#23c483':'#fbbf24'}}>{quality.score}/100</strong></div>{quality.checks.map(c=><div key={c.id} style={{fontSize:11,color:c.ok?'#8ee6bd':'#ffb0b0',marginTop:5}}>{c.ok?'✓':'•'} {c.label}</div>)}</div>}
        {data&&spec&&<div style={{marginTop:12,padding:12,border:'1px solid #35518a',borderRadius:10,background:'#111b31'}}><strong style={{display:'block',marginBottom:8}}>5. Publish & Audit</strong><div className="field"><label>Public slug</label><input value={publishSlug} onChange={e=>{setPublishSlug(slugify(e.target.value));setPublishedUrl('');setRuntimeAudit(null)}} /></div><button className="primary" disabled={publishing} onClick={publish}>{publishing?'Đang publish...':'🚀 Publish Landing Page'}</button>{publishError&&<div className="error">{publishError}</div>}{publishedUrl&&<div style={{marginTop:10,fontSize:11}}><a href={publishedUrl} target="_blank" rel="noreferrer" style={{color:'#8fb0ff',wordBreak:'break-all'}}>{publishedUrl}</a><button className="secondary" disabled={auditing} onClick={auditPublished} style={{width:'100%',marginTop:8}}>{auditing?'Đang audit...':'Kiểm tra SEO/HTML thực tế'}</button></div>}{auditError&&<div className="error">{auditError}</div>}{runtimeAudit&&<div style={{marginTop:10}}><strong>Runtime Audit {runtimeAudit.score}/100</strong>{runtimeAudit.checks.map(c=><div key={c.id} style={{fontSize:10.5,color:c.ok?'#8ee6bd':'#ffb0b0',marginTop:4}}>{c.ok?'✓':'•'} {c.label}{c.value?` · ${c.value}`:''}</div>)}</div>}</div>}
      </aside>
      <section className="canvas">{!data?<div className="empty"><div className="empty-card"><h2>Brief → Image → AI → Editor</h2><p>Tạo/chọn Hero image, Generate PageSpec và chỉnh trực tiếp trong Puck. Design tokens nằm trong Root settings của editor.</p></div></div>:<div className="editor-wrap"><Puck key={editorKey} config={puckConfig} data={data} onChange={setData} onPublish={saveDraft} headerTitle={brief.productName||'Landing Page'} viewports={[{width:1440,height:'auto',label:'Desktop'},{width:768,height:'auto',label:'Tablet'},{width:375,height:'auto',label:'Mobile'}]} /><div className="specbar"><button className="secondary" onClick={()=>data&&saveDraft(data)}>Lưu draft</button><button className="secondary" onClick={()=>{data&&saveDraft(data);window.open('/preview','_blank')}}>Preview</button><button className="secondary" disabled={publishing} onClick={publish}>Publish</button><button className="secondary" onClick={exportJson}>Export JSON</button></div></div>}</section>
    </main>
  </>;
}
