import type { ReactElement } from "react";
import type { Style } from "@react-pdf/types";
import type { GrowthReportDocument, ReportContent, ReportSections } from "../../models/GrowthReport.model.js";
import {
  makeStyles,
  renderBrandedPdf,
  sectionHeader,
  numberedList,
  simpleTable,
  text,
  view,
  safe,
} from "../shared/pdfDesign.js";

const REPORT_THEME = "#4F46E5"; // indigo

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

function scoreCards(styles: ReturnType<typeof makeStyles>, content: ReportContent): ReactElement {
  const cards: Array<[string, number]> = [
    ["SEO", content.scores.seo],
    ["Conversion", content.scores.conversion],
    ["Branding", content.scores.branding],
    ["Marketing", content.scores.marketing],
  ];
  const cardStyle: Style = {
    width: "23%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 5,
    padding: 8,
    alignItems: "center",
  };
  const els = cards.map(([label, value]) =>
    view(
      cardStyle,
      text({ fontSize: 18, fontWeight: 700, color: REPORT_THEME } as Style, `${value}`),
      text({ fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 } as Style, label),
    ),
  );
  return view({ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 } as Style, ...els);
}

export async function renderReportPdf(report: GrowthReportDocument): Promise<Buffer> {
  const content = report.content;
  const styles = makeStyles(REPORT_THEME);
  const title = content?.websiteTitle || report.hostname || "Growth Report";

  const body: ReactElement[] = [];

  if (content) {
    // Scores
    body.push(sectionHeader(styles, "Scores"));
    body.push(scoreCards(styles, content));

    // Summary
    body.push(sectionHeader(styles, "Summary"));
    body.push(text(styles.body, content.summary));

    // Primary monetization path
    body.push(sectionHeader(styles, "Primary Monetization Path"));
    body.push(text(styles.h3, content.monetizationStrategy.primaryPath));
    body.push(text(styles.body, content.monetizationStrategy.reasoning));

    // Revenue streams table
    if (content.monetizationStreams.length) {
      body.push(sectionHeader(styles, "Revenue Streams"));
      body.push(
        simpleTable(
          styles,
          ["Stream", "Effort", "Time", "Potential", "Fit"],
          content.monetizationStreams.map((s) => [
            `${s.name}\n${s.description}`,
            s.setupEffort,
            s.timeToFirstRevenue,
            s.monthlyRevenuePotential,
            `${s.fitScore}/100`,
          ]),
          ["40%", "13%", "16%", "19%", "12%"],
        ),
      );
    }

    // Sections
    for (const key of SECTION_ORDER) {
      const value = content.sections[key];
      if (!safe(value)) continue;
      body.push(sectionHeader(styles, SECTION_LABELS[key]));
      body.push(text(styles.body, value));
    }

    // Recommendations
    if (content.topRecommendations.length) {
      body.push(sectionHeader(styles, "Top Recommendations"));
      body.push(...numberedList(styles, content.topRecommendations));
    }
  } else {
    body.push(text(styles.body, "No report content available yet."));
  }

  const metaLine = [report.websiteUrl, content?.detectedGenre, content?.industry]
    .filter((v) => safe(v as string))
    .join("   ·   ");

  return renderBrandedPdf({
    title,
    author: "Growth Report",
    themeColor: REPORT_THEME,
    cover: {
      title,
      meta: metaLine,
      score: content?.scores.overall ?? null,
      scoreLabel: "Overall",
    },
    body,
  });
}
