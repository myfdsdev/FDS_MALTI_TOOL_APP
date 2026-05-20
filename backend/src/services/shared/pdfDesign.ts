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

// ════════════════════════════════════════════════════════════════════════════
// Shared @react-pdf design kit.
//
// Models the polished resume PDF look so the gig + report exports share one
// consistent "system" design language: a themed cover band, color-banded
// section headers, structured cards/tables, and a page footer with page numbers.
//
// NOTE: backend tsc has no JSX transform configured, so everything here uses
// React.createElement (aliased `e`) instead of JSX — same as the resume/gig
// exporters.
// ════════════════════════════════════════════════════════════════════════════

// React-PDF can hang trying to fetch Helvetica on some systems. Disable
// hyphenation and lean on the built-in fonts (Helvetica, Times-Roman, Courier).
Font.registerHyphenationCallback((word) => [word]);

export const DEFAULT_BRAND_NAME = "Multi-Tool AI SaaS";

const e = createElement;
type S = Style | Style[];

export const view = (style: S, ...children: unknown[]): ReactElement =>
  e(View, { style }, ...(children as ReactElement[]));
export const text = (style: S, value: string | null | undefined): ReactElement =>
  e(Text, { style }, cleanText((value || "").toString()));

export const safe = (v: string | null | undefined): string => (v || "").trim();

/**
 * AI content is sometimes stored with literal escape sequences (a backslash
 * followed by "n" rather than a real newline). Convert them back so text
 * renders with proper line breaks. react-pdf <Text> honors real newlines.
 */
export function cleanText(value: string | null | undefined): string {
  return (value || "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t");
}

export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Shared neutral palette (matches resume exporter conventions).
export const INK = "#1f2937";
export const MUTED = "#6b7280";
export const FAINT = "#9ca3af";
export const HAIRLINE = "#e5e7eb";
export const PANEL = "#f9fafb";

export interface DesignStyles {
  styles: ReturnType<typeof StyleSheet.create>;
  themeColor: string;
}

// All page padding lives on a content wrapper rather than the Page so the cover
// band can bleed to the page edges.
const PAGE_PAD = 36;

