import type {
  ReportContent,
  ReportSnapshot,
  MonetizationStream,
  ReportSections,
} from "../../models/GrowthReport.model.js";
import { hostnameFromUrl } from "./scraper.js";

interface GenreProfile {
  label: string;
  industry: string;
  audience: string;
  primaryPath: string;
  reasoning: string;
  streams: MonetizationStream[];
  recommendations: string[];
  baseScores: { seo: number; conversion: number; branding: number; marketing: number };
}

const GENRE_KEYWORDS: { keys: string[]; profile: GenreProfile }[] = [
  {
    keys: ["saas", "software", "app", "platform", "dashboard", "api", "sdk", "developers"],
    profile: {
      label: "SaaS / web application",
      industry: "Software & Technology",
      audience: "Teams, product managers, and developers looking for a focused tool",
      primaryPath: "Tiered subscription with a generous free trial",
      reasoning:
        "Software products convert best when users can self-serve a free trial and upgrade as usage grows. Your existing copy already targets teams, so a per-seat tiered model captures both small startups and growing org accounts.",
      streams: [
        {
          name: "Free trial → paid subscription",
          description: "14-day full-feature trial then a 3-tier monthly plan (Starter / Pro / Team).",
          setupEffort: "medium",
          timeToFirstRevenue: "2-4 weeks",
          monthlyRevenuePotential: "$500 – $20,000",
          fitScore: 92,
        },
        {
          name: "Annual plan discount",
          description: "Offer 2 months free for annual billing to lift cash flow and reduce churn.",
          setupEffort: "low",
          timeToFirstRevenue: "1 week after subs launch",
          monthlyRevenuePotential: "$200 – $5,000",
          fitScore: 78,
        },
        {
          name: "Usage-based add-on",
          description: "Charge per API call, seat, or generation above the plan ceiling.",
          setupEffort: "high",
          timeToFirstRevenue: "1-2 months",
          monthlyRevenuePotential: "$100 – $4,000",
          fitScore: 70,
        },
        {
          name: "Done-for-you onboarding",
          description: "One-time onboarding/setup engagement for enterprise prospects.",
          setupEffort: "low",
          timeToFirstRevenue: "1-2 weeks",
          monthlyRevenuePotential: "$500 – $3,000",
          fitScore: 65,
        },
        {
          name: "Integration partner referrals",
          description: "Earn referral fees from complementary tools your users adopt.",
          setupEffort: "low",
          timeToFirstRevenue: "1 month",
          monthlyRevenuePotential: "$100 – $1,500",
          fitScore: 55,
        },
      ],
      recommendations: [
        "Surface a clear pricing page within one click of the hero.",
        "Add a 30-second product demo video above the fold.",
        "Capture emails on a credible free tool/template before paywall.",
        "Publish a comparison page vs. the top 2 competitors.",
        "Wire conversion analytics (sign-up → activation → paid).",
        "Build a help center indexed by Google for long-tail keywords.",
      ],
      baseScores: { seo: 62, conversion: 58, branding: 68, marketing: 60 },
    },
  },
  {
    keys: ["shop", "store", "ecommerce", "cart", "buy", "checkout", "product", "shipping"],
    profile: {
      label: "Ecommerce / online store",
      industry: "Retail & Commerce",
      audience: "Shoppers looking for specific products and bundles",
      primaryPath: "Conversion-rate optimization on existing traffic",
      reasoning:
        "Stores grow fastest by lifting AOV and CVR on the traffic they already get, before spending more on ads. Quick wins here pay back faster than expanding product lines.",
      streams: [
        {
          name: "Bundle and upsell at checkout",
          description: "Show 'frequently bought together' and post-purchase upsells.",
          setupEffort: "low",
          timeToFirstRevenue: "1 week",
          monthlyRevenuePotential: "$300 – $4,000",
          fitScore: 90,
        },
        {
          name: "Abandoned-cart email sequence",
          description: "Three-email flow recovering lost checkout sessions.",
          setupEffort: "low",
          timeToFirstRevenue: "2 weeks",
          monthlyRevenuePotential: "$200 – $3,000",
          fitScore: 85,
        },
        {
          name: "Loyalty / referral program",
          description: "Reward repeat buyers and give them a share-able discount link.",
          setupEffort: "medium",
          timeToFirstRevenue: "1 month",
          monthlyRevenuePotential: "$150 – $2,500",
          fitScore: 72,
        },
        {
          name: "Subscribe & save",
          description: "Recurring orders for consumable / replenishable items.",
          setupEffort: "medium",
          timeToFirstRevenue: "1-2 months",
          monthlyRevenuePotential: "$300 – $5,000",
          fitScore: 70,
        },
        {
          name: "Wholesale / B2B tier",
          description: "Lower price for bulk orders with a separate landing page.",
          setupEffort: "high",
          timeToFirstRevenue: "1-3 months",
          monthlyRevenuePotential: "$500 – $10,000",
          fitScore: 60,
        },
      ],
      recommendations: [
        "Add trust badges and shipping/return policy near the buy button.",
        "Show real customer reviews with photos on the product page.",
        "Optimize hero images for sub-2-second LCP.",
        "Add SMS + email abandoned-cart flow today.",
        "Test free shipping above a threshold to lift AOV.",
        "Make the cart icon a sticky button on mobile.",
      ],
      baseScores: { seo: 55, conversion: 50, branding: 60, marketing: 62 },
    },
  },
  {
    keys: ["blog", "article", "post", "newsletter", "writer", "essay", "stories"],
    profile: {
      label: "Personal blog / content site",
      industry: "Publishing & Media",
      audience: "Readers interested in a specific topic or author",
      primaryPath: "Paid newsletter + sponsorship combo",
      reasoning:
        "Editorial sites with consistent voice monetize best by stacking a small paid subscription on top of sponsor placements. Both compound with audience size and beat display ads on RPM.",
      streams: [
        {
          name: "Paid newsletter tier",
          description: "Free posts to grow the list, paid posts (or community) at $5–10/mo.",
          setupEffort: "low",
          timeToFirstRevenue: "2-4 weeks",
          monthlyRevenuePotential: "$100 – $5,000",
          fitScore: 88,
        },
        {
          name: "Sponsor slots",
          description: "Sell weekly sponsor blocks at a flat rate once you cross ~2k subscribers.",
          setupEffort: "low",
          timeToFirstRevenue: "1-3 months",
          monthlyRevenuePotential: "$200 – $4,000",
          fitScore: 80,
        },
        {
          name: "Affiliate links",
          description: "Earn commission on tools / books / courses you'd recommend anyway.",
          setupEffort: "low",
          timeToFirstRevenue: "1 month",
          monthlyRevenuePotential: "$50 – $1,500",
          fitScore: 70,
        },
        {
          name: "Digital download / mini-course",
          description: "Package your best content into a one-time-purchase resource.",
          setupEffort: "medium",
          timeToFirstRevenue: "1-2 months",
          monthlyRevenuePotential: "$200 – $3,000",
          fitScore: 72,
        },
        {
          name: "Community membership",
          description: "Private Discord or forum included with the paid tier.",
          setupEffort: "medium",
          timeToFirstRevenue: "1-2 months",
          monthlyRevenuePotential: "$150 – $2,000",
          fitScore: 60,
        },
      ],
      recommendations: [
        "Add an email opt-in above the fold and at the end of every post.",
        "Publish a free PDF lead-magnet tied to your most popular post.",
        "Pick one publishing cadence and stick with it for 90 days.",
        "Cross-post to LinkedIn / X with a stronger title hook.",
        "Add a 'tip jar' or 'support this' page for readers who want to chip in.",
        "Track conversion from free → paid each week, not each month.",
      ],
      baseScores: { seo: 65, conversion: 45, branding: 60, marketing: 55 },
    },
  },
  {
    keys: ["agency", "consulting", "services", "freelance", "studio", "hire", "clients"],
    profile: {
      label: "Agency / consulting / services",
      industry: "Professional Services",
      audience: "Decision-makers looking to outsource a specific outcome",
      primaryPath: "Productized service with clear scope and price",
      reasoning:
        "Services scale poorly with hourly billing. Packaging your top engagement into a fixed-price, fixed-scope offer increases close rate and lets you predict revenue.",
      streams: [
        {
          name: "Productized engagement",
          description: "Flat-price package (e.g. '$4k brand audit, 2-week turnaround').",
          setupEffort: "low",
          timeToFirstRevenue: "1-2 weeks",
          monthlyRevenuePotential: "$2,000 – $20,000",
          fitScore: 92,
        },
        {
          name: "Monthly retainer",
          description: "Ongoing support contract with capped hours and SLA.",
          setupEffort: "medium",
          timeToFirstRevenue: "1 month",
          monthlyRevenuePotential: "$1,500 – $15,000",
          fitScore: 85,
        },
        {
          name: "Diagnostic call (paid)",
          description: "Convert top-of-funnel into a $200–500 paid intake call.",
          setupEffort: "low",
          timeToFirstRevenue: "1 week",
          monthlyRevenuePotential: "$200 – $3,000",
          fitScore: 70,
        },
        {
          name: "Template / playbook sale",
          description: "Sell the proven SOP/template behind your service for $99–$299.",
          setupEffort: "medium",
          timeToFirstRevenue: "1-2 months",
          monthlyRevenuePotential: "$200 – $2,500",
          fitScore: 65,
        },
        {
          name: "Affiliate / referral fees",
          description: "Earn referral fees from partner tools your clients buy.",
          setupEffort: "low",
          timeToFirstRevenue: "1-3 months",
          monthlyRevenuePotential: "$100 – $2,000",
          fitScore: 55,
        },
      ],
      recommendations: [
        "Put the productized offer with price and scope at the top of the page.",
        "Replace 'Contact us' with a calendar booking link.",
        "Show 2-3 case studies with results in numbers.",
        "Add an FAQ that answers the 5 most common pre-sales objections.",
        "Capture leads with a free audit/checklist tied to the service.",
        "Publish one client outcome per month on LinkedIn.",
      ],
      baseScores: { seo: 50, conversion: 55, branding: 65, marketing: 50 },
    },
  },
  {
    keys: ["restaurant", "menu", "reservation", "café", "cafe", "bar", "delivery", "takeout"],
    profile: {
      label: "Local restaurant / hospitality",
      industry: "Food & Beverage",
      audience: "Local customers searching for somewhere to eat tonight",
      primaryPath: "Direct ordering + repeat-visit loyalty",
      reasoning:
        "Marketplaces (Uber, DoorDash) cost 25–30% of order value. Routing orders through your own site, paired with a loyalty program, lifts margin and visit frequency.",
      streams: [
        {
          name: "Direct online ordering",
          description: "Embed a no-fee ordering widget and promote it heavily.",
          setupEffort: "medium",
          timeToFirstRevenue: "2-4 weeks",
          monthlyRevenuePotential: "$500 – $8,000",
          fitScore: 90,
        },
        {
          name: "Loyalty / punch-card program",
          description: "Digital stamp card that nudges a 4th-visit-free reward.",
          setupEffort: "low",
          timeToFirstRevenue: "2 weeks",
          monthlyRevenuePotential: "$200 – $2,500",
          fitScore: 80,
        },
        {
          name: "Reservation & private events",
          description: "Take deposits online for private bookings.",
          setupEffort: "low",
          timeToFirstRevenue: "1 month",
          monthlyRevenuePotential: "$200 – $4,000",
          fitScore: 70,
        },
        {
          name: "Gift cards",
          description: "Sell digital gift cards with no expiry.",
          setupEffort: "low",
          timeToFirstRevenue: "1-2 weeks",
          monthlyRevenuePotential: "$100 – $1,500",
          fitScore: 65,
        },
        {
          name: "Merch / branded retail",
          description: "Hats, beans, sauces — small SKUs that fans buy on a visit.",
          setupEffort: "medium",
          timeToFirstRevenue: "1-2 months",
          monthlyRevenuePotential: "$100 – $1,200",
          fitScore: 55,
        },
      ],
      recommendations: [
        "Make hours, address, and phone number tappable on every page.",
        "Verify and own the Google Business Profile listing.",
        "Replace the menu PDF with an HTML menu (SEO + mobile).",
        "Take great photos of 5 best dishes for hero/social use.",
        "Push reviews proactively — ask happy customers at the table.",
        "Promote the loyalty program on receipts and table cards.",
      ],
      baseScores: { seo: 55, conversion: 60, branding: 70, marketing: 55 },
    },
  },
];

