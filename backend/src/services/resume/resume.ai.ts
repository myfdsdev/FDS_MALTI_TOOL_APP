import { randomUUID } from "node:crypto";
import { logger } from "../../config/logger.js";
import type {
  ATSIssue,
  ResumeContent,
  ResumeDocument,
} from "../../models/Resume.model.js";
import type { UserDocument } from "../../models/User.model.js";
import { resolveAIConfigForUser } from "../ai/config.js";
import { generateWithProvider } from "../ai/providers.js";
import {
  atsCheck,
  generateBullets,
  improveField,
  starterFill,
  suggestSkills,
} from "./resume.prompts.js";

export type ResumeAIMode = "live" | "mock";

interface ResumeAIResult<T> {
  output: T;
  mode: ResumeAIMode;
}

function parseJsonObject(raw: string): Record<string, unknown> {
  let text = raw.trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) text = fenced[1].trim();

  // Sometimes models add stray text around the JSON; try to extract the first { ... } object.
  if (!text.startsWith("{")) {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      text = text.slice(first, last + 1);
    }
  }

  return JSON.parse(text);
}

async function callLive<T>(
  account: UserDocument | undefined,
  system: string,
  user: string,
  fallback: T
): Promise<ResumeAIResult<T>> {
  const config = resolveAIConfigForUser(account);
  if (!config) {
    return { output: fallback, mode: "mock" };
  }
  try {
    const response = await generateWithProvider(config, system, user);
    const parsed = parseJsonObject(response.text);
    return { output: parsed as T, mode: "live" };
  } catch (err) {
    logger.error({ err }, "Resume AI generation failed; falling back to mock");
    return { output: fallback, mode: "mock" };
  }
}

const FILLER_ID = () => randomUUID();

function ensureIdsOnContent(input: Partial<ResumeContent>): ResumeContent {
  return {
    personal: {
      fullName: input.personal?.fullName ?? "",
      jobTitle: input.personal?.jobTitle ?? "",
      email: input.personal?.email ?? "",
      phone: input.personal?.phone ?? "",
      location: input.personal?.location ?? "",
      website: input.personal?.website ?? "",
      linkedin: input.personal?.linkedin ?? "",
      github: input.personal?.github ?? "",
      summary: input.personal?.summary ?? "",
    },
    experience: (input.experience ?? []).map((entry) => ({
      id: FILLER_ID(),
      company: entry.company ?? "",
      role: entry.role ?? "",
      location: entry.location ?? "",
      startDate: entry.startDate ?? "",
      endDate: entry.endDate ?? null,
      current: Boolean(entry.current),
      bullets: Array.isArray(entry.bullets) ? entry.bullets.filter(Boolean) : [],
    })),
    education: (input.education ?? []).map((entry) => ({
      id: FILLER_ID(),
      institution: entry.institution ?? "",
      degree: entry.degree ?? "",
      field: entry.field ?? "",
      location: entry.location ?? "",
      startDate: entry.startDate ?? "",
      endDate: entry.endDate ?? null,
      gpa: entry.gpa ?? "",
      notes: entry.notes ?? "",
    })),
    skills: (input.skills ?? []).map((entry) => ({
      id: FILLER_ID(),
      category: entry.category ?? "",
      items: Array.isArray(entry.items) ? entry.items.filter(Boolean) : [],
    })),
    projects: (input.projects ?? []).map((entry) => ({
      id: FILLER_ID(),
      name: entry.name ?? "",
      link: entry.link ?? "",
      description: entry.description ?? "",
      bullets: Array.isArray(entry.bullets) ? entry.bullets.filter(Boolean) : [],
      tech: Array.isArray(entry.tech) ? entry.tech.filter(Boolean) : [],
    })),
    certifications: (input.certifications ?? []).map((entry) => ({
      id: FILLER_ID(),
      name: entry.name ?? "",
      issuer: entry.issuer ?? "",
      date: entry.date ?? "",
      link: entry.link ?? "",
    })),
    languages: (input.languages ?? []).map((entry) => ({
      id: FILLER_ID(),
      name: entry.name ?? "",
      level: entry.level ?? "",
    })),
    awards: (input.awards ?? []).map((entry) => ({
      id: FILLER_ID(),
      name: entry.name ?? "",
      issuer: entry.issuer ?? "",
      date: entry.date ?? "",
      description: entry.description ?? "",
    })),
    hiddenSections: input.hiddenSections ?? [],
  };
}

