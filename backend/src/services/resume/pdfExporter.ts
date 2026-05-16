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

function buildContactLine(content: ResumeContent): string {
  const p = content.personal;
  return [safe(p.email), safe(p.phone), safe(p.location)].filter(Boolean).join("  •  ");
}

function buildLinksLine(content: ResumeContent): string {
  const p = content.personal;
  return [safe(p.website), safe(p.linkedin), safe(p.github)].filter(Boolean).join("  •  ");
}

// Element factory helpers (avoid JSX in .ts files).
type S = Style | Style[];
const e = createElement;
const view = (style: S, ...children: unknown[]) =>
  e(View, { style }, ...(children as ReactElement[]));
const text = (style: S, value: string | null | undefined) =>
  e(Text, { style }, safe(value));

// ════════════════════════════════════════════════════════════════════════════
// MODERN — 2-column with themed colored sidebar, sans-serif
// ════════════════════════════════════════════════════════════════════════════
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
    contactList.forEach((v) => sidebarChildren.push(text(styles.rowSmall, v)));
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

// ════════════════════════════════════════════════════════════════════════════
// CLASSIC — Centered header, serif, thin themed underline, conservative
// ════════════════════════════════════════════════════════════════════════════
function ClassicPdf(props: { content: ResumeContent; themeColor: string; fontFamily: string }): ReactElement {
  const { content, themeColor } = props;
  // Classic forces serif regardless of fontFamily selection (the look is the point).
  const serif = "Times-Roman";
  const styles = StyleSheet.create({
    page: { padding: 50, fontFamily: serif, fontSize: 11, color: "#1c1917", lineHeight: 1.5 },
    header: { textAlign: "center", borderBottom: `1.5pt solid ${themeColor}`, paddingBottom: 10, marginBottom: 16 },
    name: { fontSize: 26, fontWeight: 700, letterSpacing: 1 },
    title: { fontSize: 12, fontStyle: "italic", color: "#44403c", marginTop: 4 },
    contact: { fontSize: 9.5, color: "#57534e", marginTop: 6 },
    section: { fontSize: 12, fontWeight: 700, color: themeColor, marginTop: 14, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: `0.5pt solid ${themeColor}`, paddingBottom: 2 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 1 },
    role: { fontSize: 11.5, fontWeight: 700 },
    dates: { fontSize: 10, fontStyle: "italic", color: "#57534e" },
    company: { fontSize: 10.5, fontStyle: "italic", color: "#44403c", marginBottom: 4 },
    bullet: { fontSize: 11, marginLeft: 12, marginBottom: 2 },
    body: { fontSize: 11, marginBottom: 4 },
  });

  const children: ReactElement[] = [];

  // Centered header with thin themed underline
  const headerKids: ReactElement[] = [text(styles.name, content.personal.fullName || "Your Name")];
  if (safe(content.personal.jobTitle)) headerKids.push(text(styles.title, content.personal.jobTitle));
  const contact = buildContactLine(content);
  const links = buildLinksLine(content);
  if (contact) headerKids.push(text(styles.contact, contact));
  if (links) headerKids.push(text(styles.contact, links));
  children.push(view(styles.header, ...headerKids));

  if (!isSectionHidden(content, "summary") && safe(content.personal.summary)) {
    children.push(text(styles.section, "Summary"));
    children.push(text(styles.body, content.personal.summary));
  }

  if (!isSectionHidden(content, "experience") && content.experience.length) {
    children.push(text(styles.section, "Experience"));
    for (const exp of content.experience) {
      children.push(
        view(
          styles.expRow,
          text(styles.role, `${exp.role || "Role"}${exp.company ? `, ${exp.company}` : ""}`),
          text(styles.dates, fmtDateRange(exp.startDate, exp.endDate, exp.current))
        )
      );
      if (safe(exp.location)) children.push(text(styles.company, exp.location));
      for (const b of exp.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `• ${b}`));
      }
      children.push(view({ height: 4 }));
    }
  }

  if (!isSectionHidden(content, "education") && content.education.length) {
    children.push(text(styles.section, "Education"));
    for (const ed of content.education) {
      children.push(
        view(
          styles.expRow,
          text(styles.role, ed.institution || "Institution"),
          text(styles.dates, fmtDateRange(ed.startDate, ed.endDate, false))
        )
      );
      const deg = [safe(ed.degree), safe(ed.field)].filter(Boolean).join(", ");
      if (deg) children.push(text(styles.body, deg));
      if (safe(ed.notes)) children.push(text({ fontSize: 10, color: "#57534e" } as Style, ed.notes));
    }
  }

  if (!isSectionHidden(content, "skills") && content.skills.length) {
    children.push(text(styles.section, "Skills"));
    for (const g of content.skills) {
      children.push(
        e(
          Text,
          { style: { fontSize: 11, marginBottom: 2 } as Style },
          e(Text, { style: { fontWeight: 700 } as Style }, `${g.category}: `),
          g.items.filter(Boolean).join(", ")
        )
      );
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
    }
  }

  if (!isSectionHidden(content, "certifications") && content.certifications.length) {
    children.push(text(styles.section, "Certifications"));
    for (const c of content.certifications) {
      const line = [safe(c.name), safe(c.issuer), safe(c.date)].filter(Boolean).join("  ·  ");
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
      const meta = [safe(a.issuer), safe(a.date)].filter(Boolean).join("  ·  ");
      if (meta) children.push(text({ fontSize: 10, fontStyle: "italic", color: "#57534e" } as Style, meta));
      if (safe(a.description)) children.push(text(styles.body, a.description));
    }
  }

  return e(Page, { size: "A4", style: styles.page }, ...children);
}

