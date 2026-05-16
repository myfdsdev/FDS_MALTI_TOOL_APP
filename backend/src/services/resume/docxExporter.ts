import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { ResumeContent, ResumeDocument } from "../../models/Resume.model.js";

function safe(value: string | null | undefined): string {
  return (value || "").trim();
}

function formatDateRange(start: string, end: string | null, current: boolean): string {
  const startLabel = safe(start) || "—";
  const endLabel = current ? "Present" : safe(end) || "—";
  if (!startLabel && !endLabel) return "";
  return `${startLabel} – ${endLabel}`;
}

function isSectionHidden(content: ResumeContent, key: string): boolean {
  return (content.hiddenSections ?? []).includes(key);
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 24,
      }),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text: safe(text), size: 22 })],
  });
}

function buildHeader(content: ResumeContent): Paragraph[] {
  const personal = content.personal;
  const headerParts: Paragraph[] = [];

  if (safe(personal.fullName)) {
    headerParts.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: safe(personal.fullName), bold: true, size: 44 }),
        ],
      })
    );
  }

  if (safe(personal.jobTitle)) {
    headerParts.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: safe(personal.jobTitle), italics: true, size: 24 }),
        ],
      })
    );
  }

  const contactLine = [
    safe(personal.email),
    safe(personal.phone),
    safe(personal.location),
  ].filter(Boolean);

  if (contactLine.length) {
    headerParts.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: contactLine.join("  •  "), size: 20 })],
      })
    );
  }

  const links: Array<{ label: string; href: string }> = [];
  if (safe(personal.website)) links.push({ label: "Website", href: personal.website });
  if (safe(personal.linkedin)) links.push({ label: "LinkedIn", href: personal.linkedin });
  if (safe(personal.github)) links.push({ label: "GitHub", href: personal.github });
  if (links.length) {
    headerParts.push(
      new Paragraph({
        spacing: { after: 120 },
        children: links.flatMap((link, index) => {
          const sep = index === 0 ? [] : [new TextRun({ text: "  •  ", size: 20 })];
          return [
            ...sep,
            new ExternalHyperlink({
              link: link.href,
              children: [new TextRun({ text: link.label, style: "Hyperlink", size: 20 })],
            }),
          ];
        }),
      })
    );
  }

  return headerParts;
}

function buildSummary(content: ResumeContent): Paragraph[] {
  if (isSectionHidden(content, "summary")) return [];
  const summary = safe(content.personal.summary);
  if (!summary) return [];
  return [
    sectionHeading("Summary"),
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: summary, size: 22 })],
    }),
  ];
}

function buildExperience(content: ResumeContent): Paragraph[] {
  if (isSectionHidden(content, "experience") || content.experience.length === 0) return [];
  const paragraphs: Paragraph[] = [sectionHeading("Experience")];
  for (const entry of content.experience) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: safe(entry.role) || "Role", bold: true, size: 24 }),
          ...(safe(entry.company)
            ? [new TextRun({ text: ` — ${safe(entry.company)}`, size: 24 })]
            : []),
        ],
      })
    );
    const rightLine = [
      formatDateRange(entry.startDate, entry.endDate, entry.current),
      safe(entry.location),
    ]
      .filter(Boolean)
      .join("  •  ");
    if (rightLine) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: rightLine, size: 20, italics: true })],
        })
      );
    }
    for (const bullet of entry.bullets.filter(Boolean)) {
      paragraphs.push(bulletParagraph(bullet));
    }
  }
  return paragraphs;
}

function buildEducation(content: ResumeContent): Paragraph[] {
  if (isSectionHidden(content, "education") || content.education.length === 0) return [];
  const paragraphs: Paragraph[] = [sectionHeading("Education")];
  for (const entry of content.education) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 100, after: 30 },
        children: [
          new TextRun({ text: safe(entry.institution) || "Institution", bold: true, size: 24 }),
        ],
      })
    );
    const degreeLine = [safe(entry.degree), safe(entry.field)].filter(Boolean).join(", ");
    if (degreeLine) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: degreeLine, size: 22 })],
        })
      );
    }
    const meta = [
      formatDateRange(entry.startDate, entry.endDate, false),
      safe(entry.location),
      safe(entry.gpa) ? `GPA ${safe(entry.gpa)}` : "",
    ]
      .filter(Boolean)
      .join("  •  ");
    if (meta) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: meta, size: 20, italics: true })],
        })
      );
    }
    if (safe(entry.notes)) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: safe(entry.notes), size: 20 })],
        })
      );
    }
  }
  return paragraphs;
}

