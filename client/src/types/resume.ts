export type ResumeTemplate =
  | "modern"
  | "classic"
  | "minimal"
  | "creative"
  | "compact"
  | "executive";

export type ResumeFontFamily = "inter" | "serif" | "mono" | "sans";

export interface ResumePersonal {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string | null;
  gpa: string;
  notes: string;
}

export interface ResumeSkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  link: string;
  description: string;
  bullets: string[];
  tech: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface ResumeLanguage {
  id: string;
  name: string;
  level: string;
}

export interface ResumeAward {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "awards";

export interface ResumeContent {
  personal: ResumePersonal;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkillGroup[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
  awards: ResumeAward[];
  hiddenSections: SectionKey[];
}

export interface ResumeShare {
  enabled: boolean;
  slug: string | null;
  viewCount: number;
  lastViewedAt?: string | null;
}

export interface ATSIssue {
  severity: "error" | "warning" | "info";
  message: string;
  field?: string;
}

export interface ResumeListItem {
  _id: string;
  title: string;
  template: ResumeTemplate;
  themeColor: string;
  fontFamily: ResumeFontFamily;
  atsScore: number | null;
  updatedAt: string;
  createdAt: string;
  lastEditedAt: string;
  share: { enabled: boolean; slug: string | null; viewCount: number };
}

export interface Resume {
  _id: string;
  user: string;
  title: string;
  template: ResumeTemplate;
  themeColor: string;
  fontFamily: ResumeFontFamily;
  content: ResumeContent;
  share: ResumeShare;
  atsScore: number | null;
  atsIssues: ATSIssue[];
  atsSuggestions: string[];
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicResume {
  title: string;
  template: ResumeTemplate;
  themeColor: string;
  fontFamily: ResumeFontFamily;
  content: ResumeContent;
  share: { viewCount: number };
}

export interface CreateResumeInput {
  title?: string;
  template?: ResumeTemplate;
  themeColor?: string;
  fontFamily?: ResumeFontFamily;
  content?: Partial<ResumeContent>;
}

export interface UpdateResumeInput {
  title?: string;
  template?: ResumeTemplate;
  themeColor?: string;
  fontFamily?: ResumeFontFamily;
  content?: Partial<ResumeContent>;
}

export interface ATSCheckResult {
  score: number;
  issues: ATSIssue[];
  suggestions: string[];
}

export interface ShareUpdateResult {
  enabled: boolean;
  slug: string | null;
  url: string | null;
  viewCount: number;
}

export const TEMPLATE_LABELS: Record<ResumeTemplate, string> = {
  modern: "Modern",
  classic: "Classic",
  minimal: "Minimal",
  creative: "Creative",
  compact: "Compact",
  executive: "Executive",
};

export const TEMPLATE_DESCRIPTIONS: Record<ResumeTemplate, string> = {
  modern: "2-column layout with a themed sidebar. Sans-serif, contemporary.",
  classic: "Single column, centered header, conservative serif. Traditional industries.",
  minimal: "Generous whitespace, uppercase headings. Tech-resume style.",
  creative: "Dark sidebar with accent color. Best for design/creative roles.",
  compact: "Tighter spacing, smaller font. Senior engineers with 10+ years.",
  executive: "Authoritative typography with strong dividers. Leadership roles.",
};

export const FONT_LABELS: Record<ResumeFontFamily, string> = {
  inter: "Inter (sans)",
  sans: "System sans",
  serif: "Serif",
  mono: "Mono",
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
};