// ════════════════════════════════════════════════════════════════════════════
// MINIMAL — Huge whitespace, theme color only for the name, tiny uppercase
// section labels, gray text. Tech-resume style.
// ════════════════════════════════════════════════════════════════════════════
function MinimalPdf(props: { content: ResumeContent; themeColor: string; fontFamily: string }): ReactElement {
  const { content, themeColor, fontFamily } = props;
  const styles = StyleSheet.create({
    page: { padding: 60, fontFamily, fontSize: 10.5, color: "#1f2937", lineHeight: 1.55 },
    name: { fontSize: 30, fontWeight: 700, color: themeColor, letterSpacing: -0.5 },
    title: { fontSize: 11, color: "#6b7280", marginTop: 4 },
    contact: { fontSize: 9, color: "#9ca3af", marginTop: 8 },
    section: { fontSize: 9, fontWeight: 700, color: "#9ca3af", marginTop: 22, marginBottom: 10, textTransform: "uppercase", letterSpacing: 2.5 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 },
    role: { fontSize: 11, fontWeight: 500, color: "#111827" },
    company: { fontSize: 10, color: "#6b7280" },
    dates: { fontSize: 9, color: "#9ca3af" },
    bullet: { fontSize: 10, marginBottom: 3, marginLeft: 10, color: "#374151" },
    body: { fontSize: 10.5, marginBottom: 4, color: "#374151" },
    grid: { flexDirection: "row", marginBottom: 6 },
    gridLabel: { width: "30%", fontSize: 10, color: "#6b7280" },
    gridValue: { width: "70%", fontSize: 10, color: "#374151" },
  });

  const children: ReactElement[] = [
    text(styles.name, content.personal.fullName || "Your Name"),
  ];
  if (safe(content.personal.jobTitle)) children.push(text(styles.title, content.personal.jobTitle));
  const contactAll = [
    content.personal.email,
    content.personal.phone,
    content.personal.location,
    content.personal.website,
    content.personal.linkedin,
    content.personal.github,
  ].filter((v) => safe(v));
  if (contactAll.length) children.push(text(styles.contact, contactAll.join("  ·  ")));

  if (!isSectionHidden(content, "summary") && safe(content.personal.summary)) {
    children.push(text(styles.section, "Summary"));
    children.push(text(styles.body, content.personal.summary));
  }

  if (!isSectionHidden(content, "experience") && content.experience.length) {
    children.push(text(styles.section, "Experience"));
    for (const exp of content.experience) {
      children.push(
        view(
          styles.expRow,
          text(styles.role, exp.role ? `${exp.role}${exp.company ? ` at ${exp.company}` : ""}` : exp.company),
          text(styles.dates, fmtDateRange(exp.startDate, exp.endDate, exp.current))
        )
      );
      if (safe(exp.location)) children.push(text(styles.company, exp.location));
      for (const b of exp.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `· ${b}`));
      }
      children.push(view({ height: 8 }));
    }
  }

  if (!isSectionHidden(content, "education") && content.education.length) {
    children.push(text(styles.section, "Education"));
    for (const ed of content.education) {
      children.push(
        view(
          styles.expRow,
          text(styles.role, ed.institution || "Institution"),
          text(styles.dates, fmtDateRange(ed.startDate, ed.endDate, false))
        )
      );
      const deg = [safe(ed.degree), safe(ed.field)].filter(Boolean).join(", ");
      if (deg) children.push(text(styles.company, deg));
      children.push(view({ height: 6 }));
    }
  }

  if (!isSectionHidden(content, "skills") && content.skills.length) {
    children.push(text(styles.section, "Skills"));
    for (const g of content.skills) {
      children.push(
        view(
          styles.grid,
          text(styles.gridLabel, g.category || "—"),
          text(styles.gridValue, g.items.filter(Boolean).join(", "))
        )
      );
    }
  }

  if (!isSectionHidden(content, "projects") && content.projects.length) {
    children.push(text(styles.section, "Projects"));
    for (const p of content.projects) {
      children.push(text(styles.role, p.name || "Project"));
      if (safe(p.description)) children.push(text(styles.body, p.description));
      for (const b of p.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `· ${b}`));
      }
      if (p.tech.length) children.push(text(styles.dates, p.tech.join(" · ")));
      children.push(view({ height: 6 }));
    }
  }

  if (!isSectionHidden(content, "certifications") && content.certifications.length) {
    children.push(text(styles.section, "Certifications"));
    for (const c of content.certifications) {
      children.push(text(styles.body, [safe(c.name), safe(c.issuer), safe(c.date)].filter(Boolean).join("  ·  ")));
    }
  }

  if (!isSectionHidden(content, "languages") && content.languages.length) {
    children.push(text(styles.section, "Languages"));
    children.push(
      text(
        styles.body,
        content.languages
          .filter((l) => safe(l.name))
          .map((l) => (safe(l.level) ? `${safe(l.name)} (${safe(l.level)})` : safe(l.name)))
          .join(" · ")
      )
    );
  }

  if (!isSectionHidden(content, "awards") && content.awards.length) {
    children.push(text(styles.section, "Awards"));
    for (const a of content.awards) {
      children.push(text(styles.role, a.name));
      const meta = [safe(a.issuer), safe(a.date)].filter(Boolean).join("  ·  ");
      if (meta) children.push(text(styles.dates, meta));
      if (safe(a.description)) children.push(text(styles.body, a.description));
    }
  }

  return e(Page, { size: "A4", style: styles.page }, ...children);
}

