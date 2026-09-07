# RUN LP Studio V1.2

Ứng dụng nội bộ giúp Marketing tạo, chỉnh sửa, kiểm tra và publish Landing Page mà không cần viết HTML/CSS.

## Luồng chính

Marketing Brief → AI Page Architect → PageSpec JSON → Zod Validation → Puck Visual Editor → Quality Gate → Preview → Publish → Public URL

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
- Vercel Blob cho published page storage

## Chạy local

```bash
npm install
npm run dev
```

Tạo `.env.local`:

```bash
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=your_supported_model
BLOB_READ_WRITE_TOKEN=your_blob_token_if_not_using_vercel_oidc
```

Không đưa API key/token vào browser hoặc commit lên GitHub.

## V1.2 đã có

- Marketing Brief
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
- SEO title/description/Open Graph metadata cho public page
- Vercel Blob persistence

## Vercel setup

1. Import/connect repository `tuanpm1911/lp2` với Vercel.
2. Preview branch: `feature/lp-studio-v1`.
3. Thêm `ANTHROPIC_API_KEY` cho Preview/Production.
4. Trong Project → Storage, tạo hoặc kết nối một Vercel Blob store.
5. Với project/store mới, ưu tiên OIDC. Nếu project cũ dùng static token, cần `BLOB_READ_WRITE_TOKEN`.
6. Generate một page, chỉnh trong editor, Preview, sau đó Publish.
7. Public page có URL dạng `/share/vibe-code-hosting`.

## Vòng tiếp theo

- Image asset upload + AVIF/WebP/srcset
- Runtime HTML/SEO audit
- Lighthouse / Core Web Vitals quality gate
- Authentication + role Marketing/Reviewer/Admin
- Server-side version history + rollback
- AI regenerate một section
- Brand Kit / design tokens nhiều thương hiệu
- Analytics events + A/B testing
- Custom domain / campaign domain mapping
