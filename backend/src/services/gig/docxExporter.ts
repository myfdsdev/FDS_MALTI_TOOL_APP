import { Packer, Paragraph, Table } from "docx";
import type { GigDocument } from "../../models/Gig.model.js";
import {
  buildBrandedDocx,
  titleBlock,
  heading2,
  heading3,
  body as p,
  bodyMultiline,
  bullet,
  numbered,
  comparisonTable,
} from "../shared/docxDesign.js";

const GIG_THEME = "#0f766e";

function safe(v: string | null | undefined): string {
  return (v || "").trim();
}

function descriptionParagraphs(description: string): Paragraph[] {
  const out: Paragraph[] = [];
  for (const block of description.split(/\n{2,}/)) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (/^#{1,3}\s+/.test(trimmed)) {
      out.push(heading3(trimmed.replace(/^#{1,3}\s+/, "")));
      continue;
    }
    if (/(^|\n)\s*([-*•+])\s+/.test(trimmed)) {
      for (const line of trimmed.split("\n")) {
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
  const outreach = gig.content.outreach;
  const leads = gig.content.leadStrategy;
  const cur = gig.input.pricingCurrency;

  const children: Array<Paragraph | Table> = [];

  children.push(
    ...titleBlock(
      c?.title || gig.title || gig.input.serviceName,
      `${gig.input.platform.toUpperCase()}  •  ${gig.input.niche}  •  ${gig.input.targetAudience}`,
      GIG_THEME,
    ),
  );

  if (gig.score) {
    children.push(heading2("Gig Score", GIG_THEME));
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
      children.push(heading3("Suggestions"));
      gig.score.suggestions.forEach((s) => children.push(bullet(s)));
    }
  }

  if (c) {
    if (c.tags.length) {
      children.push(heading3("Tags"));
      children.push(p(c.tags.join(", ")));
    }
    if (c.seoKeywords.length) {
      children.push(heading3("SEO keywords"));
      children.push(p(c.seoKeywords.join(", ")));
    }

    children.push(heading2("Description", GIG_THEME));
    for (const para of descriptionParagraphs(c.description)) children.push(para);

    children.push(heading2("Packages", GIG_THEME));
    children.push(
      comparisonTable(
        (["basic", "standard", "premium"] as const).map((key) => {
          const pkg = c.packages[key];
          const lines = [
            `${pkg.price} ${cur}`,
            `${pkg.deliveryDays} day(s)`,
            `${pkg.revisions} revision(s)`,
            "",
            "Deliverables:",
            ...pkg.deliverables.filter(Boolean).map((d) => `• ${d}`),
          ];
          if (pkg.addOns.filter(Boolean).length) {
            lines.push("", "Add-ons:", ...pkg.addOns.filter(Boolean).map((a) => `• ${a}`));
          }
          return { title: pkg.name || key.toUpperCase(), lines };
        }),
        GIG_THEME,
      ),
    );

    if (c.buyerRequirements.length) {
      children.push(heading2("Buyer Requirements", GIG_THEME));
      c.buyerRequirements.forEach((r, i) => children.push(numbered(r, i)));
    }

    if (c.faqs.length) {
      children.push(heading2("FAQs", GIG_THEME));
      for (const f of c.faqs) {
        children.push(heading3(f.question));
        children.push(p(f.answer));
      }
    }

    if (c.addOnServices.length) {
      children.push(heading2("Add-On Services", GIG_THEME));
      for (const a of c.addOnServices) {
        children.push(heading3(`${a.name} — ${a.price} ${cur}`));
        children.push(p(a.description));
      }
    }

    if (safe(c.thumbnailConcept) || safe(c.thumbnailPrompt)) {
      children.push(heading2("Thumbnail", GIG_THEME));
      if (safe(c.thumbnailConcept)) {
        children.push(heading3("Concept"));
        children.push(p(c.thumbnailConcept));
      }
      if (safe(c.thumbnailPrompt)) {
        children.push(heading3("Image prompt"));
        children.push(p(c.thumbnailPrompt));
      }
    }

    if (c.portfolioSampleIdeas.length) {
      children.push(heading2("Portfolio Sample Ideas", GIG_THEME));
      c.portfolioSampleIdeas.forEach((s, i) => children.push(numbered(s, i)));
    }
  }

  if (leads) {
    children.push(heading2("Lead Strategy", GIG_THEME));
    if (leads.bestLeadTypes.length) {
      children.push(heading3("Best lead types"));
      leads.bestLeadTypes.forEach((t) => children.push(bullet(t)));
    }
    if (leads.targetIndustries.length) {
      children.push(heading3("Target industries"));
      leads.targetIndustries.forEach((t) => children.push(bullet(t)));
    }
    if (leads.googleQueries.length) {
      children.push(heading3("Google search queries"));
      leads.googleQueries.forEach((q) => children.push(bullet(q)));
    }
    if (safe(leads.manualStrategy)) {
      children.push(heading3("Manual strategy"));
      children.push(p(leads.manualStrategy));
    }
  }

  if (outreach) {
    children.push(heading2("Outreach", GIG_THEME));
    children.push(heading3(`Cold email — ${outreach.coldEmail.subject}`));
    children.push(bodyMultiline(outreach.coldEmail.body));
    children.push(heading3("Instagram DM"));
    children.push(bodyMultiline(outreach.instagramDm));
    children.push(heading3("LinkedIn message"));
    children.push(bodyMultiline(outreach.linkedinMessage));
    children.push(heading3("Short pitch"));
    children.push(bodyMultiline(outreach.shortPitch));
    children.push(heading3("Follow-up"));
    children.push(bodyMultiline(outreach.followUpMessage));
    children.push(heading3("Proposal"));
    children.push(bodyMultiline(outreach.proposalMessage));
  }

  const doc = buildBrandedDocx({
    title: gig.title || gig.input.serviceName,
    creator: "GigLead AI",
    children,
  });

  return Packer.toBuffer(doc);
}
