import type {
  GigContent,
  GigPackage,
  GigPackages,
  GigScore,
  GigScoreBreakdown,
} from "../../models/Gig.model.js";

// Weights total 100.
const WEIGHTS = {
  titleClarity: 12,
  nicheFocus: 12,
  buyerBenefit: 14,
  pricingStrength: 12,
  keywordQuality: 12,
  descriptionQuality: 14,
  trustFactor: 12,
  ctaStrength: 12,
} as const;

const SEARCH_WORDS = [
  "professional",
  "expert",
  "custom",
  "modern",
  "high",
  "quality",
  "premium",
  "stunning",
  "creative",
  "fast",
  "responsive",
  "seo",
  "design",
  "service",
  "logo",
  "video",
  "writing",
  "marketing",
];

const BENEFIT_WORDS = [
  "increase",
  "boost",
  "grow",
  "save",
  "convert",
  "drive",
  "improve",
  "double",
  "scale",
  "rank",
  "attract",
  "generate",
  "win",
  "achieve",
  "deliver",
  "outperform",
];

const CTA_PHRASES = [
  "order now",
  "message me",
  "contact me",
  "click order",
  "get started",
  "let's chat",
  "let's talk",
  "place your order",
  "buy now",
  "send a message",
  "reach out",
  "dm me",
  "hire me",
];

const FAKE_GUARANTEE_PATTERNS = [
  /100\s*%\s*guarantee/i,
  /100\s*%\s*guaranteed/i,
  /make money overnight/i,
  /get rich quick/i,
  /guaranteed results overnight/i,
];

const TRUST_WORDS = [
  "experience",
  "years",
  "delivered",
  "clients",
  "portfolio",
  "satisfaction",
  "support",
  "refund",
  "money-back",
  "money back",
  "revision",
  "revisions",
];

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function pct(value: number, weight: number): number {
  return Math.round(clamp01(value) * weight);
}

function safe(str: string | null | undefined): string {
  return (str || "").trim();
}

function countWords(text: string): number {
  return safe(text).split(/\s+/).filter(Boolean).length;
}

function containsAny(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w.toLowerCase()));
}

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((acc, w) => (lower.includes(w.toLowerCase()) ? acc + 1 : acc), 0);
}

function isAllValidTags(tags: string[]): boolean {
  // Fiverr-style: 2-3 word tags, lowercase, alphanumeric.
  return tags.every((tag) => {
    const t = tag.trim();
    if (!t) return false;
    if (t.length > 30) return false;
    const wordCount = t.split(/\s+/).length;
    if (wordCount > 3) return false;
    if (!/^[a-zA-Z0-9 \-]+$/.test(t)) return false;
    return true;
  });
}

function scoreTitleClarity(content: GigContent): number {
  const title = safe(content.title);
  if (!title) return 0;
  let value = 0;

  // Length: ideal 40-80 chars.
  const len = title.length;
  if (len >= 40 && len <= 80) value += 0.4;
  else if (len >= 20 && len <= 100) value += 0.25;
  else value += 0.1;

  // Contains a recognized search keyword.
  if (containsAny(title, SEARCH_WORDS)) value += 0.3;

  // Has alternative titles for A/B variety.
  if (content.alternativeTitles && content.alternativeTitles.length >= 3) value += 0.2;

  // Avoid all-caps spam.
  const upperRatio = title.replace(/[^A-Z]/g, "").length / Math.max(1, title.replace(/[^a-zA-Z]/g, "").length);
  if (upperRatio < 0.5) value += 0.1;

  return pct(value, WEIGHTS.titleClarity);
}

function scoreNicheFocus(content: GigContent): number {
  const title = safe(content.title).toLowerCase();
  const description = safe(content.description).toLowerCase();
  const category = safe(content.category).toLowerCase();
  let value = 0;

  if (category) value += 0.25;
  // Specificity heuristic — niche words tend to be specific nouns, so reward
  // titles and descriptions that include category and at least one descriptive
  // word from search terms.
  if (category && title.includes(category.split(" ")[0] || "")) value += 0.25;
  if (description.length > 400) value += 0.25;
  if (content.tags.length >= 5) value += 0.25;

  return pct(value, WEIGHTS.nicheFocus);
}

