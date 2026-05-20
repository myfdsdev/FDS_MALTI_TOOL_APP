import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type ISectionOptions,
} from "docx";

// ════════════════════════════════════════════════════════════════════════════
// Shared `docx` design kit.
//
// Gives the gig + report DOCX exports one consistent branded look that mirrors
// the polished PDF design language: a themed title block with a divider rule,
// themed section headings, shaded-header tables, and a footer with the brand
// name + page numbers.
//
// Colors are passed as hex WITHOUT a leading "#" (docx convention).
// Font sizes are in half-points; spacing in twips (1/20 pt).
// ════════════════════════════════════════════════════════════════════════════

export const DEFAULT_BRAND_NAME = "Multi-Tool AI SaaS";
const INK = "1f2937";
const MUTED = "6b7280";

export const PAGE_MARGIN = { top: 720, bottom: 720, left: 720, right: 720 };

function hexNoHash(color: string): string {
  return color.replace(/^#/, "");
}

/** Branded title block: large themed title, muted subtitle, and a divider rule. */
export function titleBlock(title: string, subtitle: string, themeColor: string): Paragraph[] {
  const theme = hexNoHash(themeColor);
  return [
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: title, bold: true, size: 44, color: theme })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: theme, space: 4 } },
      children: [new TextRun({ text: subtitle, italics: true, size: 20, color: MUTED })],
    }),
  ];
}

export function heading2(text: string, themeColor: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 26, color: hexNoHash(themeColor) }),
    ],
  });
}

export function heading3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, color: INK })],
  });
}

export function body(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text: cleanText(text) || "—", size: 22, color: INK })],
  });
}

/**
 * AI content sometimes stores literal escape sequences (backslash-n) instead of
 * real newlines. Convert them back to real characters.
 */
export function cleanText(text: string | null | undefined): string {
  return (text || "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t");
}

/**
 * Multi-line body paragraph: a single DOCX TextRun does not break on "\n", so
 * we split the (cleaned) text into runs separated by explicit line breaks.
 */
export function bodyMultiline(text: string): Paragraph {
  const lines = cleanText(text).split("\n");
  const children: TextRun[] = [];
  lines.forEach((line, i) => {
    children.push(new TextRun({ text: line, size: 22, color: INK, break: i > 0 ? 1 : undefined }));
  });
  return new Paragraph({ spacing: { after: 80 }, children });
}

export function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 22, color: INK })],
  });
}

export function numbered(text: string, index: number): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: `${index + 1}. ${text}`, size: 22, color: INK })],
  });
}

export function meta(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, italics: true, size: 20, color: MUTED })],
  });
}

function headerCell(text: string, themeColor: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: hexNoHash(themeColor), color: "auto" },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, color: "FFFFFF" })] })],
  });
}

function bodyCell(lines: string[], width: number, bold = false): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: lines.map(
      (line) =>
        new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: line, size: 20, bold, color: INK })],
        }),
    ),
  });
}

/** A table with a themed (shaded) header row. `rows` cells may contain `\n`. */
export function themedTable(
  headers: string[],
  rows: string[][],
  themeColor: string,
  widths?: number[],
): Table {
  const width = (i: number): number => widths?.[i] ?? Math.floor(100 / headers.length);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => headerCell(h, themeColor, width(i))),
  });
  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell, i) => bodyCell(cell.split("\n"), width(i))),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

/** Vertical comparison cards rendered as a single-row table (PDF parity). */
export function comparisonTable(
  columns: Array<{ title: string; lines: string[] }>,
  themeColor: string,
): Table {
  const colWidth = Math.floor(100 / Math.max(1, columns.length));
  const cells = columns.map((col) => {
    const children: Paragraph[] = [
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: col.title, bold: true, size: 24, color: hexNoHash(themeColor) })],
      }),
      ...col.lines.map(
        (line) =>
          new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: line, size: 20, color: INK })] }),
      ),
    ];
    return new TableCell({
      width: { size: colWidth, type: WidthType.PERCENTAGE },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children,
    });
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: cells })],
  });
}

function brandFooter(brandName: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db", space: 4 } },
        children: [
          new TextRun({ text: `${brandName}   ·   Page `, size: 16, color: "9ca3af" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "9ca3af" }),
          new TextRun({ text: " of ", size: 16, color: "9ca3af" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "9ca3af" }),
        ],
      }),
    ],
  });
}

export interface BrandedDocxOptions {
  title: string;
  creator?: string;
  brandName?: string;
  children: ISectionOptions["children"];
}

/** Assembles a branded DOCX with consistent margins and a page-number footer. */
export function buildBrandedDocx(opts: BrandedDocxOptions): Document {
  const brandName = opts.brandName || DEFAULT_BRAND_NAME;
  return new Document({
    creator: opts.creator || brandName,
    title: opts.title,
    sections: [
      {
        properties: { page: { margin: PAGE_MARGIN } },
        footers: { default: brandFooter(brandName) },
        children: opts.children,
      },
    ],
  });
}
