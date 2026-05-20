import type { ReactElement } from "react";
import type { Style } from "@react-pdf/types";
import type { GigDocument } from "../../models/Gig.model.js";
import {
  makeStyles,
  renderBrandedPdf,
  sectionHeader,
  bulletList,
  numberedList,
  tagRow,
  keyValueGrid,
  scoreBars,
  comparisonCards,
  text,
  view,
  safe,
  type ComparisonCard,
} from "../shared/pdfDesign.js";

const GIG_THEME = "#0f766e"; // teal

function descriptionElements(styles: ReturnType<typeof makeStyles>, description: string): ReactElement[] {
  const out: ReactElement[] = [];
  const paragraphs = description.split(/\n{2,}/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (/^#{1,3}\s+/.test(trimmed)) {
      out.push(text(styles.h3, trimmed.replace(/^#{1,3}\s+/, "")));
    } else if (/(^|\n)\s*([-*•+])\s+/.test(trimmed)) {
      for (const line of trimmed.split("\n")) {
        const m = line.match(/^\s*[-*•+]\s+(.*)$/);
        if (m) out.push(text(styles.bullet, `• ${m[1]}`));
        else if (line.trim()) out.push(text(styles.body, line.trim()));
      }
    } else {
      out.push(text(styles.body, trimmed));
    }
  }
  return out;
}

export async function renderGigPdf(gig: GigDocument): Promise<Buffer> {
  const styles = makeStyles(GIG_THEME);
  const content = gig.content.gig;
  const outreach = gig.content.outreach;
  const leads = gig.content.leadStrategy;
  const score = gig.score;
  const cur = gig.input.pricingCurrency;

  const body: ReactElement[] = [];

  // ── Score breakdown ───────────────────────────────────────────────────────
  if (score) {
    body.push(sectionHeader(styles, "Gig Score"));
    body.push(
      scoreBars(styles, GIG_THEME, [
        ["Title clarity", score.breakdown.titleClarity],
        ["Niche focus", score.breakdown.nicheFocus],
        ["Buyer benefit", score.breakdown.buyerBenefit],
        ["Pricing strength", score.breakdown.pricingStrength],
        ["Keyword quality", score.breakdown.keywordQuality],
        ["Description quality", score.breakdown.descriptionQuality],
        ["Trust factor", score.breakdown.trustFactor],
        ["CTA strength", score.breakdown.ctaStrength],
      ], 15),
    );
    if (score.suggestions.length) {
      body.push(text(styles.h3, "Suggestions"));
      body.push(...bulletList(styles, score.suggestions));
    }
  }

  // ── Summary + tags ──────────────────────────────────────────────────────--
  body.push(sectionHeader(styles, "Summary"));
  body.push(
    keyValueGrid(styles, [
      ["Platform", gig.input.platform.toUpperCase()],
      ["Category", content?.category || "—"],
      ["Niche", gig.input.niche],
      ["Audience", gig.input.targetAudience],
      ["Delivery", gig.input.deliveryTime],
      ["Pricing", `${gig.input.pricingMin}–${gig.input.pricingMax} ${cur}`],
    ]),
  );
  if (content?.tags.length) {
    body.push(text(styles.h3, "Tags"));
    body.push(tagRow(styles, content.tags));
  }

  if (content) {
    // ── Description ───────────────────────────────────────────────────────--
    body.push(sectionHeader(styles, "Description"));
    body.push(...descriptionElements(styles, content.description));

    // ── Packages (comparison cards) ──────────────────────────────────────---
    body.push(sectionHeader(styles, "Packages"));
    const cards: ComparisonCard[] = (["basic", "standard", "premium"] as const).map((key) => {
      const p = content.packages[key];
      const lines = [...p.deliverables.filter(Boolean)];
      if (p.addOns.filter(Boolean).length) {
        lines.push(...p.addOns.filter(Boolean).map((a) => `+ ${a}`));
      }
      return {
        name: p.name || key.toUpperCase(),
        price: `${p.price} ${cur}`,
        meta: `${p.deliveryDays} day(s) · ${p.revisions} revision(s)`,
        lines,
        highlight: key === "premium",
        ribbon: key === "premium" ? "Most popular" : undefined,
      };
    });
    body.push(comparisonCards(styles, cards));

    // ── Requirements ─────────────────────────────────────────────────────---
    if (content.buyerRequirements.length) {
      body.push(sectionHeader(styles, "Buyer Requirements"));
      body.push(...numberedList(styles, content.buyerRequirements));
    }

    // ── FAQs ──────────────────────────────────────────────────────────────--
    if (content.faqs.length) {
      body.push(sectionHeader(styles, "FAQs"));
      for (const f of content.faqs) {
        body.push(text(styles.h3, f.question));
        body.push(text(styles.body, f.answer));
      }
    }

    // ── Add-ons ───────────────────────────────────────────────────────────--
    if (content.addOnServices.length) {
      body.push(sectionHeader(styles, "Add-On Services"));
      for (const a of content.addOnServices) {
        body.push(text(styles.h3, `${a.name} — ${a.price} ${cur}`));
        body.push(text(styles.body, a.description));
      }
    }

    // ── Thumbnail ─────────────────────────────────────────────────────────--
    if (safe(content.thumbnailConcept) || safe(content.thumbnailPrompt)) {
      body.push(sectionHeader(styles, "Thumbnail"));
      if (safe(content.thumbnailConcept)) {
        body.push(text(styles.h3, "Concept"));
        body.push(text(styles.body, content.thumbnailConcept));
      }
      if (safe(content.thumbnailPrompt)) {
        body.push(text(styles.h3, "Image prompt"));
        body.push(view([styles.body, { fontFamily: "Courier", fontSize: 9.5 } as Style], text({}, content.thumbnailPrompt)));
      }
    }

    // ── Portfolio ideas ───────────────────────────────────────────────────--
    if (content.portfolioSampleIdeas.length) {
      body.push(sectionHeader(styles, "Portfolio Sample Ideas"));
      body.push(...numberedList(styles, content.portfolioSampleIdeas));
    }
  }

  // ── Lead strategy ───────────────────────────────────────────────────────--
  if (leads) {
    body.push(sectionHeader(styles, "Lead Strategy"));
    if (leads.bestLeadTypes.length) {
      body.push(text(styles.h3, "Best lead types"));
      body.push(...bulletList(styles, leads.bestLeadTypes));
    }
    if (leads.targetIndustries.length) {
      body.push(text(styles.h3, "Target industries"));
      body.push(...bulletList(styles, leads.targetIndustries));
    }
    if (leads.googleQueries.length) {
      body.push(text(styles.h3, "Google search queries"));
      body.push(...bulletList(styles, leads.googleQueries));
    }
    if (safe(leads.manualStrategy)) {
      body.push(text(styles.h3, "Manual strategy"));
      body.push(text(styles.body, leads.manualStrategy));
    }
  }

  // ── Outreach ────────────────────────────────────────────────────────────--
  if (outreach) {
    body.push(sectionHeader(styles, "Outreach"));
    body.push(text(styles.h3, `Cold email — ${outreach.coldEmail.subject}`));
    body.push(text(styles.body, outreach.coldEmail.body));
    body.push(text(styles.h3, "Instagram DM"));
    body.push(text(styles.body, outreach.instagramDm));
    body.push(text(styles.h3, "LinkedIn message"));
    body.push(text(styles.body, outreach.linkedinMessage));
    body.push(text(styles.h3, "Short pitch"));
    body.push(text(styles.body, outreach.shortPitch));
    body.push(text(styles.h3, "Follow-up"));
    body.push(text(styles.body, outreach.followUpMessage));
    body.push(text(styles.h3, "Proposal"));
    body.push(text(styles.body, outreach.proposalMessage));
  }

  return renderBrandedPdf({
    title: gig.title || gig.input.serviceName,
    author: "GigLead AI",
    themeColor: GIG_THEME,
    cover: {
      title: content?.title || gig.title || gig.input.serviceName,
      meta: `${gig.input.platform.toUpperCase()}   ·   ${gig.input.niche}   ·   ${gig.input.targetAudience}`,
      score: score?.overall ?? null,
      scoreLabel: "Score",
    },
    body,
  });
}