const DEFAULT_PROFILE: GenreProfile = {
  label: "Brand / content website",
  industry: "Digital & Online Business",
  audience: "Visitors interested in this brand or topic",
  primaryPath: "Convert traffic into an email list, then to a paid offer",
  reasoning:
    "Without a clear signup or purchase path, traffic leaks. The most reliable first move is to capture emails with a high-value freebie, then sell a small paid offer to subscribers.",
  streams: [
    {
      name: "Lead-magnet → email funnel",
      description: "Offer a useful free resource for an email, then nurture with a 5-email sequence.",
      setupEffort: "low",
      timeToFirstRevenue: "2-4 weeks",
      monthlyRevenuePotential: "$200 – $3,000",
      fitScore: 85,
    },
    {
      name: "Small paid starter offer",
      description: "Sell a $20–$100 entry-level product/service to your list.",
      setupEffort: "medium",
      timeToFirstRevenue: "1-2 months",
      monthlyRevenuePotential: "$200 – $4,000",
      fitScore: 78,
    },
    {
      name: "Booking / consultation",
      description: "Add a calendar to monetize attention as paid consultations.",
      setupEffort: "low",
      timeToFirstRevenue: "1-2 weeks",
      monthlyRevenuePotential: "$300 – $5,000",
      fitScore: 70,
    },
    {
      name: "Affiliate / partnerships",
      description: "Recommend tools / services you trust for a referral cut.",
      setupEffort: "low",
      timeToFirstRevenue: "1-2 months",
      monthlyRevenuePotential: "$100 – $1,500",
      fitScore: 60,
    },
    {
      name: "Digital download",
      description: "Package your best content into a one-time-purchase resource.",
      setupEffort: "medium",
      timeToFirstRevenue: "1-2 months",
      monthlyRevenuePotential: "$150 – $2,500",
      fitScore: 55,
    },
  ],
  recommendations: [
    "Add a single clear call-to-action above the fold.",
    "Capture emails with a high-value freebie.",
    "Write three pillar pages that target buyer-intent searches.",
    "Add testimonials, logos, or trust signals near the CTA.",
    "Wire conversion analytics to see what's actually working.",
    "Publish or update content on a steady weekly cadence.",
  ],
  baseScores: { seo: 50, conversion: 45, branding: 55, marketing: 50 },
};

