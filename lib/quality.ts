import type { PageSpec } from './page-spec';

export type QualityCheck={id:string;label:string;ok:boolean;severity:'error'|'warning'|'info'};

export function evaluatePageSpec(spec:PageSpec):{score:number;checks:QualityCheck[]}{
  const components=spec.sections.map(s=>s.component);
  const checks:QualityCheck[]=[
    {id:'seo-title',label:'SEO title có nội dung',ok:spec.seo.title.trim().length>=20,severity:'error'},
    {id:'seo-description',label:'Meta description đủ rõ',ok:spec.seo.description.trim().length>=70,severity:'error'},
    {id:'hero',label:'Có Hero đầu trang',ok:components.slice(0,2).some(x=>x==='HeroSplit'||x==='HeroCentered'),severity:'error'},
    {id:'cta',label:'Có CTA cuối trang',ok:components.includes('FinalCTA')||components.includes('LeadForm'),severity:'error'},
    {id:'flow',label:'Page có 5–12 sections',ok:spec.sections.length>=5&&spec.sections.length<=12,severity:'warning'},
    {id:'faq',label:'Có FAQ xử lý objection',ok:components.includes('FAQAccordion'),severity:'info'},
    {id:'proof',label:'Có proof hoặc testimonial',ok:components.includes('Testimonials')||components.includes('StatsStrip'),severity:'warning'},
    {id:'cta-event',label:'Primary CTA có analytics event',ok:Boolean(spec.page.primaryCTA.event?.trim()),severity:'warning'},
    {id:'schema',label:'Có structured data recommendation',ok:spec.seo.schemaTypes.length>0,severity:'info'},
    {id:'mobile',label:'Có mobile guidance',ok:spec.qualityHints.mobileNotes.length>0,severity:'info'}
  ];
  const weights={error:15,warning:8,info:4};
  const total=checks.reduce((sum,c)=>sum+weights[c.severity],0);
  const earned=checks.reduce((sum,c)=>sum+(c.ok?weights[c.severity]:0),0);
  return {score:Math.round((earned/total)*100),checks};
}
