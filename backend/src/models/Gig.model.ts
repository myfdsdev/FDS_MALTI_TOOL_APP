import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type GigPlatform = "fiverr" | "upwork" | "linkedin" | "instagram" | "freelancer";
export type ExperienceLevel = "beginner" | "intermediate" | "expert";
export type PreferredTone = "professional" | "friendly" | "persuasive" | "casual";
export type GigStatus = "queued" | "processing" | "partial" | "completed" | "failed";
export type StageStatus = "pending" | "running" | "done" | "failed";
export type GigGeneratedBy = "ai" | "mock" | null;

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
  preferredTone: PreferredTone;
  pricingMin: number;
  pricingMax: number;
  pricingCurrency: string;
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

export interface GigPackages {
  basic: GigPackage;
  standard: GigPackage;
  premium: GigPackage;
}

export interface GigFaq {
  question: string;
  answer: string;
}

export interface GigAddOnService {
  name: string;
  price: number;
  description: string;
}

export interface GigContent {
  title: string;
  alternativeTitles: string[];
  category: string;
  tags: string[];
  seoKeywords: string[];
  description: string;
  packages: GigPackages;
  buyerRequirements: string[];
  faqs: GigFaq[];
  addOnServices: GigAddOnService[];
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

export interface OutreachMessage {
  subject: string;
  body: string;
}

export interface OutreachContent {
  coldEmail: OutreachMessage;
  instagramDm: string;
  linkedinMessage: string;
  shortPitch: string;
  followUpMessage: string;
  proposalMessage: string;
}

export interface GigScoreBreakdown {
  titleClarity: number;
  nicheFocus: number;
  buyerBenefit: number;
  pricingStrength: number;
  keywordQuality: number;
  descriptionQuality: number;
  trustFactor: number;
  ctaStrength: number;
}

export interface GigScore {
  overall: number;
  breakdown: GigScoreBreakdown;
  suggestions: string[];
}

export interface GigStageInfo {
  status: StageStatus;
  error?: string | null;
}

export interface GigGenerationStages {
  gig: GigStageInfo;
  leads: GigStageInfo;
  outreach: GigStageInfo;
}

export interface GigShare {
  enabled: boolean;
  slug: string | null;
  viewCount: number;
}

export interface GigDocument extends Document {
  user: Types.ObjectId;
  title: string;
  input: GigInput;
  content: {
    gig: GigContent | null;
    leadStrategy: LeadStrategy | null;
    outreach: OutreachContent | null;
  };
  score: GigScore | null;
  status: GigStatus;
  generationStages: GigGenerationStages;
  generatedBy: GigGeneratedBy;
  generationMs: number | null;
  share: GigShare;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PLATFORM_VALUES = ["fiverr", "upwork", "linkedin", "instagram", "freelancer"] as const;
const EXPERIENCE_VALUES = ["beginner", "intermediate", "expert"] as const;
const TONE_VALUES = ["professional", "friendly", "persuasive", "casual"] as const;
const STATUS_VALUES = ["queued", "processing", "partial", "completed", "failed"] as const;
const STAGE_STATUS_VALUES = ["pending", "running", "done", "failed"] as const;

const inputSchema = new Schema<GigInput>(
  {
    serviceName: { type: String, required: true, trim: true },
    platform: { type: String, enum: PLATFORM_VALUES, required: true },
    category: { type: String, default: "", trim: true },
    targetAudience: { type: String, required: true, trim: true },
    niche: { type: String, required: true, trim: true },
    problemSolved: { type: String, required: true, trim: true },
    buyerResult: { type: String, required: true, trim: true },
    toolsUsed: { type: String, required: true, trim: true },
    deliveryFormat: { type: String, required: true, trim: true },
    experienceLevel: { type: String, enum: EXPERIENCE_VALUES, required: true },
    preferredTone: { type: String, enum: TONE_VALUES, required: true },
    pricingMin: { type: Number, required: true, min: 0 },
    pricingMax: { type: Number, required: true, min: 0 },
    pricingCurrency: { type: String, default: "USD", trim: true },
    deliveryTime: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const packageSchema = new Schema<GigPackage>(
  {
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    deliveryDays: { type: Number, default: 0 },
    revisions: { type: Number, default: 0 },
    deliverables: { type: [String], default: [] },
    addOns: { type: [String], default: [] },
  },
  { _id: false }
);

const packagesSchema = new Schema<GigPackages>(
  {
    basic: { type: packageSchema, default: () => ({}) },
    standard: { type: packageSchema, default: () => ({}) },
    premium: { type: packageSchema, default: () => ({}) },
  },
  { _id: false }
);

const faqSchema = new Schema<GigFaq>(
  {
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
  },
  { _id: false }
);

const addOnServiceSchema = new Schema<GigAddOnService>(
  {
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const gigContentSchema = new Schema<GigContent>(
  {
    title: { type: String, default: "" },
    alternativeTitles: { type: [String], default: [] },
    category: { type: String, default: "" },
    tags: { type: [String], default: [] },
    seoKeywords: { type: [String], default: [] },
    description: { type: String, default: "" },
    packages: { type: packagesSchema, default: () => ({}) },
    buyerRequirements: { type: [String], default: [] },
    faqs: { type: [faqSchema], default: [] },
    addOnServices: { type: [addOnServiceSchema], default: [] },
    thumbnailConcept: { type: String, default: "" },
    thumbnailPrompt: { type: String, default: "" },
    portfolioSampleIdeas: { type: [String], default: [] },
  },
  { _id: false }
);

const leadStrategySchema = new Schema<LeadStrategy>(
  {
    bestLeadTypes: { type: [String], default: [] },
    targetIndustries: { type: [String], default: [] },
    googleQueries: { type: [String], default: [] },
    instagramSearchTerms: { type: [String], default: [] },
    linkedinSearchTerms: { type: [String], default: [] },
    googleMapsSearchTerms: { type: [String], default: [] },
    manualStrategy: { type: String, default: "" },
  },
  { _id: false }
);

const outreachMessageSchema = new Schema<OutreachMessage>(
  {
    subject: { type: String, default: "" },
    body: { type: String, default: "" },
  },
  { _id: false }
);

const outreachSchema = new Schema<OutreachContent>(
  {
    coldEmail: { type: outreachMessageSchema, default: () => ({}) },
    instagramDm: { type: String, default: "" },
    linkedinMessage: { type: String, default: "" },
    shortPitch: { type: String, default: "" },
    followUpMessage: { type: String, default: "" },
    proposalMessage: { type: String, default: "" },
  },
  { _id: false }
);

const scoreBreakdownSchema = new Schema<GigScoreBreakdown>(
  {
    titleClarity: { type: Number, default: 0 },
    nicheFocus: { type: Number, default: 0 },
    buyerBenefit: { type: Number, default: 0 },
    pricingStrength: { type: Number, default: 0 },
    keywordQuality: { type: Number, default: 0 },
    descriptionQuality: { type: Number, default: 0 },
    trustFactor: { type: Number, default: 0 },
    ctaStrength: { type: Number, default: 0 },
  },
  { _id: false }
);

const scoreSchema = new Schema<GigScore>(
  {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    breakdown: { type: scoreBreakdownSchema, default: () => ({}) },
    suggestions: { type: [String], default: [] },
  },
  { _id: false }
);

const stageInfoSchema = new Schema<GigStageInfo>(
  {
    status: { type: String, enum: STAGE_STATUS_VALUES, default: "pending" },
    error: { type: String, default: null },
  },
  { _id: false }
);

const generationStagesSchema = new Schema<GigGenerationStages>(
  {
    gig: { type: stageInfoSchema, default: () => ({}) },
    leads: { type: stageInfoSchema, default: () => ({}) },
    outreach: { type: stageInfoSchema, default: () => ({}) },
  },
  { _id: false }
);

const shareSchema = new Schema<GigShare>(
  {
    enabled: { type: Boolean, default: false },
    slug: { type: String, default: null },
    viewCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const contentSchema = new Schema(
  {
    gig: { type: gigContentSchema, default: null },
    leadStrategy: { type: leadStrategySchema, default: null },
    outreach: { type: outreachSchema, default: null },
  },
  { _id: false }
);

const gigSchema = new Schema<GigDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "" },
    input: { type: inputSchema, required: true },
    content: { type: contentSchema, default: () => ({ gig: null, leadStrategy: null, outreach: null }) },
    score: { type: scoreSchema, default: null },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "queued",
      index: true,
    },
    generationStages: { type: generationStagesSchema, default: () => ({}) },
    generatedBy: { type: String, enum: ["ai", "mock", null], default: null },
    generationMs: { type: Number, default: null },
    share: { type: shareSchema, default: () => ({}) },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

gigSchema.index({ user: 1, createdAt: -1 });
gigSchema.index({ user: 1, status: 1 });
gigSchema.index({ user: 1, "input.platform": 1 });
gigSchema.index({ "share.slug": 1 }, { unique: true, sparse: true });

export const Gig: Model<GigDocument> =
  mongoose.models.Gig || mongoose.model<GigDocument>("Gig", gigSchema);