export function detectGenre(snapshot: ReportSnapshot): GenreProfile {
  const text = `${snapshot.title} ${snapshot.h1s.join(" ")} ${snapshot.h2s.join(" ")} ${snapshot.bodySample}`.toLowerCase();
  for (const entry of GENRE_KEYWORDS) {
    if (entry.keys.some((kw) => text.includes(kw))) {
      return entry.profile;
    }
  }
  return DEFAULT_PROFILE;
}

function computeOverall(scores: { seo: number; conversion: number; branding: number; marketing: number }): number {
  const avg = (scores.seo + scores.conversion + scores.branding + scores.marketing) / 4;
  return Math.round(avg);
}

function buildSections(profile: GenreProfile, websiteTitle: string, hostname: string): ReportSections {
  const site = websiteTitle || hostname || "this website";
  return {
    shortSummary: `${site} fits the profile of a ${profile.label.toLowerCase()} serving ${profile.audience.toLowerCase()}. The fastest path to revenue is ${profile.primaryPath.toLowerCase()}.`,
    earningPotentialOverview: `Based on the page content, ${site} sits in the ${profile.industry.toLowerCase()} space. With moderate effort over the next 30–90 days, a realistic monthly revenue band is the range shown in the streams table below. Hitting the upper bound depends on conversion-rate work and consistent traffic acquisition.`,
    whoWillPay: `The most likely buyers for ${site} are ${profile.audience.toLowerCase()}. They will pay because the offer maps directly to a problem they already know they have, and the perceived cost of inaction is higher than the price of the solution.`,
    bestWaysToEarn: `Lead with: ${profile.primaryPath}. ${profile.reasoning} Stack one secondary stream (such as ${profile.streams[1]?.name.toLowerCase() || "an upsell"}) once the primary stream is producing predictable revenue.`,
    pricingOfferIdeas: `Anchor on one clear price point per package. For ${profile.label.toLowerCase()}s, three tiers usually beats five — keep the middle tier as the obvious choice. Show the price publicly; opaque "Contact us" forms lose 50%+ of pre-qualified buyers.`,
    stepByStepPlan: `Week 1: ship the smallest version of ${profile.primaryPath.toLowerCase()}. Week 2: wire up analytics + email capture. Week 3: send the first marketing push. Week 4: iterate on the page based on real funnel data. Months 2–3: layer in the next stream and double down on whichever channel is converting.`,
    seoContentIdeas: `Write 3 pillar pages targeting buyer-intent phrases tied to ${profile.label.toLowerCase()}s. Pair each pillar with 4–6 supporting articles answering long-tail questions buyers ask before purchase. Internal-link aggressively from supporting articles back to the pillar and the offer page.`,
    marketingChannels: `Start with two channels and ignore the rest for 90 days. For ${profile.label.toLowerCase()}, the strongest pair is usually organic search + one community/audience channel (X, LinkedIn, or a relevant subreddit/Slack). Spend < $200 testing paid until the organic funnel converts at >2%.`,
    conversionImprovements: `Move the primary CTA above the fold. Replace generic copy with a benefit-led headline that includes the audience and outcome. Add at least 3 forms of social proof: testimonials, logos, or measurable results. Cut every form field that is not strictly required.`,
    roadmap: `Days 1–14: launch primary offer. Days 15–30: collect first batch of customer feedback. Days 31–60: improve the page based on what you learned. Days 61–90: introduce the second revenue stream. Days 91–180: scale whichever channel is producing the lowest customer acquisition cost.`,
    revenuePotential: `Realistic potential for ${site}: see the streams table. The lower bound assumes minimal traffic growth; the upper bound assumes ~30% growth quarter-over-quarter and a 2-3% conversion rate on the primary offer. Track weekly so you can spot what's actually moving.`,
    firstActionsToday: `1) Add the primary CTA and price to the home page above the fold. 2) Install email capture (ConvertKit / Beehiiv / native). 3) Connect basic analytics so you can see which sources convert. 4) Schedule a single repeating content slot. 5) Ask 3 existing customers (or warm contacts) the one question that would unlock the next 3 customers.`,
  };
}

