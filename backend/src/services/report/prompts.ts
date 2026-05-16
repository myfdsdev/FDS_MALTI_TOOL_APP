import type { ReportSnapshot } from "../../models/GrowthReport.model.js";

export interface ReportPromptBundle {
  system: string;
  user: string;
}

export function buildReportPrompt(
  websiteUrl: string,
  snapshot: ReportSnapshot,
  hostname: string
): ReportPromptBundle {
  const system = [
    "You are a senior growth and monetization analyst.",
    "Your job is to analyze a single public website and recommend the single best path to monetization for THIS specific site.",
    "Return ONLY strict JSON. No markdown fences, no commentary before or after. The output must parse with JSON.parse.",
    "",
    "Output contract (TypeScript):",
    `{
  "websiteTitle": string,
  "detectedGenre": string,            // e.g. "SaaS productivity tool", "Local restaurant", "Personal blog"
  "industry": string,                 // broader category like "Software & Technology"
  "audience": string,                 // who this site serves
  "summary": string,                  // 3-5 sentence overview specific to this site

  "scores": {
    "overall": number,                // 0-100
    "seo": number,
    "conversion": number,
    "branding": number,
    "marketing": number
  },

  "monetizationStrategy": {
    "primaryPath": string,            // the ONE most-recommended way to make money
    "reasoning": string               // why this fits THIS site specifically
  },

  "monetizationStreams": [{           // 5 streams, sorted by fitScore desc
    "name": string,
    "description": string,
    "setupEffort": "low" | "medium" | "high",
    "timeToFirstRevenue": string,     // e.g. "1-2 weeks"
    "monthlyRevenuePotential": string, // e.g. "$250-$2,000"
    "fitScore": number                // 0-100
  }],

  "sections": {
    "shortSummary": string,
    "earningPotentialOverview": string,
    "whoWillPay": string,
    "bestWaysToEarn": string,
    "pricingOfferIdeas": string,
    "stepByStepPlan": string,
    "seoContentIdeas": string,
    "marketingChannels": string,
    "conversionImprovements": string,
    "roadmap": string,
    "revenuePotential": string,
    "firstActionsToday": string
  },

  "topRecommendations": string[]      // 5-7 prioritized actions
}`,
    "",
    "Rules:",
    "- Be opinionated about ONE primary monetization path. Don't hedge.",
    "- Tailor everything to the actual title, h1s, and body snippet provided. Reference them.",
    "- Avoid generic startup advice; call out the actual product/service when possible.",
    "- Every section in `sections` must be at least 200 characters.",
    "- Generate exactly 5 monetization streams.",
    "- Generate 5–7 top recommendations.",
    "- Scores 0-100. 'overall' should roughly equal the average of the other 4.",
  ].join("\n");

  const snapshotSummary = snapshot.ok
    ? [
        `Title: ${snapshot.title || "(none)"}`,
        `Description: ${snapshot.description || "(none)"}`,
        `H1s: ${snapshot.h1s.length ? snapshot.h1s.map((h) => `- ${h}`).join("\n") : "(none)"}`,
        `H2s: ${snapshot.h2s.length ? snapshot.h2s.slice(0, 10).map((h) => `- ${h}`).join("\n") : "(none)"}`,
        `Body snippet (truncated):\n${snapshot.bodySample.slice(0, 4000)}`,
      ].join("\n\n")
    : `The site could not be scraped (${snapshot.error || "unknown reason"}). Infer what you can from the URL itself.`;

  const user = [
    `Website URL: ${websiteUrl}`,
    `Hostname: ${hostname}`,
    "",
    "Site snapshot:",
    snapshotSummary,
    "",
    "Produce the monetization report as strict JSON matching the contract above.",
  ].join("\n");

  return { system, user };
}
