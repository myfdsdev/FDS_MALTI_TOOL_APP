import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { z } from "zod";
import * as cheerio from "cheerio";
import { AppError } from "../utils/errors.js";

const MAX_REDIRECTS = 5;
const MAX_BYTES = 2 * 1024 * 1024;
const CACHE_TTL_MS = 60 * 60 * 1000;
const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "Mozilla/5.0 (compatible; MultiToolBot/1.0; +https://yourapp.com)",
};

const urlSchema = z
  .string()
  .trim()
  .url("Please enter a valid URL")
  .transform((value) => new URL(value));

const previewCache = new Map<string, { expiresAt: number; data: LinkPreview }>();

export interface LinkPreview {
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  favicon: string;
  url: string;
}

function linkPreviewError(message = "Couldn't fetch a preview for that URL. Try a different public page.", statusCode = 400) {
  return new AppError(message, statusCode, "LINK_PREVIEW_FAILED");
}

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;

  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

function expandIpv6(ip: string) {
  const [head, tail = ""] = ip.toLowerCase().split("::");
  const headParts = head ? head.split(":").filter(Boolean) : [];
  const tailParts = tail ? tail.split(":").filter(Boolean) : [];
  const missing = 8 - (headParts.length + tailParts.length);
  const middle = Array.from({ length: Math.max(0, missing) }, () => "0");
  return [...headParts, ...middle, ...tailParts].map((part) => part.padStart(4, "0"));
}

function isPrivateIpv6(ip: string) {
  if (ip === "::1") return true;

  const parts = expandIpv6(ip);
  if (parts.length !== 8) return false;

  const first = Number.parseInt(parts[0], 16);
  const second = Number.parseInt(parts[1], 16);

  return (
    (first & 0xfe00) === 0xfc00 || // fc00::/7
    (first === 0xfe80 && (second & 0xc000) === 0x8000) // fe80::/10
  );
}

function assertPublicIpAddress(address: string) {
  if (isIP(address) === 4 && isPrivateIpv4(address)) {
    throw linkPreviewError("That URL points to a private network address and can't be previewed.");
  }

  if (isIP(address) === 6 && isPrivateIpv6(address)) {
    throw linkPreviewError("That URL points to a private network address and can't be previewed.");
  }
}

async function assertSafeUrl(url: URL) {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw linkPreviewError("Only public http(s) URLs are supported.");
  }

  if (["localhost", "localhost.localdomain"].includes(url.hostname.toLowerCase())) {
    throw linkPreviewError("Localhost URLs can't be previewed.");
  }

  if (isIP(url.hostname)) {
    assertPublicIpAddress(url.hostname);
    return;
  }

  let records;
  try {
    records = await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw linkPreviewError("Couldn't resolve that URL. Check the address and try again.");
  }

  if (records.length === 0) {
    throw linkPreviewError("Couldn't resolve that URL. Check the address and try again.");
  }

  for (const record of records) {
    assertPublicIpAddress(record.address);
  }
}

function readCache(key: string) {
  const cached = previewCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    previewCache.delete(key);
    return null;
  }
  return cached.data;
}

function writeCache(key: string, data: LinkPreview) {
  previewCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function fetchHtml(startUrl: URL) {
  let currentUrl = startUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertSafeUrl(currentUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(currentUrl, {
        headers: REQUEST_HEADERS,
        redirect: "manual",
        signal: controller.signal,
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw linkPreviewError("The target URL redirected in an unsupported way.");
        }

        if (redirectCount === MAX_REDIRECTS) {
          throw linkPreviewError("That URL redirected too many times.");
        }

        currentUrl = new URL(location, currentUrl);
        continue;
      }

      if (!response.ok) {
        throw linkPreviewError("Couldn't fetch a preview for that URL. The page may be unavailable.", 502);
      }

      const contentLengthHeader = response.headers.get("content-length");
      if (contentLengthHeader && Number(contentLengthHeader) > MAX_BYTES) {
        throw linkPreviewError("That page is too large to preview.");
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        throw linkPreviewError("That URL did not return an HTML page.");
      }

      const html = await readBodyWithLimit(response);
      return { html, finalUrl: currentUrl };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw linkPreviewError("The preview request timed out. Try a faster public URL.");
      }
      throw linkPreviewError("Couldn't fetch a preview for that URL. Try again in a moment.", 502);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw linkPreviewError("That URL redirected too many times.");
}

async function readBodyWithLimit(response: Response) {
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_BYTES) {
      await reader.cancel();
      throw linkPreviewError("That page is too large to preview.");
    }

    html += decoder.decode(value, { stream: true });
  }

  html += decoder.decode();
  return html;
}

function makeAbsoluteUrl(value: string | undefined | null, baseUrl: URL) {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return null;
  }
}

function readMeta($: cheerio.CheerioAPI, key: string) {
  return (
    $(`meta[property="${key}"]`).attr("content") ??
    $(`meta[name="${key}"]`).attr("content") ??
    null
  );
}

function findLargeImage($: cheerio.CheerioAPI, baseUrl: URL) {
  let fallback: string | null = null;

  for (const element of $("body img").toArray()) {
    const src = $(element).attr("src");
    const candidate = makeAbsoluteUrl(src, baseUrl);
    if (!candidate) continue;

    fallback ??= candidate;

    const width = Number($(element).attr("width"));
    const height = Number($(element).attr("height"));
    if (width >= 180 || height >= 180) {
      return candidate;
    }
  }

  return fallback;
}

export async function scrapeUrl(rawUrl: string): Promise<LinkPreview> {
  let parsedUrl: URL;
  try {
    parsedUrl = urlSchema.parse(rawUrl);
  } catch {
    throw linkPreviewError("Please enter a valid public URL.");
  }

  const cached = readCache(parsedUrl.href);
  if (cached) return cached;

  const { html, finalUrl } = await fetchHtml(parsedUrl);
  const $ = cheerio.load(html);

  const title =
    readMeta($, "og:title")?.trim() ||
    readMeta($, "twitter:title")?.trim() ||
    $("title").first().text().trim() ||
    finalUrl.hostname;

  const description =
    readMeta($, "og:description")?.trim() ||
    readMeta($, "twitter:description")?.trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const image =
    makeAbsoluteUrl(readMeta($, "og:image"), finalUrl) ??
    makeAbsoluteUrl(readMeta($, "twitter:image"), finalUrl) ??
    findLargeImage($, finalUrl);

  const siteName = readMeta($, "og:site_name")?.trim() || finalUrl.hostname;

  const favicon =
    makeAbsoluteUrl($('link[rel="icon"]').attr("href"), finalUrl) ??
    makeAbsoluteUrl($('link[rel="shortcut icon"]').attr("href"), finalUrl) ??
    makeAbsoluteUrl($('link[rel="apple-touch-icon"]').attr("href"), finalUrl) ??
    new URL("/favicon.ico", finalUrl.origin).href;

  const preview: LinkPreview = {
    title,
    description,
    image,
    siteName,
    favicon,
    url: finalUrl.href,
  };

  writeCache(parsedUrl.href, preview);
  return preview;
}
