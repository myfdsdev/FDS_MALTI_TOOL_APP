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
import type { GigDocument } from "../../models/Gig.model.js";

Font.registerHyphenationCallback((word) => [word]);

const e = createElement;

type S = Style | Style[];

const view = (style: S, ...children: unknown[]): ReactElement =>
  e(View, { style }, ...(children as ReactElement[]));
const text = (style: S, value: string | null | undefined): ReactElement =>
  e(Text, { style }, (value || "").toString());

const safe = (v: string | null | undefined): string => (v || "").trim();

const PRIMARY = "#0f766e"; // teal
const ACCENT = "#0ea5e9";
const MUTED = "#6b7280";
const TEXT = "#1f2937";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10.5, color: TEXT, lineHeight: 1.45 },
  h1: { fontSize: 22, fontWeight: 700, color: PRIMARY, marginBottom: 4 },
  h2: { fontSize: 14, fontWeight: 700, color: PRIMARY, marginTop: 14, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  h3: { fontSize: 12, fontWeight: 700, marginTop: 8, marginBottom: 4 },
  body: { fontSize: 10.5, marginBottom: 4 },
  small: { fontSize: 9, color: MUTED, marginBottom: 4 },
  bullet: { fontSize: 10.5, marginLeft: 12, marginBottom: 2 },
  scoreBox: { padding: 12, backgroundColor: "#ecfeff", borderLeft: `3pt solid ${ACCENT}`, marginBottom: 12 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  pkgGrid: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  pkg: { width: "31%", padding: 10, backgroundColor: "#f9fafb", borderTop: `2pt solid ${PRIMARY}` },
  pkgName: { fontSize: 11, fontWeight: 700, color: PRIMARY, marginBottom: 4 },
  pkgPrice: { fontSize: 14, fontWeight: 700, marginBottom: 6 },
  pkgMeta: { fontSize: 9, color: MUTED, marginBottom: 4 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  tag: { fontSize: 9, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#e0f2fe", color: "#0369a1", marginRight: 4, marginBottom: 4, borderRadius: 2 },
});

function bulletList(items: string[]): ReactElement[] {
  return items.filter((i) => safe(i)).map((i) => text(styles.bullet, `• ${i}`));
}

function renderPage1(gig: GigDocument): ReactElement {
  const content = gig.content.gig;
  const score = gig.score;
  const kids: ReactElement[] = [];

  kids.push(text(styles.h1, content?.title || gig.title || gig.input.serviceName));
  kids.push(text(styles.small, `Platform: ${gig.input.platform.toUpperCase()}   •   Niche: ${gig.input.niche}   •   Audience: ${gig.input.targetAudience}`));

  if (score) {
    const scoreKids: ReactElement[] = [
      view(
        styles.scoreRow,
        text({ fontWeight: 700, fontSize: 12 } as Style, "Overall Gig Score"),
        text({ fontWeight: 700, fontSize: 14, color: PRIMARY } as Style, `${score.overall}/100`)
      ),
    ];
    const dims = score.breakdown;
    const rows: [string, number][] = [
      ["Title clarity", dims.titleClarity],
      ["Niche focus", dims.nicheFocus],
      ["Buyer benefit", dims.buyerBenefit],
      ["Pricing strength", dims.pricingStrength],
      ["Keyword quality", dims.keywordQuality],
      ["Description quality", dims.descriptionQuality],
      ["Trust factor", dims.trustFactor],
      ["CTA strength", dims.ctaStrength],
    ];
    for (const [label, value] of rows) {
      scoreKids.push(
        view(
          styles.scoreRow,
          text({ fontSize: 10 } as Style, label),
          text({ fontSize: 10, fontWeight: 700 } as Style, String(value))
        )
      );
    }
    kids.push(view(styles.scoreBox, ...scoreKids));

    if (score.suggestions.length) {
      kids.push(text(styles.h2, "Suggestions"));
      score.suggestions.forEach((s) => kids.push(text(styles.bullet, `• ${s}`)));
    }
  }

  if (content) {
    kids.push(text(styles.h2, "Summary"));
    kids.push(
      text(
        styles.body,
        `Category: ${content.category || "—"}\nDelivery: ${gig.input.deliveryTime}\nPricing: ${gig.input.pricingMin}-${gig.input.pricingMax} ${gig.input.pricingCurrency}`
      )
    );

    if (content.tags.length) {
      kids.push(text(styles.h3, "Tags"));
      kids.push(
        view(styles.tagRow, ...content.tags.map((t) => text(styles.tag, t)))
      );
    }
  }

  return e(Page, { size: "A4", style: styles.page }, ...kids);
}

function renderDescriptionAndPackages(gig: GigDocument): ReactElement {
  const content = gig.content.gig;
  const kids: ReactElement[] = [];
  if (!content) {
    kids.push(text(styles.body, "No gig content available yet."));
    return e(Page, { size: "A4", style: styles.page }, ...kids);
  }

  kids.push(text(styles.h2, "Description"));
  // Render description paragraphs by splitting on blank lines.
  const paragraphs = content.description.split(/\n{2,}/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (/^#{1,3}\s+/.test(trimmed)) {
      kids.push(text(styles.h3, trimmed.replace(/^#{1,3}\s+/, "")));
    } else if (/(^|\n)\s*([-*•+])\s+/.test(trimmed)) {
      const lines = trimmed.split("\n");
      for (const line of lines) {
        const m = line.match(/^\s*[-*•+]\s+(.*)$/);
        if (m) kids.push(text(styles.bullet, `• ${m[1]}`));
        else if (line.trim()) kids.push(text(styles.body, line.trim()));
      }
    } else {
      kids.push(text(styles.body, trimmed));
    }
  }

  kids.push(text(styles.h2, "Packages"));
  const pkgList: Array<["basic" | "standard" | "premium"]> = [["basic"], ["standard"], ["premium"]];
  const pkgKids = pkgList.map(([key]) => {
    const p = content.packages[key];
    return view(
      styles.pkg,
      text(styles.pkgName, p.name || key.toUpperCase()),
      text(styles.pkgPrice, `${p.price} ${gig.input.pricingCurrency}`),
      text(styles.pkgMeta, `${p.deliveryDays} day(s)   •   ${p.revisions} revision(s)`),
      ...bulletList(p.deliverables)
    );
  });
  kids.push(view(styles.pkgGrid, ...pkgKids));

  return e(Page, { size: "A4", style: styles.page }, ...kids);
}

function renderExtras(gig: GigDocument): ReactElement {
  const content = gig.content.gig;
  const kids: ReactElement[] = [];
  if (!content) {
    kids.push(text(styles.body, "No gig content available yet."));
    return e(Page, { size: "A4", style: styles.page }, ...kids);
  }

  if (content.faqs.length) {
    kids.push(text(styles.h2, "FAQs"));
    for (const f of content.faqs) {
      kids.push(text(styles.h3, f.question));
      kids.push(text(styles.body, f.answer));
    }
  }

  if (content.buyerRequirements.length) {
    kids.push(text(styles.h2, "Buyer Requirements"));
    bulletList(content.buyerRequirements).forEach((b) => kids.push(b));
  }

  if (content.addOnServices.length) {
    kids.push(text(styles.h2, "Add-On Services"));
    for (const a of content.addOnServices) {
      kids.push(text(styles.h3, `${a.name} — ${a.price} ${gig.input.pricingCurrency}`));
      kids.push(text(styles.body, a.description));
    }
  }

  if (safe(content.thumbnailConcept) || safe(content.thumbnailPrompt)) {
    kids.push(text(styles.h2, "Thumbnail"));
    if (safe(content.thumbnailConcept)) {
      kids.push(text(styles.h3, "Concept"));
      kids.push(text(styles.body, content.thumbnailConcept));
    }
    if (safe(content.thumbnailPrompt)) {
      kids.push(text(styles.h3, "Image prompt"));
      kids.push(text(styles.body, content.thumbnailPrompt));
    }
  }

  if (content.portfolioSampleIdeas.length) {
    kids.push(text(styles.h2, "Portfolio Sample Ideas"));
    bulletList(content.portfolioSampleIdeas).forEach((b) => kids.push(b));
  }

  return e(Page, { size: "A4", style: styles.page }, ...kids);
}

function renderLeadsAndOutreach(gig: GigDocument): ReactElement {
  const leads = gig.content.leadStrategy;
  const outreach = gig.content.outreach;
  const kids: ReactElement[] = [];

  if (leads) {
    kids.push(text(styles.h2, "Lead Strategy"));

    kids.push(text(styles.h3, "Best lead types"));
    bulletList(leads.bestLeadTypes).forEach((b) => kids.push(b));

    kids.push(text(styles.h3, "Target industries"));
    bulletList(leads.targetIndustries).forEach((b) => kids.push(b));

    kids.push(text(styles.h3, "Google search queries"));
    bulletList(leads.googleQueries).forEach((b) => kids.push(b));

    kids.push(text(styles.h3, "Instagram search terms"));
    bulletList(leads.instagramSearchTerms).forEach((b) => kids.push(b));

    kids.push(text(styles.h3, "LinkedIn search terms"));
    bulletList(leads.linkedinSearchTerms).forEach((b) => kids.push(b));

    kids.push(text(styles.h3, "Google Maps search terms"));
    bulletList(leads.googleMapsSearchTerms).forEach((b) => kids.push(b));

    kids.push(text(styles.h3, "Manual strategy"));
    kids.push(text(styles.body, leads.manualStrategy));
  }

  if (outreach) {
    kids.push(text(styles.h2, "Outreach"));

    kids.push(text(styles.h3, `Cold email — ${outreach.coldEmail.subject}`));
    kids.push(text(styles.body, outreach.coldEmail.body));

    kids.push(text(styles.h3, "Instagram DM"));
    kids.push(text(styles.body, outreach.instagramDm));

    kids.push(text(styles.h3, "LinkedIn message"));
    kids.push(text(styles.body, outreach.linkedinMessage));

    kids.push(text(styles.h3, "Short pitch"));
    kids.push(text(styles.body, outreach.shortPitch));

    kids.push(text(styles.h3, "Follow-up"));
    kids.push(text(styles.body, outreach.followUpMessage));

    kids.push(text(styles.h3, "Proposal"));
    kids.push(text(styles.body, outreach.proposalMessage));
  }

  if (!leads && !outreach) {
    kids.push(text(styles.body, "No lead or outreach content available yet."));
  }

  return e(Page, { size: "A4", style: styles.page }, ...kids);
}

export async function renderGigPdf(gig: GigDocument): Promise<Buffer> {
  const doc = e(
    Document,
    { title: gig.title || gig.input.serviceName, author: "GigLead AI" },
    renderPage1(gig),
    renderDescriptionAndPackages(gig),
    renderExtras(gig),
    renderLeadsAndOutreach(gig)
  );
  return renderToBuffer(doc);
}
