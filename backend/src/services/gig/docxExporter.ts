import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { GigDocument } from "../../models/Gig.model.js";

function safe(v: string | null | undefined): string {
  return (v || "").trim();
}

function h1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 120 },
    children: [new TextRun({ text, bold: true, size: 44 })],
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 26 })],
  });
}

function h3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22 })],
  });
}

function p(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function meta(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, italics: true, size: 20, color: "6b7280" })],
  });
}

function packageCell(title: string, lines: string[]): TableCell {
  return new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 24, color: "0f766e" })],
      }),
      ...lines.map(
        (line) => new Paragraph({ children: [new TextRun({ text: line, size: 20 })] })
      ),
    ],
  });
}

function packageTable(gig: GigDocument): Table | null {
  const c = gig.content.gig;
  if (!c) return null;
  const cur = gig.input.pricingCurrency;
  const cells = (["basic", "standard", "premium"] as const).map((key) => {
    const pkg = c.packages[key];
    const lines = [
      `${pkg.price} ${cur}`,
      `${pkg.deliveryDays} day(s)`,
      `${pkg.revisions} revision(s)`,
      "",
      "Deliverables:",
      ...pkg.deliverables.filter(Boolean).map((d) => `• ${d}`),
    ];
    if (pkg.addOns.length) {
      lines.push("", "Add-ons:", ...pkg.addOns.filter(Boolean).map((a) => `• ${a}`));
    }
    return packageCell(pkg.name || key.toUpperCase(), lines);
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: cells })],
  });
}

function descriptionParagraphs(description: string): Paragraph[] {
  const out: Paragraph[] = [];
  const blocks = description.split(/\n{2,}/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (/^#{1,3}\s+/.test(trimmed)) {
      out.push(h3(trimmed.replace(/^#{1,3}\s+/, "")));
      continue;
    }
    if (/(^|\n)\s*([-*•+])\s+/.test(trimmed)) {
      const lines = trimmed.split("\n");
      for (const line of lines) {
        const m = line.match(/^\s*[-*•+]\s+(.*)$/);
        if (m) out.push(bullet(m[1]));
        else if (line.trim()) out.push(p(line.trim()));
      }
      continue;
    }
    out.push(p(trimmed));
  }
  return out;
}

export async function renderGigDocx(gig: GigDocument): Promise<Buffer> {
  const c = gig.content.gig;
  const leads = gig.content.leadStrategy;
  const outreach = gig.content.outreach;

  const children: Array<Paragraph | Table> = [];

  children.push(h1(c?.title || gig.title || gig.input.serviceName));
  children.push(
    meta(
      `Platform: ${gig.input.platform.toUpperCase()}  •  Niche: ${gig.input.niche}  •  Audience: ${gig.input.targetAudience}`
    )
  );

  if (gig.score) {
    children.push(h2("Gig Score"));
    children.push(p(`Overall: ${gig.score.overall}/100`));
    const b = gig.score.breakdown;
    children.push(bullet(`Title clarity: ${b.titleClarity}`));
    children.push(bullet(`Niche focus: ${b.nicheFocus}`));
    children.push(bullet(`Buyer benefit: ${b.buyerBenefit}`));
    children.push(bullet(`Pricing strength: ${b.pricingStrength}`));
    children.push(bullet(`Keyword quality: ${b.keywordQuality}`));
    children.push(bullet(`Description quality: ${b.descriptionQuality}`));
    children.push(bullet(`Trust factor: ${b.trustFactor}`));
    children.push(bullet(`CTA strength: ${b.ctaStrength}`));
    if (gig.score.suggestions.length) {
      children.push(h3("Suggestions"));
      gig.score.suggestions.forEach((s) => children.push(bullet(s)));
    }
  }

  if (c) {
    if (c.tags.length) {
      children.push(h3("Tags"));
      children.push(p(c.tags.join(", ")));
    }
    if (c.seoKeywords.length) {
      children.push(h3("SEO keywords"));
      children.push(p(c.seoKeywords.join(", ")));
    }

    children.push(h2("Description"));
    for (const para of descriptionParagraphs(c.description)) children.push(para);

    children.push(h2("Packages"));
    const tbl = packageTable(gig);
    if (tbl) children.push(tbl);

    if (c.buyerRequirements.length) {
      children.push(h2("Buyer Requirements"));
      c.buyerRequirements.forEach((r) => children.push(bullet(r)));
    }

    if (c.faqs.length) {
      children.push(h2("FAQs"));
      for (const f of c.faqs) {
        children.push(h3(f.question));
        children.push(p(f.answer));
      }
    }

    if (c.addOnServices.length) {
      children.push(h2("Add-On Services"));
      for (const a of c.addOnServices) {
        children.push(h3(`${a.name} — ${a.price} ${gig.input.pricingCurrency}`));
        children.push(p(a.description));
      }
    }

    if (safe(c.thumbnailConcept) || safe(c.thumbnailPrompt)) {
      children.push(h2("Thumbnail"));
      if (safe(c.thumbnailConcept)) {
        children.push(h3("Concept"));
        children.push(p(c.thumbnailConcept));
      }
      if (safe(c.thumbnailPrompt)) {
        children.push(h3("Image prompt"));
        children.push(p(c.thumbnailPrompt));
      }
    }

    if (c.portfolioSampleIdeas.length) {
      children.push(h2("Portfolio Sample Ideas"));
      c.portfolioSampleIdeas.forEach((s) => children.push(bullet(s)));
    }
  }

  if (leads) {
    children.push(h2("Lead Strategy"));
    children.push(h3("Best lead types"));
    leads.bestLeadTypes.forEach((s) => children.push(bullet(s)));
    children.push(h3("Target industries"));
    leads.targetIndustries.forEach((s) => children.push(bullet(s)));
    children.push(h3("Google search queries"));
    leads.googleQueries.forEach((s) => children.push(bullet(s)));
    children.push(h3("Instagram search terms"));
    leads.instagramSearchTerms.forEach((s) => children.push(bullet(s)));
    children.push(h3("LinkedIn search terms"));
    leads.linkedinSearchTerms.forEach((s) => children.push(bullet(s)));
    children.push(h3("Google Maps search terms"));
    leads.googleMapsSearchTerms.forEach((s) => children.push(bullet(s)));
    children.push(h3("Manual strategy"));
    children.push(p(leads.manualStrategy));
  }

  if (outreach) {
    children.push(h2("Outreach"));
    children.push(h3(`Cold email — ${outreach.coldEmail.subject}`));
    children.push(p(outreach.coldEmail.body));
    children.push(h3("Instagram DM"));
    children.push(p(outreach.instagramDm));
    children.push(h3("LinkedIn message"));
    children.push(p(outreach.linkedinMessage));
    children.push(h3("Short pitch"));
    children.push(p(outreach.shortPitch));
    children.push(h3("Follow-up"));
    children.push(p(outreach.followUpMessage));
    children.push(h3("Proposal"));
    children.push(p(outreach.proposalMessage));
  }

  const doc = new Document({
    creator: "GigLead AI",
    title: gig.title || gig.input.serviceName,
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