// ════════════════════════════════════════════════════════════════════════════
// CREATIVE — Dark sidebar, themed accents, bold name. For design/creative roles.
// ════════════════════════════════════════════════════════════════════════════
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
    expWrap: { borderLeft: `2pt solid ${themeColor}`, paddingLeft: 10, marginBottom: 10 },
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
      const expKids: ReactElement[] = [
        text(styles.expRole, exp.role || "Role"),
        text(styles.expCompany, [safe(exp.company), safe(exp.location)].filter(Boolean).join(" — ")),
        text(styles.expDate, fmtDateRange(exp.startDate, exp.endDate, exp.current)),
      ];
      for (const b of exp.bullets.filter(Boolean)) expKids.push(text(styles.bullet, `• ${b}`));
      main.push(view(styles.expWrap, ...expKids));
    }
  }
  if (!isSectionHidden(content, "projects") && content.projects.length) {
    main.push(text(styles.section, "PROJECTS"));
    for (const p of content.projects) {
      const kids: ReactElement[] = [text(styles.expRole, p.name)];
      if (safe(p.description)) kids.push(text(styles.body10, p.description));
      for (const b of p.bullets.filter(Boolean)) kids.push(text(styles.bullet, `• ${b}`));
      main.push(view(styles.expWrap, ...kids));
    }
  }
  if (!isSectionHidden(content, "education") && content.education.length) {
    main.push(text(styles.section, "EDUCATION"));
    for (const ed of content.education) {
      const kids: ReactElement[] = [
        text(styles.expRole, ed.institution),
        text(styles.expCompany, [safe(ed.degree), safe(ed.field)].filter(Boolean).join(", ")),
        text(styles.expDate, fmtDateRange(ed.startDate, ed.endDate, false)),
      ];
      main.push(view(styles.expWrap, ...kids));
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

// ════════════════════════════════════════════════════════════════════════════
// COMPACT — Tight density, smaller font, inline dates, single column.
// Senior engineers with 10+ years.
// ════════════════════════════════════════════════════════════════════════════
function CompactPdf(props: { content: ResumeContent; themeColor: string; fontFamily: string }): ReactElement {
  const { content, themeColor, fontFamily } = props;
  const styles = StyleSheet.create({
    page: { padding: 30, fontFamily, fontSize: 9, color: "#1f2937", lineHeight: 1.3 },
    header: { borderBottom: `1pt solid ${themeColor}`, paddingBottom: 4, marginBottom: 8 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    name: { fontSize: 18, fontWeight: 700, color: "#0f172a" },
    title: { fontSize: 10, color: "#475569" },
    contact: { fontSize: 8.5, color: "#475569", marginTop: 2 },
    section: { fontSize: 10, fontWeight: 700, color: themeColor, marginTop: 8, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    role: { fontSize: 9.5, fontWeight: 700 },
    dates: { fontSize: 8.5, fontStyle: "italic", color: "#64748b" },
    bullet: { fontSize: 9, marginLeft: 10, marginBottom: 0.5 },
    body: { fontSize: 9, marginBottom: 2 },
  });

  const children: ReactElement[] = [];

  const headerKids: ReactElement[] = [
    view(
      styles.headerRow,
      text(styles.name, content.personal.fullName || "Your Name"),
      ...(safe(content.personal.jobTitle) ? [text(styles.title, content.personal.jobTitle)] : [])
    ),
  ];
  const contactAll = [
    content.personal.email,
    content.personal.phone,
    content.personal.location,
    content.personal.website,
    content.personal.linkedin,
    content.personal.github,
  ].filter((v) => safe(v));
  if (contactAll.length) headerKids.push(text(styles.contact, contactAll.join("  ·  ")));
  children.push(view(styles.header, ...headerKids));

  if (!isSectionHidden(content, "summary") && safe(content.personal.summary)) {
    children.push(text(styles.section, "Summary"));
    children.push(text(styles.body, content.personal.summary));
  }

  if (!isSectionHidden(content, "experience") && content.experience.length) {
    children.push(text(styles.section, "Experience"));
    for (const exp of content.experience) {
      children.push(
        view(
          styles.expRow,
          text(styles.role, `${exp.role || "Role"}${exp.company ? ` · ${exp.company}` : ""}`),
          text(styles.dates, [fmtDateRange(exp.startDate, exp.endDate, exp.current), safe(exp.location)].filter(Boolean).join("  ·  "))
        )
      );
      for (const b of exp.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `• ${b}`));
      }
      children.push(view({ height: 2 }));
    }
  }

  if (!isSectionHidden(content, "projects") && content.projects.length) {
    children.push(text(styles.section, "Projects"));
    for (const p of content.projects) {
      children.push(text(styles.role, `${p.name}${p.tech.length ? ` · ${p.tech.join(", ")}` : ""}`));
      if (safe(p.description)) children.push(text(styles.body, p.description));
      for (const b of p.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `• ${b}`));
      }
    }
  }

  if (!isSectionHidden(content, "education") && content.education.length) {
    children.push(text(styles.section, "Education"));
    for (const ed of content.education) {
      children.push(
        view(
          styles.expRow,
          text(styles.role, `${ed.institution}${ed.degree ? ` · ${ed.degree}` : ""}${ed.field ? `, ${ed.field}` : ""}`),
          text(styles.dates, fmtDateRange(ed.startDate, ed.endDate, false))
        )
      );
    }
  }

  if (!isSectionHidden(content, "skills") && content.skills.length) {
    children.push(text(styles.section, "Skills"));
    for (const g of content.skills) {
      children.push(
        e(
          Text,
          { style: styles.body },
          e(Text, { style: { fontWeight: 700 } as Style }, `${g.category}: `),
          g.items.filter(Boolean).join(", ")
        )
      );
    }
  }

  if (!isSectionHidden(content, "certifications") && content.certifications.length) {
    children.push(text(styles.section, "Certifications"));
    children.push(
      text(
        styles.body,
        content.certifications.map((c) => [safe(c.name), safe(c.issuer), safe(c.date)].filter(Boolean).join(" · ")).join("  •  ")
      )
    );
  }

  if (!isSectionHidden(content, "languages") && content.languages.length) {
    children.push(text(styles.section, "Languages"));
    children.push(
      text(
        styles.body,
        content.languages.map((l) => (safe(l.level) ? `${safe(l.name)} (${safe(l.level)})` : safe(l.name))).join(", ")
      )
    );
  }

  if (!isSectionHidden(content, "awards") && content.awards.length) {
    children.push(text(styles.section, "Awards"));
    for (const a of content.awards) {
      children.push(
        text(styles.body, `${a.name}${a.issuer ? ` · ${a.issuer}` : ""}${a.date ? ` · ${a.date}` : ""}`)
      );
    }
  }

  return e(Page, { size: "A4", style: styles.page }, ...children);
}

