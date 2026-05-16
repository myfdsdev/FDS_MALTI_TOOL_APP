import type { TemplateProps } from "./shared/types";
import { FONT_FAMILY_STYLE, formatDateRange, isSectionHidden, joinNonEmpty } from "./shared/utils";

export function ExecutiveTemplate({ content, themeColor, fontFamily }: TemplateProps) {
  const p = content.personal;
  const fontStack = FONT_FAMILY_STYLE[fontFamily === "inter" ? "serif" : fontFamily];

  return (
    <div
      className="h-full w-full bg-white px-10 py-10 text-[10.5pt] leading-relaxed text-slate-800"
      style={{ fontFamily: fontStack }}
    >
      <header className="border-b-4 pb-3" style={{ borderColor: themeColor }}>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: themeColor }}>
          {p.fullName || "Your name"}
        </h1>
        {p.jobTitle && (
          <p className="mt-2 text-[12pt] font-medium uppercase tracking-widest text-slate-700">
            {p.jobTitle}
          </p>
        )}
        <p className="mt-3 text-[10pt] text-slate-600">
          {joinNonEmpty([p.email, p.phone, p.location], "  ·  ")}
        </p>
        <p className="text-[10pt] text-slate-600">
          {joinNonEmpty([p.website, p.linkedin, p.github], "  ·  ")}
        </p>
      </header>

      {!isSectionHidden(content, "summary") && p.summary?.trim() && (
        <Section title="Executive Summary" themeColor={themeColor}>
          <p className="text-[11pt] leading-relaxed text-slate-700">{p.summary}</p>
        </Section>
      )}

      {!isSectionHidden(content, "experience") && content.experience.length > 0 && (
        <Section title="Professional Experience" themeColor={themeColor}>
          {content.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[12pt] font-bold text-slate-900">{exp.role}</p>
                <p className="whitespace-nowrap text-[9.5pt] italic text-slate-600">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </p>
              </div>
              <p className="text-[11pt] font-semibold" style={{ color: themeColor }}>
                {joinNonEmpty([exp.company, exp.location], " — ")}
              </p>
              <ul className="mt-2 space-y-1.5">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="ml-5 list-disc">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "skills") && content.skills.length > 0 && (
        <Section title="Core Competencies" themeColor={themeColor}>
          <div className="grid gap-2">
            {content.skills.map((g) => (
              <p key={g.id} className="text-[10.5pt]">
                <span className="font-bold" style={{ color: themeColor }}>{g.category}:</span>{" "}
                {g.items.join(", ")}
              </p>
            ))}
          </div>
        </Section>
      )}

      {!isSectionHidden(content, "education") && content.education.length > 0 && (
        <Section title="Education" themeColor={themeColor}>
          {content.education.map((ed) => (
            <div key={ed.id} className="mb-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-bold">{ed.institution}</p>
                <p className="whitespace-nowrap text-[9.5pt] italic text-slate-600">
                  {formatDateRange(ed.startDate, ed.endDate, false)}
                </p>
              </div>
              <p>{joinNonEmpty([ed.degree, ed.field], ", ")}</p>
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "projects") && content.projects.length > 0 && (
        <Section title="Selected Projects" themeColor={themeColor}>
          {content.projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <p className="font-bold">{proj.name}</p>
              {proj.description && <p>{proj.description}</p>}
              <ul className="mt-1 space-y-1">
                {proj.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="ml-5 list-disc">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "awards") && content.awards.length > 0 && (
        <Section title="Recognition" themeColor={themeColor}>
          {content.awards.map((a) => (
            <div key={a.id} className="mb-2">
              <p className="font-bold">{a.name}</p>
              <p className="text-[9.5pt] text-slate-600">{joinNonEmpty([a.issuer, a.date], " · ")}</p>
              {a.description && <p>{a.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "certifications") && content.certifications.length > 0 && (
        <Section title="Certifications" themeColor={themeColor}>
          {content.certifications.map((c) => (
            <p key={c.id}>{joinNonEmpty([c.name, c.issuer, c.date], " · ")}</p>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "languages") && content.languages.length > 0 && (
        <Section title="Languages" themeColor={themeColor}>
          <p>
            {content.languages
              .filter((l) => l.name)
              .map((l) => (l.level ? `${l.name} (${l.level})` : l.name))
              .join(" · ")}
          </p>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  themeColor,
}: {
  title: string;
  children: React.ReactNode;
  themeColor: string;
}) {
  return (
    <section className="mt-5">
      <h2
        className="border-b pb-1 text-[12pt] font-bold uppercase tracking-widest"
        style={{ color: themeColor, borderColor: themeColor }}
      >
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
