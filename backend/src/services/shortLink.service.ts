import crypto from "node:crypto";
import { ShortLink, type ShortLinkDocument } from "../models/ShortLink.model.js";
import type { UserDocument } from "../models/User.model.js";
import { AppError, BadRequestError, ConflictError } from "../utils/errors.js";

const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const GENERATED_CODE_LENGTH = 7;
const MAX_GENERATE_ATTEMPTS = 8;
const CUSTOM_ALIAS_PATTERN = /^[a-z0-9_-]{3,40}$/;

export interface ShortLinkResult {
  id: string;
  originalUrl: string;
  shortUrl: string;
  code: string;
  clicks: number;
  createdAt: string;
}

interface CreateShortLinkParams {
  user: UserDocument;
  originalUrl: unknown;
  customAlias?: unknown;
  baseUrl: string;
}

export async function createShortLink({
  user,
  originalUrl,
  customAlias,
  baseUrl,
}: CreateShortLinkParams): Promise<ShortLinkResult> {
  const normalizedUrl = normalizeHttpUrl(originalUrl);
  const alias = normalizeAlias(customAlias);

  if (alias) {
    try {
      const doc = await ShortLink.create({
        user: user._id,
        originalUrl: normalizedUrl,
        code: alias,
      });
      return toShortLinkResult(doc, baseUrl);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw new ConflictError("That custom alias is already taken");
      }
      throw err;
    }
  }

  for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt += 1) {
    try {
      const doc = await ShortLink.create({
        user: user._id,
        originalUrl: normalizedUrl,
        code: randomCode(),
      });
      return toShortLinkResult(doc, baseUrl);
    } catch (err) {
      if (isDuplicateKeyError(err)) continue;
      throw err;
    }
  }

  throw new AppError("Could not create a unique short link. Please try again.", 500);
}

export function buildShortUrl(baseUrl: string, code: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/s/${encodeURIComponent(code)}`;
}

function normalizeHttpUrl(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestError("URL is required");
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new BadRequestError("Only http:// and https:// URLs can be shortened");
    }
    return url.toString();
  } catch (err) {
    if (err instanceof BadRequestError) throw err;
    throw new BadRequestError("Enter a valid URL starting with http:// or https://");
  }
}

function normalizeAlias(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string") throw new BadRequestError("Custom alias must be text");

  const alias = value.trim().toLowerCase();
  if (!alias) return undefined;
  if (!CUSTOM_ALIAS_PATTERN.test(alias)) {
    throw new BadRequestError(
      "Custom alias must be 3-40 characters and use only letters, numbers, dashes, or underscores",
    );
  }
  return alias;
}

function randomCode(): string {
  const bytes = crypto.randomBytes(GENERATED_CODE_LENGTH);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

function toShortLinkResult(doc: ShortLinkDocument, baseUrl: string): ShortLinkResult {
  return {
    id: String(doc._id),
    originalUrl: doc.originalUrl,
    shortUrl: buildShortUrl(baseUrl, doc.code),
    code: doc.code,
    clicks: doc.clicks,
    createdAt: doc.createdAt.toISOString(),
  };
}

function isDuplicateKeyError(err: unknown): boolean {
  return !!err && typeof err === "object" && "code" in err && (err as { code?: number }).code === 11000;
}
