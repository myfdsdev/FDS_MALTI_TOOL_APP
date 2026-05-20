import { z } from "zod";
import { logger } from "../../config/logger.js";
import { generateWithProvider, type ResolvedAIConfig } from "../ai/providers.js";
import type {
  GigContent,
  GigInput,
  OutreachContent,
} from "../../models/Gig.model.js";
import {
  buildGigCorePrompt,
  buildOutreachPrompt,
  type GigPromptBundle,
} from "./prompts.js";

/* ─── Runtime schemas for AI output ──────────────────────────── */

const packageSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  deliveryDays: z.coerce.number().int().nonnegative(),
  revisions: z.coerce.number().int().nonnegative(),
  deliverables: z.array(z.string().min(1)).min(3),
  addOns: z.array(z.string()).default([]),
});

const tagSchema = z
  .string()
  .regex(/^[a-z0-9]+(?: [a-z0-9]+){1,2}$/, "Tags must be 2-3 lowercase alphanumeric words");

const gigContentZ = z.object({
  title: z.string().min(1),
  alternativeTitles: z.array(z.string().min(1)).length(3),
  category: z.string().min(1),
  tags: z.array(tagSchema).min(5).max(8),
  seoKeywords: z.array(z.string().min(1)).min(5).max(8),
  description: z.string().min(100),
  packages: z.object({
    basic: packageSchema,
    standard: packageSchema,
    premium: packageSchema,
  }),
  buyerRequirements: z.array(z.string().min(1)).min(1),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .min(1),
  addOnServices: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.coerce.number().nonnegative(),
        description: z.string().min(1),
      })
    )
    .min(1),
  thumbnailConcept: z.string().min(1),
  thumbnailPrompt: z.string().min(1),
  portfolioSampleIdeas: z.array(z.string().min(1)).min(1),
});

const outreachZ = z.object({
  coldEmail: z.object({
    subject: z.string().min(1),
    body: z.string().min(20),
  }),
  instagramDm: z.string().min(20),
  linkedinMessage: z.string().min(20),
  shortPitch: z.string().min(20),
  followUpMessage: z.string().min(20),
  proposalMessage: z.string().min(20),
});

/* ─── Helpers ────────────────────────────────────────────────── */

function stripFences(raw: string): string {
  let text = raw.trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) text = fenced[1].trim();
  if (!text.startsWith("{") && !text.startsWith("[")) {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      text = text.slice(first, last + 1);
    }
  }
  return text;
}

/**
 * Some models double-escape control characters when asked for JSON, so after
 * JSON.parse a string field can contain a literal backslash-n ("\\n") instead
 * of a real newline. Recursively convert those escape sequences back to real
 * characters so stored content renders with proper line breaks.
 */
function deepUnescape<T>(value: T): T {
  if (typeof value === "string") {
    return value
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\\t/g, "\t") as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepUnescape(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepUnescape(v);
    }
    return out as unknown as T;
  }
  return value;
}

function parseOrNull(raw: string): unknown {
  try {
    return deepUnescape(JSON.parse(stripFences(raw)));
  } catch {
    return null;
  }
}

interface RunOptions<T> {
  config: ResolvedAIConfig;
  prompt: GigPromptBundle;
  schema: z.ZodSchema<T>;
  label: string;
}

async function runWithRetry<T>(opts: RunOptions<T>): Promise<T> {
  const { config, prompt, schema, label } = opts;

  // Attempt 1.
  const first = await generateWithProvider(config, prompt.system, prompt.user);
  const parsed1 = parseOrNull(first.text);
  if (parsed1) {
    const result1 = schema.safeParse(parsed1);
    if (result1.success) return result1.data;
    logger.warn({ label, issues: result1.error.issues }, "Gig AI output failed validation, retrying");
    return retry(opts, formatZodIssues(result1.error.issues));
  }
  logger.warn({ label }, "Gig AI output not JSON, retrying");
  return retry(opts, "Previous response was not valid JSON. Output ONLY a JSON object that parses with JSON.parse.");
}