export function makeStyles(themeColor: string) {
  return StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 10.5,
      color: INK,
      lineHeight: 1.45,
      paddingTop: 0,
      paddingHorizontal: 0, // cover band bleeds edge-to-edge
      paddingBottom: 48, // room for the fixed footer
    },
    content: { paddingHorizontal: PAGE_PAD, paddingTop: 18 },

    // Cover band — themed block bleeding to the page edges.
    cover: {
      width: "100%",
      backgroundColor: themeColor,
      color: "white",
      paddingHorizontal: PAGE_PAD,
      paddingVertical: 28,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    coverLeft: { flexDirection: "column", flexGrow: 1, flexShrink: 1, paddingRight: 20 },
    coverTitle: { fontSize: 21, fontWeight: 700, color: "white", marginBottom: 6, lineHeight: 1.25 },
    coverMeta: { fontSize: 9.5, color: "white", opacity: 0.92, lineHeight: 1.5 },

    // Score badge (circle-ish chip in the cover band).
    badge: {
      width: 64,
      height: 64,
      flexShrink: 0,
      borderRadius: 32,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 2,
      borderColor: "white",
      alignItems: "center",
      justifyContent: "center",
    },
    badgeNum: { fontSize: 20, fontWeight: 700, color: "white" },
    badgeLabel: { fontSize: 7, color: "white", opacity: 0.9, letterSpacing: 1 },

    // Section header with a thin divider rule.
    section: {
      fontSize: 13,
      fontWeight: 700,
      color: themeColor,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginTop: 16,
      marginBottom: 4,
    },
    sectionRule: {
      borderBottomWidth: 1.5,
      borderBottomColor: hexToRgba(themeColor, 0.35),
      marginBottom: 8,
    },

    h3: { fontSize: 11.5, fontWeight: 700, color: INK, marginTop: 8, marginBottom: 3 },
    body: { fontSize: 10.5, marginBottom: 4 },
    small: { fontSize: 9, color: MUTED, marginBottom: 3 },
    bullet: { fontSize: 10.5, marginLeft: 12, marginBottom: 2 },

    // Tag chips.
    tagRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
    tag: {
      fontSize: 9,
      paddingHorizontal: 7,
      paddingVertical: 2,
      backgroundColor: hexToRgba(themeColor, 0.1),
      color: themeColor,
      marginRight: 5,
      marginBottom: 5,
      borderRadius: 3,
    },

    // Key/value summary grid.
    kvGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      borderWidth: 1,
      borderColor: HAIRLINE,
      borderRadius: 4,
      marginBottom: 8,
    },
    kvCell: { width: "50%", padding: 8 },
    kvKey: { fontSize: 8, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
    kvVal: { fontSize: 10.5, color: INK },

    // Score bars.
    scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    scoreLabel: { width: "32%", fontSize: 9.5, color: MUTED },
    scoreTrack: {
      flexGrow: 1,
      height: 8,
      backgroundColor: HAIRLINE,
      borderRadius: 4,
      marginHorizontal: 8,
    },
    scoreVal: { width: 28, fontSize: 9, color: INK, textAlign: "right" },

    // Comparison cards.
    cardGrid: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
    card: {
      width: "31.5%",
      borderWidth: 1,
      borderColor: HAIRLINE,
      borderRadius: 5,
      padding: 10,
      backgroundColor: PANEL,
    },
    cardHighlight: {
      width: "31.5%",
      borderWidth: 1.5,
      borderColor: themeColor,
      borderRadius: 5,
      padding: 10,
      backgroundColor: hexToRgba(themeColor, 0.06),
    },
    cardRibbon: {
      fontSize: 7,
      fontWeight: 700,
      color: "white",
      backgroundColor: themeColor,
      textTransform: "uppercase",
      letterSpacing: 1,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 3,
      marginBottom: 5,
      alignSelf: "flex-start",
    },
    cardName: { fontSize: 11, fontWeight: 700, color: themeColor, marginBottom: 3 },
    cardPrice: { fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 },
    cardMeta: { fontSize: 8.5, color: MUTED, marginBottom: 5 },

    // Table.
    table: { borderWidth: 1, borderColor: HAIRLINE, borderRadius: 4, marginBottom: 8 },
    tableHead: { flexDirection: "row", backgroundColor: hexToRgba(themeColor, 0.12) },
    tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: HAIRLINE },
    th: { padding: 6, fontSize: 9, fontWeight: 700, color: themeColor },
    td: { padding: 6, fontSize: 9.5, color: INK },

    // Fixed footer.
    footer: {
      position: "absolute",
      bottom: 18,
      left: PAGE_PAD,
      right: PAGE_PAD,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: HAIRLINE,
      paddingTop: 6,
    },
    footerText: { fontSize: 8, color: FAINT },
  });
}

type Styles = ReturnType<typeof makeStyles>;

// ─── Component helpers ───────────────────────────────────────────────────────

export function coverBand(
  styles: Styles,
  opts: { title: string; meta: string; score?: number | null; scoreLabel?: string },
): ReactElement {
  const left = view(
    styles.coverLeft,
    text(styles.coverTitle, opts.title),
    text(styles.coverMeta, opts.meta),
  );
  const children: ReactElement[] = [left];
  if (typeof opts.score === "number") {
    children.push(
      view(
        styles.badge,
        text(styles.badgeNum, `${opts.score}`),
        text(styles.badgeLabel, (opts.scoreLabel || "SCORE").toUpperCase()),
      ),
    );
  }
  return view(styles.cover, ...children);
}

export function sectionHeader(styles: Styles, label: string): ReactElement {
  return view({}, text(styles.section, label), view(styles.sectionRule));
}

export function bulletList(styles: Styles, items: string[]): ReactElement[] {
  return items.filter((i) => safe(i)).map((i) => text(styles.bullet, `• ${i}`));
}

export function numberedList(styles: Styles, items: string[]): ReactElement[] {
  return items
    .filter((i) => safe(i))
    .map((i, idx) => text(styles.bullet, `${idx + 1}. ${i}`));
}