export async function runStarterFill(bio: string, account?: UserDocument): Promise<ResumeContent> {
  const fallback: Partial<ResumeContent> = {
    personal: {
      fullName: "[Your full name]",
      jobTitle: "[Your target job title]",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: bio.slice(0, 280),
    },
    experience: [
      {
        id: FILLER_ID(),
        company: "[Add your company name]",
        role: "[Your role]",
        location: "",
        startDate: "",
        endDate: null,
        current: true,
        bullets: [
          "Led a cross-functional initiative that delivered measurable impact (replace with your achievement).",
          "Quantify a key win here — e.g. \"increased X by 20% by doing Y\".",
        ],
      },
    ],
    education: [
      {
        id: FILLER_ID(),
        institution: "[Your university]",
        degree: "[Degree]",
        field: "[Field of study]",
        location: "",
        startDate: "",
        endDate: null,
        gpa: "",
        notes: "",
      },
    ],
    skills: [
      { id: FILLER_ID(), category: "Core skills", items: ["Skill 1", "Skill 2", "Skill 3"] },
    ],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
  };

  const { output } = await callLive<Partial<ResumeContent>>(
    account,
    starterFill.system,
    starterFill.user({ bio }),
    fallback
  );

  return ensureIdsOnContent(output);
}

export async function runImproveField(args: {
  field: string;
  currentValue: string;
  context?: string;
  resume: ResumeContent;
}, account?: UserDocument): Promise<{ suggestion: string }> {
  const fallback = {
    suggestion:
      args.currentValue
        ? `Polished: ${args.currentValue}`
        : "Led a measurable initiative that delivered clear business impact (add a number when you can).",
  };

  const { output } = await callLive<{ suggestion?: string }>(
    account,
    improveField.system,
    improveField.user(args),
    fallback
  );

  return {
    suggestion: typeof output?.suggestion === "string" && output.suggestion.trim()
      ? output.suggestion.trim()
      : fallback.suggestion,
  };
}

export async function runGenerateBullets(args: {
  role: string;
  company: string;
  existingBullets: string[];
}, account?: UserDocument): Promise<{ bullets: string[] }> {
  const fallback = {
    bullets: [
      `Drove a major initiative as ${args.role} that improved a key metric.`,
      "Led cross-functional collaboration to ship a critical project on time and under budget.",
      "Mentored teammates and codified best practices that scaled across the org.",
      "Reduced operational overhead by automating repetitive workflows.",
    ],
  };

  const { output } = await callLive<{ bullets?: unknown[] }>(
    account,
    generateBullets.system,
    generateBullets.user(args),
    fallback
  );

  const list = Array.isArray(output?.bullets)
    ? output.bullets.filter((b): b is string => typeof b === "string" && b.trim().length > 0)
    : [];
  return { bullets: list.length ? list : fallback.bullets };
}

export async function runSuggestSkills(args: {
  jobTitle: string;
  currentSkills: string[];
}, account?: UserDocument): Promise<{ skills: { category: string; items: string[] }[] }> {
  const fallback = {
    skills: [
      { category: "Core", items: ["Communication", "Problem solving", "Ownership"] },
      { category: "Tools", items: ["Notion", "Figma", "Linear"] },
    ],
  };

  const { output } = await callLive<{ skills?: unknown }>(
    account,
    suggestSkills.system,
    suggestSkills.user(args),
    fallback
  );

  const arr = Array.isArray(output?.skills) ? output.skills : [];
  const normalized = arr
    .map((group) => {
      const obj = group as { category?: unknown; items?: unknown };
      const category = typeof obj.category === "string" ? obj.category : "";
      const items = Array.isArray(obj.items)
        ? obj.items.filter((i): i is string => typeof i === "string" && i.trim().length > 0)
        : [];
      return { category, items };
    })
    .filter((g) => g.category && g.items.length > 0);

  return { skills: normalized.length ? normalized : fallback.skills };
}

export async function runAtsCheck(resume: ResumeDocument, account?: UserDocument): Promise<{
  score: number;
  issues: ATSIssue[];
  suggestions: string[];
}> {
  const fallback = {
    score: 70,
    issues: [
      ...(resume.content.personal.email
        ? []
        : ([{ severity: "warning", message: "Missing email", field: "personal.email" }] as ATSIssue[])),
      ...(resume.content.experience.length === 0
        ? ([{ severity: "error", message: "No work experience listed", field: "experience" }] as ATSIssue[])
        : []),
    ],
    suggestions: [
      "Add measurable outcomes to each bullet (numbers, %, $).",
      "Lead each bullet with a strong action verb.",
    ],
  };

  const { output } = await callLive<{
    score?: number;
    issues?: unknown;
    suggestions?: unknown;
  }>(account, atsCheck.system, atsCheck.user({ resume: resume.content }), fallback);

  const rawScore = Number(output?.score);
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : fallback.score;

  const issues: ATSIssue[] = Array.isArray(output?.issues)
    ? output.issues
        .map((entry): ATSIssue | null => {
          const obj = entry as { severity?: unknown; message?: unknown; field?: unknown };
          const severity: ATSIssue["severity"] =
            obj.severity === "error" || obj.severity === "warning" || obj.severity === "info"
              ? obj.severity
              : "info";
          const message = typeof obj.message === "string" ? obj.message : "";
          const field = typeof obj.field === "string" ? obj.field : undefined;
          if (!message) return null;
          return field ? { severity, message, field } : { severity, message };
        })
        .filter((entry): entry is ATSIssue => entry !== null)
    : fallback.issues;

  const suggestions = Array.isArray(output?.suggestions)
    ? output.suggestions.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : fallback.suggestions;

  return { score, issues, suggestions };
}
