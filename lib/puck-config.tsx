import type { Config, Data } from '@puckeditor/core';
import type { MarketingBrief, PageSpec } from './page-spec';

type Components = {
  HeroSplit: { variant:string; eyebrow:string; title:string; description:string; ctaLabel:string; ctaHref:string; imageUrl:string; imageAlt:string };
  BenefitCards: { title:string; items:string };
  ProblemSolution: { title:string; problem:string; solution:string };
  HowItWorks: { title:string; steps:string };
  Testimonials: { title:string; quotes:string };
  PricingTable: { title:string; price:string; description:string; ctaLabel:string };
  FAQAccordion: { title:string; items:string };
  FinalCTA: { title:string; description:string; ctaLabel:string; ctaHref:string };
  Footer: { company:string; contact:string };
};

type RootProps={title:string;brandColor:string;fontStyle:string;radius:string};

const shell: React.CSSProperties={maxWidth:1160,margin:'0 auto',padding:'0 24px'};
const btn: React.CSSProperties={display:'inline-block',padding:'13px 22px',borderRadius:'var(--lp-radius)',background:'var(--lp-brand)',color:'#fff',fontWeight:800,textDecoration:'none'};
const lines=(value:string)=>value.split('\n').map(x=>x.trim()).filter(Boolean);
const fontMap:Record<string,string>={modern:'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',editorial:'Georgia,"Times New Roman",serif',classic:'Arial,Helvetica,sans-serif'};