export function tagRow(styles: Styles, tags: string[]): ReactElement {
  return view(styles.tagRow, ...tags.filter((t) => safe(t)).map((t) => text(styles.tag, t)));
}

export function keyValueGrid(styles: Styles, pairs: Array<[string, string]>): ReactElement {
  const cells = pairs.map(([k, v]) =>
    view(styles.kvCell, text(styles.kvKey, k), text(styles.kvVal, v || "—")),
  );
  return view(styles.kvGrid, ...cells);
}

export function scoreBars(
  styles: Styles,
  themeColor: string,
  rows: Array<[string, number]>,
  max = 100,
): ReactElement {
  const bars = rows.map(([label, value]) => {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    // Track with an inner fill bar sized to the score percentage.
    const track = view(
      styles.scoreTrack,
      view({
        width: `${pct}%`,
        height: 8,
        backgroundColor: themeColor,
        borderRadius: 4,
      } as Style),
    );
    return view(
      styles.scoreRow,
      text(styles.scoreLabel, label),
      track,
      text(styles.scoreVal, `${value}`),
    );
  });
  return view({}, ...bars);
}

export interface ComparisonCard {
  name: string;
  price: string;
  meta: string;
  lines: string[];
  highlight?: boolean;
  ribbon?: string;
}

export function comparisonCards(styles: Styles, cards: ComparisonCard[]): ReactElement {
  const els = cards.map((c) => {
    const kids: ReactElement[] = [];
    if (c.highlight && c.ribbon) kids.push(text(styles.cardRibbon, c.ribbon));
    kids.push(text(styles.cardName, c.name));
    kids.push(text(styles.cardPrice, c.price));
    if (safe(c.meta)) kids.push(text(styles.cardMeta, c.meta));
    for (const line of c.lines.filter((l) => safe(l))) {
      kids.push(text(styles.bullet, `• ${line}`));
    }
    return view(c.highlight ? styles.cardHighlight : styles.card, ...kids);
  });
  return view(styles.cardGrid, ...els);
}

export function simpleTable(
  styles: Styles,
  headers: string[],
  rows: string[][],
  widths?: string[],
): ReactElement {
  const colWidth = (i: number): string => widths?.[i] || `${100 / headers.length}%`;
  const head = view(
    styles.tableHead,
    ...headers.map((h, i) => text([styles.th, { width: colWidth(i) } as Style], h)),
  );
  const body = rows.map((row) =>
    view(
      styles.tableRow,
      ...row.map((cell, i) => text([styles.td, { width: colWidth(i) } as Style], cell)),
    ),
  );
  return view(styles.table, head, ...body);
}

export function footer(styles: Styles, brandName: string): ReactElement {
  return e(View, {
    style: styles.footer,
    fixed: true,
    children: [
      e(Text, { style: styles.footerText, key: "brand" }, brandName),
      e(Text, {
        style: styles.footerText,
        key: "pages",
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
          `Page ${pageNumber} of ${totalPages}`,
      }),
    ],
  });
}

// ─── Document assembly ───────────────────────────────────────────────────────

export interface BrandedDocOptions {
  title: string;
  author?: string;
  brandName?: string;
  themeColor: string;
  /** Cover band shown at the very top of the first page. */
  cover: { title: string; meta: string; score?: number | null; scoreLabel?: string };
  /** Body content elements (rendered after the cover, inside padded content). */
  body: ReactElement[];
}

/**
 * Builds a single-Page branded document with a cover band, padded flowing
 * content, and a fixed footer with page numbers. Content paginates naturally.
 */
export async function renderBrandedPdf(opts: BrandedDocOptions): Promise<Buffer> {
  const styles = makeStyles(opts.themeColor);
  const brandName = opts.brandName || DEFAULT_BRAND_NAME;

  const page = e(
    Page,
    { size: "A4", style: styles.page },
    coverBand(styles, opts.cover),
    view(styles.content, ...opts.body),
    footer(styles, brandName),
  );

  const doc = e(
    Document,
    { title: opts.title, author: opts.author || brandName },
    page,
  );
  return renderToBuffer(doc);
}
