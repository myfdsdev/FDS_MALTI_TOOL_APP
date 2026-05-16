import type { ResumeContent, ResumeFontFamily, SectionKey } from "@/types/resume";

export function formatDateRange(start: string, end: string | null, current: boolean): string {
  const s = (start || "").trim();
  const e = current ? "Present" : (end || "").trim();
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

export function joinNonEmpty(parts: (string | null | undefined)[], sep = " · "): string {
  return parts.filter((part) => part && part.trim()).join(sep);
}

export function isSectionHidden(content: ResumeContent, key: SectionKey): boolean {
  return (content.hiddenSections ?? []).includes(key);
}

export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const FONT_FAMILY_STYLE: Record<ResumeFontFamily, string> = {
  inter: "'Inter', system-ui, -apple-system, sans-serif",
  sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "'Source Serif Pro', 'Georgia', 'Times New Roman', serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
};

export function emptyContent(): ResumeContent {
  return {
    personal: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    hiddenSections: [],
  };
}

export function starterPlaceholderContent(): ResumeContent {
  return {
    personal: {
      fullName: "Your full name",
      jobTitle: "Senior Software Engineer",
      email: "you@example.com",
      phone: "+1 (555) 010-2030",
      location: "City, Country",
      website: "yourdomain.com",
      linkedin: "linkedin.com/in/yourname",
      github: "github.com/yourname",
      summary:
        "Two to four sentences about what you do, what you're great at, and what you're looking for next. Use AI Improve to rewrite this once you've added experience below.",
    },
    experience: [
      {
        id: "exp-1",
        company: "Acme Corp",
        role: "Senior Software Engineer",
        location: "Remote",
        startDate: "2022-01",
        endDate: null,
        current: true,
        bullets: [
          "Led the migration of a monolithic Node.js service to microservices, reducing p95 latency by 38%.",
          "Mentored 4 engineers; designed an interview rubric adopted org-wide.",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "Your University",
        degree: "B.Sc.",
        field: "Computer Science",
        location: "City",
        startDate: "2016-09",
        endDate: "2020-06",
        gpa: "",
        notes: "",
      },
    ],
    skills: [
      {
        id: "skill-1",
        category: "Languages",
        items: ["TypeScript", "Python", "Go"],
      },
      {
        id: "skill-2",
        category: "Frameworks",
        items: ["React", "Node.js", "Express"],
      },
    ],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    hiddenSections: [],
  };
}
