import { createElement, type ReactElement } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type {
  ResumeContent,
  ResumeDocument,
  ResumeFontFamily,
  ResumeTemplate,
} from "../../models/Resume.model.js";

// React-PDF can hang trying to fetch Helvetica on some systems. Disable hyphenation
// and lean on built-in fonts (Helvetica, Times-Roman, Courier).
Font.registerHyphenationCallback((word) => [word]);

const FONT_MAP: Record<ResumeFontFamily, string> = {
  inter: "Helvetica",
  sans: "Helvetica",
  serif: "Times-Roman",
  mono: "Courier",
};

const safe = (value: string | null | undefined): string => (value || "").trim();
const isSectionHidden = (content: ResumeContent, key: string) =>
  (content.hiddenSections ?? []).includes(key);

function fmtDateRange(start: string, end: string | null, current: boolean): string {
  const s = safe(start);
  const e = current ? "Present" : safe(end || "");
  if (!s && !e) return "";
  if (s && e) return `${s} – ${e}`;
  return s || e;
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Element factory helpers (avoid JSX in .ts files).
type S = Style | Style[];
const e = createElement;
const view = (style: S, ...children: unknown[]) =>
  e(View, { style }, ...(children as ReactElement[]));
const text = (style: S, value: string | null | undefined) =>
  e(Text, { style }, safe(value));

function buildContactLine(content: ResumeContent): string {
  const p = content.personal;
  return [safe(p.email), safe(p.phone), safe(p.location)].filter(Boolean).join("  •  ");
}

function buildLinksLine(content: ResumeContent): string {
  const p = content.personal;
  return [safe(p.website), safe(p.linkedin), safe(p.github)].filter(Boolean).join("  •  ");
}

// ─── Modern template (2-column with colored sidebar) ─────────────────────────
function ModernPdf(props: { content: ResumeContent; themeColor: string; fontFamily: string }): ReactElement {
  const { content, themeColor, fontFamily } = props;
  const styles = StyleSheet.create({
    page: { padding: 0, fontFamily, fontSize: 10, color: "#1f2937" },
    body: { flexDirection: "row", minHeight: "100%" },
    sidebar: {
      width: "34%",
      backgroundColor: hexToRgba(themeColor, 0.95),
      color: "white",
      padding: 24,
    },
    main: { width: "66%", padding: 24 },
    name: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: "white" },
    title: { fontSize: 12, marginBottom: 16, color: "white", opacity: 0.9 },
    sectionLight: { fontSize: 11, fontWeight: 700, marginTop: 16, marginBottom: 6, color: "white", letterSpacing: 1 },
    section: { fontSize: 11, fontWeight: 700, color: themeColor, marginTop: 14, marginBottom: 6, letterSpacing: 1 },
    rowSmall: { fontSize: 9, color: "white", marginBottom: 3, opacity: 0.9 },
    expRole: { fontSize: 11, fontWeight: 700, color: "#111827" },
    expCompany: { fontSize: 10, color: "#374151", marginBottom: 2 },
    expDate: { fontSize: 9, color: "#6b7280", marginBottom: 4, fontStyle: "italic" },
    bullet: { fontSize: 9.5, marginLeft: 10, marginBottom: 2 },
    body10: { fontSize: 10, marginBottom: 4 },
  });

  const sidebarChildren: ReactElement[] = [
    text(styles.name, content.personal.fullName || "Your Name"),
    text(styles.title, content.personal.jobTitle || "Your Title"),
  ];

  const contactList = [
    content.personal.email,
    content.personal.phone,
    content.personal.location,
    content.personal.website,
    content.personal.linkedin,
    content.personal.github,
  ].filter((v) => safe(v));
  if (contactList.length) {
    sidebarChildren.push(text(styles.sectionLight, "CONTACT"));
    contactList.forEach((v, i) => sidebarChildren.push(text({ ...styles.rowSmall, key: i } as Style, v)));
  }

  if (!isSectionHidden(content, "skills") && content.skills.length) {
    sidebarChildren.push(text(styles.sectionLight, "SKILLS"));
    for (const group of content.skills) {
      if (!safe(group.category) && group.items.length === 0) continue;
      sidebarChildren.push(text({ fontSize: 10, fontWeight: 700, color: "white", marginTop: 4 } as Style, group.category));
      sidebarChildren.push(text({ fontSize: 9, color: "white", opacity: 0.95, marginBottom: 4 } as Style, group.items.filter(Boolean).join(", ")));
    }
  }

  if (!isSectionHidden(content, "languages") && content.languages.length) {
    sidebarChildren.push(text(styles.sectionLight, "LANGUAGES"));
    for (const lang of content.languages) {
      const label = safe(lang.level) ? `${safe(lang.name)} — ${safe(lang.level)}` : safe(lang.name);
      sidebarChildren.push(text(styles.rowSmall, label));
    }
  }

  const mainChildren: ReactElement[] = [];

  if (!isSectionHidden(content, "summary") && safe(content.personal.summary)) {
    mainChildren.push(text(styles.section, "SUMMARY"));
    mainChildren.push(text(styles.body10, content.personal.summary));
  }

  if (!isSectionHidden(content, "experience") && content.experience.length) {
    mainChildren.push(text(styles.section, "EXPERIENCE"));
    for (const exp of content.experience) {
      mainChildren.push(text(styles.expRole, exp.role || "Role"));
      mainChildren.push(
        text(styles.expCompany, [safe(exp.company), safe(exp.location)].filter(Boolean).join(" — "))
      );
      mainChildren.push(text(styles.expDate, fmtDateRange(exp.startDate, exp.endDate, exp.current)));
      for (const b of exp.bullets.filter(Boolean)) {
        mainChildren.push(text(styles.bullet, `• ${b}`));
      }
      mainChildren.push(view({ height: 6 }));
    }
  }

  if (!isSectionHidden(content, "projects") && content.projects.length) {
    mainChildren.push(text(styles.section, "PROJECTS"));
    for (const p of content.projects) {
      mainChildren.push(text(styles.expRole, p.name || "Project"));
      if (safe(p.description)) mainChildren.push(text(styles.body10, p.description));
      for (const b of p.bullets.filter(Boolean)) {
        mainChildren.push(text(styles.bullet, `• ${b}`));
      }
      if (p.tech.length) {
        mainChildren.push(text({ fontSize: 9, color: "#6b7280", fontStyle: "italic", marginBottom: 4 } as Style, `Tech: ${p.tech.join(", ")}`));
      }
      mainChildren.push(view({ height: 4 }));
    }
  }

  if (!isSectionHidden(content, "education") && content.education.length) {
    mainChildren.push(text(styles.section, "EDUCATION"));
    for (const ed of content.education) {
      mainChildren.push(text(styles.expRole, ed.institution || "Institution"));
      const degLine = [safe(ed.degree), safe(ed.field)].filter(Boolean).join(", ");
      if (degLine) mainChildren.push(text(styles.expCompany, degLine));
      mainChildren.push(text(styles.expDate, fmtDateRange(ed.startDate, ed.endDate, false)));
      if (safe(ed.notes)) mainChildren.push(text(styles.body10, ed.notes));
      mainChildren.push(view({ height: 4 }));
    }
  }

  if (!isSectionHidden(content, "certifications") && content.certifications.length) {
    mainChildren.push(text(styles.section, "CERTIFICATIONS"));
    for (const c of content.certifications) {
      const line = [safe(c.name), safe(c.issuer), safe(c.date)].filter(Boolean).join("  •  ");
      mainChildren.push(text(styles.body10, line));
    }
  }

  if (!isSectionHidden(content, "awards") && content.awards.length) {
    mainChildren.push(text(styles.section, "AWARDS"));
    for (const a of content.awards) {
      mainChildren.push(text({ fontSize: 11, fontWeight: 700 } as Style, a.name));
      const line = [safe(a.issuer), safe(a.date)].filter(Boolean).join("  •  ");
      if (line) mainChildren.push(text({ fontSize: 9, color: "#6b7280" } as Style, line));
      if (safe(a.description)) mainChildren.push(text(styles.body10, a.description));
    }
  }

  return e(
    Page,
    { size: "A4", style: styles.page },
    e(View, { style: styles.body }, e(View, { style: styles.sidebar }, ...sidebarChildren), e(View, { style: styles.main }, ...mainChildren))
  );
}

