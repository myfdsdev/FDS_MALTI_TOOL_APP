import { lookup } from "node:dns/promises";
import * as cheerio from "cheerio";
import { Address4, Address6 } from "ip-address";
import { logger } from "../../config/logger.js";

const USER_AGENT =
  "Mozilla/5.0 (compatible; GrowthReportBot/1.0; +https://multitool.local)";
const FETCH_TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 200_000;
const MAX_REDIRECTS = 5;
const MAX_BODY_SAMPLE = 6000;
const MAX_H1S = 5;
const MAX_H2S = 10;

export interface SiteSnapshot {
  ok: boolean;
  title: string;
  description: string;
  h1s: string[];
  h2s: string[];
  bodySample: string;
  fetchedAt: Date;
  error: string | null;
  finalUrl?: string;
}

/**
 * Block IPv4 ranges that should never be reachable from a public site fetch:
 *   0.0.0.0/8, 10.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16,
 *   172.16.0.0/12, 192.168.0.0/16
 */
function isPrivateIPv4(ipStr: string): boolean {
  try {
    const ip = new Address4(ipStr);
    const blocked = [
      new Address4("0.0.0.0/8"),
      new Address4("10.0.0.0/8"),
      new Address4("127.0.0.0/8"),
      new Address4("169.254.0.0/16"),
      new Address4("172.16.0.0/12"),
      new Address4("192.168.0.0/16"),
    ];
    return blocked.some((range) => ip.isInSubnet(range));
  } catch {
    return false;
  }
}

/** Block IPv6 loopback (::1), unique-local (fc00::/7), link-local (fe80::/10). */
function isPrivateIPv6(ipStr: string): boolean {
  try {
    const ip = new Address6(ipStr);
    const blocked = [
      new Address6("::1/128"),
      new Address6("fc00::/7"),
      new Address6("fe80::/10"),
    ];
    return blocked.some((range) => ip.isInSubnet(range));
  } catch {
    return false;
  }
}

async function assertResolvedHostIsPublic(hostname: string): Promise<void> {
  let addrs: { address: string; family: number }[] = [];
  try {
    addrs = await lookup(hostname, { all: true });
  } catch (err) {
    throw new Error(`DNS lookup failed for ${hostname}: ${(err as Error).message}`);
  }
  if (addrs.length === 0) throw new Error(`No DNS records for ${hostname}`);
  for (const addr of addrs) {
    const isPrivate =
      addr.family === 4 ? isPrivateIPv4(addr.address) : isPrivateIPv6(addr.address);
    if (isPrivate) {
      throw new Error(`Refusing to fetch private/loopback address ${addr.address}`);
    }
  }
}

function decodeBodyChunked(buffer: Buffer): string {
  // Try UTF-8 first; fall back to latin1 for legacy pages.
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  } catch {
    return buffer.toString("latin1");
  }
}

async function fetchWithLimits(targetUrl: string, redirectsLeft: number): Promise<{ html: string; finalUrl: string }> {
  const parsed = new URL(targetUrl);
  if (!/^https?:$/i.test(parsed.protocol)) {
    throw new Error(`Refusing non-http(s) protocol: ${parsed.protocol}`);
  }
  await assertResolvedHostIsPublic(parsed.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  } finally {
    clearTimeout(timer);
  }

  if (response.status >= 300 && response.status < 400) {
    const loc = response.headers.get("location");
    if (!loc) throw new Error(`Redirect with no Location header`);
    if (redirectsLeft <= 0) throw new Error("Too many redirects");
    const nextUrl = new URL(loc, parsed).toString();
    return fetchWithLimits(nextUrl, redirectsLeft - 1);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  // Stream the body and cap at MAX_BODY_BYTES.
  const reader = response.body?.getReader();
  if (!reader) {
    return { html: "", finalUrl: response.url || parsed.toString() };
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      break;
    }
    chunks.push(value);
  }
  const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return { html: decodeBodyChunked(buffer), finalUrl: response.url || parsed.toString() };
}

function cleanText(value: string | null | undefined, max = 0): string {
  const cleaned = (value || "").replace(/\s+/g, " ").trim();
  return max > 0 ? cleaned.slice(0, max) : cleaned;
}

function parseHtmlSnapshot(html: string, finalUrl: string): Omit<SiteSnapshot, "fetchedAt" | "ok" | "error"> {
  const $ = cheerio.load(html);
  const title =
    cleanText($("title").first().text(), 300) ||
    cleanText($('meta[property="og:title"]').attr("content"), 300) ||
    "";

  const description =
    cleanText($('meta[name="description"]').attr("content"), 500) ||
    cleanText($('meta[property="og:description"]').attr("content"), 500) ||
    "";

  const h1s: string[] = [];
  $("h1").each((_, el) => {
    if (h1s.length >= MAX_H1S) return;
    const t = cleanText($(el).text(), 200);
    if (t) h1s.push(t);
  });

  const h2s: string[] = [];
  $("h2").each((_, el) => {
    if (h2s.length >= MAX_H2S) return;
    const t = cleanText($(el).text(), 200);
    if (t) h2s.push(t);
  });

  // Body sample: strip scripts/styles, collapse whitespace.
  $("script, style, noscript, svg, iframe").remove();
  const bodyText = cleanText($("body").text() || $.root().text(), 0);
  const bodySample = bodyText.slice(0, MAX_BODY_SAMPLE);

  return {
    title,
    description,
    h1s,
    h2s,
    bodySample,
    finalUrl,
  };
}

export async function fetchSiteSnapshot(rawUrl: string): Promise<SiteSnapshot> {
  const fetchedAt = new Date();
  try {
    const parsed = new URL(rawUrl);
    if (!/^https?:$/i.test(parsed.protocol)) {
      throw new Error(`URL must use http or https (got ${parsed.protocol})`);
    }
    const { html, finalUrl } = await fetchWithLimits(parsed.toString(), MAX_REDIRECTS);
    const parts = parseHtmlSnapshot(html, finalUrl);
    return {
      ok: true,
      title: parts.title,
      description: parts.description,
      h1s: parts.h1s,
      h2s: parts.h2s,
      bodySample: parts.bodySample,
      finalUrl: parts.finalUrl,
      fetchedAt,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    logger.warn({ rawUrl, message }, "Site snapshot failed");
    return {
      ok: false,
      title: "",
      description: "",
      h1s: [],
      h2s: [],
      bodySample: "",
      fetchedAt,
      error: message,
    };
  }
}

export function hostnameFromUrl(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return "";
  }
}
