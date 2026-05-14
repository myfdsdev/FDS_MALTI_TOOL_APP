import type { ToolDefinition } from "./types.js";
import { GENERAL_TONES, listOutput, selectInput, textInput, textOutput, textareaInput, urlInput } from "./shared.js";

export const businessTools: ToolDefinition[] = [
  {
    id: "business-name",
    name: "AI Business Name Generator",
    category: "business",
    description: "Generate memorable business names that fit the niche and brand personality.",
    inputs: [
      textInput("niche", "Niche", "AI automation, skincare, legal services"),
      textInput("audience", "Audience", "Founders, premium buyers, local families"),
      selectInput("style", "Style", ["Modern", "Premium", "Creative", "Minimal", "Bold"]),
      textInput("brandPersonality", "Brand Personality", "Clean, trustworthy, energetic, luxurious"),
    ],
    prompt: {
      instructions: [
        "Make the names easy to pronounce, easy to remember, and brandable.",
        "Avoid names that feel generic or clunky.",
        "Keep each category stylistically distinct.",
      ],
      outputFields: [
        listOutput("modernNames", "Modern Names", 5),
        listOutput("premiumNames", "Premium Names", 5),
        listOutput("creativeNames", "Creative Names", 5),
        listOutput("shortNames", "Short Names", 5),
      ],
    },
  },
  {
    id: "logo-idea",
    name: "AI Logo Idea Generator",
    category: "business",
    description: "Suggest logo concepts, symbol ideas, palette direction, typography, and brand feel.",
    inputs: [
      textInput("brandName", "Brand Name", "Luma Growth"),
      textInput("industry", "Industry", "SaaS, salon, coaching, hospitality"),
      textInput("brandPersonality", "Brand Personality", "Bold, calm, premium, friendly"),
      textInput("colorPreference", "Color Preference", "Emerald and charcoal, warm neutrals", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Do not generate an image.",
        "Describe the concept clearly enough that a designer could execute it.",
        "Keep the direction cohesive and commercially usable.",
      ],
      outputFields: [
        textOutput("logoConcept", "Logo Concept"),
        textOutput("iconSymbolIdea", "Icon or Symbol Idea"),
        textOutput("colourPalette", "Colour Palette"),
        textOutput("typographyStyle", "Typography Style"),
        textOutput("visualStyle", "Visual Style"),
      ],
    },
  },
  {
    id: "tagline-generator",
    name: "AI Tagline Generator",
    category: "business",
    description: "Create short, memorable taglines for a brand, product, or service.",
    inputs: [
      textInput("brandName", "Brand Name", "Northstone Studio"),
      textInput("niche", "Niche", "Creative agency for local businesses"),
      selectInput("tone", "Tone", GENERAL_TONES),
      textInput("mainBenefit", "Main Benefit", "Faster growth, better leads, stronger presence"),
    ],
    prompt: {
      instructions: [
        "Make the taglines clear, memorable, and marketable.",
        "Avoid cliches and empty slogans.",
        "Keep them compact and punchy.",
      ],
      outputFields: [listOutput("taglineOptions", "20 tagline options", 20)],
    },
  },
  {
    id: "offer-generator",
    name: "AI Offer Generator",
    category: "business",
    description: "Design stronger offers with clear value, bonuses, urgency, and risk reversal.",
    inputs: [
      textInput("business", "Business", "Paid ads agency, nutrition coach, dental clinic"),
      textInput("goal", "Goal", "Generate more leads, close premium clients, improve retention"),
      textInput("audience", "Audience", "Restaurant owners, fitness beginners, ecommerce brands", {
        required: false,
      }),
      textInput("transformation", "Desired Transformation", "More appointments, more confidence, more sales", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Focus on the offer itself, not just general marketing advice.",
        "Make the promise realistic but compelling.",
        "Include bonuses, urgency, and risk-reversal ideas where useful.",
      ],
      outputFields: [
        textOutput("offerName", "Offer Name"),
        textOutput("mainPromise", "Main Promise"),
        listOutput("whatsIncluded", "What's Included", 5),
        listOutput("bonusIdeas", "Bonus Ideas", 5),
        textOutput("cta", "CTA"),
      ],
    },
  },
  {
    id: "cta-generator",
    name: "AI CTA Generator",
    category: "business",
    description: "Create short, direct calls to action for pages, ads, emails, and social posts.",
    inputs: [
      textInput("context", "Context", "Landing page hero, retargeting ad, sales email footer"),
      textInput("goal", "Goal", "Book a call, download a guide, start a trial"),
      selectInput("tone", "Tone", GENERAL_TONES, undefined, { required: false }),
    ],
    prompt: {
      instructions: [
        "Keep the CTA lines short, clear, and action-driven.",
        "Vary the energy level across the different categories.",
        "Avoid generic filler like 'Learn more' unless it genuinely fits.",
      ],
      outputFields: [
        listOutput("softCtas", "Soft CTAs", 5),
        listOutput("directCtas", "Direct CTAs", 5),
        listOutput("urgencyCtas", "Urgency CTAs", 5),
        listOutput("premiumCtas", "Premium CTAs", 5),
      ],
    },
  },
  {
    id: "proposal-writer",
    name: "AI Proposal Writer",
    category: "business",
    description: "Generate a professional proposal with scope, deliverables, timeline, and next step.",
    inputs: [
      textInput("service", "Service", "Social media management, app redesign, SEO retainer"),
      textInput("client", "Client", "Acme Dental, John Smith, BluePeak Labs"),
      textareaInput("scope", "Scope", "What work is included?"),
      textInput("objective", "Objective", "Increase bookings, improve conversion, speed up delivery", {
        required: false,
      }),
      textInput("timeline", "Timeline", "2 weeks, 30 days, 3 phases", { required: false }),
    ],
    prompt: {
      instructions: [
        "Write like a clear, competent professional.",
        "Include pricing as a placeholder rather than inventing a number.",
        "Keep it persuasive without sounding inflated.",
      ],
      outputFields: [
        textOutput("proposalTitle", "Proposal Title"),
        textOutput("introduction", "Introduction"),
        textOutput("objective", "Objective"),
        textOutput("scopeOfWork", "Scope of Work"),
        listOutput("deliverables", "Deliverables", 5),
        textOutput("timeline", "Timeline"),
        textOutput("investment", "Investment"),
        textOutput("nextStep", "Next Step"),
      ],
    },
  },
  {
    id: "invoice-message",
    name: "AI Invoice Message Generator",
    category: "business",
    description: "Write polite, direct invoice and payment reminder messages.",
    inputs: [
      textInput("clientName", "Client Name", "Sarah, Acme Corp, Dr. Patel"),
      textInput("amount", "Amount", "$1,250"),
      textInput("dueDate", "Due Date", "May 30, 2026"),
      textareaInput("context", "Context", "Any extra details, such as milestone name or payment terms", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Be polite, professional, and clear.",
        "Do not sound aggressive or passive-aggressive.",
        "Make the next step obvious for the client.",
      ],
      outputFields: [
        textOutput("subject", "Subject"),
        textOutput("message", "Message"),
      ],
    },
  },
  {
    id: "client-reply",
    name: "AI Client Reply Generator",
    category: "business",
    description: "Respond to client messages with clarity, confidence, and good judgment.",
    inputs: [
      textareaInput("clientMessage", "Client Message", "Paste the client's message here"),
      textInput("goal", "Goal", "Reassure them, explain a delay, handle a revision request", {
        required: false,
      }),
      selectInput("tone", "Tone", GENERAL_TONES),
    ],
    prompt: {
      instructions: [
        "Understand the concern and address it directly.",
        "Write clearly, politely, and confidently.",
        "Keep the reply brand-safe and solution-oriented.",
      ],
      outputFields: [textOutput("reply", "Reply")],
    },
  },
  {
    id: "meeting-summary",
    name: "AI Meeting Summary Generator",
    category: "business",
    description: "Turn rough notes into a clean summary with decisions, action items, and deadlines.",
    inputs: [textareaInput("notes", "Meeting Notes", "Paste your raw notes, transcript excerpt, or bullet points")],
    prompt: {
      instructions: [
        "Extract the most important decisions, tasks, owners, deadlines, and follow-ups.",
        "Make the summary clear enough to share immediately after the meeting.",
        "If owners or deadlines are missing, state that briefly rather than inventing them.",
      ],
      outputFields: [
        textOutput("meetingSummary", "Meeting Summary"),
        listOutput("keyDecisions", "Key Decisions", 5),
        listOutput("actionItems", "Action Items", 5),
        listOutput("deadlines", "Deadlines", 5),
        textOutput("followUpNotes", "Follow-up Notes"),
      ],
    },
  },
  {
    id: "business-report",
    name: "AI Business Report Generator",
    category: "business",
    description: "Generate a practical growth report using business details and website context.",
    inputs: [
      textInput("businessName", "Business Name", "North Shore Dental"),
      urlInput("url", "Website URL", "https://example.com", { required: false }),
      textInput("industry", "Industry", "Healthcare, SaaS, ecommerce"),
      textareaInput("currentSituation", "Current Situation", "Traffic is flat, referrals are strong, retention is weak", {
        required: false,
      }),
      textareaInput("goals", "Goals", "Increase monthly bookings by 20%, raise AOV, improve lead quality", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Focus on the business's current situation, problems, opportunities, revenue ideas, and next steps.",
        "Be practical and commercially useful.",
        "Do not pretend to have audited details that were not provided.",
      ],
      outputFields: [
        textOutput("businessOverview", "Business Overview"),
        listOutput("currentProblems", "Current Problems", 5),
        listOutput("growthOpportunities", "Growth Opportunities", 5),
        listOutput("marketingSuggestions", "Marketing Suggestions", 5),
        listOutput("profitImprovementIdeas", "Profit Improvement Ideas", 5),
        listOutput("actionPlan", "Action Plan", 5),
      ],
    },
  },
];