function buildSkills(content: ResumeContent): Paragraph[] {
  if (isSectionHidden(content, "skills") || content.skills.length === 0) return [];
  const paragraphs: Paragraph[] = [sectionHeading("Skills")];
  for (const group of content.skills) {
    if (group.items.length === 0 && !safe(group.category)) continue;
    paragraphs.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${safe(group.category) || "Skills"}: `, bold: true, size: 22 }),
          new TextRun({ text: group.items.filter(Boolean).join(", "), size: 22 }),
        ],
      })
    );
  }
  return paragraphs;
}

function buildProjects(content: ResumeContent): Paragraph[] {
  if (isSectionHidden(content, "projects") || content.projects.length === 0) return [];
  const paragraphs: Paragraph[] = [sectionHeading("Projects")];
  for (const project of content.projects) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 100, after: 40 },
        children: [
          new TextRun({ text: safe(project.name) || "Project", bold: true, size: 24 }),
          ...(safe(project.link)
            ? [new TextRun({ text: `  •  ${safe(project.link)}`, size: 20, italics: true })]
            : []),
        ],
      })
    );
    if (safe(project.description)) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: safe(project.description), size: 22 })],
        })
      );
    }
    for (const bullet of project.bullets.filter(Boolean)) {
      paragraphs.push(bulletParagraph(bullet));
    }
    if (project.tech.length) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Tech: ", bold: true, size: 20 }),
            new TextRun({ text: project.tech.filter(Boolean).join(", "), size: 20 }),
          ],
        })
      );
    }
  }
  return paragraphs;
}

function buildCertifications(content: ResumeContent): Paragraph[] {
  if (isSectionHidden(content, "certifications") || content.certifications.length === 0) return [];
  const paragraphs: Paragraph[] = [sectionHeading("Certifications")];
  for (const cert of content.certifications) {
    const line = [safe(cert.name), safe(cert.issuer), safe(cert.date)]
      .filter(Boolean)
      .join("  •  ");
    paragraphs.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: line || "Certification", size: 22 })],
      })
    );
  }
  return paragraphs;
}

function buildLanguages(content: ResumeContent): Paragraph[] {
  if (isSectionHidden(content, "languages") || content.languages.length === 0) return [];
  const paragraphs: Paragraph[] = [sectionHeading("Languages")];
  const text = content.languages
    .filter((l) => safe(l.name))
    .map((l) => (safe(l.level) ? `${safe(l.name)} (${safe(l.level)})` : safe(l.name)))
    .join(", ");
  if (text) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text, size: 22 })],
      })
    );
  }
  return paragraphs;
}

function buildAwards(content: ResumeContent): Paragraph[] {
  if (isSectionHidden(content, "awards") || content.awards.length === 0) return [];
  const paragraphs: Paragraph[] = [sectionHeading("Awards")];
  for (const award of content.awards) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 30 },
        children: [
          new TextRun({ text: safe(award.name) || "Award", bold: true, size: 22 }),
          ...(safe(award.issuer)
            ? [new TextRun({ text: ` — ${safe(award.issuer)}`, size: 22 })]
            : []),
          ...(safe(award.date)
            ? [new TextRun({ text: `  •  ${safe(award.date)}`, size: 20, italics: true })]
            : []),
        ],
      })
    );
    if (safe(award.description)) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: safe(award.description), size: 20 })],
        })
      );
    }
  }
  return paragraphs;
}

export async function renderResumeDocx(resume: ResumeDocument): Promise<Buffer> {
  const content = resume.content;

  const sections = [
    ...buildHeader(content),
    ...buildSummary(content),
    ...buildExperience(content),
    ...buildEducation(content),
    ...buildSkills(content),
    ...buildProjects(content),
    ...buildCertifications(content),
    ...buildLanguages(content),
    ...buildAwards(content),
  ];

  const doc = new Document({
    creator: "Multi-Tool SaaS Resume Builder",
    title: resume.title,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: sections,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