async function retry<T>(opts: RunOptions<T>, validationError: string): Promise<T> {
  const { config, prompt, schema, label } = opts;
  const correctiveSystem = `${prompt.system}\n\nIMPORTANT: The previous response failed validation. Fix these errors:\n${validationError}\nReturn ONLY valid JSON matching the contract exactly.`;
  const correctiveUser = `${prompt.user}\n\nReminder: respond with ONLY valid JSON. The previous error was:\n${validationError}`;

  const second = await generateWithProvider(config, correctiveSystem, correctiveUser);
  const parsed = parseOrNull(second.text);
  if (!parsed) {
    throw new Error(`AI returned invalid JSON for ${label} after retry`);
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `AI output for ${label} failed validation after retry: ${formatZodIssues(result.error.issues)}`
    );
  }
  return result.data;
}

function formatZodIssues(issues: z.ZodIssue[]): string {
  return issues
    .slice(0, 6)
    .map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`)
    .join("; ");
}

/* ─── Public generators ──────────────────────────────────────── */

export async function generateGigCore(
  config: ResolvedAIConfig,
  input: GigInput
): Promise<GigContent> {
  const prompt = buildGigCorePrompt(input);
  const out = await runWithRetry({
    config,
    prompt,
    schema: gigContentZ,
    label: "gig core",
  });
  // Cast: Zod output structure matches GigContent. addOns is defaulted.
  return out as GigContent;
}

export async function generateOutreach(
  config: ResolvedAIConfig,
  input: GigInput
): Promise<OutreachContent> {
  const prompt = buildOutreachPrompt(input);
  const out = await runWithRetry({
    config,
    prompt,
    schema: outreachZ,
    label: "outreach",
  });
  return out;
}

/* ─── One-section improver (used by /improve endpoint) ───────── */

export type ImproveSection = "title" | "description" | "packages" | "faqs" | "outreach";

export async function improveGigSection(
  config: ResolvedAIConfig,
  section: ImproveSection,
  input: GigInput,
  currentContent: {
    gig: GigContent | null;
    outreach: OutreachContent | null;
  },
  instructions: string | undefined
): Promise<string> {
  const focus: Record<ImproveSection, string> = {
    title: "Rewrite the gig title and 5 alternative titles. Keep within 40-80 chars, include a high-intent keyword.",
    description:
      "Rewrite the gig description in markdown (3+ paragraphs, bullet lists, strong CTA). Keep 300-600 words.",
    packages:
      "Rewrite the three packages (basic, standard, premium) with ascending prices in the user's range, 3+ deliverables each.",
    faqs: "Rewrite 4-6 FAQs that handle real buyer objections (timeline, revisions, quality, fit).",
    outreach: "Rewrite the cold email (subject + body) and short pitch to be more compelling and human.",
  };

  const currentDump = JSON.stringify(
    section === "outreach"
      ? { outreach: currentContent.outreach ?? {} }
      : { [section]: pickSection(section, currentContent.gig) },
    null,
    2
  );

  const system = [
    "You are a senior gig copywriter improving a single section of an existing listing.",
    focus[section],
    "Respond with ONLY plain markdown / text for that single section — no JSON, no fences, no commentary.",
    "Do not invent fake guarantees or spammy language.",
  ].join("\n");

  const user = [
    `Service: ${input.serviceName}`,
    `Platform: ${input.platform}`,
    `Niche: ${input.niche}`,
    `Target audience: ${input.targetAudience}`,
    `Buyer result: ${input.buyerResult}`,
    `Preferred tone: ${input.preferredTone}`,
    `Pricing range: ${input.pricingMin}-${input.pricingMax} ${input.pricingCurrency}`,
    "",
    "Current section content:",
    currentDump,
    "",
    instructions ? `Additional instructions from the user: ${instructions}` : "Use your best judgment to improve clarity, conversion, and credibility.",
    "",
    "Return the rewritten section only.",
  ].join("\n");

  const result = await generateWithProvider(config, system, user);
  return deepUnescape(stripFences(result.text).trim());
}

function pickSection(section: ImproveSection, gig: GigContent | null): unknown {
  if (!gig) return null;
  switch (section) {
    case "title":
      return { title: gig.title, alternativeTitles: gig.alternativeTitles };
    case "description":
      return { description: gig.description };
    case "packages":
      return { packages: gig.packages };
    case "faqs":
      return { faqs: gig.faqs };
    default:
      return null;
  }
}
