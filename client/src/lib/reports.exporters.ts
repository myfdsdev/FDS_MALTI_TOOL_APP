import ExcelJS from "exceljs";
import pptxgen from "pptxgenjs";
import DOMPurify from "dompurify";
import { api } from "./api";
import type { ReportContent, ReportSections } from "@/types/reports";
import { SECTION_LABELS, SECTION_ORDER } from "@/types/reports";

export interface Branding {
  name: string;
  color: string; // hex with leading #
}

const DEFAULT_BRANDING: Branding = {
  name: "Multi-Tool AI SaaS",
  color: "#4F46E5",
};

function hexNoHash(color: string): string {
  return color.replace(/^#/, "");
}

function safeFilename(value: string, ext: string): string {
  const cleaned = (value || "growth-report")
    .replace(/[^a-z0-9-_ ]/gi, "")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "growth-report";
  return `${cleaned}.${ext}`;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sectionsList(sections: ReportSections): { label: string; body: string }[] {
  return SECTION_ORDER.map((key) => ({
    label: SECTION_LABELS[key],
    body: sections[key] || "",
  }));
}

// ─── TXT ───────────────────────────────────────────────────────────────────
export function exportTxt(content: ReportContent, websiteUrl: string, branding: Branding = DEFAULT_BRANDING): void {
  const lines: string[] = [];
  const div = (ch = "─", n = 60) => ch.repeat(n);

  lines.push(`${branding.name} — Growth Report`);
  lines.push(div());
  lines.push(`Website: ${websiteUrl}`);
  lines.push(`Title: ${content.websiteTitle}`);
  lines.push(`Detected genre: ${content.detectedGenre}`);
  lines.push(`Industry: ${content.industry}`);
  lines.push(`Audience: ${content.audience}`);
  lines.push("");
  lines.push("Summary:");
  lines.push(content.summary);
  lines.push("");
  lines.push("Scores:");
  lines.push(`  Overall: ${content.scores.overall}/100`);
  lines.push(`  SEO: ${content.scores.seo}/100`);
  lines.push(`  Conversion: ${content.scores.conversion}/100`);
  lines.push(`  Branding: ${content.scores.branding}/100`);
  lines.push(`  Marketing: ${content.scores.marketing}/100`);
  lines.push("");
  lines.push("Primary monetization path:");
  lines.push(`  ${content.monetizationStrategy.primaryPath}`);
  lines.push(`  Reasoning: ${content.monetizationStrategy.reasoning}`);
  lines.push("");
  lines.push("Revenue streams:");
  for (const s of content.monetizationStreams) {
    lines.push(`  • ${s.name} (fit ${s.fitScore}/100)`);
    lines.push(`      ${s.description}`);
    lines.push(`      Effort: ${s.setupEffort}  ·  Time: ${s.timeToFirstRevenue}  ·  Potential: ${s.monthlyRevenuePotential}`);
  }
  lines.push("");
  lines.push(div());
  for (const section of sectionsList(content.sections)) {
    lines.push(section.label);
    lines.push(div("·", 40));
    lines.push(section.body);
    lines.push("");
  }
  lines.push(div());
  lines.push("Top recommendations:");
  content.topRecommendations.forEach((rec, i) => lines.push(`  ${i + 1}. ${rec}`));

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  triggerBlobDownload(blob, safeFilename(content.websiteTitle || "growth-report", "txt"));
}

// ─── CSV ───────────────────────────────────────────────────────────────────
function csvCell(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportCsv(content: ReportContent, websiteUrl: string): void {
  const rows: string[][] = [];
  rows.push(["Section", "Value"]);
  rows.push(["Website URL", websiteUrl]);
  rows.push(["Website title", content.websiteTitle]);
  rows.push(["Detected genre", content.detectedGenre]);
  rows.push(["Industry", content.industry]);
  rows.push(["Audience", content.audience]);
  rows.push(["Summary", content.summary]);
  rows.push(["Score: overall", String(content.scores.overall)]);
  rows.push(["Score: SEO", String(content.scores.seo)]);
  rows.push(["Score: conversion", String(content.scores.conversion)]);
  rows.push(["Score: branding", String(content.scores.branding)]);
  rows.push(["Score: marketing", String(content.scores.marketing)]);
  rows.push(["Primary path", content.monetizationStrategy.primaryPath]);
  rows.push(["Primary reasoning", content.monetizationStrategy.reasoning]);
  rows.push([]);
  rows.push(["Stream", "Description", "Setup effort", "Time to revenue", "Monthly potential", "Fit score"]);
  for (const s of content.monetizationStreams) {
    rows.push([s.name, s.description, s.setupEffort, s.timeToFirstRevenue, s.monthlyRevenuePotential, String(s.fitScore)]);
  }
  rows.push([]);
  rows.push(["Section heading", "Body"]);
  for (const section of sectionsList(content.sections)) {
    rows.push([section.label, section.body]);
  }
  rows.push([]);
  rows.push(["Recommendation"]);
  content.topRecommendations.forEach((rec) => rows.push([rec]));

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerBlobDownload(blob, safeFilename(content.websiteTitle || "growth-report", "csv"));
}

// ─── HTML ──────────────────────────────────────────────────────────────────
export function exportHtml(content: ReportContent, websiteUrl: string, branding: Branding = DEFAULT_BRANDING): void {
  const themeColor = branding.color;
  const sectionHtml = sectionsList(content.sections)
    .map((s) => `
      <section>
        <h2>${escapeHtml(s.label)}</h2>
        <p>${escapeHtml(s.body).replace(/\n/g, "<br/>")}</p>
      </section>`)
    .join("\n");

  const streamsHtml = content.monetizationStreams
    .map((s) => `
      <tr>
        <td><strong>${escapeHtml(s.name)}</strong><br/><span class="muted">${escapeHtml(s.description)}</span></td>
        <td>${escapeHtml(s.setupEffort)}</td>
        <td>${escapeHtml(s.timeToFirstRevenue)}</td>
        <td>${escapeHtml(s.monthlyRevenuePotential)}</td>
        <td>${s.fitScore}/100</td>
      </tr>`)
    .join("");

  const recsHtml = content.topRecommendations
    .map((r) => `<li>${escapeHtml(r)}</li>`)
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(content.websiteTitle || "Growth Report")} — Growth Report</title>
<style>
  :root { color-scheme: light; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; margin: 0; color: #1f2937; line-height: 1.6; }
  .cover { background: ${themeColor}; color: #fff; padding: 36px 24px; }
  .cover-inner { max-width: 800px; margin: 0 auto; }
  .cover h1 { color: #fff; font-size: 28px; margin: 0 0 6px; }
  .cover .meta { color: #fff; opacity: 0.9; font-size: 14px; }
  .wrap { max-width: 800px; margin: 32px auto; padding: 0 24px; }
  h1 { color: ${themeColor}; font-size: 28px; margin-bottom: 4px; }
  h2 { color: ${themeColor}; margin-top: 28px; font-size: 18px; border-bottom: 1px solid ${themeColor}33; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .muted { color: #6b7280; font-size: 0.9em; }
  .scores { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 16px 0; }
  .scoreCard { border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; text-align: center; }
  .scoreCard b { color: ${themeColor}; font-size: 22px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  th { background: ${themeColor}11; color: ${themeColor}; }
  ul { padding-left: 20px; }
  footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.85em; }
</style>
</head>
<body>
  <header class="cover">
    <div class="cover-inner">
      <h1>${escapeHtml(content.websiteTitle || "Growth Report")}</h1>
      <div class="meta">${escapeHtml(websiteUrl)} · ${escapeHtml(content.detectedGenre)} · ${escapeHtml(content.industry)} · Overall ${content.scores.overall}/100</div>
    </div>
  </header>
  <div class="wrap">
  <p>${escapeHtml(content.summary)}</p>

  <h2>Scores</h2>
  <div class="scores">
    <div class="scoreCard"><b>${content.scores.overall}</b><div class="muted">Overall</div></div>
    <div class="scoreCard"><b>${content.scores.seo}</b><div class="muted">SEO</div></div>
    <div class="scoreCard"><b>${content.scores.conversion}</b><div class="muted">Conversion</div></div>
    <div class="scoreCard"><b>${content.scores.branding}</b><div class="muted">Branding</div></div>
    <div class="scoreCard"><b>${content.scores.marketing}</b><div class="muted">Marketing</div></div>
  </div>

  <h2>Primary monetization path</h2>
  <p><strong>${escapeHtml(content.monetizationStrategy.primaryPath)}</strong></p>
  <p>${escapeHtml(content.monetizationStrategy.reasoning)}</p>

  <h2>Revenue streams</h2>
  <table>
    <thead><tr><th>Stream</th><th>Effort</th><th>Time</th><th>Potential</th><th>Fit</th></tr></thead>
    <tbody>${streamsHtml}</tbody>
  </table>

  ${sectionHtml}

  <h2>Top recommendations</h2>
  <ul>${recsHtml}</ul>

  <footer>Generated by ${escapeHtml(branding.name)}</footer>
  </div>
</body>
</html>`;

  const safe = DOMPurify.sanitize(html, { WHOLE_DOCUMENT: true, RETURN_TRUSTED_TYPE: false });
  const blob = new Blob([safe], { type: "text/html;charset=utf-8" });
  triggerBlobDownload(blob, safeFilename(content.websiteTitle || "growth-report", "html"));
}

function escapeHtml(s: string): string {
  return (s || "").replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return ch;
    }
  });
}

// ─── XLSX ──────────────────────────────────────────────────────────────────
export async function exportXlsx(content: ReportContent, websiteUrl: string, branding: Branding = DEFAULT_BRANDING): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = branding.name;
  workbook.created = new Date();

  const header = workbook.addWorksheet("Overview");
  header.columns = [
    { header: "Field", key: "field", width: 30 },
    { header: "Value", key: "value", width: 80 },
  ];
  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF" + hexNoHash(branding.color) } },
  };
  header.getRow(1).eachCell((c) => Object.assign(c, headerStyle));

  const rows: [string, string | number][] = [
    ["Website URL", websiteUrl],
    ["Title", content.websiteTitle],
    ["Detected genre", content.detectedGenre],
    ["Industry", content.industry],
    ["Audience", content.audience],
    ["Summary", content.summary],
    ["Overall score", content.scores.overall],
    ["SEO", content.scores.seo],
    ["Conversion", content.scores.conversion],
    ["Branding", content.scores.branding],
    ["Marketing", content.scores.marketing],
    ["Primary path", content.monetizationStrategy.primaryPath],
    ["Primary reasoning", content.monetizationStrategy.reasoning],
  ];
  rows.forEach((r) => header.addRow({ field: r[0], value: r[1] }));

  const streams = workbook.addWorksheet("Revenue streams");
  streams.columns = [
    { header: "Stream", key: "name", width: 28 },
    { header: "Description", key: "description", width: 60 },
    { header: "Setup effort", key: "effort", width: 14 },
    { header: "Time to revenue", key: "time", width: 18 },
    { header: "Monthly potential", key: "potential", width: 22 },
    { header: "Fit score", key: "fit", width: 12 },
  ];
  streams.getRow(1).eachCell((c) => Object.assign(c, headerStyle));
  content.monetizationStreams.forEach((s) =>
    streams.addRow({
      name: s.name,
      description: s.description,
      effort: s.setupEffort,
      time: s.timeToFirstRevenue,
      potential: s.monthlyRevenuePotential,
      fit: s.fitScore,
    })
  );

  const sections = workbook.addWorksheet("Sections");
  sections.columns = [
    { header: "Section", key: "section", width: 32 },
    { header: "Body", key: "body", width: 100 },
  ];
  sections.getRow(1).eachCell((c) => Object.assign(c, headerStyle));
  sectionsList(content.sections).forEach((s) => sections.addRow({ section: s.label, body: s.body }));
  sections.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: "top" };
    });
  });

  const recs = workbook.addWorksheet("Recommendations");
  recs.columns = [
    { header: "#", key: "n", width: 6 },
    { header: "Recommendation", key: "r", width: 100 },
  ];
  recs.getRow(1).eachCell((c) => Object.assign(c, headerStyle));
  content.topRecommendations.forEach((r, i) => recs.addRow({ n: i + 1, r }));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBlobDownload(blob, safeFilename(content.websiteTitle || "growth-report", "xlsx"));
}

// ─── Server-side downloads (PDF + DOCX) ──────────────────────────────────────
// PDF and DOCX are now generated server-side with the shared @react-pdf / docx
// design kit so they match the polished resume/gig documents (themed cover band,
// section headers, structured tables, page-number footer). We just stream the
// rendered file and trigger a browser download.

async function downloadReportFile(reportId: string, ext: "pdf" | "docx", title: string): Promise<void> {
  const response = await api.get<Blob>(`/reports/${reportId}/export/${ext}`, { responseType: "blob" });
  triggerBlobDownload(response.data, safeFilename(title || "growth-report", ext));
}

export async function downloadReportPdf(reportId: string, title: string): Promise<void> {
  await downloadReportFile(reportId, "pdf", title);
}

export async function downloadReportDocx(reportId: string, title: string): Promise<void> {
  await downloadReportFile(reportId, "docx", title);
}

// ─── PPTX ──────────────────────────────────────────────────────────────────
export async function exportPptx(content: ReportContent, websiteUrl: string, branding: Branding = DEFAULT_BRANDING): Promise<void> {
  const pres = new pptxgen();
  pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pres.layout = "WIDE";

  const themeColor = hexNoHash(branding.color);

  // Slide 1 — title (themed cover band across the top)
  const title = pres.addSlide();
  title.background = { color: "FFFFFF" };
  title.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.333, h: 2.6, fill: { color: themeColor }, line: { color: themeColor },
  });
  title.addText(content.websiteTitle || "Growth Report", {
    x: 0.6, y: 0.7, w: 12, h: 1.2,
    fontSize: 44, bold: true, color: "FFFFFF", fontFace: "Calibri",
  });
  title.addText(`Overall score ${content.scores.overall}/100`, {
    x: 0.6, y: 1.9, w: 12, h: 0.5,
    fontSize: 16, color: "FFFFFF", fontFace: "Calibri",
  });
  title.addText(`${websiteUrl}  ·  ${content.detectedGenre}  ·  ${content.industry}`, {
    x: 0.6, y: 2.7, w: 12, h: 0.6,
    fontSize: 16, color: "666666", italic: true, fontFace: "Calibri",
  });
  title.addText(content.summary, {
    x: 0.6, y: 3.6, w: 12, h: 3,
    fontSize: 16, color: "333333", fontFace: "Calibri",
  });
  title.addText(`Generated by ${branding.name}`, {
    x: 0.6, y: 6.9, w: 12, h: 0.4,
    fontSize: 10, color: "999999",
  });

  // Slide 2 — Scores
  const scores = pres.addSlide();
  scores.addText("Scores", { x: 0.6, y: 0.4, w: 12, h: 0.8, fontSize: 30, bold: true, color: themeColor });
  const scoreItems = [
    ["Overall", content.scores.overall],
    ["SEO", content.scores.seo],
    ["Conversion", content.scores.conversion],
    ["Branding", content.scores.branding],
    ["Marketing", content.scores.marketing],
  ];
  scoreItems.forEach(([label, value], i) => {
    const x = 0.6 + i * 2.5;
    scores.addShape(pres.ShapeType.rect, {
      x, y: 2, w: 2.2, h: 3, fill: { color: themeColor }, line: { color: themeColor },
    });
    scores.addText(String(value), {
      x, y: 2.2, w: 2.2, h: 1.4, align: "center", fontSize: 56, bold: true, color: "FFFFFF",
    });
    scores.addText(String(label), {
      x, y: 3.7, w: 2.2, h: 0.6, align: "center", fontSize: 16, color: "FFFFFF",
    });
  });

  // Slide 3 — Primary strategy
  const strat = pres.addSlide();
  strat.addText("Primary monetization path", { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 20, color: themeColor, bold: true });
  strat.addText(content.monetizationStrategy.primaryPath, { x: 0.6, y: 1.2, w: 12, h: 1.4, fontSize: 34, bold: true, color: "111111" });
  strat.addText(content.monetizationStrategy.reasoning, { x: 0.6, y: 3.0, w: 12, h: 4, fontSize: 18, color: "333333" });

  // Slide 4 — Streams table
  const streamsSlide = pres.addSlide();
  streamsSlide.addText("Revenue streams", { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 26, bold: true, color: themeColor });
  const rows: pptxgen.TableRow[] = [
    [
      { text: "Stream", options: { bold: true, color: "FFFFFF", fill: { color: themeColor } } },
      { text: "Effort", options: { bold: true, color: "FFFFFF", fill: { color: themeColor } } },
      { text: "Time", options: { bold: true, color: "FFFFFF", fill: { color: themeColor } } },
      { text: "Potential", options: { bold: true, color: "FFFFFF", fill: { color: themeColor } } },
      { text: "Fit", options: { bold: true, color: "FFFFFF", fill: { color: themeColor } } },
    ],
    ...content.monetizationStreams.map((s) => [
      { text: `${s.name}\n${s.description}` },
      { text: s.setupEffort },
      { text: s.timeToFirstRevenue },
      { text: s.monthlyRevenuePotential },
      { text: `${s.fitScore}/100` },
    ]),
  ];
  streamsSlide.addTable(rows, {
    x: 0.6, y: 1.2, w: 12,
    fontSize: 11, color: "333333",
    border: { type: "solid", pt: 1, color: "DDDDDD" },
    rowH: 0.7,
  });

  // Section slides
  for (const section of sectionsList(content.sections)) {
    const slide = pres.addSlide();
    slide.addText(section.label, { x: 0.6, y: 0.4, w: 12, h: 0.7, fontSize: 26, bold: true, color: themeColor });
    slide.addText(section.body, { x: 0.6, y: 1.3, w: 12, h: 5.8, fontSize: 14, color: "333333" });
  }

  // Recommendations
  const recsSlide = pres.addSlide();
  recsSlide.addText("Top recommendations", { x: 0.6, y: 0.4, w: 12, h: 0.7, fontSize: 26, bold: true, color: themeColor });
  recsSlide.addText(
    content.topRecommendations.map((r, i) => ({ text: `${i + 1}. ${r}`, options: { breakLine: true } })),
    { x: 0.6, y: 1.3, w: 12, h: 5.8, fontSize: 16, color: "333333" }
  );

  await pres.writeFile({ fileName: safeFilename(content.websiteTitle || "growth-report", "pptx") });
}

// PDF is generated server-side — see downloadReportPdf above.
