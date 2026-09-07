# RUN LP Studio V1.5

Ứng dụng nội bộ giúp Marketing tạo, chỉnh sửa, kiểm tra và publish Landing Page mà không cần viết HTML/CSS.

## Luồng chính

Marketing Brief → Brand Kit → GPT-Image-2 Creative Studio → AI Page Architect → PageSpec JSON → Zod Validation → Puck Visual Editor → Quality Gate → Preview → Publish → Runtime Audit → Public URL

## Kiến trúc cốt lõi

PageSpec + approved component registry là source-of-truth. AI không sinh HTML production tự do. Marketing chỉnh trang bằng Puck; dữ liệu bản cuối được lưu/publish dưới dạng structured data và render lại bằng component đã duyệt.

Ảnh cũng đi theo cùng nguyên tắc: Image Agent không tạo ảnh ngẫu nhiên. Prompt ảnh được dựng từ Product Brief + Audience + USP + Brand tone + Brand color + vị trí sử dụng. Ảnh sau khi generate được lưu vào Vercel Blob, Marketing chọn ảnh trước khi đưa vào PageSpec/editor.

## Stack

- Next.js 16
- React 19
- TypeScript
- Puck visual editor
- Zod validation
- Anthropic Messages API cho Page Architect
- OpenAI GPT-Image-2 cho image generation
- Vercel
- Vercel Blob cho published page storage và image assets

## Chạy local

```bash
npm install
npm run dev
```

Tạo `.env.local`:

```bash
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=your_supported_model
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
BLOB_READ_WRITE_TOKEN=your_blob_token_if_not_using_vercel_oidc
```

Không đưa API key/token vào browser hoặc commit lên GitHub.

## GPT-Image-2 workflow

### Draft mode
- Model: `gpt-image-2`
- Quality: `medium`
- Hero size: `1536x1024`
- Generate 2 options
- Marketing chọn 1 ảnh

### Final mode
- Model: `gpt-image-2`
- Quality: `high`
- Hero size: `2048x1152`
- Generate 1 final image
- Ảnh final được tự động chọn làm Hero

### Prompt rules
- Giữ negative space cho headline/CTA
- Không tạo logo giả
- Không watermark
- Không pseudo text / UI text
- Không tự bịa số liệu, chứng nhận, giá, product screenshot
- Tránh phong cách AI generic, CGI/plastic skin, cyberpunk không liên quan
- Ưu tiên commercial art direction phù hợp Landing Page

## V1.5 đã có

- Marketing Brief
- Brand Kit cơ bản: brand color / font style / radius
- Hero variants: Split / Centered / Dark
- Upload Hero image JPG / PNG / WebP / AVIF
- GPT-Image-2 Creative Studio
- Draft/Final image generation
- Generated image lưu trên Vercel Blob
- Marketing chọn generated image làm Hero
- Hero có alt text và `fetchPriority="high"`
- AI sinh PageSpec JSON thay vì HTML
- Zod validate PageSpec
- Approved component registry
- PageSpec → Puck Data converter
- Puck drag/drop visual editor
- Desktop / Tablet / Mobile viewport
- Local draft save + auto restore
- JSON export
- Preview route `/preview`
- PageSpec Quality Gate
- Publish API `/api/publish`
- Public page route `/share/[slug]`
- SEO title / description / canonical / Open Graph
- Hero image dùng làm Open Graph image khi có
- JSON-LD WebPage và FAQPage
- robots.txt + dynamic sitemap từ published pages
- Runtime HTML/SEO audit sau publish

## Vercel setup

1. Import/connect repository `tuanpm1911/lp2` với Vercel.
2. Preview branch: `feature/lp-studio-v1`.
3. Thêm `ANTHROPIC_API_KEY`.
4. Thêm `OPENAI_API_KEY`.
5. Thêm `NEXT_PUBLIC_SITE_URL` khi có production/custom domain.
6. Trong Project → Storage, tạo/kết nối Vercel Blob store.
7. Với project/store mới, ưu tiên OIDC. Nếu project cũ dùng static token, cần `BLOB_READ_WRITE_TOKEN`.
8. Marketing nhập Brief → Generate/Upload Hero → Generate LP → Edit → Preview → Publish → Audit.

## Vòng tiếp theo

- Image Agent cho từng section thay vì chỉ Hero
- Edit/regenerate ảnh dựa trên ảnh đã chọn
- Responsive image derivatives / AVIF/WebP/srcset tự động
- Lighthouse / Core Web Vitals quality gate
- Authentication + role Marketing/Reviewer/Admin
- Server-side version history + rollback
- AI regenerate một section
- Brand Kit nhiều thương hiệu: TENTEN / RUNSYSTEM / RUNBiz...
- Analytics events + A/B testing
- Custom domain / campaign domain mapping