// ─── Single-column generic template (used as base for Classic/Minimal/Compact/Executive) ─────
interface SingleColumnOptions {
  variant: "classic" | "minimal" | "compact" | "executive";
}

function SingleColumnPdf(props: {
  content: ResumeContent;
  themeColor: string;
  fontFamily: string;
  variant: SingleColumnOptions["variant"];
}): ReactElement {
  const { content, themeColor, fontFamily, variant } = props;
  const isCompact = variant === "compact";
  const isExecutive = variant === "executive";
  const isMinimal = variant === "minimal";

  const baseFont = isCompact ? 9 : 10;
  const lineGap = isCompact ? 1.3 : 1.45;

  const styles = StyleSheet.create({
    page: {
      padding: isExecutive ? 36 : isCompact ? 28 : 36,
      fontFamily,
      fontSize: baseFont,
      color: "#1f2937",
      lineHeight: lineGap,
    },
    header: {
      textAlign: variant === "classic" ? "center" : "left",
      borderBottom: isExecutive ? `2pt solid ${themeColor}` : isMinimal ? "none" : `1pt solid ${themeColor}`,
      paddingBottom: 10,
      marginBottom: 12,
    },
    name: {
      fontSize: isExecutive ? 28 : isCompact ? 18 : 22,
      fontWeight: 700,
      color: isMinimal ? themeColor : "#0f172a",
    },
    title: {
      fontSize: isCompact ? 11 : 13,
      color: "#4b5563",
      marginTop: 2,
      marginBottom: 6,
    },
    contact: { fontSize: 9.5, color: "#4b5563" },
    section: {
      fontSize: isCompact ? 11 : 12,
      fontWeight: 700,
      color: isMinimal ? "#0f172a" : themeColor,
      marginTop: 12,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: isMinimal ? 1.2 : 0.5,
      borderBottom: isExecutive ? `1pt solid ${hexToRgba(themeColor, 0.6)}` : isMinimal ? `1pt solid #e5e7eb` : "none",
      paddingBottom: isExecutive || isMinimal ? 2 : 0,
    },
    role: { fontSize: baseFont + 1, fontWeight: 700, color: "#111827" },
    company: { fontSize: baseFont, color: "#374151" },
    dates: { fontSize: 9, color: "#6b7280", fontStyle: "italic", marginBottom: 3 },
    bullet: { fontSize: baseFont, marginLeft: 10, marginBottom: 1.5 },
    body: { fontSize: baseFont, marginBottom: 4 },
    inlineRow: { flexDirection: "row", justifyContent: "space-between" },
  });

  const children: ReactElement[] = [];

  const headerChildren: ReactElement[] = [
    text(styles.name, content.personal.fullName || "Your Name"),
    ...(safe(content.personal.jobTitle) ? [text(styles.title, content.personal.jobTitle)] : []),
  ];
  const contactLine = buildContactLine(content);
  const linksLine = buildLinksLine(content);
  if (contactLine) headerChildren.push(text(styles.contact, contactLine));
  if (linksLine) headerChildren.push(text(styles.contact, linksLine));
  children.push(view(styles.header, ...headerChildren));

  if (!isSectionHidden(content, "summary") && safe(content.personal.summary)) {
    children.push(text(styles.section, "Summary"));
    children.push(text(styles.body, content.personal.summary));
  }

  if (!isSectionHidden(content, "experience") && content.experience.length) {
    children.push(text(styles.section, "Experience"));
    for (const exp of content.experience) {
      const dateLine = fmtDateRange(exp.startDate, exp.endDate, exp.current);
      if (isCompact) {
        children.push(
          view(
            styles.inlineRow,
            text(styles.role, `${exp.role || "Role"}${exp.company ? ` · ${exp.company}` : ""}`),
            text(styles.dates, [dateLine, safe(exp.location)].filter(Boolean).join("  •  "))
          )
        );
      } else {
        children.push(text(styles.role, exp.role || "Role"));
        children.push(text(styles.company, [safe(exp.company), safe(exp.location)].filter(Boolean).join(" — ")));
        children.push(text(styles.dates, dateLine));
      }
      for (const b of exp.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `• ${b}`));
      }
      children.push(view({ height: 4 }));
    }
  }

  if (!isSectionHidden(content, "projects") && content.projects.length) {
    children.push(text(styles.section, "Projects"));
    for (const p of content.projects) {
      children.push(text(styles.role, p.name || "Project"));
      if (safe(p.description)) children.push(text(styles.body, p.description));
      for (const b of p.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `• ${b}`));
      }
      if (p.tech.length) {
        children.push(text({ fontSize: 9, color: "#6b7280", fontStyle: "italic", marginBottom: 4 } as Style, `Tech: ${p.tech.join(", ")}`));
      }
      children.push(view({ height: 3 }));
    }
  }

  if (!isSectionHidden(content, "education") && content.education.length) {
    children.push(text(styles.section, "Education"));
    for (const ed of content.education) {
      children.push(text(styles.role, ed.institution || "Institution"));
      const degLine = [safe(ed.degree), safe(ed.field)].filter(Boolean).join(", ");
      if (degLine) children.push(text(styles.company, degLine));
      children.push(text(styles.dates, fmtDateRange(ed.startDate, ed.endDate, false)));
      if (safe(ed.notes)) children.push(text(styles.body, ed.notes));
      children.push(view({ height: 3 }));
    }
  }

  if (!isSectionHidden(content, "skills") && content.skills.length) {
    children.push(text(styles.section, "Skills"));
    for (const g of content.skills) {
      const line = `${g.category}${g.category ? ": " : ""}${g.items.filter(Boolean).join(", ")}`;
      children.push(text(styles.body, line));
    }
  }

  if (!isSectionHidden(content, "certifications") && content.certifications.length) {
    children.push(text(styles.section, "Certifications"));
    for (const c of content.certifications) {
      const line = [safe(c.name), safe(c.issuer), safe(c.date)].filter(Boolean).join("  •  ");
      children.push(text(styles.body, line));
    }
  }

  if (!isSectionHidden(content, "languages") && content.languages.length) {
    children.push(text(styles.section, "Languages"));
    const line = content.languages
      .filter((l) => safe(l.name))
      .map((l) => (safe(l.level) ? `${safe(l.name)} (${safe(l.level)})` : safe(l.name)))
      .join(", ");
    children.push(text(styles.body, line));
  }

  if (!isSectionHidden(content, "awards") && content.awards.length) {
    children.push(text(styles.section, "Awards"));
    for (const a of content.awards) {
      children.push(text(styles.role, a.name));
      const meta = [safe(a.issuer), safe(a.date)].filter(Boolean).join("  •  ");
      if (meta) children.push(text(styles.dates, meta));
      if (safe(a.description)) children.push(text(styles.body, a.description));
      children.push(view({ height: 3 }));
    }
  }

  return e(Page, { size: "A4", style: styles.page }, ...children);
}

