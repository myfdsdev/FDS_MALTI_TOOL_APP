import type { GigInput } from "../../models/Gig.model.js";

export interface GigPromptBundle {
  system: string;
  user: string;
}

function inputSummary(input: GigInput): string {
  return [
    `Service/Niche: ${input.serviceName}`,
    `Platform: ${input.platform}`,
    input.category ? `Category: ${input.category}` : null,
    `Target audience: ${input.targetAudience}`,
    `Niche details: ${input.niche}`,
    `Problem solved: ${input.problemSolved}`,
    `Buyer result: ${input.buyerResult}`,
    `Tools used: ${input.toolsUsed}`,
    `Delivery format: ${input.deliveryFormat}`,
    `Experience level: ${input.experienceLevel}`,
    `Tone instruction: ${input.preferredTone}`,
    `Price range: ${input.pricingMin}-${input.pricingMax} ${input.pricingCurrency}`,
    `Typical delivery time: ${input.deliveryTime}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const JSON_RULES = [
  "Respond with ONLY raw, valid JSON that compiles perfectly with JSON.parse.",
  "Do NOT wrap the JSON in markdown fences. Do not use ```json or ```.",
  "Do NOT include any introductory text, outro text, or conversational commentary.",
  "Do NOT include trailing commas, JavaScript comments, or unescaped control characters.",
  "CRITICAL: The description field contains text and bullet points. You MUST explicitly escape all newlines as \"\\n\" and all inner double quotes as \"\\\"\" to prevent breaking the JSON structure.",
  "Do NOT use fake guarantees such as '100% guaranteed', 'make money overnight', or 'get rich quick'.",
  "Do NOT use phrases like 'I want leads finding' or guarantee customer generation.",
  "Avoid spammy language. Stay specific to the provided niche and focus strictly on technical and design delivery.",
].join("\n");

function toneInstruction(tone: GigInput["preferredTone"]): string {
  switch (tone) {
    case "professional":
      return "Tone instruction: Professional, confident, and direct. Avoid slang.";
    case "friendly":
      return "Tone instruction: Warm, approachable, conversational, but still credible.";
    case "persuasive":
      return "Tone instruction: Outcome-driven, benefit-led, action verbs, and strong CTAs without hype.";
    case "casual":
      return "Tone instruction: Relaxed, easygoing, plain language. Light contractions OK.";
  }
}

export function buildGigCorePrompt(input: GigInput): GigPromptBundle {
  const system = [
    "You are a senior freelance platform gig copywriter and conversion rate optimization (CRO) specialist.",
    "Your goal is to write a high-converting gig listing tailored exactly to the provided niche, audience, and constraints.",
    `Platform context: ${input.platform}.`,
    toneInstruction(input.preferredTone),
    "",
    JSON_RULES,
    "",
    "Output structure (JSON contract):",
    `{
  "title": "string",
  "alternativeTitles": ["string", "string", "string"],
  "category": "string",
  "tags": ["string", "string", "string"],
  "seoKeywords": ["string", "string", "string"],
  "description": "string",
  "packages": {
    "basic": { "name": "string", "price": number, "deliveryDays": number, "revisions": number, "deliverables": ["string", "string", "string"], "addOns": ["string"] },
    "standard": { "name": "string", "price": number, "deliveryDays": number, "revisions": number, "deliverables": ["string", "string", "string"], "addOns": ["string"] },
    "premium": { "name": "string", "price": number, "deliveryDays": number, "revisions": number, "deliverables": ["string", "string", "string"], "addOns": ["string"] }
  },
  "buyerRequirements": ["string"],
  "faqs": [{ "question": "string", "answer": "string" }],
  "addOnServices": [{ "name": "string", "price": number, "description": "string" }],
  "thumbnailConcept": "string",
  "thumbnailPrompt": "string",
  "portfolioSampleIdeas": ["string"]
}`,
    "",
    "Strict business and system rules:",
    "1. PRICING RULES:",
    `- All package prices must fall within the provided input price range [${input.pricingMin}, ${input.pricingMax}] ${input.pricingCurrency}.`,
    "- Price progression must strictly follow: basic < standard < premium.",
    "- The premium price MUST be at least 2x the basic price.",
    "2. DELIVERABLES: Every package tier must contain at least 3 distinct deliverables.",
    "3. TAGS FORMAT: Every item in the tags array must be exactly 2 to 3 lowercase words, containing alphanumeric characters and spaces only. No special characters or single-word tags.",
    "4. DESCRIPTION STRUCTURE (ABOUT THIS GIG):",
    "The description field must follow this exact, clean, scannable structure using basic markdown bolding and bullet points, properly escaped inside the JSON string:",
    "- Hook: A brief 1-2 sentence question or statement addressing the audience's goal, such as boosting credibility, sales readiness, or online presence.",
    "- Intro: A single short paragraph stating expertise as a developer, including CMS, interactions, animations, and Figma conversions when relevant.",
    "- Services Included: A clean bulleted list detailing specific features such as responsive layout, Webflow CMS, advanced animations, SEO-friendly structure, CTA integration, and related deliverables.",
    "- Why Hire Me: A short bulleted list highlighting professional reliability, on-time delivery, quick response, and consultation details.",
    "- CTA: A closing line inviting the buyer to send a message to discuss requirements.",
    "5. QUALITY & ETHICS:",
    "- Do not use spammy language or hype keywords.",
    "- Do not include fake guarantees.",
    "- Do not promise absolute business outcomes you cannot legally guarantee.",
    "- Do not use phrases like 'I want leads finding' or guarantee customer generation.",
    "- Focus strictly on technical and design delivery.",
  ].join("\n");

  const user = [
    "Input context:",
    inputSummary(input),
    "",
    "Return the strict JSON now.",
  ].join("\n");

  return { system, user };
}

export function buildOutreachPrompt(input: GigInput): GigPromptBundle {
  const system = [
    "You are a cold outreach copywriter for solo freelancers.",
    "Write six personalized outreach messages that feel human, not templated.",
    toneInstruction(input.preferredTone),
    "",
    JSON_RULES,
    "",
    "Output contract (TypeScript):",
    `{
  "coldEmail": { "subject": string, "body": string },
  "instagramDm": string,
  "linkedinMessage": string,
  "shortPitch": string,
  "followUpMessage": string,
  "proposalMessage": string
}`,
    "",
    "Hard rules:",
    "- Use the placeholders [their name] and [their company] for personalization.",
    "- Lead with a specific observation about the prospect, not generic flattery.",
    "- No 'Dear Sir/Madam', no 'I hope this email finds you well'.",
    "- No spam triggers ('guaranteed', 'free money', ALL CAPS shouting).",
    "- Close every message with a soft, low-friction CTA.",
    "- Do not claim you can find leads or guarantee customer generation.",
  ].join("\n");

  const user = [
    "Write the outreach kit for the following service:",
    inputSummary(input),
    "",
    "Return the strict JSON now.",
  ].join("\n");

  return { system, user };
}