export const puckConfig: Config<any> = {
  root:{
    fields:{
      title:{type:'text'},
      brandColor:{type:'text'},
      fontStyle:{type:'select',options:[{label:'Modern',value:'modern'},{label:'Editorial',value:'editorial'},{label:'Classic',value:'classic'}]},
      radius:{type:'select',options:[{label:'Sharp',value:'6px'},{label:'Balanced',value:'14px'},{label:'Soft',value:'24px'}]}
    },
    defaultProps:{title:'Landing Page',brandColor:'#2563eb',fontStyle:'modern',radius:'14px'},
    render:({children,brandColor,fontStyle,radius}:RootProps&{children:React.ReactNode})=>{
      const style={
        '--lp-brand':brandColor||'#2563eb',
        '--lp-radius':radius||'14px',
        fontFamily:fontMap[fontStyle]||fontMap.modern,
        background:'#fff',
        color:'#0f172a',
        minHeight:'100vh'
      } as React.CSSProperties;
      return <div style={style}>{children}</div>;
    }
  },
  categories:{
    conversion:{title:'Conversion',components:['HeroSplit','PricingTable','FinalCTA']},
    content:{title:'Content',components:['ProblemSolution','BenefitCards','HowItWorks','Testimonials','FAQAccordion']},
    global:{title:'Global',components:['Footer']}
  },
  components:{
    HeroSplit:{
      label:'Hero',
      fields:{
        variant:{type:'select',options:[{label:'Split',value:'split'},{label:'Centered',value:'centered'},{label:'Dark',value:'dark'}]},
        eyebrow:{type:'text'},title:{type:'text'},description:{type:'textarea'},ctaLabel:{type:'text'},ctaHref:{type:'text'},imageUrl:{type:'text'},imageAlt:{type:'text'}
      },
      defaultProps:{variant:'split',eyebrow:'SẢN PHẨM MỚI',title:'Một headline rõ giá trị',description:'Mô tả ngắn gọn lợi ích chính.',ctaLabel:'Bắt đầu ngay',ctaHref:'#contact',imageUrl:'',imageAlt:''},
      render:({variant,eyebrow,title,description,ctaLabel,ctaHref,imageUrl,imageAlt}:Components['HeroSplit'])=>{
        const centered=variant==='centered';
        const dark=variant==='dark';
        const sectionStyle:React.CSSProperties={padding:'76px 0',background:dark?'#07111f':'linear-gradient(135deg,#f8fafc,#fff)',color:dark?'#fff':'#0f172a',borderTop:dark?'4px solid var(--lp-brand)':'4px solid var(--lp-brand)'};
        const layout:React.CSSProperties={...shell,display:'grid',gridTemplateColumns:centered?'1fr':imageUrl?'repeat(auto-fit,minmax(320px,1fr))':'1fr',alignItems:'center',gap:42,textAlign:centered?'center':'left'};
        return <section style={sectionStyle}><div style={layout}><div style={{maxWidth:centered?850:760,margin:centered?'0 auto':undefined}}><div style={{fontSize:13,fontWeight:900,letterSpacing:1.3,color:dark?'#93c5fd':'var(--lp-brand)',marginBottom:14}}>{eyebrow}</div><h1 style={{fontSize:'clamp(38px,6vw,68px)',lineHeight:1.02,letterSpacing:-2.5,margin:'0 0 20px',color:dark?'#fff':'#0f172a'}}>{title}</h1><p style={{fontSize:19,lineHeight:1.7,color:dark?'#cbd5e1':'#475569',margin:'0 0 28px'}}>{description}</p><a href={ctaHref} style={btn}>{ctaLabel}</a></div>{imageUrl&&<figure style={{margin:centered?'10px auto 0':0,maxWidth:centered?880:undefined,width:'100%',borderRadius:'var(--lp-radius)',overflow:'hidden',boxShadow:'0 24px 70px rgba(15,23,42,.16)',background:'#e2e8f0',aspectRatio:centered?'16 / 9':'4 / 3'}}><img src={imageUrl} alt={imageAlt} fetchPriority="high" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} /></figure>}</div></section>;
      }
    },
    ProblemSolution:{
      fields:{title:{type:'text'},problem:{type:'textarea'},solution:{type:'textarea'}},defaultProps:{title:'Vấn đề → Giải pháp',problem:'Vấn đề khách hàng đang gặp',solution:'Cách sản phẩm giải quyết'},
      render:({title,problem,solution}:Components['ProblemSolution'])=><section style={{padding:'72px 0'}}><div style={shell}><h2 style={{fontSize:36,marginBottom:28}}>{title}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18}}><article style={{padding:28,border:'1px solid #e2e8f0',borderRadius:'var(--lp-radius)'}}><strong>Vấn đề</strong><p style={{lineHeight:1.7,color:'#475569'}}>{problem}</p></article><article style={{padding:28,border:'1px solid var(--lp-brand)',background:'#f8fafc',borderRadius:'var(--lp-radius)'}}><strong>Giải pháp</strong><p style={{lineHeight:1.7,color:'#334155'}}>{solution}</p></article></div></div></section>
    },
    BenefitCards:{
      fields:{title:{type:'text'},items:{type:'textarea'}},defaultProps:{title:'Lợi ích nổi bật',items:'Nhanh hơn\nDễ sử dụng\nTối ưu chi phí'},
      render:({title,items}:Components['BenefitCards'])=><section style={{padding:'72px 0',background:'#f8fafc'}}><div style={shell}><h2 style={{fontSize:36,marginBottom:28}}>{title}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>{lines(items).map((x,i)=><div key={i} style={{padding:24,background:'#fff',border:'1px solid #e2e8f0',borderTop:'3px solid var(--lp-brand)',borderRadius:'var(--lp-radius)',fontWeight:750}}>{x}</div>)}</div></div></section>
    },
    HowItWorks:{fields:{title:{type:'text'},steps:{type:'textarea'}},defaultProps:{title:'Cách hoạt động',steps:'Bước 1\nBước 2\nBước 3'},render:({title,steps}:Components['HowItWorks'])=><section style={{padding:'72px 0'}}><div style={shell}><h2 style={{fontSize:36}}>{title}</h2>{lines(steps).map((x,i)=><div key={i} style={{display:'flex',gap:16,padding:'18px 0',borderBottom:'1px solid #e2e8f0'}}><b style={{color:'var(--lp-brand)'}}>{String(i+1).padStart(2,'0')}</b><span>{x}</span></div>)}</div></section>},
    Testimonials:{fields:{title:{type:'text'},quotes:{type:'textarea'}},defaultProps:{title:'Khách hàng nói gì',quotes:'Đánh giá thực tế 1\nĐánh giá thực tế 2'},render:({title,quotes}:Components['Testimonials'])=><section style={{padding:'72px 0',background:'#0f172a',color:'#fff'}}><div style={shell}><h2 style={{fontSize:36}}>{title}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>{lines(quotes).map((x,i)=><blockquote key={i} style={{margin:0,padding:24,border:'1px solid #334155',borderRadius:'var(--lp-radius)',lineHeight:1.7}}>{x}</blockquote>)}</div></div></section>},
    PricingTable:{fields:{title:{type:'text'},price:{type:'text'},description:{type:'textarea'},ctaLabel:{type:'text'}},defaultProps:{title:'Gói phù hợp để bắt đầu',price:'Liên hệ',description:'Mô tả giá trị của gói.',ctaLabel:'Nhận tư vấn'},render:({title,price,description,ctaLabel}:Components['PricingTable'])=><section style={{padding:'72px 0'}}><div style={shell}><div style={{maxWidth:620,margin:'0 auto',padding:36,border:'2px solid var(--lp-brand)',borderRadius:'var(--lp-radius)',textAlign:'center'}}><h2>{title}</h2><div style={{fontSize:44,fontWeight:900,margin:'18px 0'}}>{price}</div><p style={{color:'#475569',lineHeight:1.7}}>{description}</p><a href="#contact" style={btn}>{ctaLabel}</a></div></div></section>},
    FAQAccordion:{fields:{title:{type:'text'},items:{type:'textarea'}},defaultProps:{title:'Câu hỏi thường gặp',items:'Câu hỏi 1 | Câu trả lời 1\nCâu hỏi 2 | Câu trả lời 2'},render:({title,items}:Components['FAQAccordion'])=><section style={{padding:'72px 0',background:'#f8fafc'}}><div style={{...shell,maxWidth:820}}><h2 style={{fontSize:36}}>{title}</h2>{lines(items).map((x,i)=>{const [q,a]=x.split('|');return <details key={i} style={{padding:'18px 0',borderBottom:'1px solid #cbd5e1'}}><summary style={{fontWeight:800,cursor:'pointer'}}>{q}</summary><p style={{color:'#475569',lineHeight:1.7}}>{a||''}</p></details>})}</div></section>},
    FinalCTA:{fields:{title:{type:'text'},description:{type:'textarea'},ctaLabel:{type:'text'},ctaHref:{type:'text'}},defaultProps:{title:'Sẵn sàng bắt đầu?',description:'Thực hiện bước tiếp theo ngay hôm nay.',ctaLabel:'Bắt đầu ngay',ctaHref:'#contact'},render:({title,description,ctaLabel,ctaHref}:Components['FinalCTA'])=><section id="contact" style={{padding:'76px 0',background:'var(--lp-brand)',color:'#fff',textAlign:'center'}}><div style={{...shell,maxWidth:760}}><h2 style={{fontSize:42,marginBottom:12}}>{title}</h2><p style={{fontSize:18,opacity:.88,marginBottom:26}}>{description}</p><a href={ctaHref} style={{...btn,background:'#fff',color:'#0f172a'}}>{ctaLabel}</a></div></section>},
    Footer:{fields:{company:{type:'text'},contact:{type:'text'}},defaultProps:{company:'RUNSYSTEM / TENTEN',contact:'Thông tin liên hệ'},render:({company,contact}:Components['Footer'])=><footer style={{padding:'32px 0',background:'#020617',color:'#94a3b8'}}><div style={{...shell,display:'flex',justifyContent:'space-between',gap:20,flexWrap:'wrap'}}><strong style={{color:'#fff'}}>{company}</strong><span>{contact}</span></div></footer>}
  }
};