// ─── Creative (dark sidebar) ─────────────────────────────────────────────────
function CreativePdf(props: { content: ResumeContent; themeColor: string; fontFamily: string }): ReactElement {
  const { content, themeColor, fontFamily } = props;
  const styles = StyleSheet.create({
    page: { padding: 0, fontFamily, fontSize: 10, color: "#1f2937" },
    body: { flexDirection: "row", minHeight: "100%" },
    sidebar: { width: "32%", backgroundColor: "#0f172a", color: "white", padding: 22 },
    main: { width: "68%", padding: 22 },
    name: { fontSize: 24, fontWeight: 700, color: "white", marginBottom: 4 },
    title: { fontSize: 12, color: themeColor, marginBottom: 12, fontWeight: 700 },
    sectionLight: { fontSize: 11, fontWeight: 700, color: themeColor, marginTop: 14, marginBottom: 6, letterSpacing: 1 },
    section: { fontSize: 12, fontWeight: 700, color: themeColor, marginTop: 14, marginBottom: 6, letterSpacing: 0.6 },
    rowSmall: { fontSize: 9, color: "white", marginBottom: 3, opacity: 0.92 },
    expRole: { fontSize: 12, fontWeight: 700, color: "#0f172a" },
    expCompany: { fontSize: 10, color: "#374151", marginBottom: 2 },
    expDate: { fontSize: 9, color: "#6b7280", marginBottom: 4, fontStyle: "italic" },
    bullet: { fontSize: 10, marginLeft: 10, marginBottom: 2 },
    body10: { fontSize: 10, marginBottom: 4 },
  });

  const sidebar: ReactElement[] = [
    text(styles.name, content.personal.fullName || "Your Name"),
    text(styles.title, content.personal.jobTitle || "Your Title"),
  ];
  const contactList = [
    content.personal.email,
    content.personal.phone,
    content.personal.location,
    content.personal.website,
    content.personal.linkedin,
    content.personal.github,
  ].filter((v) => safe(v));
  if (contactList.length) {
    sidebar.push(text(styles.sectionLight, "CONTACT"));
    contactList.forEach((v) => sidebar.push(text(styles.rowSmall, v)));
  }
  if (!isSectionHidden(content, "skills") && content.skills.length) {
    sidebar.push(text(styles.sectionLight, "SKILLS"));
    for (const g of content.skills) {
      sidebar.push(text({ fontSize: 10, fontWeight: 700, color: "white", marginTop: 4 } as Style, g.category));
      sidebar.push(text({ fontSize: 9, color: "white", opacity: 0.92, marginBottom: 4 } as Style, g.items.join(", ")));
    }
  }
  if (!isSectionHidden(content, "languages") && content.languages.length) {
    sidebar.push(text(styles.sectionLight, "LANGUAGES"));
    for (const lang of content.languages) {
      const label = safe(lang.level) ? `${safe(lang.name)} — ${safe(lang.level)}` : safe(lang.name);
      sidebar.push(text(styles.rowSmall, label));
    }
  }

  const main: ReactElement[] = [];
  if (!isSectionHidden(content, "summary") && safe(content.personal.summary)) {
    main.push(text(styles.section, "ABOUT"));
    main.push(text(styles.body10, content.personal.summary));
  }
  if (!isSectionHidden(content, "experience") && content.experience.length) {
    main.push(text(styles.section, "EXPERIENCE"));
    for (const exp of content.experience) {
      main.push(text(styles.expRole, exp.role || "Role"));
      main.push(text(styles.expCompany, [safe(exp.company), safe(exp.location)].filter(Boolean).join(" — ")));
      main.push(text(styles.expDate, fmtDateRange(exp.startDate, exp.endDate, exp.current)));
      for (const b of exp.bullets.filter(Boolean)) main.push(text(styles.bullet, `• ${b}`));
      main.push(view({ height: 6 }));
    }
  }
  if (!isSectionHidden(content, "projects") && content.projects.length) {
    main.push(text(styles.section, "PROJECTS"));
    for (const p of content.projects) {
      main.push(text(styles.expRole, p.name));
      if (safe(p.description)) main.push(text(styles.body10, p.description));
      for (const b of p.bullets.filter(Boolean)) main.push(text(styles.bullet, `• ${b}`));
      main.push(view({ height: 4 }));
    }
  }
  if (!isSectionHidden(content, "education") && content.education.length) {
    main.push(text(styles.section, "EDUCATION"));
    for (const ed of content.education) {
      main.push(text(styles.expRole, ed.institution));
      main.push(text(styles.expCompany, [safe(ed.degree), safe(ed.field)].filter(Boolean).join(", ")));
      main.push(text(styles.expDate, fmtDateRange(ed.startDate, ed.endDate, false)));
    }
  }
  if (!isSectionHidden(content, "awards") && content.awards.length) {
    main.push(text(styles.section, "AWARDS"));
    for (const a of content.awards) {
      main.push(text({ fontSize: 11, fontWeight: 700 } as Style, a.name));
      const meta = [safe(a.issuer), safe(a.date)].filter(Boolean).join("  •  ");
      if (meta) main.push(text({ fontSize: 9, color: "#6b7280" } as Style, meta));
    }
  }

  return e(
    Page,
    { size: "A4", style: styles.page },
    e(View, { style: styles.body }, e(View, { style: styles.sidebar }, ...sidebar), e(View, { style: styles.main }, ...main))
  );
}

function pageFor(template: ResumeTemplate, content: ResumeContent, themeColor: string, fontFamily: string): ReactElement {
  switch (template) {
    case "modern":
      return ModernPdf({ content, themeColor, fontFamily });
    case "creative":
      return CreativePdf({ content, themeColor, fontFamily });
    case "classic":
      return SingleColumnPdf({ content, themeColor, fontFamily, variant: "classic" });
    case "minimal":
      return SingleColumnPdf({ content, themeColor, fontFamily, variant: "minimal" });
    case "compact":
      return SingleColumnPdf({ content, themeColor, fontFamily, variant: "compact" });
    case "executive":
      return SingleColumnPdf({ content, themeColor, fontFamily, variant: "executive" });
    default:
      return SingleColumnPdf({ content, themeColor, fontFamily, variant: "classic" });
  }
}

export async function renderResumePdf(resume: ResumeDocument): Promise<Buffer> {
  const fontFamily = FONT_MAP[resume.fontFamily] || "Helvetica";
  const doc = e(
    Document,
    { title: resume.title, author: resume.content.personal.fullName || "Resume" },
    pageFor(resume.template, resume.content, resume.themeColor, fontFamily)
  );
  return renderToBuffer(doc);
}