function scoreBuyerBenefit(content: GigContent): number {
  const corpus = [safe(content.title), safe(content.description), ...content.faqs.map((f) => f.answer)]
    .join(" ");
  const matches = countMatches(corpus, BENEFIT_WORDS);
  let value = 0;
  if (matches >= 5) value = 1;
  else if (matches >= 3) value = 0.75;
  else if (matches >= 1) value = 0.45;
  else value = 0.15;
  return pct(value, WEIGHTS.buyerBenefit);
}

function packagePrices(packages: GigPackages): [number, number, number] {
  return [
    Number(packages.basic?.price) || 0,
    Number(packages.standard?.price) || 0,
    Number(packages.premium?.price) || 0,
  ];
}

function eachHasNDeliverables(packages: GigPackages, n: number): boolean {
  const list: GigPackage[] = [packages.basic, packages.standard, packages.premium];
  return list.every((p) => Array.isArray(p?.deliverables) && p.deliverables.filter(Boolean).length >= n);
}

function scorePricingStrength(content: GigContent): number {
  const [basic, standard, premium] = packagePrices(content.packages);
  let value = 0;

  // All three present.
  if (basic > 0 && standard > 0 && premium > 0) value += 0.25;
  // Strictly ascending.
  if (basic < standard && standard < premium) value += 0.3;
  // Premium >= 2x basic.
  if (basic > 0 && premium >= basic * 2) value += 0.25;
  // Each package has >= 3 deliverables.
  if (eachHasNDeliverables(content.packages, 3)) value += 0.2;

  return pct(value, WEIGHTS.pricingStrength);
}

function scoreKeywordQuality(content: GigContent): number {
  let value = 0;
  const tags = (content.tags || []).map((t) => safe(t)).filter(Boolean);
  const seoKeywords = (content.seoKeywords || []).map((k) => safe(k)).filter(Boolean);

  if (tags.length === 5 && isAllValidTags(tags)) value += 0.5;
  else if (tags.length >= 3 && isAllValidTags(tags)) value += 0.3;
  else if (tags.length > 0) value += 0.1;

  if (seoKeywords.length >= 5) value += 0.3;
  else if (seoKeywords.length >= 1) value += 0.15;

  // Reward keyword presence in description.
  const description = safe(content.description).toLowerCase();
  const hits = seoKeywords.filter((k) => description.includes(k.toLowerCase())).length;
  if (hits >= 3) value += 0.2;
  else if (hits >= 1) value += 0.1;

  return pct(value, WEIGHTS.keywordQuality);
}

