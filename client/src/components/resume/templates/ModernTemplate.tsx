import type { TemplateProps } from "./shared/types";
import { FONT_FAMILY_STYLE, formatDateRange, hexToRgba, isSectionHidden, joinNonEmpty } from "./shared/utils";

export function ModernTemplate({ content, themeColor, fontFamily }: TemplateProps) {
  const p = content.personal;
  const fontStack = FONT_FAMILY_STYLE[fontFamily];

  return (
    <div
      className="flex h-full w-full bg-white text-[10pt] leading-relaxed text-slate-800"
      style={{ fontFamily: fontStack }}
    >
      {/* Sidebar */}
      <aside
        className="w-1/3 p-6 text-white"
        style={{ backgroundColor: hexToRgba(themeColor, 0.95) }}
      >
        <h1 className="text-2xl font-bold leading-tight">{p.fullName || "Your name"}</h1>
        <p className="mt-1 text-sm opacity-90">{p.jobTitle || "Your role"}</p>

        <SidebarBlock title="Contact">
          {[p.email, p.phone, p.location, p.website, p.linkedin, p.github]
            .filter(Boolean)
            .map((line, i) => (
              <p key={i} className="break-words text-[9.5pt] opacity-95">
                {line}
              </p>
            ))}
        </SidebarBlock>

        {!isSectionHidden(content, "skills") && content.skills.length > 0 && (
          <SidebarBlock title="Skills">
            {content.skills.map((g) => (
              <div key={g.id} className="mb-2">
                <p className="text-[10pt] font-semibold">{g.category || "Skills"}</p>
                <p className="text-[9.5pt] opacity-95">{g.items.filter(Boolean).join(", ")}</p>
              </div>
            ))}
          </SidebarBlock>
        )}

        {!isSectionHidden(content, "languages") && content.languages.length > 0 && (
          <SidebarBlock title="Languages">
            {content.languages.map((l) => (
              <p key={l.id} className="text-[9.5pt] opacity-95">
                {l.level ? `${l.name} — ${l.level}` : l.name}
              </p>
            ))}
          </SidebarBlock>
        )}
      </aside>

      {/* Main */}
      <main className="w-2/3 px-7 py-6">
        {!isSectionHidden(content, "summary") && p.summary?.trim() && (
          <Section title="Summary" themeColor={themeColor}>
            <p>{p.summary}</p>
          </Section>
        )}

        {!isSectionHidden(content, "experience") && content.experience.length > 0 && (
          <Section title="Experience" themeColor={themeColor}>
            {content.experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <p className="text-[11pt] font-semibold text-slate-900">{exp.role || "Role"}</p>
                <p className="text-[10pt] text-slate-700">
                  {joinNonEmpty([exp.company, exp.location], " — ")}
                </p>
                <p className="text-[9pt] italic text-slate-500">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </p>
                <ul className="mt-1 space-y-1">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="ml-4 list-disc text-[10pt]">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {!isSectionHidden(content, "projects") && content.projects.length > 0 && (
          <Section title="Projects" themeColor={themeColor}>
            {content.projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <p className="text-[11pt] font-semibold text-slate-900">{proj.name || "Project"}</p>
                {proj.description && <p className="text-[10pt]">{proj.description}</p>}
                <ul className="mt-1 space-y-1">
                  {proj.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="ml-4 list-disc text-[10pt]">
                      {b}
                    </li>
                  ))}
                </ul>
                {proj.tech.length > 0 && (
                  <p className="mt-1 text-[9pt] italic text-slate-500">
                    Tech: {proj.tech.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}

        {!isSectionHidden(content, "education") && content.education.length > 0 && (
          <Section title="Education" themeColor={themeColor}>
            {content.education.map((ed) => (
              <div key={ed.id} className="mb-2">
                <p className="text-[11pt] font-semibold text-slate-900">
                  {ed.institution || "Institution"}
                </p>
                <p className="text-[10pt] text-slate-700">
                  {joinNonEmpty([ed.degree, ed.field], ", ")}
                </p>
                <p className="text-[9pt] italic text-slate-500">
                  {formatDateRange(ed.startDate, ed.endDate, false)}
                </p>
                {ed.notes && <p className="text-[10pt]">{ed.notes}</p>}
              </div>
            ))}
          </Section>
        )}

        {!isSectionHidden(content, "certifications") && content.certifications.length > 0 && (
          <Section title="Certifications" themeColor={themeColor}>
            {content.certifications.map((c) => (
              <p key={c.id} className="text-[10pt]">
                {joinNonEmpty([c.name, c.issuer, c.date], " · ")}
              </p>
            ))}
          </Section>
        )}

        {!isSectionHidden(content, "awards") && content.awards.length > 0 && (
          <Section title="Awards" themeColor={themeColor}>
            {content.awards.map((a) => (
              <div key={a.id} className="mb-2">
                <p className="text-[10.5pt] font-semibold">{a.name}</p>
                <p className="text-[9pt] text-slate-500">
                  {joinNonEmpty([a.issuer, a.date], " · ")}
                </p>
                {a.description && <p className="text-[10pt]">{a.description}</p>}
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="text-[10pt] font-semibold uppercase tracking-wider opacity-90">{title}</p>
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
    <section className="mb-4">
      <h2
        className="mb-2 text-[11pt] font-bold uppercase tracking-widest"
        style={{ color: themeColor }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
