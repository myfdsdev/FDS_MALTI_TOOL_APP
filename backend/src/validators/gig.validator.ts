import { z } from "zod";

const platformEnum = z.enum(["fiverr", "upwork", "linkedin", "instagram", "freelancer"]);
const experienceEnum = z.enum(["beginner", "intermediate", "expert"]);
const toneEnum = z.enum(["professional", "friendly", "persuasive", "casual"]);
const statusEnum = z.enum(["queued", "processing", "partial", "completed", "failed"]);

export const createGigSchema = z
  .object({
    serviceName: z.string().trim().min(1, "Service name is required").max(200),
    platform: platformEnum,
    category: z.string().trim().max(100).optional(),
    targetAudience: z.string().trim().min(1, "Target audience is required").max(500),
    niche: z.string().trim().min(1, "Niche is required").max(300),
    problemSolved: z.string().trim().min(1, "Problem solved is required").max(1000),
    buyerResult: z.string().trim().min(1, "Buyer result is required").max(1000),
    toolsUsed: z.string().trim().min(1, "Tools used is required").max(500),
    deliveryFormat: z.string().trim().min(1, "Delivery format is required").max(300),
    experienceLevel: experienceEnum,
    preferredTone: toneEnum,
    pricingMin: z.number().nonnegative(),
    pricingMax: z.number().positive(),
    pricingCurrency: z.string().trim().min(1).max(8).default("USD"),
    deliveryTime: z.string().trim().min(1, "Delivery time is required").max(100),
  })
  .refine((v) => v.pricingMin < v.pricingMax, {
    message: "pricingMin must be less than pricingMax",
    path: ["pricingMin"],
  });

const packageSchema = z.object({
  name: z.string().max(100).optional(),
  price: z.number().nonnegative().optional(),
  deliveryDays: z.number().int().nonnegative().optional(),
  revisions: z.number().int().nonnegative().optional(),
  deliverables: z.array(z.string()).optional(),
  addOns: z.array(z.string()).optional(),
});

const packagesPartialSchema = z.object({
  basic: packageSchema.optional(),
  standard: packageSchema.optional(),
  premium: packageSchema.optional(),
});

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const addOnServiceSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative(),
  description: z.string(),
});

const gigContentPatchSchema = z.object({
  title: z.string().optional(),
  alternativeTitles: z.array(z.string()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoKeywords: z.array(z.string()).optional(),
  description: z.string().optional(),
  packages: packagesPartialSchema.optional(),
  buyerRequirements: z.array(z.string()).optional(),
  faqs: z.array(faqSchema).optional(),
  addOnServices: z.array(addOnServiceSchema).optional(),
  thumbnailConcept: z.string().optional(),
  thumbnailPrompt: z.string().optional(),
  portfolioSampleIdeas: z.array(z.string()).optional(),
});

const leadStrategyPatchSchema = z.object({
  bestLeadTypes: z.array(z.string()).optional(),
  targetIndustries: z.array(z.string()).optional(),
  googleQueries: z.array(z.string()).optional(),
  instagramSearchTerms: z.array(z.string()).optional(),
  linkedinSearchTerms: z.array(z.string()).optional(),
  googleMapsSearchTerms: z.array(z.string()).optional(),
  manualStrategy: z.string().optional(),
});

const outreachMessageSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

const outreachPatchSchema = z.object({
  coldEmail: outreachMessageSchema.optional(),
  instagramDm: z.string().optional(),
  linkedinMessage: z.string().optional(),
  shortPitch: z.string().optional(),
  followUpMessage: z.string().optional(),
  proposalMessage: z.string().optional(),
});

export const updateGigSchema = z
  .object({
    title: z.string().trim().max(300).optional(),
    archived: z.boolean().optional(),
    content: z
      .object({
        gig: gigContentPatchSchema.optional(),
        leadStrategy: leadStrategyPatchSchema.optional(),
        outreach: outreachPatchSchema.optional(),
      })
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No updates provided" });

export const improveGigSectionSchema = z.object({
  section: z.enum(["title", "description", "packages", "faqs", "outreach"]),
  instructions: z.string().trim().max(1000).optional(),
});

export const shareGigSchema = z.object({
  enabled: z.boolean(),
});

export const listGigsQuerySchema = z.object({
  platform: platformEnum.optional(),
  status: statusEnum.optional(),
  archived: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .optional(),
  search: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  cursor: z.string().optional(),
});

export type CreateGigInput = z.infer<typeof createGigSchema>;
export type UpdateGigInput = z.infer<typeof updateGigSchema>;
export type ImproveGigSectionInput = z.infer<typeof improveGigSectionSchema>;
export type ShareGigInput = z.infer<typeof shareGigSchema>;
export type ListGigsQuery = z.infer<typeof listGigsQuerySchema>;
