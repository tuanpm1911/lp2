# RUN LP Studio V1.3

Ứng dụng nội bộ giúp Marketing tạo, chỉnh sửa, kiểm tra và publish Landing Page mà không cần viết HTML/CSS.

## Luồng chính

Marketing Brief → Upload Assets → AI Page Architect → PageSpec JSON → Zod Validation → Puck Visual Editor → Quality Gate → Preview → Publish → Public URL

## Kiến trúc cốt lõi

PageSpec + approved component registry là source-of-truth. AI không sinh HTML production tự do. Marketing chỉnh trang bằng Puck; dữ liệu bản cuối được lưu/publish dưới dạng structured data và render lại bằng component đã duyệt.

## Stack

- Next.js 16
- React 19
- TypeScript
- Puck visual editor
- Zod validation
- Anthropic Messages API
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
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
BLOB_READ_WRITE_TOKEN=your_blob_token_if_not_using_vercel_oidc
```

Không đưa API key/token vào browser hoặc commit lên GitHub.

## V1.3 đã có

- Marketing Brief
- Hero image upload: JPG / PNG / WebP / AVIF, tối đa 8MB
- Image asset lưu trên Vercel Blob
- AI buộc giữ đúng uploaded image URL
- HeroSplit có ảnh + alt text + `fetchPriority="high"`
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
- JSON-LD WebPage và FAQPage từ nội dung thật
- Vercel Blob persistence

## Vercel setup

1. Import/connect repository `tuanpm1911/lp2` với Vercel.
2. Preview branch: `feature/lp-studio-v1`.
3. Thêm `ANTHROPIC_API_KEY` cho Preview/Production.
4. Thêm `NEXT_PUBLIC_SITE_URL` khi có production/custom domain.
5. Trong Project → Storage, tạo hoặc kết nối một Vercel Blob store.
6. Với project/store mới, ưu tiên OIDC. Nếu project cũ dùng static token, cần `BLOB_READ_WRITE_TOKEN`.
7. Generate một page, chỉnh trong editor, Preview, sau đó Publish.
8. Public page có URL dạng `/share/vibe-code-hosting`.

## Vòng tiếp theo

- Responsive image derivatives / AVIF/WebP/srcset tự động
- Runtime HTML/SEO audit
- Lighthouse / Core Web Vitals quality gate
- Authentication + role Marketing/Reviewer/Admin
- Server-side version history + rollback
- AI regenerate một section
- Brand Kit / design tokens nhiều thương hiệu
- Analytics events + A/B testing
- Custom domain / campaign domain mapping