// ════════════════════════════════════════════════════════════════════════════
// EXECUTIVE — Bigger name, thick themed divider, serif, leadership-style layout
// ════════════════════════════════════════════════════════════════════════════
function ExecutivePdf(props: { content: ResumeContent; themeColor: string; fontFamily: string }): ReactElement {
  const { content, themeColor } = props;
  const serif = "Times-Roman";
  const styles = StyleSheet.create({
    page: { padding: 44, fontFamily: serif, fontSize: 11, color: "#1c1917", lineHeight: 1.5 },
    header: { borderBottom: `3pt solid ${themeColor}`, paddingBottom: 10, marginBottom: 14 },
    name: { fontSize: 32, fontWeight: 700, color: themeColor, letterSpacing: 0.5 },
    title: { fontSize: 12, fontWeight: 700, color: "#44403c", textTransform: "uppercase", letterSpacing: 2, marginTop: 6 },
    contact: { fontSize: 10, color: "#57534e", marginTop: 8 },
    section: { fontSize: 12, fontWeight: 700, color: themeColor, marginTop: 16, marginBottom: 6, textTransform: "uppercase", letterSpacing: 2, borderBottom: `0.75pt solid ${hexToRgba(themeColor, 0.5)}`, paddingBottom: 3 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    role: { fontSize: 12, fontWeight: 700, color: "#0f172a" },
    company: { fontSize: 11, fontWeight: 700, color: themeColor, marginBottom: 4 },
    dates: { fontSize: 10, fontStyle: "italic", color: "#57534e" },
    bullet: { fontSize: 11, marginLeft: 14, marginBottom: 2 },
    body: { fontSize: 11.5, marginBottom: 4, lineHeight: 1.55 },
  });

  const children: ReactElement[] = [];

  const headerKids: ReactElement[] = [text(styles.name, content.personal.fullName || "Your Name")];
  if (safe(content.personal.jobTitle)) headerKids.push(text(styles.title, content.personal.jobTitle));
  const contact = buildContactLine(content);
  const links = buildLinksLine(content);
  if (contact) headerKids.push(text(styles.contact, contact));
  if (links) headerKids.push(text(styles.contact, links));
  children.push(view(styles.header, ...headerKids));

  if (!isSectionHidden(content, "summary") && safe(content.personal.summary)) {
    children.push(text(styles.section, "Executive Summary"));
    children.push(text(styles.body, content.personal.summary));
  }

  if (!isSectionHidden(content, "experience") && content.experience.length) {
    children.push(text(styles.section, "Professional Experience"));
    for (const exp of content.experience) {
      children.push(
        view(
          styles.expRow,
          text(styles.role, exp.role || "Role"),
          text(styles.dates, fmtDateRange(exp.startDate, exp.endDate, exp.current))
        )
      );
      children.push(text(styles.company, [safe(exp.company), safe(exp.location)].filter(Boolean).join(" — ")));
      for (const b of exp.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `▪ ${b}`));
      }
      children.push(view({ height: 6 }));
    }
  }

  if (!isSectionHidden(content, "skills") && content.skills.length) {
    children.push(text(styles.section, "Core Competencies"));
    for (const g of content.skills) {
      children.push(
        e(
          Text,
          { style: styles.body },
          e(Text, { style: { fontWeight: 700, color: themeColor } as Style }, `${g.category}: `),
          g.items.filter(Boolean).join(", ")
        )
      );
    }
  }

  if (!isSectionHidden(content, "education") && content.education.length) {
    children.push(text(styles.section, "Education"));
    for (const ed of content.education) {
      children.push(
        view(
          styles.expRow,
          text(styles.role, ed.institution || "Institution"),
          text(styles.dates, fmtDateRange(ed.startDate, ed.endDate, false))
        )
      );
      const deg = [safe(ed.degree), safe(ed.field)].filter(Boolean).join(", ");
      if (deg) children.push(text(styles.body, deg));
    }
  }

  if (!isSectionHidden(content, "projects") && content.projects.length) {
    children.push(text(styles.section, "Selected Projects"));
    for (const p of content.projects) {
      children.push(text(styles.role, p.name || "Project"));
      if (safe(p.description)) children.push(text(styles.body, p.description));
      for (const b of p.bullets.filter(Boolean)) {
        children.push(text(styles.bullet, `▪ ${b}`));
      }
    }
  }

  if (!isSectionHidden(content, "awards") && content.awards.length) {
    children.push(text(styles.section, "Recognition"));
    for (const a of content.awards) {
      children.push(text(styles.role, a.name));
      const meta = [safe(a.issuer), safe(a.date)].filter(Boolean).join("  ·  ");
      if (meta) children.push(text(styles.dates, meta));
      if (safe(a.description)) children.push(text(styles.body, a.description));
    }
  }

  if (!isSectionHidden(content, "certifications") && content.certifications.length) {
    children.push(text(styles.section, "Certifications"));
    for (const c of content.certifications) {
      children.push(text(styles.body, [safe(c.name), safe(c.issuer), safe(c.date)].filter(Boolean).join("  ·  ")));
    }
  }

  if (!isSectionHidden(content, "languages") && content.languages.length) {
    children.push(text(styles.section, "Languages"));
    children.push(
      text(
        styles.body,
        content.languages
          .filter((l) => safe(l.name))
          .map((l) => (safe(l.level) ? `${safe(l.name)} (${safe(l.level)})` : safe(l.name)))
          .join(" · ")
      )
    );
  }

  return e(Page, { size: "A4", style: styles.page }, ...children);
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTER
// ════════════════════════════════════════════════════════════════════════════
function pageFor(template: ResumeTemplate, content: ResumeContent, themeColor: string, fontFamily: string): ReactElement {
  switch (template) {
    case "modern":
      return ModernPdf({ content, themeColor, fontFamily });
    case "classic":
      return ClassicPdf({ content, themeColor, fontFamily });
    case "minimal":
      return MinimalPdf({ content, themeColor, fontFamily });
    case "creative":
      return CreativePdf({ content, themeColor, fontFamily });
    case "compact":
      return CompactPdf({ content, themeColor, fontFamily });
    case "executive":
      return ExecutivePdf({ content, themeColor, fontFamily });
    default:
      return ModernPdf({ content, themeColor, fontFamily });
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