export function buildFallbackReport(websiteUrl: string, snapshot: ReportSnapshot): ReportContent {
  const hostname = hostnameFromUrl(websiteUrl);
  const profile = detectGenre(snapshot);
  const websiteTitle = snapshot.title || hostname || websiteUrl;
  const scores = {
    ...profile.baseScores,
    overall: computeOverall(profile.baseScores),
  };

  // Bump scores slightly if the page actually returned useful signals.
  if (snapshot.ok && snapshot.title) scores.branding = Math.min(100, scores.branding + 4);
  if (snapshot.description) scores.seo = Math.min(100, scores.seo + 4);
  if (snapshot.h1s.length > 0) scores.seo = Math.min(100, scores.seo + 2);
  scores.overall = computeOverall(scores);

  return {
    websiteTitle,
    detectedGenre: profile.label,
    industry: profile.industry,
    audience: profile.audience,
    summary: `${websiteTitle} reads as a ${profile.label.toLowerCase()} in the ${profile.industry.toLowerCase()} space. ${profile.reasoning}`,
    scores,
    monetizationStrategy: {
      primaryPath: profile.primaryPath,
      reasoning: profile.reasoning,
    },
    monetizationStreams: profile.streams,
    sections: buildSections(profile, websiteTitle, hostname),
    topRecommendations: profile.recommendations,
  };
}
