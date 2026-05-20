import type { Request, Response } from "express";
import { isValidObjectId, type Types } from "mongoose";
import { customAlphabet } from "nanoid";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/responses.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import {
  Gig,
  type GigContent,
  type GigDocument,
  type OutreachContent,
} from "../models/Gig.model.js";
import { checkAndConsume } from "../services/usage.service.js";
import { resolveAIConfigForUser } from "../services/ai/config.js";
import { runGeneration } from "../services/gig/orchestrator.js";
import { improveGigSection } from "../services/gig/generator.js";
import { calculateGigScore } from "../services/gig/scorer.js";
import { renderGigPdf } from "../services/gig/pdfExporter.js";
import { renderGigDocx } from "../services/gig/docxExporter.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type {
  CreateGigInput,
  ImproveGigSectionInput,
  ListGigsQuery,
  ShareGigInput,
  UpdateGigInput,
} from "../validators/gig.validator.js";

type UserRequest = Request & { user: NonNullable<Request["user"]> };

const nanoidSlug = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  12,
);

const AI_REQUIRED_MESSAGE =
  "AI is not configured. Add an AI API key before generating gigs.";

function requireUser(req: Request): UserRequest {
  if (!req.user) throw new UnauthorizedError();
  return req as UserRequest;
}

function ensureObjectId(id: string): void {
  if (!isValidObjectId(id)) throw new NotFoundError("Gig not found");
}

async function findOwnedGigOr404(
  userId: Types.ObjectId,
  id: string,
): Promise<GigDocument> {
  ensureObjectId(id);
  const gig = await Gig.findOne({ _id: id, user: userId });
  if (!gig) throw new NotFoundError("Gig not found");
  return gig;
}

function defaultTitleFor(input: CreateGigInput): string {
  return `${input.serviceName} · ${input.platform}`;
}

function serializeListItem(gig: GigDocument) {
  return {
    _id: gig._id,
    title: gig.title,
    input: {
      serviceName: gig.input.serviceName,
      platform: gig.input.platform,
      niche: gig.input.niche,
    },
    status: gig.status,
    score: gig.score ? { overall: gig.score.overall } : null,
    archived: gig.archived,
    createdAt: gig.createdAt,
    updatedAt: gig.updatedAt,
    share: {
      enabled: gig.share.enabled,
      slug: gig.share.slug ?? null,
      viewCount: gig.share.viewCount,
    },
  };
}

function safeFilename(title: string, ext: string): string {
  const cleaned =
    title
      .replace(/[^a-z0-9-_ ]/gi, "")
      .replace(/\s+/g, "_")
      .slice(0, 80) || "gig";
  return `${cleaned}.${ext}`;
}

function kickOffGeneration(gigId: string): void {
  runGeneration(gigId).catch((err) => {
    logger.error({ err, gigId }, "Async gig generation crashed");
  });
}

/* ─── List ───────────────────────────────────────────────────── */

export const listGigs = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { platform, status, archived, search, limit } =
    req.query as unknown as ListGigsQuery;

  const filter: Record<string, unknown> = { user: authedReq.user._id };
  if (platform) filter["input.platform"] = platform;
  if (status) filter.status = status;
  if (typeof archived === "boolean") filter.archived = archived;
  if (search && search.trim()) {
    const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "i");
    filter.$or = [
      { title: re },
      { "input.serviceName": re },
      { "input.niche": re },
      { "content.gig.title": re },
    ];
  }

  const gigs = await Gig.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(
      "title input.serviceName input.platform input.niche input.pricingMin input.pricingMax input.pricingCurrency status generationStages generatedBy score.overall archived createdAt updatedAt share",
    );

  return ok(res, gigs.map(serializeListItem));
});

/* ─── Create ─────────────────────────────────────────────────── */

export const createGig = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const input = req.body as CreateGigInput;

  if (!resolveAIConfigForUser(authedReq.user)) {
    throw new BadRequestError(AI_REQUIRED_MESSAGE);
  }

  await checkAndConsume(authedReq.user);

  const gig = await Gig.create({
    user: authedReq.user._id,
    title: defaultTitleFor(input),
    input,
    status: "queued",
    generationStages: {
      gig: { status: "pending", error: null },
      leads: { status: "done", error: null },
      outreach: { status: "pending", error: null },
    },
  });

  kickOffGeneration(String(gig._id));

  return res.status(202).json({
    success: true,
    message: "Gig queued",
    data: { gigId: String(gig._id) },
  });
});

