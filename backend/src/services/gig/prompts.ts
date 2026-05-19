import type { GigInput } from "../../models/Gig.model.js";

export interface GigPromptBundle {
  system: string;
  user: string;
}

function inputSummary(input: GigInput): string {
  return [
    `Service: ${input.serviceName}`,
    `Platform: ${input.platform}`,
    input.category ? `Category: ${input.category}` : null,
    `Target audience: ${input.targetAudience}`,
    `Niche: ${input.niche}`,
    `Problem solved: ${input.problemSolved}`,
    `Buyer result: ${input.buyerResult}`,
    `Tools used: ${input.toolsUsed}`,
    `Delivery format: ${input.deliveryFormat}`,
    `Experience level: ${input.experienceLevel}`,
    `Preferred tone: ${input.preferredTone}`,
    `Pricing range: ${input.pricingMin}-${input.pricingMax} ${input.pricingCurrency}`,
    `Typical delivery time: ${input.deliveryTime}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const JSON_RULES = [
  "Respond with ONLY valid JSON that parses with JSON.parse.",
  "Do NOT wrap the JSON in markdown fences. No commentary before or after.",
  "Do NOT include trailing commas, comments, or unescaped control characters.",
  "Do NOT use fake guarantees such as '100% guaranteed', 'make money overnight', or 'get rich quick'.",
  "Avoid spammy language. Stay specific to the provided niche.",
].join("\n");

function toneInstruction(tone: GigInput["preferredTone"]): string {
  switch (tone) {
    case "professional":
      return "Tone: confident, expert, polished. Avoid slang.";
    case "friendly":
      return "Tone: warm, approachable, conversational, but still credible.";
    case "persuasive":
      return "Tone: outcome-driven, benefit-led, action verbs. Strong CTAs.";
    case "casual":
      return "Tone: relaxed, easygoing, plain language. Light contractions OK.";
  }
}

export function buildGigCorePrompt(input: GigInput): GigPromptBundle {
  const system = [
    `You are a senior ${input.platform} gig copywriter and conversion specialist.`,
    "Produce a complete gig listing tailored to the provided service, niche, and audience.",
    toneInstruction(input.preferredTone),
    "",
    JSON_RULES,
    "",
    "Output contract (TypeScript):",
    `{
  "title": string,                       // 40-80 chars, includes a high-intent search keyword
  "alternativeTitles": string[],         // exactly 5
  "category": string,
  "tags": string[],                      // exactly 5, 2-3 lowercase words each
  "seoKeywords": string[],               // 6-10 buyer search phrases
  "description": string,                 // 300-600 words, markdown with 3+ paragraphs and bullet lists. End with a clear CTA.
  "packages": {
    "basic":    { "name": string, "price": number, "deliveryDays": number, "revisions": number, "deliverables": string[], "addOns": string[] },
    "standard": { "name": string, "price": number, "deliveryDays": number, "revisions": number, "deliverables": string[], "addOns": string[] },
    "premium":  { "name": string, "price": number, "deliveryDays": number, "revisions": number, "deliverables": string[], "addOns": string[] }
  },
  "buyerRequirements": string[],         // 3-6 questions you need from the buyer
  "faqs": [{ "question": string, "answer": string }],  // 4-6 entries
  "addOnServices": [{ "name": string, "price": number, "description": string }],  // 3-5 entries
  "thumbnailConcept": string,            // 1-2 sentence visual concept
  "thumbnailPrompt": string,             // image-gen ready prompt
  "portfolioSampleIdeas": string[]       // 3-5 concrete deliverable samples
}`,
    "",
    "Hard rules:",
    `- Package prices MUST sit inside the user's range [${input.pricingMin}, ${input.pricingMax}] ${input.pricingCurrency}. Basic ~= pricingMin, premium ~= pricingMax, standard between them.`,
    "- Basic < standard < premium. Premium price should be at least 2x basic.",
    "- Each package has at least 3 deliverables.",
    "- Every tag is 2-3 lowercase words, alphanumeric only.",
    "- Description uses markdown (## headings and `-` bullets are encouraged).",
    "- Mention the niche, audience, and buyer result explicitly in the description.",
    "- Do not promise outcomes you cannot guarantee. No '100% guaranteed', no overnight claims.",
  ].join("\n");

  const user = [
    "Generate the gig listing for the following input:",
    inputSummary(input),
    "",
    "Return the strict JSON now.",
  ].join("\n");

  return { system, user };
}

export function buildLeadStrategyPrompt(input: GigInput): GigPromptBundle {
  const system = [
    "You are a B2B/B2C lead generation strategist who helps freelancers find buyers off-platform.",
    "Produce an actionable lead strategy for the given service.",
    toneInstruction(input.preferredTone),
    "",
    JSON_RULES,
    "",
    "Output contract (TypeScript):",
    `{
  "bestLeadTypes": string[],             // exactly 5 buyer archetypes
  "targetIndustries": string[],          // exactly 5 industries
  "googleQueries": string[],             // exactly 10 Google search queries using site: filters and quoted phrases
  "instagramSearchTerms": string[],      // exactly 8 hashtags/phrases for Instagram
  "linkedinSearchTerms": string[],       // exactly 8 LinkedIn search strings
  "googleMapsSearchTerms": string[],     // exactly 5 local-search style terms
  "manualStrategy": string               // ~200 words, concrete weekly outreach playbook
}`,
    "",
    "Hard rules:",
    "- googleQueries MUST combine `site:` operators (e.g. site:linkedin.com/in, site:twitter.com, site:reddit.com) with quoted intent phrases.",
    "- Avoid generic terms — every entry must be specific to the niche.",
    "- manualStrategy must reference channels, weekly cadence, and message types.",
  ].join("\n");

  const user = [
    "Build the lead-generation strategy for the following service:",
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
  "coldEmail": { "subject": string, "body": string },   // body 120-180 words
  "instagramDm": string,                                // 60-100 words
  "linkedinMessage": string,                            // 80-140 words
  "shortPitch": string,                                 // 2-3 sentences, elevator pitch
  "followUpMessage": string,                            // 60-100 words, polite bump
  "proposalMessage": string                             // 150-220 words, proposal-style for Upwork/email
}`,
    "",
    "Hard rules:",
    "- Use the placeholders [their name] and [their company] for personalization.",
    "- Lead with a specific observation about the prospect, not generic flattery.",
    "- No 'Dear Sir/Madam', no 'I hope this email finds you well'.",
    "- No spam triggers ('guaranteed', 'free money', ALL CAPS shouting).",
    "- Close every message with a soft, low-friction CTA.",
  ].join("\n");

  const user = [
    "Write the outreach kit for the following service:",
    inputSummary(input),
    "",
    "Return the strict JSON now.",
  ].join("\n");

  return { system, user };
}
