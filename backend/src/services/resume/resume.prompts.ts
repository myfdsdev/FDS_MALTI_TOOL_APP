import type { ResumeContent } from "../../models/Resume.model.js";

const SYSTEM_BASE = [
  "You are an expert resume writing assistant.",
  "Return ONLY valid JSON. Never wrap output in markdown code fences.",
  "Never invent specific company names that look real — use placeholders like \"[Add your company name]\".",
  "Use STAR-style achievements (Situation, Task, Action, Result).",
  "Lead bullets with strong action verbs (Led, Built, Designed, Increased, Reduced, Shipped).",
  "Quantify outcomes whenever you can (%, $, users, latency, time saved).",
  "Keep each bullet under two lines (~24 words).",
].join("\n");

export interface StarterFillPromptArgs {
  bio: string;
}

export const starterFill = {
  system: [
    SYSTEM_BASE,
    "",
    "You are drafting a starter resume from a short user bio.",
    "Return JSON matching this exact TypeScript type:",
    '{ "personal": { "fullName": string, "jobTitle": string, "email": string, "phone": string, "location": string, "website": string, "linkedin": string, "github": string, "summary": string },',
    '  "experience": [{ "company": string, "role": string, "location": string, "startDate": "YYYY-MM", "endDate": "YYYY-MM" | null, "current": boolean, "bullets": string[] }],',
    '  "education": [{ "institution": string, "degree": string, "field": string, "location": string, "startDate": "YYYY-MM", "endDate": "YYYY-MM" | null, "gpa": string, "notes": string }],',
    '  "skills": [{ "category": string, "items": string[] }],',
    '  "projects": [{ "name": string, "link": string, "description": string, "bullets": string[], "tech": string[] }],',
    '  "certifications": [{ "name": string, "issuer": string, "date": "YYYY-MM", "link": string }],',
    '  "languages": [{ "name": string, "level": string }],',
    '  "awards": [{ "name": string, "issuer": string, "date": "YYYY-MM", "description": string }] }',
    "",
    "Rules:",
    "- Use the bio to extract real names, real job titles, real years of experience.",
    "- Where the user did not mention a specific company name, school name, or date, use a clearly-bracketed placeholder like \"[Your company]\", \"[Your university]\", \"[YYYY-MM]\".",
    "- Generate 2–3 experience entries, 1 education entry, 3–5 skill categories, and (optionally) 1–2 sample projects relevant to the role.",
    "- The summary is 2–4 sentences in first-person voice.",
    "- Leave email, phone, linkedin, github, website as empty strings unless the user provided them.",
  ].join("\n"),
  user: ({ bio }: StarterFillPromptArgs) =>
    [
      "User bio:",
      bio,
      "",
      "Draft a complete starter resume in the JSON shape above.",
    ].join("\n"),
};

export interface ImproveFieldPromptArgs {
  field: string;
  currentValue: string;
  context?: string;
  resume: ResumeContent;
}

export const improveField = {
  system: [
    SYSTEM_BASE,
    "",
    "You are improving a single text field on a resume.",
    'Return JSON of the form: { "suggestion": string }',
    "Rules:",
    "- Keep the same language/locale as the original.",
    "- Don't invent new employers, schools, or dates not present in the resume.",
    "- For bullet fields: produce a single improved bullet (no list).",
    "- For the summary field: produce a 2–4 sentence rewrite.",
    "- Keep it concise. No preamble, no labels, no quotes around the result.",
  ].join("\n"),
  user: ({ field, currentValue, context, resume }: ImproveFieldPromptArgs) =>
    [
      `Field to improve: ${field}`,
      `Current text: ${currentValue || "(empty)"}`,
      context ? `Additional context: ${context}` : "",
      "",
      "Resume snapshot (for context only — do not echo it back):",
      JSON.stringify(
        {
          headline: resume.personal?.jobTitle ?? "",
          summary: resume.personal?.summary ?? "",
        },
        null,
        2
      ),
    ]
      .filter(Boolean)
      .join("\n"),
};

export interface GenerateBulletsPromptArgs {
  role: string;
  company: string;
  existingBullets: string[];
}

export const generateBullets = {
  system: [
    SYSTEM_BASE,
    "",
    "You generate 3 to 5 brand-new resume bullets for a given role.",
    'Return JSON of the form: { "bullets": string[] }',
    "- Do not duplicate or paraphrase the existing bullets the user already has.",
    "- Each bullet uses a strong action verb and quantifies impact when plausible.",
  ].join("\n"),
  user: ({ role, company, existingBullets }: GenerateBulletsPromptArgs) =>
    [
      `Role: ${role}`,
      company ? `Company: ${company}` : "Company: (not specified)",
      "",
      "Existing bullets (do not repeat):",
      existingBullets.length
        ? existingBullets.map((b) => `- ${b}`).join("\n")
        : "(none yet)",
      "",
      "Generate 3–5 new bullets that are distinct, achievement-oriented, and resume-ready.",
    ].join("\n"),
};

export interface SuggestSkillsPromptArgs {
  jobTitle: string;
  currentSkills: string[];
}

export const suggestSkills = {
  system: [
    SYSTEM_BASE,
    "",
    "You suggest professional skill categories for a job title.",
    'Return JSON of the form: { "skills": [{ "category": string, "items": string[] }] }',
    "- 3 to 5 categories.",
    "- 4 to 8 items per category.",
    "- Don't duplicate skills the user already has.",
    "- Categories must be specific (e.g. \"Backend\", \"Cloud & Infra\", \"Leadership\"), not generic (\"Technical\").",
  ].join("\n"),
  user: ({ jobTitle, currentSkills }: SuggestSkillsPromptArgs) =>
    [
      `Target job title: ${jobTitle}`,
      "",
      "Skills the user already has:",
      currentSkills.length ? currentSkills.map((s) => `- ${s}`).join("\n") : "(none)",
    ].join("\n"),
};

export interface AtsCheckPromptArgs {
  resume: ResumeContent;
}

export const atsCheck = {
  system: [
    SYSTEM_BASE,
    "",
    "You audit resumes for ATS (Applicant Tracking System) compatibility and quality.",
    'Return JSON of the form: { "score": number (0-100), "issues": [{ "severity": "error"|"warning"|"info", "message": string, "field"?: string }], "suggestions": string[] }',
    "",
    "Check for:",
    "- Missing standard sections (summary, experience, education, skills).",
    "- Weak verbs (Worked on, Helped with, Responsible for).",
    "- Lack of metrics (no numbers, %, $, time).",
    "- Contact info gaps (email, phone, location).",
    "- Date inconsistencies (end before start, gaps not explained).",
    "- Formatting/length issues (overly long bullets, all-caps blocks, emoji).",
    "",
    "Score rubric:",
    "- 90–100: ready to send",
    "- 75–89: solid, minor polish",
    "- 50–74: needs work",
    "- <50: many gaps; rewrite recommended",
    "",
    "Keep messages short and constructive. 5–10 issues, 3–6 suggestions.",
  ].join("\n"),
  user: ({ resume }: AtsCheckPromptArgs) =>
    [
      "Resume to audit (JSON):",
      JSON.stringify(resume, null, 2),
    ].join("\n"),
};