function scoreDescriptionQuality(content: GigContent): number {
  const description = safe(content.description);
  if (!description) return 0;
  let value = 0;

  const wordCount = countWords(description);
  if (wordCount >= 300) value += 0.35;
  else if (wordCount >= 150) value += 0.2;
  else value += 0.05;

  // Paragraph count.
  const paragraphs = description.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  if (paragraphs.length >= 3) value += 0.25;
  else if (paragraphs.length >= 2) value += 0.15;

  // Bullet detection — markdown or unicode bullets.
  const hasBullets = /(^|\n)\s*([-*•+])\s+/.test(description);
  if (hasBullets) value += 0.25;

  // Penalty for spammy ALL CAPS lines.
  if (/[A-Z]{6,}/.test(description)) value -= 0.1;

  // Reward markdown headings.
  if (/(^|\n)#{1,3}\s+/.test(description)) value += 0.15;

  return pct(value, WEIGHTS.descriptionQuality);
}

function scoreTrustFactor(content: GigContent): number {
  const corpus = [safe(content.description), ...content.faqs.map((f) => `${f.question} ${f.answer}`)].join(" ");
  let value = 0;

  const trustHits = countMatches(corpus, TRUST_WORDS);
  if (trustHits >= 4) value += 0.45;
  else if (trustHits >= 2) value += 0.3;
  else value += 0.1;

  // FAQs present.
  if (content.faqs.length >= 4) value += 0.25;
  else if (content.faqs.length >= 1) value += 0.1;

  // Buyer requirements present.
  if (content.buyerRequirements.length >= 3) value += 0.2;
  else if (content.buyerRequirements.length >= 1) value += 0.1;

  // Penalize fake guarantees.
  const hasFakeGuarantee = FAKE_GUARANTEE_PATTERNS.some((re) => re.test(corpus));
  if (hasFakeGuarantee) value -= 0.4;

  // Portfolio samples mentioned.
  if (content.portfolioSampleIdeas.length >= 3) value += 0.1;

  return pct(value, WEIGHTS.trustFactor);
}

function scoreCtaStrength(content: GigContent): number {
  const description = safe(content.description).toLowerCase();
  const lastChunk = description.slice(Math.max(0, description.length - 400));
  let value = 0;

  const hasCtaAtEnd = CTA_PHRASES.some((phrase) => lastChunk.includes(phrase));
  const hasCtaAnywhere = CTA_PHRASES.some((phrase) => description.includes(phrase));

  if (hasCtaAtEnd) value += 0.6;
  else if (hasCtaAnywhere) value += 0.35;

  // Question or invitation phrasing helps.
  if (/(ready|let'?s|why wait|don'?t hesitate)/i.test(description)) value += 0.2;

  // Encourage messaging before order.
  if (/message me|contact me|chat/i.test(description)) value += 0.2;

  return pct(value, WEIGHTS.ctaStrength);
}

function suggestionsFor(content: GigContent, breakdown: GigScoreBreakdown): string[] {
  type Dim = { key: keyof GigScoreBreakdown; weight: number; raw: number };
  const dims: Dim[] = (Object.keys(breakdown) as Array<keyof GigScoreBreakdown>).map((key) => ({
    key,
    weight: WEIGHTS[key],
    raw: breakdown[key] / Math.max(1, WEIGHTS[key]),
  }));

  // Sort ascending by raw (lowest first).
  dims.sort((a, b) => a.raw - b.raw);

  const messages: Record<keyof GigScoreBreakdown, string> = {
    titleClarity:
      "Tighten the title to 40-80 characters and include a high-intent search keyword (e.g. 'design', 'SEO', 'video').",
    nicheFocus:
      "Make the niche more specific — call out the exact buyer persona, industry, and outcome in the first line.",
    buyerBenefit:
      "Lead with concrete buyer outcomes (increase, boost, save, convert) instead of describing what you do.",
    pricingStrength:
      "Use three ascending tiers with premium >= 2x basic, and give each tier at least 3 unique deliverables.",
    keywordQuality:
      "Provide exactly 5 short tag phrases (2-3 lowercase words) and weave your SEO keywords into the description.",
    descriptionQuality:
      "Expand the description to 300+ words, break it into 3+ paragraphs, and add bullet lists for deliverables.",
    trustFactor:
      "Add real proof: years of experience, client count, revisions policy, and 3-5 FAQs that handle objections.",
    ctaStrength:
      "Close with a clear CTA — invite buyers to message you first, then 'Order now' or 'Place your order today'.",
  };

  const fakeGuarantee = FAKE_GUARANTEE_PATTERNS.some((re) =>
    re.test([content.title, content.description, ...content.faqs.map((f) => f.answer)].join(" "))
  );

  const out: string[] = [];
  if (fakeGuarantee) {
    out.push(
      "Remove unrealistic guarantees ('100% guaranteed', 'overnight'). They hurt trust and can violate platform rules."
    );
  }

  for (const dim of dims) {
    if (out.length >= 5) break;
    out.push(messages[dim.key]);
  }
  // Always 3-5 suggestions.
  return out.slice(0, Math.max(3, Math.min(5, out.length)));
}

export function calculateGigScore(content: GigContent): GigScore {
  const breakdown: GigScoreBreakdown = {
    titleClarity: scoreTitleClarity(content),
    nicheFocus: scoreNicheFocus(content),
    buyerBenefit: scoreBuyerBenefit(content),
    pricingStrength: scorePricingStrength(content),
    keywordQuality: scoreKeywordQuality(content),
    descriptionQuality: scoreDescriptionQuality(content),
    trustFactor: scoreTrustFactor(content),
    ctaStrength: scoreCtaStrength(content),
  };

  const overall = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  // Clamp to [0, 100] just in case of penalty math.
  const clampedOverall = Math.max(0, Math.min(100, overall));

  return {
    overall: clampedOverall,
    breakdown,
    suggestions: suggestionsFor(content, breakdown),
  };
}
