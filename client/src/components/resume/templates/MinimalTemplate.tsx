import type { TemplateProps } from "./shared/types";
import { FONT_FAMILY_STYLE, formatDateRange, isSectionHidden, joinNonEmpty } from "./shared/utils";

export function MinimalTemplate({ content, themeColor, fontFamily }: TemplateProps) {
  const p = content.personal;
  const fontStack = FONT_FAMILY_STYLE[fontFamily];

  return (
    <div
      className="h-full w-full bg-white px-12 py-12 text-[10.5pt] leading-relaxed text-slate-800"
      style={{ fontFamily: fontStack }}
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: themeColor }}>
          {p.fullName || "Your name"}
        </h1>
        {p.jobTitle && <p className="mt-1 text-slate-600">{p.jobTitle}</p>}
        <p className="mt-3 text-[9.5pt] text-slate-500">
          {joinNonEmpty([p.email, p.phone, p.location, p.website, p.linkedin, p.github], "  ·  ")}
        </p>
      </header>

      {!isSectionHidden(content, "summary") && p.summary?.trim() && (
        <Section title="Summary">
          <p className="text-slate-700">{p.summary}</p>
        </Section>
      )}

      {!isSectionHidden(content, "experience") && content.experience.length > 0 && (
        <Section title="Experience">
          {content.experience.map((exp) => (
            <div key={exp.id} className="mb-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-slate-900">
                  {exp.role || "Role"}
                  {exp.company && <span className="text-slate-500"> at {exp.company}</span>}
                </p>
                <p className="text-[9.5pt] text-slate-500">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </p>
              </div>
              {exp.location && (
                <p className="text-[9.5pt] text-slate-500">{exp.location}</p>
              )}
              <ul className="mt-2 space-y-1.5">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="ml-4 list-disc text-slate-700">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "education") && content.education.length > 0 && (
        <Section title="Education">
          {content.education.map((ed) => (
            <div key={ed.id} className="mb-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{ed.institution}</p>
                <p className="text-[9.5pt] text-slate-500">
                  {formatDateRange(ed.startDate, ed.endDate, false)}
                </p>
              </div>
              <p className="text-slate-700">{joinNonEmpty([ed.degree, ed.field], ", ")}</p>
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "skills") && content.skills.length > 0 && (
        <Section title="Skills">
          <div className="grid gap-2">
            {content.skills.map((g) => (
              <div key={g.id} className="grid grid-cols-3 gap-2">
                <p className="font-medium text-slate-700">{g.category}</p>
                <p className="col-span-2 text-slate-600">{g.items.join(", ")}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {!isSectionHidden(content, "projects") && content.projects.length > 0 && (
        <Section title="Projects">
          {content.projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <p className="font-medium">{proj.name}</p>
              {proj.description && <p className="text-slate-700">{proj.description}</p>}
              <ul className="mt-1 space-y-1">
                {proj.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="ml-4 list-disc">{b}</li>
                ))}
              </ul>
              {proj.tech.length > 0 && (
                <p className="text-[9.5pt] text-slate-500">{proj.tech.join(" · ")}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "certifications") && content.certifications.length > 0 && (
        <Section title="Certifications">
          {content.certifications.map((c) => (
            <p key={c.id} className="text-slate-700">{joinNonEmpty([c.name, c.issuer, c.date], " · ")}</p>
          ))}
        </Section>
      )}

      {!isSectionHidden(content, "languages") && content.languages.length > 0 && (
        <Section title="Languages">
          <p>
            {content.languages
              .filter((l) => l.name)
              .map((l) => (l.level ? `${l.name} (${l.level})` : l.name))
              .join(" · ")}
          </p>
        </Section>
      )}

      {!isSectionHidden(content, "awards") && content.awards.length > 0 && (
        <Section title="Awards">
          {content.awards.map((a) => (
            <div key={a.id} className="mb-2">
              <p className="font-medium">{a.name}</p>
              <p className="text-[9.5pt] text-slate-500">{joinNonEmpty([a.issuer, a.date], " · ")}</p>
              {a.description && <p className="text-slate-700">{a.description}</p>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <p className="mb-3 text-[10pt] font-medium uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      {children}
    </section>
  );
}
