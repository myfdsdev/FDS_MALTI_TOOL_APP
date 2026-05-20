import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ReportStatus = "queued" | "processing" | "completed" | "failed";
export type ReportStage =
  | "queued"
  | "scraping"
  | "analyzing"
  | "generating"
  | "completed"
  | "failed";
export type GeneratedBy = "ai" | "fallback" | null;
export type SetupEffort = "low" | "medium" | "high";

export interface ReportSnapshot {
  title: string;
  description: string;
  h1s: string[];
  h2s: string[];
  bodySample: string;
  fetchedAt: Date | null;
  ok: boolean;
  error: string | null;
}

export interface ReportScores {
  overall: number;
  seo: number;
  conversion: number;
  branding: number;
  marketing: number;
}

export interface MonetizationStrategy {
  primaryPath: string;
  reasoning: string;
}

export interface MonetizationStream {
  name: string;
  description: string;
  setupEffort: SetupEffort;
  timeToFirstRevenue: string;
  monthlyRevenuePotential: string;
  fitScore: number;
}

export interface ReportSections {
  shortSummary: string;
  earningPotentialOverview: string;
  whoWillPay: string;
  bestWaysToEarn: string;
  pricingOfferIdeas: string;
  stepByStepPlan: string;
  seoContentIdeas: string;
  marketingChannels: string;
  conversionImprovements: string;
  roadmap: string;
  revenuePotential: string;
  firstActionsToday: string;
}

export interface ReportContent {
  websiteTitle: string;
  detectedGenre: string;
  industry: string;
  audience: string;
  summary: string;
  scores: ReportScores;
  monetizationStrategy: MonetizationStrategy;
  monetizationStreams: MonetizationStream[];
  sections: ReportSections;
  topRecommendations: string[];
}

export interface ReportShare {
  enabled: boolean;
  slug: string | null;
  viewCount: number;
}

export interface GrowthReportDocument extends Document {
  user: Types.ObjectId;
  websiteUrl: string;
  hostname: string;
  snapshot: ReportSnapshot;
  content: ReportContent | null;
  status: ReportStatus;
  statusStage: ReportStage;
  error: string | null;
  generatedBy: GeneratedBy;
  generationMs: number | null;
  share: ReportShare;
  createdAt: Date;
  updatedAt: Date;
}

const snapshotSchema = new Schema<ReportSnapshot>(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    h1s: { type: [String], default: [] },
    h2s: { type: [String], default: [] },
    bodySample: { type: String, default: "", maxlength: 6000 },
    fetchedAt: { type: Date, default: null },
    ok: { type: Boolean, default: false },
    error: { type: String, default: null },
  },
  { _id: false }
);

