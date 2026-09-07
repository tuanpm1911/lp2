import type { MarketingBrief, PageSpec } from './page-spec';
import { pageSpecToPuck } from './puck-config';

export const demoBrief:MarketingBrief={
  productName:'Vibe Code Hosting',
  audience:'Người làm website bằng AI, vibe coding hoặc no-code muốn có môi trường hosting dễ tiếp cận và dễ quản lý.',
  goal:'Đăng ký dùng thử',
  usp:'Đưa website từ ý tưởng lên môi trường hosting dễ quản lý\nPhù hợp workflow tạo website bằng AI / vibe coding\nTập trung vào trải nghiệm đơn giản cho người không chuyên hạ tầng',
  cta:'Khám phá Vibe Code Hosting',
  brandColor:'#1375FF',
  tone:'Hiện đại, công nghệ, rõ ràng, dễ hiểu',
  heroImageUrl:'/demo/vibe-code-hero.svg',
  heroImageAlt:'Minh họa dashboard hosting hiện đại dành cho website tạo bằng AI',
  extra:'NỘI DUNG DEMO NỘI BỘ — không sử dụng như claim thương mại chính thức.'
};

export const demoSpec:PageSpec={
  page:{
    name:'Vibe Code Hosting',
    locale:'vi-VN',
    conversionGoal:'Đăng ký dùng thử',
    primaryCTA:{label:'Khám phá ngay',href:'#contact',event:'cta_click'}
  },
  seo:{
    title:'Vibe Code Hosting — Demo Landing Page',
    description:'Bản demo LP Studio minh họa cách Marketing có thể tạo, chỉnh sửa và kiểm tra landing page Vibe Code Hosting bằng component chuẩn.',
    canonical:'',
    ogTitle:'Vibe Code Hosting — Demo LP Studio',
    ogDescription:'Bản demo nội bộ của hệ thống LP Studio.',
    ogImageRequirement:'1200x630',
    schemaTypes:['WebPage','FAQPage']
  },
  design:{
    brandColor:'#1375FF',
    fontStyle:'modern',
    radius:'14px'
  },
  sections:[
    {
      id:'hero',component:'HeroSplit',variant:'dark',purpose:'Giới thiệu giá trị cốt lõi',
      props:{eyebrow:'VIBE CODE HOSTING · DEMO',title:'Từ ý tưởng AI đến một website sẵn sàng vận hành',description:'Một trải nghiệm hosting được trình bày theo cách đơn giản hơn cho người đang tạo website bằng AI, vibe coding hoặc no-code.',ctaLabel:'Khám phá ngay',ctaHref:'#contact',imageUrl:'/demo/vibe-code-hero.svg',imageAlt:'Minh họa dashboard hosting hiện đại dành cho website tạo bằng AI'},
      images:[{purpose:'Hero visual',src:'/demo/vibe-code-hero.svg',alt:'Minh họa dashboard hosting hiện đại dành cho website tạo bằng AI',aspectRatio:'3:2',lcp:true,lazy:false}],analytics:['cta_click']
    },
    {
      id:'problem',component:'ProblemSolution',variant:'default',purpose:'Nêu vấn đề và cách tiếp cận',
      props:{title:'Website tạo rất nhanh. Đưa lên vận hành thì không nên phức tạp.',problem:'Người làm website bằng AI thường tập trung vào ý tưởng, nội dung và trải nghiệm — nhưng lại dễ mắc kẹt ở bước cấu hình, triển khai và quản lý hosting.',solution:'Landing Page demo này minh họa cách sản phẩm có thể được giải thích bằng ngôn ngữ đơn giản, tập trung vào kết quả người dùng muốn đạt được.'},images:[],analytics:[]
    },
    {
      id:'benefits',component:'BenefitCards',variant:'default',purpose:'Trình bày lợi ích',
      props:{title:'Một trải nghiệm được thiết kế cho workflow mới',items:['Tập trung vào việc đưa website lên vận hành','Giảm cảm giác phức tạp với người không chuyên hạ tầng','Phù hợp với quy trình tạo website bằng AI / vibe coding']},images:[],analytics:[]
    },
    {
      id:'how',component:'HowItWorks',variant:'default',purpose:'Giải thích luồng sử dụng',
      props:{title:'Từ ý tưởng đến website theo 3 bước','steps':['Tạo website bằng công cụ AI hoặc vibe coding','Đưa source / bản build vào môi trường hosting','Kiểm tra, xuất bản và tiếp tục tối ưu nội dung']},images:[],analytics:[]
    },
    {
      id:'pricing',component:'PricingTable',variant:'default',purpose:'Minh họa khu vực offer',
      props:{title:'Khu vực Offer / Pricing',price:'Liên hệ',description:'Phần này là nội dung demo. Khi dùng thật, Marketing nhập đúng gói giá và điều kiện đã được phê duyệt.',ctaLabel:'Nhận tư vấn'},images:[],analytics:['pricing_select']
    },
    {
      id:'faq',component:'FAQAccordion',variant:'default',purpose:'Xử lý câu hỏi thường gặp',
      props:{title:'Câu hỏi thường gặp',items:[{question:'Demo này có phải nội dung sản phẩm chính thức không?',answer:'Không. Đây là nội dung minh họa cho LP Studio và cần được thay bằng claim đã được phê duyệt trước khi publish campaign.'},{question:'Marketing có thể tự sửa nội dung không?',answer:'Có. Nội dung, section, CTA và layout có thể được chỉnh trực tiếp trong Visual Editor.'},{question:'Có thể thay ảnh Hero không?',answer:'Có. Bản production hỗ trợ upload ảnh hoặc tạo ảnh qua Image Studio khi có API key.'}]},images:[],analytics:[]
    },
    {
      id:'cta',component:'FinalCTA',variant:'default',purpose:'Chốt chuyển đổi',
      props:{title:'Đây là trải nghiệm LP Studio bạn có thể chỉnh ngay',description:'Mở Demo Studio để kéo thả section, sửa headline, CTA, màu thương hiệu và xem responsive mà không cần API key.',ctaLabel:'Mở Demo Studio',ctaHref:'/demo/studio'},images:[],analytics:['cta_click']
    },
    {
      id:'footer',component:'Footer',variant:'default',purpose:'Footer',
      props:{company:'TENTEN / RUNSYSTEM — DEMO',contact:'Nội dung minh họa nội bộ cho LP Studio'},images:[],analytics:[]
    }
  ],
  qualityHints:{
    primaryMessage:'Tạo và chỉnh LP bằng component chuẩn thay vì HTML tự do.',
    mainObjections:['Nội dung demo không phải claim thương mại chính thức'],
    proofRequired:['Bổ sung proof thật khi đưa vào campaign'],
    mobileNotes:['Hero phải đọc tốt trên 375px','CTA phải dễ bấm trên mobile']
  }
};

export const demoData=pageSpecToPuck(demoSpec,demoBrief);