/* ─── Get ────────────────────────────────────────────────────── */

export const getGig = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const gig = await findOwnedGigOr404(authedReq.user._id, req.params.id);
  return ok(res, gig);
});

/* ─── Update ─────────────────────────────────────────────────── */

export const updateGig = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const gig = await findOwnedGigOr404(authedReq.user._id, req.params.id);
  const input = req.body as UpdateGigInput;

  if (input.title !== undefined) gig.title = input.title.trim();
  if (input.archived !== undefined) gig.archived = input.archived;

  if (input.content) {
    if (input.content.gig && gig.content.gig) {
      const patch = input.content.gig;
      const current = gig.content.gig;
      gig.content.gig = {
        ...current,
        ...patch,
        packages: patch.packages
          ? {
              basic: {
                ...current.packages.basic,
                ...(patch.packages.basic ?? {}),
              },
              standard: {
                ...current.packages.standard,
                ...(patch.packages.standard ?? {}),
              },
              premium: {
                ...current.packages.premium,
                ...(patch.packages.premium ?? {}),
              },
            }
          : current.packages,
      } as GigContent;
      gig.markModified("content.gig");
    }
    if (input.content.outreach && gig.content.outreach) {
      const patch = input.content.outreach;
      const current = gig.content.outreach;
      gig.content.outreach = {
        ...current,
        ...patch,
        coldEmail: patch.coldEmail ?? current.coldEmail,
      } as OutreachContent;
      gig.markModified("content.outreach");
    }

    // Recompute score when the gig content was edited.
    if (input.content.gig && gig.content.gig) {
      gig.score = calculateGigScore(gig.content.gig);
    }
  }

  await gig.save();
  return ok(res, gig, "Gig updated");
});

/* ─── Delete ─────────────────────────────────────────────────── */

export const deleteGig = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const gig = await findOwnedGigOr404(authedReq.user._id, req.params.id);
  await Gig.deleteOne({ _id: gig._id, user: authedReq.user._id });
  return ok(res, { deleted: true }, "Gig deleted");
});

/* ─── Regenerate ─────────────────────────────────────────────── */

export const regenerateGig = asyncHandler(
  async (req: Request, res: Response) => {
    const authedReq = requireUser(req);
    const gig = await findOwnedGigOr404(authedReq.user._id, req.params.id);

    if (
      !(["completed", "failed", "partial"] as const).includes(
        gig.status as "completed" | "failed" | "partial",
      )
    ) {
      throw new BadRequestError(
        "Gig is still in progress; cannot regenerate yet",
      );
    }

    if (!resolveAIConfigForUser(authedReq.user)) {
      throw new BadRequestError(AI_REQUIRED_MESSAGE);
    }

    await checkAndConsume(authedReq.user);

    gig.status = "queued";
    gig.generationStages = {
      gig: { status: "pending", error: null },
      leads: { status: "done", error: null },
      outreach: { status: "pending", error: null },
    };
    gig.generationMs = null;
    await gig.save();

    kickOffGeneration(String(gig._id));

    return res.status(202).json({
      success: true,
      message: "Gig regeneration queued",
      data: { gigId: String(gig._id) },
    });
  },
);

/* ─── Improve a single section ───────────────────────────────── */

export const improveGig = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const gig = await findOwnedGigOr404(authedReq.user._id, req.params.id);
  const { section, instructions } = req.body as ImproveGigSectionInput;

  const config = resolveAIConfigForUser(authedReq.user);
  if (!config) throw new BadRequestError(AI_REQUIRED_MESSAGE);

  if (section !== "outreach" && !gig.content.gig) {
    throw new BadRequestError("Gig content is not ready yet");
  }
  if (section === "outreach" && !gig.content.outreach) {
    throw new BadRequestError("Outreach content is not ready yet");
  }

  await checkAndConsume(authedReq.user);

  const suggestion = await improveGigSection(
    config,
    section,
    gig.input,
    { gig: gig.content.gig, outreach: gig.content.outreach },
    instructions,
  );

  return ok(res, { section, suggestion });
});

