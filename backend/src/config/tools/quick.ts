import type { ToolDefinition } from "./types.js";
import {
  SOCIAL_PLATFORMS,
  listOutput,
  selectInput,
  textInput,
  textOutput,
  textareaInput,
  urlInput,
} from "./shared.js";

export const quickTools: ToolDefinition[] = [
  {
    id: "link-saver",
    name: "Link Preview & Saver",
    category: "quick",
    description: "Paste any URL to get a clean preview card with title, description, favicon, and image.",
    inputs: [
      urlInput("url", "URL", "https://example.com", {
        helpText: "Paste any public URL",
      }),
    ],
    prompt: {
      instructions: ["URL preview - handled by URL scraper, not AI"],
      outputFields: [
        textOutput("title", "Title"),
        textOutput("description", "Description"),
        textOutput("favicon", "Favicon URL"),
        textOutput("image", "Preview image URL"),
        textOutput("siteName", "Site name"),
        textOutput("url", "Final URL"),
      ],
    },
  },
  {
    id: "bio-generator",
    name: "AI Bio Generator",
    category: "quick",
    description: "Generate platform-specific bios for social and personal websites.",
    inputs: [
      textInput("nameOrBrand", "Name or Brand", "Ava Patel, Studio North, GrowthForge"),
      textInput("about", "What You Do", "Freelance designer helping SaaS teams launch faster"),
      textInput("audience", "Audience", "Founders, clients, followers", { required: false }),
      textInput("tone", "Tone", "Crisp, playful, premium", { required: false }),
    ],
    prompt: {
      instructions: [
        "Write concise bios that fit the culture of each platform.",
        "Keep them specific, readable, and identity-driven.",
        "Avoid generic self-descriptions.",
      ],
      outputFields: [
        textOutput("instagramBio", "Instagram Bio"),
        textOutput("linkedInBio", "LinkedIn Bio"),
        textOutput("twitterBio", "Twitter/X Bio"),
        textOutput("websiteBio", "Website Bio"),
      ],
    },
  },
  {
    id: "username-generator",
    name: "AI Username Generator",
    category: "quick",
    description: "Generate niche-relevant usernames that are short, memorable, and brandable.",
    inputs: [
      textInput("niche", "Niche", "Fitness coaching, travel creator, AI agency"),
      textInput("style", "Style", "Professional, catchy, minimalist"),
      textInput("keywords", "Keywords", "alex, growth, studio", { required: false }),
    ],
    prompt: {
      instructions: [
        "Keep usernames simple, memorable, and realistic for social handles.",
        "Avoid cluttered punctuation and awkward spellings.",
        "Make the category buckets feel meaningfully different.",
      ],
      outputFields: [
        listOutput("professionalUsernames", "Professional Usernames", 6),
        listOutput("creativeUsernames", "Creative Usernames", 6),
        listOutput("shortUsernames", "Short Usernames", 6),
        listOutput("brandableUsernames", "Brandable Usernames", 6),
      ],
    },
  },
  {
    id: "review-reply",
    name: "AI Review Reply Generator",
    category: "quick",
    description: "Generate polished replies for positive, negative, and neutral reviews.",
    inputs: [
      textInput("businessName", "Business Name", "Harbor Dental, Bloom Salon"),
      textInput("industry", "Industry", "Restaurant, clinic, SaaS, salon"),
      textInput("tone", "Tone", "Warm, professional, premium", { required: false }),
    ],
    prompt: {
      instructions: [
        "Write one reply for a positive review, one for a negative review, and one for a neutral review.",
        "Keep the replies polite, brand-safe, and natural.",
        "For negative reviews, acknowledge the issue without becoming defensive.",
      ],
      outputFields: [
        textOutput("positiveReviewReply", "Positive Review Reply"),
        textOutput("negativeReviewReply", "Negative Review Reply"),
        textOutput("neutralReviewReply", "Neutral Review Reply"),
      ],
    },
  },
  {
    id: "faq-generator",
    name: "AI FAQ Generator",
    category: "quick",
    description: "Generate clear FAQ entries for a product, service, or website.",
    inputs: [
      textInput("productOrService", "Product or Service", "Membership community, dental implant package"),
      textInput("audience", "Audience", "New customers, applicants, premium buyers", { required: false }),
      textareaInput("commonConcerns", "Common Concerns", "Pricing, delivery times, trust, results", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Write FAQs with answers that are clear, helpful, and concise.",
        "Keep the questions realistic for the audience.",
        "Avoid vague answers that dodge the question.",
      ],
      outputFields: [
        textOutput("faq1", "FAQ 1"),
        textOutput("faq2", "FAQ 2"),
        textOutput("faq3", "FAQ 3"),
        textOutput("faq4", "FAQ 4"),
        textOutput("faq5", "FAQ 5"),
      ],
    },
  },
  {
    id: "resume-summary",
    name: "AI Resume Summary Generator",
    category: "quick",
    description: "Generate resume summary options aligned with role, experience, and skills.",
    inputs: [
      textInput("jobRole", "Job Role", "Product manager, frontend developer, account executive"),
      textInput("experience", "Experience", "5 years in SaaS, fresh graduate, ex-agency operator"),
      textareaInput("skills", "Skills", "React, SQL, stakeholder management, performance ads"),
      textInput("industry", "Industry", "Healthcare, fintech, ecommerce", { required: false }),
    ],
    prompt: {
      instructions: [
        "Keep the summaries professional and job-focused.",
        "Emphasize strengths in a credible way.",
        "Make the achievement-focused version stronger and more outcome-oriented.",
      ],
      outputFields: [
        textOutput("resumeSummary", "Resume Summary"),
        textOutput("skillsSummary", "Skills Summary"),
        textOutput("achievementFocusedSummary", "Achievement-Focused Summary"),
      ],
    },
  },
  {
    id: "cover-letter",
    name: "AI Cover Letter Generator",
    category: "quick",
    description: "Write concise cover letters tailored to the job, company, and candidate profile.",
    inputs: [
      textInput("jobRole", "Job Role", "Marketing Manager, UX Researcher, Software Engineer"),
      textInput("company", "Company", "Acme Labs, Stripe, Local Studio"),
      textInput("experience", "Experience", "4 years in B2B SaaS, former founder, internship background"),
      textareaInput("skills", "Skills", "Lifecycle marketing, SQL, product strategy"),
      textareaInput("jobDescription", "Job Description", "Paste the role description or the key requirements"),
    ],
    prompt: {
      instructions: [
        "Write a professional, specific, and concise cover letter.",
        "Use the role, company, skills, and experience provided.",
        "Keep the tone credible and tailored rather than generic.",
      ],
      outputFields: [
        textOutput("subject", "Subject"),
        textOutput("coverLetter", "Cover Letter"),
      ],
    },
  },
  {
    id: "blog-title",
    name: "AI Blog Title Generator",
    category: "quick",
    description: "Generate SEO-aware blog titles across different headline styles.",
    inputs: [
      textInput("topic", "Topic", "AI email marketing, home workouts, local SEO"),
      textInput("audience", "Audience", "Beginners, founders, restaurant owners"),
      textInput("keyword", "Keyword", "best local SEO tips", { required: false }),
    ],
    prompt: {
      instructions: [
        "Generate clickable but honest titles.",
        "Balance search intent with curiosity.",
        "Keep the titles useful for real blog content, not clickbait only.",
      ],
      outputFields: [
        listOutput("howToTitles", "How-To Titles", 5),
        listOutput("listicleTitles", "Listicle Titles", 5),
        listOutput("questionTitles", "Question Titles", 5),
        listOutput("seoTitles", "SEO Titles", 5),
      ],
    },
  },
  {
    id: "content-calendar",
    name: "AI Content Calendar Generator",
    category: "quick",
    description: "Plan a content calendar with topics, formats, caption angles, and CTAs.",
    inputs: [
      textInput("niche", "Niche", "Nutrition coach, SaaS founder, real estate agent"),
      selectInput("platform", "Platform", SOCIAL_PLATFORMS),
      textInput("audience", "Audience", "Beginners, premium buyers, local families", {
        required: false,
      }),
      textInput("goal", "Goal", "Lead generation, brand awareness, engagement", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Create a practical 14-day content calendar unless the user explicitly asks for another length.",
        "For each day, include topic, format, platform angle, caption idea, and CTA.",
        "Keep the plan varied and relevant to the selected platform.",
      ],
      outputFields: [listOutput("calendarEntries", "Content Calendar", 14)],
    },
  },
];
