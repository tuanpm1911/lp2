import { list } from '@vercel/blob';
import { z } from 'zod';
import { PageSpecSchema } from './page-spec';

export const PublishedPageSchema = z.object({
  version: z.literal(1),
  slug: z.string().min(2).max(80),
  publishedAt: z.string(),
  brief: z.record(z.string(), z.unknown()).default({}),
  spec: PageSpecSchema,
  puckData: z.unknown()
});

export type PublishedPage = z.infer<typeof PublishedPageSchema>;

export function normalizeSlug(value:string){
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,80);
}

export async function getPublishedPage(slug:string):Promise<PublishedPage|null>{
  const safe=normalizeSlug(slug);
  if(!safe) return null;
  const pathname=`published/${safe}.json`;
  const { blobs }=await list({prefix:pathname,limit:5});
  const blob=blobs.find(item=>item.pathname===pathname);
  if(!blob) return null;
  const response=await fetch(blob.url,{cache:'no-store'});
  if(!response.ok) return null;
  return PublishedPageSchema.parse(await response.json());
}