const scoresSchema = new Schema<ReportScores>(
  {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    seo: { type: Number, default: 0, min: 0, max: 100 },
    conversion: { type: Number, default: 0, min: 0, max: 100 },
    branding: { type: Number, default: 0, min: 0, max: 100 },
    marketing: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const monetizationStrategySchema = new Schema<MonetizationStrategy>(
  {
    primaryPath: { type: String, default: "" },
    reasoning: { type: String, default: "" },
  },
  { _id: false }
);

const monetizationStreamSchema = new Schema<MonetizationStream>(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    setupEffort: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    timeToFirstRevenue: { type: String, default: "" },
    monthlyRevenuePotential: { type: String, default: "" },
    fitScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const sectionsSchema = new Schema<ReportSections>(
  {
    shortSummary: { type: String, default: "" },
    earningPotentialOverview: { type: String, default: "" },
    whoWillPay: { type: String, default: "" },
    bestWaysToEarn: { type: String, default: "" },
    pricingOfferIdeas: { type: String, default: "" },
    stepByStepPlan: { type: String, default: "" },
    seoContentIdeas: { type: String, default: "" },
    marketingChannels: { type: String, default: "" },
    conversionImprovements: { type: String, default: "" },
    roadmap: { type: String, default: "" },
    revenuePotential: { type: String, default: "" },
    firstActionsToday: { type: String, default: "" },
  },
  { _id: false }
);

const contentSchema = new Schema<ReportContent>(
  {
    websiteTitle: { type: String, default: "" },
    detectedGenre: { type: String, default: "" },
    industry: { type: String, default: "" },
    audience: { type: String, default: "" },
    summary: { type: String, default: "" },
    scores: { type: scoresSchema, default: () => ({}) },
    monetizationStrategy: { type: monetizationStrategySchema, default: () => ({}) },
    monetizationStreams: { type: [monetizationStreamSchema], default: [] },
    sections: { type: sectionsSchema, default: () => ({}) },
    topRecommendations: { type: [String], default: [] },
  },
  { _id: false }
);

const shareSchema = new Schema<ReportShare>(
  {
    enabled: { type: Boolean, default: false },
    slug: { type: String, default: null },
    viewCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const HTTP_URL = /^https?:\/\//i;

const growthReportSchema = new Schema<GrowthReportDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    websiteUrl: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => HTTP_URL.test(v),
        message: "websiteUrl must be a valid http(s) URL",
      },
    },
    hostname: { type: String, default: "" },
    snapshot: { type: snapshotSchema, default: () => ({}) },
    content: { type: contentSchema, default: null },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"] as const,
      default: "queued",
      index: true,
    },
    statusStage: {
      type: String,
      enum: ["queued", "scraping", "analyzing", "generating", "completed", "failed"] as const,
      default: "queued",
    },
    error: { type: String, default: null },
    generatedBy: { type: String, enum: ["ai", "fallback", null], default: null },
    generationMs: { type: Number, default: null },
    share: { type: shareSchema, default: () => ({}) },
  },
  { timestamps: true }
);

growthReportSchema.index({ user: 1, createdAt: -1 });
growthReportSchema.index({ user: 1, status: 1 });

// A plain `unique + sparse` index still rejects multiple documents whose
// `share.slug` is explicitly `null` (the schema default), which makes the
// second un-shared report fail to insert with an E11000 duplicate-key error.
// A partial index that only covers string slugs avoids that entirely.
const SHARE_SLUG_INDEX_NAME = "report_share_slug_unique";

growthReportSchema.index(
  { "share.slug": 1 },
  {
    name: SHARE_SLUG_INDEX_NAME,
    unique: true,
    partialFilterExpression: { "share.slug": { $type: "string" } },
  }
);

export const GrowthReport: Model<GrowthReportDocument> =
  mongoose.models.GrowthReport ||
  mongoose.model<GrowthReportDocument>("GrowthReport", growthReportSchema);

type MongoIndexInfo = {
  name?: string;
  key?: Record<string, unknown>;
  unique?: boolean;
  partialFilterExpression?: Record<string, unknown>;
};

const isShareSlugIndex = (index: MongoIndexInfo): boolean =>
  index.key?.["share.slug"] === 1 && Object.keys(index.key).length === 1;

const isDesiredShareSlugIndex = (index: MongoIndexInfo): boolean =>
  index.name === SHARE_SLUG_INDEX_NAME &&
  index.unique === true &&
  JSON.stringify(index.partialFilterExpression) ===
    JSON.stringify({ "share.slug": { $type: "string" } });

/**
 * Migrates the legacy `unique + sparse` slug index (which collides on null
 * slugs) to a partial index, and clears any stored null slugs so the partial
 * index can build. Safe to run on every boot — it's a no-op once converged.
 */
export const ensureReportShareSlugIndex = async (): Promise<void> => {
  await GrowthReport.updateMany(
    { "share.slug": null },
    { $unset: { "share.slug": "" } }
  );

  const indexes = (await GrowthReport.collection.indexes()) as MongoIndexInfo[];
  const shareSlugIndexes = indexes.filter(isShareSlugIndex);

  for (const index of shareSlugIndexes) {
    if (!index.name || isDesiredShareSlugIndex(index)) continue;
    await GrowthReport.collection.dropIndex(index.name);
  }

  await GrowthReport.collection.createIndex(
    { "share.slug": 1 },
    {
      name: SHARE_SLUG_INDEX_NAME,
      unique: true,
      partialFilterExpression: { "share.slug": { $type: "string" } },
    }
  );
};