/* ─── Duplicate ──────────────────────────────────────────────── */

export const duplicateGig = asyncHandler(
  async (req: Request, res: Response) => {
    const authedReq = requireUser(req);
    const original = await findOwnedGigOr404(authedReq.user._id, req.params.id);

    if (!resolveAIConfigForUser(authedReq.user)) {
      throw new BadRequestError(AI_REQUIRED_MESSAGE);
    }

    await checkAndConsume(authedReq.user);

    const clone = await Gig.create({
      user: authedReq.user._id,
      title: `Copy of ${original.title || original.input.serviceName}`,
      input: original.toObject().input,
      status: "queued",
      generationStages: {
        gig: { status: "pending", error: null },
        leads: { status: "done", error: null },
        outreach: { status: "pending", error: null },
      },
    });

    kickOffGeneration(String(clone._id));

    return created(res, { gigId: String(clone._id) }, "Gig duplicated");
  },
);

/* ─── Share ──────────────────────────────────────────────────── */

export const updateShare = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const gig = await findOwnedGigOr404(authedReq.user._id, req.params.id);
  const { enabled } = req.body as ShareGigInput;

  if (enabled) {
    if (!gig.share.slug) {
      let slug = nanoidSlug();
      let attempts = 0;
      while (attempts < 5 && (await Gig.exists({ "share.slug": slug }))) {
        slug = nanoidSlug();
        attempts += 1;
      }
      gig.share.slug = slug;
    }
    gig.share.enabled = true;
  } else {
    gig.share.enabled = false;
    gig.share.slug = undefined;
  }
  await gig.save();

  const publicBase = env.CLIENT_URL.replace(/\/$/, "");
  const url =
    gig.share.enabled && gig.share.slug
      ? `${publicBase}/gigs/g/${gig.share.slug}`
      : null;

  return ok(res, {
    enabled: gig.share.enabled,
    slug: gig.share.slug ?? null,
    url,
    viewCount: gig.share.viewCount,
  });
});

/* ─── Public ─────────────────────────────────────────────────── */

export const getPublicGig = asyncHandler(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    if (!slug || typeof slug !== "string")
      throw new NotFoundError("Gig not found");
    const gig = await Gig.findOne({
      "share.slug": slug,
      "share.enabled": true,
    });
    if (!gig) throw new NotFoundError("Gig not found");

    Gig.updateOne({ _id: gig._id }, { $inc: { "share.viewCount": 1 } }).catch(
      () => undefined,
    );

    return ok(res, {
      title: gig.title,
      input: {
        serviceName: gig.input.serviceName,
        platform: gig.input.platform,
        niche: gig.input.niche,
        targetAudience: gig.input.targetAudience,
        pricingMin: gig.input.pricingMin,
        pricingMax: gig.input.pricingMax,
        pricingCurrency: gig.input.pricingCurrency,
        deliveryTime: gig.input.deliveryTime,
      },
      content: gig.content,
      score: gig.score,
      status: gig.status,
      generatedBy: gig.generatedBy,
      createdAt: gig.createdAt,
      share: { viewCount: gig.share.viewCount + 1 },
    });
  },
);

/* ─── Export ─────────────────────────────────────────────────── */

export const exportGigPdf = asyncHandler(
  async (req: Request, res: Response) => {
    const authedReq = requireUser(req);
    const gig = await findOwnedGigOr404(authedReq.user._id, req.params.id);
    const buffer = await renderGigPdf(gig);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename(gig.title || gig.input.serviceName, "pdf")}"`,
    );
    res.setHeader("Content-Length", buffer.length.toString());
    res.end(buffer);
  },
);

export const exportGigDocx = asyncHandler(
  async (req: Request, res: Response) => {
    const authedReq = requireUser(req);
    const gig = await findOwnedGigOr404(authedReq.user._id, req.params.id);
    const buffer = await renderGigDocx(gig);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename(gig.title || gig.input.serviceName, "docx")}"`,
    );
    res.setHeader("Content-Length", buffer.length.toString());
    res.end(buffer);
  },
);
