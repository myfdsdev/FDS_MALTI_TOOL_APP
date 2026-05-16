import type { TemplateProps } from "./shared/types";
import { FONT_FAMILY_STYLE, formatDateRange, isSectionHidden, joinNonEmpty } from "./shared/utils";

export function CompactTemplate({ content, themeColor, fontFamily }: TemplateProps) {
  const p = content.personal;
  const fontStack = FONT_FAMILY_STYLE[fontFamily];

  return (
    <div
      className="h-full w-full bg-white px-8 py-7 text-[9pt] leading-snug text-slate-800"
      style={{ fontFamily: fontStack }}
    >
      <header className="border-b pb-2" style={{ borderColor: themeColor }}>
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">{p.fullName || "Your name"}</h1>
          {p.jobTitle && <p className="text-[10pt] text-slate-600">{p.jobTitle}</p>}
        </div>
        <p className="mt-1 text-[8.5pt] text-slate-600">
          {joinNonEmpty([p.email, p.phone, p.location, p.website, p.linkedin, p.github], "  ·  ")}
        </p>
      </header>

      {!isSectionHidden(content, "summary") && p.summary?.trim() && (
        <Section title="Summary" themeColor={themeColor}>
          <p>{p.summary}</p>
        </Section>
      )}

      {!isSectionHidden(content, "experience") && content.experience.length > 0 && (
        <Section title="Experience" themeColor={themeColor}>
          {content.experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">
                  {exp.role}{exp.company ? ` · ${exp.company}` : ""}
                </p>
                <p className="whitespace-nowrap text-[8.5pt] italic text-slate-500">
                  {joinNonEmpty([formatDateRange(exp.startDate, exp.endDate, exp.current), exp.location], "  ·  ")}
                </p>
              </div>
              <ul className="mt-0.5 space-y-0.5">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="ml-4 list-disc">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "projects") && content.projects.length > 0 && (
        <Section title="Projects" themeColor={themeColor}>
          {content.projects.map((proj) => (
            <div key={proj.id} className="mb-1.5">
              <p className="font-semibold">
                {proj.name}{proj.tech.length ? ` · ${proj.tech.join(", ")}` : ""}
              </p>
              {proj.description && <p>{proj.description}</p>}
              <ul className="space-y-0.5">
                {proj.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="ml-4 list-disc">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "education") && content.education.length > 0 && (
        <Section title="Education" themeColor={themeColor}>
          {content.education.map((ed) => (
            <div key={ed.id} className="mb-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">
                  {ed.institution}{ed.degree ? ` · ${ed.degree}` : ""}{ed.field ? `, ${ed.field}` : ""}
                </p>
                <p className="whitespace-nowrap text-[8.5pt] italic text-slate-500">
                  {formatDateRange(ed.startDate, ed.endDate, false)}
                </p>
              </div>
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "skills") && content.skills.length > 0 && (
        <Section title="Skills" themeColor={themeColor}>
          {content.skills.map((g) => (
            <p key={g.id}>
              <span className="font-semibold">{g.category}:</span> {g.items.join(", ")}
            </p>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "certifications") && content.certifications.length > 0 && (
        <Section title="Certifications" themeColor={themeColor}>
          <p>{content.certifications.map((c) => joinNonEmpty([c.name, c.issuer, c.date], " · ")).join("  •  ")}</p>
        </Section>
      )}

      {!isSectionHidden(content, "languages") && content.languages.length > 0 && (
        <Section title="Languages" themeColor={themeColor}>
          <p>{content.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(", ")}</p>
        </Section>
      )}

      {!isSectionHidden(content, "awards") && content.awards.length > 0 && (
        <Section title="Awards" themeColor={themeColor}>
          {content.awards.map((a) => (
            <p key={a.id}>
              <span className="font-semibold">{a.name}</span>
              {a.issuer ? ` · ${a.issuer}` : ""}
              {a.date ? ` · ${a.date}` : ""}
            </p>
          ))}
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
    <section className="mt-3">
      <h2 className="text-[10pt] font-bold uppercase tracking-wider" style={{ color: themeColor }}>
        {title}
      </h2>
      <div className="mt-1">{children}</div>
    </section>
  );
}
