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
  fetchedAt: string | null;
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

export interface ReportListItem {
  _id: string;
  websiteUrl: string;
  hostname: string;
  status: ReportStatus;
  statusStage: ReportStage;
  generatedBy: GeneratedBy;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  overallScore: number | null;
  detectedGenre: string | null;
  websiteTitle: string | null;
  share: { enabled: boolean; slug: string | null; viewCount: number };
}

export interface Report {
  _id: string;
  user: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface PublicReport {
  websiteUrl: string;
  hostname: string;
  content: ReportContent | null;
  snapshot: ReportSnapshot;
  status: ReportStatus;
  statusStage: ReportStage;
  generatedBy: GeneratedBy;
  createdAt: string;
  share: { viewCount: number };
}

export interface ShareReportResult {
  enabled: boolean;
  slug: string | null;
  url: string | null;
  viewCount: number;
}

export const SECTION_LABELS: Record<keyof ReportSections, string> = {
  shortSummary: "Short summary",
  earningPotentialOverview: "Earning potential overview",
  whoWillPay: "Who will pay",
  bestWaysToEarn: "Best ways to earn",
  pricingOfferIdeas: "Pricing & offer ideas",
  stepByStepPlan: "Step-by-step plan",
  seoContentIdeas: "SEO & content ideas",
  marketingChannels: "Marketing channels",
  conversionImprovements: "Conversion improvements",
  roadmap: "Roadmap",
  revenuePotential: "Revenue potential",
  firstActionsToday: "First actions to take today",
};

export const SECTION_SUBTITLES: Record<keyof ReportSections, string> = {
  shortSummary: "TL;DR for the whole report",
  earningPotentialOverview: "How much this site could realistically earn",
  whoWillPay: "The exact buyers most likely to convert",
  bestWaysToEarn: "Top revenue paths in order of impact",
  pricingOfferIdeas: "How to package and price the offer",
  stepByStepPlan: "Week-by-week execution plan",
  seoContentIdeas: "Content that ranks and converts",
  marketingChannels: "Where to find your audience",
  conversionImprovements: "Page changes that lift CVR",
  roadmap: "The next 90–180 days",
  revenuePotential: "Realistic revenue bands",
  firstActionsToday: "Move the needle today",
};

export const SECTION_ORDER: (keyof ReportSections)[] = [
  "shortSummary",
  "earningPotentialOverview",
  "whoWillPay",
  "bestWaysToEarn",
  "pricingOfferIdeas",
  "stepByStepPlan",
  "seoContentIdeas",
  "marketingChannels",
  "conversionImprovements",
  "roadmap",
  "revenuePotential",
  "firstActionsToday",
];

export const STAGE_LABEL: Record<ReportStage, string> = {
  queued: "Queued",
  scraping: "Scraping the website…",
  analyzing: "Analyzing content…",
  generating: "Generating report…",
  completed: "Done",
  failed: "Failed",
};
