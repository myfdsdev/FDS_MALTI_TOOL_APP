import type { ResumeContent, ResumeFontFamily, SectionKey } from "@/types/resume";

export interface TemplateProps {
  content: ResumeContent;
  themeColor: string;
  fontFamily: ResumeFontFamily;
  isExportMode?: boolean;
}

export const SECTION_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "awards",
];
