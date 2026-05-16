import type { TemplateProps } from "./shared/types";
import { FONT_FAMILY_STYLE, formatDateRange, isSectionHidden, joinNonEmpty } from "./shared/utils";

export function CreativeTemplate({ content, themeColor, fontFamily }: TemplateProps) {
  const p = content.personal;
  const fontStack = FONT_FAMILY_STYLE[fontFamily];

  return (
    <div
      className="flex h-full w-full bg-white text-[10pt] leading-relaxed text-slate-800"
      style={{ fontFamily: fontStack }}
    >
      <aside className="w-1/3 bg-slate-900 p-6 text-white">
        <h1 className="text-2xl font-bold tracking-tight">{p.fullName || "Your name"}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: themeColor }}>
          {p.jobTitle || "Your role"}
        </p>

        <Block title="Contact" accent={themeColor}>
          {[p.email, p.phone, p.location, p.website, p.linkedin, p.github]
            .filter(Boolean)
            .map((line, i) => (
              <p key={i} className="break-words text-[9.5pt] opacity-90">{line}</p>
            ))}
        </Block>

        {!isSectionHidden(content, "skills") && content.skills.length > 0 && (
          <Block title="Skills" accent={themeColor}>
            {content.skills.map((g) => (
              <div key={g.id} className="mb-2">
                <p className="text-[10pt] font-semibold">{g.category}</p>
                <p className="text-[9.5pt] opacity-90">{g.items.join(", ")}</p>
              </div>
            ))}
          </Block>
        )}

        {!isSectionHidden(content, "languages") && content.languages.length > 0 && (
          <Block title="Languages" accent={themeColor}>
            {content.languages.map((l) => (
              <p key={l.id} className="text-[9.5pt] opacity-90">
                {l.level ? `${l.name} — ${l.level}` : l.name}
              </p>
            ))}
          </Block>
        )}
      </aside>

      <main className="w-2/3 px-7 py-6">
        {!isSectionHidden(content, "summary") && p.summary?.trim() && (
          <Section title="About" themeColor={themeColor}>
            <p>{p.summary}</p>
          </Section>
        )}

        {!isSectionHidden(content, "experience") && content.experience.length > 0 && (
          <Section title="Experience" themeColor={themeColor}>
            {content.experience.map((exp) => (
              <div key={exp.id} className="mb-4 border-l-2 pl-4" style={{ borderColor: themeColor }}>
                <p className="text-[11.5pt] font-bold text-slate-900">{exp.role || "Role"}</p>
                <p className="text-[10pt] text-slate-700">
                  {joinNonEmpty([exp.company, exp.location], " — ")}
                </p>
                <p className="text-[9pt] italic text-slate-500">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </p>
                <ul className="mt-1 space-y-1">
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
              <div key={proj.id} className="mb-3 border-l-2 pl-4" style={{ borderColor: themeColor }}>
                <p className="text-[11pt] font-bold">{proj.name}</p>
                {proj.description && <p>{proj.description}</p>}
                <ul className="mt-1 space-y-1">
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
              <div key={ed.id} className="mb-3 border-l-2 pl-4" style={{ borderColor: themeColor }}>
                <p className="text-[11pt] font-bold">{ed.institution}</p>
                <p>{joinNonEmpty([ed.degree, ed.field], ", ")}</p>
                <p className="text-[9pt] italic text-slate-500">
                  {formatDateRange(ed.startDate, ed.endDate, false)}
                </p>
              </div>
            ))}
          </Section>
        )}

        {!isSectionHidden(content, "awards") && content.awards.length > 0 && (
          <Section title="Awards" themeColor={themeColor}>
            {content.awards.map((a) => (
              <div key={a.id} className="mb-2">
                <p className="font-semibold">{a.name}</p>
                <p className="text-[9pt] text-slate-500">{joinNonEmpty([a.issuer, a.date], " · ")}</p>
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

function Block({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="mt-5">
      <p className="text-[10pt] font-bold uppercase tracking-wider" style={{ color: accent }}>
        {title}
      </p>
      <div className="mt-2 space-y-1">{children}</div>
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
    <section className="mb-5">
      <h2 className="mb-3 text-[12pt] font-bold uppercase tracking-wide" style={{ color: themeColor }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
