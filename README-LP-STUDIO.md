# RUN LP Studio V1

MVP kiến trúc mới cho landing page nội bộ Marketing.

## Luồng chính

Marketing Brief → AI Page Architect → PageSpec JSON → Puck Visual Editor → Draft / Export

## Vì sao thay đổi kiến trúc

Bản cũ yêu cầu AI sinh HTML tự do rồi inject editor vào HTML. V1 chuyển source-of-truth sang PageSpec + component registry để kiểm soát code, UX, SEO và khả năng mở rộng.

## Stack

- Next.js 16
- React 19
- TypeScript
- Puck 0.23 visual editor
- Zod validation
- Anthropic Messages API
- Vercel

## Chạy local

```bash
npm install
npm run dev
```

Tạo `.env.local`:

```bash
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-sonnet-5
```

Không đưa API key vào browser hoặc commit lên GitHub.

## V1 đã có

- Marketing Brief
- API AI sinh PageSpec JSON thay vì HTML
- Zod validate PageSpec
- Approved component registry
- PageSpec → Puck Data converter
- Puck drag/drop visual editor
- Desktop / Tablet / Mobile viewport
- Local draft save
- Export JSON

## Chưa có trong V1

- Database / authentication
- Asset CDN / image optimizer
- Public page renderer
- SEO / Lighthouse quality gate
- Publish domain
- Version history server-side
- A/B testing / analytics

Các phần này thuộc V1.1–V2 sau khi xác nhận UX của Brief + Editor.

## Vercel

Import repository `tuanpm1911/lp2`, chọn branch `feature/lp-studio-v1` để Preview Deploy, sau đó thêm Environment Variable `ANTHROPIC_API_KEY`.
