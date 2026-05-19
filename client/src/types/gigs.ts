export type GigPlatform = "fiverr" | "upwork" | "linkedin" | "instagram" | "freelancer";
export type GigStatus = "queued" | "processing" | "partial" | "completed" | "failed";
export type StageStatus = "pending" | "running" | "done" | "failed";
export type ExperienceLevel = "beginner" | "intermediate" | "expert";
export type GigTone = "professional" | "friendly" | "persuasive" | "casual";
export type GigCurrency = "USD" | "INR" | "EUR" | "GBP";
export type ImproveSection = "title" | "description" | "packages" | "faqs" | "outreach";

export interface GigInput {
  serviceName: string;
  platform: GigPlatform;
  category?: string;
  targetAudience: string;
  niche: string;
  problemSolved: string;
  buyerResult: string;
  toolsUsed: string;
  deliveryFormat: string;
  experienceLevel: ExperienceLevel;
  preferredTone: GigTone;
  pricingMin: number;
  pricingMax: number;
  pricingCurrency: GigCurrency;
  deliveryTime: string;
}

export interface GigPackage {
  name: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  deliverables: string[];
  addOns: string[];
}

export interface GigFAQ {
  question: string;
  answer: string;
}

export interface GigAddOn {
  name: string;
  price: number;
  description: string;
}

export interface GigCore {
  title: string;
  alternativeTitles: string[];
  category: string;
  tags: string[];
  seoKeywords: string[];
  description: string;
  packages: {
    basic: GigPackage;
    standard: GigPackage;
    premium: GigPackage;
  };
  buyerRequirements: string[];
  faqs: GigFAQ[];
  addOnServices: GigAddOn[];
  thumbnailConcept: string;
  thumbnailPrompt: string;
  portfolioSampleIdeas: string[];
}

export interface LeadStrategy {
  bestLeadTypes: string[];
  targetIndustries: string[];
  googleQueries: string[];
  instagramSearchTerms: string[];
  linkedinSearchTerms: string[];
  googleMapsSearchTerms: string[];
  manualStrategy: string;
}

export interface OutreachMessages {
  coldEmail: { subject: string; body: string };
  instagramDm: string;
  linkedinMessage: string;
  shortPitch: string;
  followUpMessage: string;
  proposalMessage: string;
}

export interface GigContent {
  gig: GigCore | null;
  leadStrategy: LeadStrategy | null;
  outreach: OutreachMessages | null;
}

export interface GigScoreBreakdown {
  clarity: number;
  appeal: number;
  pricing: number;
  trust: number;
  seo: number;
  uniqueness: number;
  completeness: number;
  conversion: number;
}

export interface GigScore {
  overall: number;
  breakdown: GigScoreBreakdown;
  suggestions: string[];
}

export interface GigGenerationStages {
  gig: { status: StageStatus; error?: string };
  leads: { status: StageStatus; error?: string };
  outreach: { status: StageStatus; error?: string };
}

export interface GigShare {
  enabled: boolean;
  slug: string | null;
  viewCount: number;
}

export interface Gig {
  _id: string;
  user: string;
  input: GigInput;
  content: GigContent;
  score: GigScore | null;
  status: GigStatus;
  generationStages: GigGenerationStages;
  title: string;
  archived: boolean;
  share: GigShare;
  createdAt: string;
  updatedAt: string;
  generationMs: number | null;
  generatedBy: "ai" | "fallback" | null;
}

export interface GigListItem {
  _id: string;
  title: string;
  status: GigStatus;
  archived: boolean;
  input: { platform: GigPlatform; niche: string; serviceName: string };
  share: { enabled: boolean; slug: string | null; viewCount: number };
  score: { overall: number } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShareGigResult {
  enabled: boolean;
  slug: string | null;
  url: string | null;
  viewCount: number;
}

export interface ImproveResult {
  section: ImproveSection;
  suggestion: string;
}

export interface PublicGig {
  title: string;
  input: GigInput;
  content: GigContent;
  score: GigScore | null;
  status: GigStatus;
  share: { viewCount: number };
  createdAt: string;
}

export const PLATFORM_LABEL: Record<GigPlatform, string> = {
  fiverr: "Fiverr",
  upwork: "Upwork",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  freelancer: "Freelancer",
};

export const CURRENCY_SYMBOL: Record<GigCurrency, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

export const SCORE_DIM_LABEL: Record<keyof GigScoreBreakdown, string> = {
  clarity: "Clarity",
  appeal: "Appeal",
  pricing: "Pricing",
  trust: "Trust signals",
  seo: "SEO",
  uniqueness: "Uniqueness",
  completeness: "Completeness",
  conversion: "Conversion",
};

export function formatPrice(amount: number, currency: GigCurrency): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${CURRENCY_SYMBOL[currency] || ""}${amount}`;
  }
}
