import { Packer, Paragraph, Table, TextRun } from "docx";
import type { GrowthReportDocument, ReportSections } from "../../models/GrowthReport.model.js";
import {
  buildBrandedDocx,
  titleBlock,
  heading2,
  heading3,
  body as p,
  bodyMultiline,
  numbered,
  themedTable,
} from "../shared/docxDesign.js";

const REPORT_THEME = "#4F46E5";

const SECTION_LABELS: Record<keyof ReportSections, string> = {
  shortSummary: "Short summary",
  earningPotentialOverview: "Earning potential overview",
  whoWillPay: "Who will pay",
  bestWaysToEarn: "Best ways to earn",
  pricingOfferIdeas: "Pricing & offer ideas",
  stepByStepPlan: "Step-by-step plan",
  seoContentIdeas: "SEO & content ideas",
  marketingChannels: "Marketing channels",
  conversionImprovements: "Conversion improvements",
  roadmap: "Roadmap",
  revenuePotential: "Revenue potential",
  firstActionsToday: "First actions to take today",
};

const SECTION_ORDER: (keyof ReportSections)[] = [
  "shortSummary",
  "earningPotentialOverview",
  "whoWillPay",
  "bestWaysToEarn",
  "pricingOfferIdeas",
  "stepByStepPlan",
  "seoContentIdeas",
  "marketingChannels",
  "conversionImprovements",
  "roadmap",
  "revenuePotential",
  "firstActionsToday",
];

export async function renderReportDocx(report: GrowthReportDocument): Promise<Buffer> {
  const content = report.content;
  const title = content?.websiteTitle || report.hostname || "Growth Report";
  const children: Array<Paragraph | Table> = [];

  children.push(
    ...titleBlock(
      title,
      [report.websiteUrl, content?.detectedGenre, content?.industry].filter(Boolean).join("  •  "),
      REPORT_THEME,
    ),
  );

  if (content) {
    children.push(bodyMultiline(content.summary));

    children.push(heading2("Scores", REPORT_THEME));
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `Overall ${content.scores.overall}/100`, bold: true, size: 24, color: hexNoHash(REPORT_THEME) }),
        ],
      }),
    );
    children.push(
      p(
        `SEO ${content.scores.seo}  ·  Conversion ${content.scores.conversion}  ·  Branding ${content.scores.branding}  ·  Marketing ${content.scores.marketing}`,
      ),
    );

    children.push(heading2("Primary Monetization Path", REPORT_THEME));
    children.push(heading3(content.monetizationStrategy.primaryPath));
    children.push(bodyMultiline(content.monetizationStrategy.reasoning));

    if (content.monetizationStreams.length) {
      children.push(heading2("Revenue Streams", REPORT_THEME));
      children.push(
        themedTable(
          ["Stream", "Effort", "Time", "Potential", "Fit"],
          content.monetizationStreams.map((s) => [
            `${s.name}\n${s.description}`,
            s.setupEffort,
            s.timeToFirstRevenue,
            s.monthlyRevenuePotential,
            `${s.fitScore}/100`,
          ]),
          REPORT_THEME,
          [40, 13, 16, 19, 12],
        ),
      );
    }

    for (const key of SECTION_ORDER) {
      const value = content.sections[key];
      if (!value || !value.trim()) continue;
      children.push(heading2(SECTION_LABELS[key], REPORT_THEME));
      children.push(bodyMultiline(value));
    }

    if (content.topRecommendations.length) {
      children.push(heading2("Top Recommendations", REPORT_THEME));
      content.topRecommendations.forEach((r, i) => children.push(numbered(r, i)));
    }
  } else {
    children.push(p("No report content available yet."));
  }

  const doc = buildBrandedDocx({ title, creator: "Growth Report", children });
  return Packer.toBuffer(doc);
}

function hexNoHash(color: string): string {
  return color.replace(/^#/, "");
}
