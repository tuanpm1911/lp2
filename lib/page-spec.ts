import { z } from 'zod';

export const CtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1).default('#'),
  event: z.string().optional()
});

export const SectionSchema = z.object({
  id: z.string().min(1),
  component: z.enum([
    'HeroSplit','HeroCentered','ProblemSolution','BenefitCards','FeatureGrid',
    'HowItWorks','StatsStrip','Testimonials','PricingTable','FAQAccordion',
    'LeadForm','FinalCTA','Footer'
  ]),
  variant: z.string().default('default'),
  purpose: z.string().default(''),
  props: z.record(z.string(), z.unknown()).default({}),
  images: z.array(z.object({
    purpose: z.string().default(''),
    src: z.string().optional(),
    alt: z.string().default(''),
    aspectRatio: z.string().optional(),
    lcp: z.boolean().optional(),
    lazy: z.boolean().optional()
  })).default([]),
  analytics: z.array(z.string()).default([])
});

export const PageSpecSchema = z.object({
  page: z.object({
    name: z.string().min(1),
    locale: z.string().default('vi-VN'),
    conversionGoal: z.string().default('lead'),
    primaryCTA: CtaSchema
  }),
  seo: z.object({
    title: z.string().default(''),
    description: z.string().default(''),
    canonical: z.string().default(''),
    ogTitle: z.string().default(''),
    ogDescription: z.string().default(''),
    ogImageRequirement: z.string().default(''),
    schemaTypes: z.array(z.string()).default([])
  }),
  sections: z.array(SectionSchema).min(1).max(20),
  qualityHints: z.object({
    primaryMessage: z.string().default(''),
    mainObjections: z.array(z.string()).default([]),
    proofRequired: z.array(z.string()).default([]),
    mobileNotes: z.array(z.string()).default([])
  }).default({ primaryMessage:'', mainObjections:[], proofRequired:[], mobileNotes:[] })
});

export type PageSpec = z.infer<typeof PageSpecSchema>;

export type MarketingBrief = {
  productName: string;
  audience: string;
  goal: string;
  usp: string;
  cta: string;
  price?: string;
  referenceUrl?: string;
  brandColor?: string;
  tone?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  extra?: string;
};