export function pageSpecToPuck(spec:PageSpec,brief?:MarketingBrief):Data{
  const content=spec.sections.map((s,index)=>{
    const p=s.props as Record<string,unknown>;
    const id=`${s.component}-${s.id}-${index}`;
    switch(s.component){
      case 'HeroSplit': return {type:'HeroSplit',props:{id,variant:['split','centered','dark'].includes(s.variant)?s.variant:'split',eyebrow:String(p.eyebrow||''),title:String(p.title||spec.page.name),description:String(p.description||''),ctaLabel:String(p.ctaLabel||spec.page.primaryCTA.label),ctaHref:String(p.ctaHref||spec.page.primaryCTA.href),imageUrl:String(p.imageUrl||s.images?.[0]?.src||brief?.heroImageUrl||''),imageAlt:String(p.imageAlt||s.images?.[0]?.alt||brief?.heroImageAlt||'')}};
      case 'ProblemSolution': return {type:'ProblemSolution',props:{id,title:String(p.title||'Vấn đề và giải pháp'),problem:String(p.problem||''),solution:String(p.solution||'')}};
      case 'BenefitCards': case 'FeatureGrid': return {type:'BenefitCards',props:{id,title:String(p.title||'Lợi ích nổi bật'),items:Array.isArray(p.items)?p.items.join('\n'):String(p.items||'')}};
      case 'HowItWorks': return {type:'HowItWorks',props:{id,title:String(p.title||'Cách hoạt động'),steps:Array.isArray(p.steps)?p.steps.join('\n'):String(p.steps||'')}};
      case 'Testimonials': return {type:'Testimonials',props:{id,title:String(p.title||'Khách hàng nói gì'),quotes:Array.isArray(p.quotes)?p.quotes.join('\n'):String(p.quotes||'')}};
      case 'PricingTable': return {type:'PricingTable',props:{id,title:String(p.title||'Bảng giá'),price:String(p.price||''),description:String(p.description||''),ctaLabel:String(p.ctaLabel||spec.page.primaryCTA.label)}};
      case 'FAQAccordion': return {type:'FAQAccordion',props:{id,title:String(p.title||'FAQ'),items:Array.isArray(p.items)?p.items.map((x:any)=>typeof x==='string'?x:`${x.question||''} | ${x.answer||''}`).join('\n'):String(p.items||'')}};
      case 'FinalCTA': case 'LeadForm': return {type:'FinalCTA',props:{id,title:String(p.title||'Sẵn sàng bắt đầu?'),description:String(p.description||''),ctaLabel:String(p.ctaLabel||spec.page.primaryCTA.label),ctaHref:String(p.ctaHref||spec.page.primaryCTA.href)}};
      case 'Footer': return {type:'Footer',props:{id,company:String(p.company||spec.page.name),contact:String(p.contact||'')}};
      default:return {type:'BenefitCards',props:{id,title:String(p.title||s.purpose||s.component),items:String(p.items||p.description||'')}};
    }
  });
  return {content,root:{props:{title:spec.seo.title||spec.page.name,brandColor:brief?.brandColor||'#2563eb',fontStyle:'modern',radius:'14px'}}} as Data;
}
