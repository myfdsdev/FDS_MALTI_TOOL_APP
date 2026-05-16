import { logger } from "../../config/logger.js";
import type { UserDocument } from "../../models/User.model.js";
import type {
  ReportContent,
  ReportSections,
  ReportSnapshot,
  MonetizationStream,
  ReportScores,
} from "../../models/GrowthReport.model.js";
import { resolveAIConfigForUser } from "../ai/config.js";
import { generateWithProvider } from "../ai/providers.js";
import { buildReportPrompt } from "./prompts.js";
import { hostnameFromUrl } from "./scraper.js";

const SECTION_MIN = 200;

function parseJsonObject(raw: string): Record<string, unknown> | null {
  let text = raw.trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) text = fenced[1].trim();
  if (!text.startsWith("{")) {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) return null;
    text = text.slice(first, last + 1);
  }
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function clamp(value: unknown, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error("AI report response has invalid scores");
  }
  return Math.max(min, Math.min(max, Math.round(n)));
}

function requireString(value: unknown, label: string, minLength = 1): string {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw new Error(`AI report response is missing ${label}`);
  }
  return value.trim();
}

function requireStringArray(value: unknown, label: string, minItems: number): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`AI report response is missing ${label}`);
  }
  const cleaned = value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
  if (cleaned.length < minItems) {
    throw new Error(`AI report response needs at least ${minItems} ${label}`);
  }
  return cleaned;
}

function normalizeEffort(value: unknown): "low" | "medium" | "high" {
  if (value === "low" || value === "medium" || value === "high") return value;
  throw new Error("AI report response has invalid setup effort");
}

function normalizeStream(raw: unknown, index: number): MonetizationStream {
  if (!raw || typeof raw !== "object") {
    throw new Error(`AI report response is missing monetization stream ${index + 1}`);
  }
  const r = raw as Record<string, unknown>;
  return {
    name: requireString(r.name, `monetizationStreams[${index}].name`),
    description: requireString(r.description, `monetizationStreams[${index}].description`, 80),
    setupEffort: normalizeEffort(r.setupEffort),
    timeToFirstRevenue: requireString(r.timeToFirstRevenue, `monetizationStreams[${index}].timeToFirstRevenue`),
    monthlyRevenuePotential: requireString(r.monthlyRevenuePotential, `monetizationStreams[${index}].monthlyRevenuePotential`),
    fitScore: clamp(r.fitScore, 0, 100),
  };
}

/**
 * Ensure every required section/scores/stream is present and substantive.
 * Growth Reports must be real AI output, so incomplete responses fail instead
 * of being filled with deterministic fallback content.
 */
export function ensureCompleteReport(aiContent: Partial<ReportContent> | null): ReportContent {
  if (!aiContent || typeof aiContent !== "object") {
    throw new Error("AI report response was empty");
  }

  const sectionKeys: (keyof ReportSections)[] = [
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

  const sections = {} as ReportSections;
  for (const key of sectionKeys) {
    const ai = (aiContent.sections as Partial<ReportSections> | undefined)?.[key];
    sections[key] = requireString(ai, `sections.${key}`, SECTION_MIN);
  }

  const aiScores = (aiContent.scores ?? {}) as Partial<ReportContent["scores"]>;
  const scores: ReportScores = {
    seo: clamp(aiScores.seo, 0, 100),
    conversion: clamp(aiScores.conversion, 0, 100),
    branding: clamp(aiScores.branding, 0, 100),
    marketing: clamp(aiScores.marketing, 0, 100),
    overall: clamp(aiScores.overall, 0, 100),
  };

  const aiStreams = Array.isArray(aiContent.monetizationStreams)
    ? aiContent.monetizationStreams
    : [];
  if (aiStreams.length < 5) {
    throw new Error("AI report response needs at least 5 monetization streams");
  }
  const monetizationStreams: MonetizationStream[] = aiStreams
    .slice(0, 5)
    .map((stream, index) => normalizeStream(stream, index));

  return {
    websiteTitle: requireString(aiContent.websiteTitle, "websiteTitle"),
    detectedGenre: requireString(aiContent.detectedGenre, "detectedGenre"),
    industry: requireString(aiContent.industry, "industry"),
    audience: requireString(aiContent.audience, "audience"),
    summary: requireString(aiContent.summary, "summary", 120),
    scores,
    monetizationStrategy: {
      primaryPath: requireString(
        aiContent.monetizationStrategy?.primaryPath,
        "monetizationStrategy.primaryPath"
      ),
      reasoning: requireString(
        aiContent.monetizationStrategy?.reasoning,
        "monetizationStrategy.reasoning",
        120
      ),
    },
    monetizationStreams,
    sections,
    topRecommendations: requireStringArray(aiContent.topRecommendations, "topRecommendations", 5),
  };
}

export interface BuildResult {
  content: ReportContent;
  generatedBy: "ai";
}

export async function buildReport(
  websiteUrl: string,
  snapshot: ReportSnapshot,
  user: UserDocument | null | undefined
): Promise<BuildResult> {
  const hostname = hostnameFromUrl(websiteUrl);

  const config = resolveAIConfigForUser(user ?? undefined);
  if (!config) {
    throw new Error("AI is not configured. Add an AI API key before generating Growth Reports.");
  }

  try {
    const { system, user: userPrompt } = buildReportPrompt(websiteUrl, snapshot, hostname);
    const response = await generateWithProvider(config, system, userPrompt);
    const parsed = parseJsonObject(response.text);
    if (!parsed) {
      throw new Error("AI returned an invalid report format. Please retry.");
    }
    const content = ensureCompleteReport(parsed as Partial<ReportContent>);
    return { content, generatedBy: "ai" };
  } catch (err) {
    logger.error({ err, websiteUrl }, "AI report generation failed");
    throw err instanceof Error ? err : new Error("AI report generation failed");
  }
}
