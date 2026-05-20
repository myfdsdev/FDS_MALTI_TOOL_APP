import type { Request, Response } from "express";
import { isValidObjectId, type Types } from "mongoose";
import { customAlphabet } from "nanoid";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/responses.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { GrowthReport, type GrowthReportDocument } from "../models/GrowthReport.model.js";
import { checkAndConsume } from "../services/usage.service.js";
import { resolveAIConfigForUser } from "../services/ai/config.js";
import { runReportGeneration } from "../services/report/index.js";
import { renderReportPdf } from "../services/report/pdfExporter.js";
import { renderReportDocx } from "../services/report/docxExporter.js";
import { hostnameFromUrl } from "../services/report/scraper.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type {
  CreateReportInput,
  ListReportsQuery,
  ShareReportInput,
} from "../validators/report.validator.js";

type UserRequest = Request & { user: NonNullable<Request["user"]> };

const nanoidSlug = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  12
);

const AI_REQUIRED_MESSAGE =
  "AI is not configured. Add an AI API key before generating Growth Reports.";

function requireUser(req: Request): UserRequest {
  if (!req.user) throw new UnauthorizedError();
  return req as UserRequest;
}

function ensureObjectId(id: string): void {
  if (!isValidObjectId(id)) throw new NotFoundError("Report not found");
}

async function findOwnedReportOr404(userId: Types.ObjectId, id: string): Promise<GrowthReportDocument> {
  ensureObjectId(id);
  const report = await GrowthReport.findOne({ _id: id, user: userId });
  if (!report) throw new NotFoundError("Report not found");
  return report;
}

function serializeListItem(report: GrowthReportDocument) {
  return {
    _id: report._id,
    websiteUrl: report.websiteUrl,
    hostname: report.hostname,
    status: report.status,
    statusStage: report.statusStage,
    generatedBy: report.generatedBy,
    error: report.error,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    overallScore: report.content?.scores.overall ?? null,
    detectedGenre: report.content?.detectedGenre ?? null,
    websiteTitle: report.content?.websiteTitle ?? null,
    share: { enabled: report.share.enabled, slug: report.share.slug, viewCount: report.share.viewCount },
  };
}

export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { status, limit } = req.query as unknown as ListReportsQuery;

  const filter: Record<string, unknown> = { user: authedReq.user._id };
  if (status) filter.status = status;

  const reports = await GrowthReport.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  return ok(res, reports.map(serializeListItem));
});

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { url } = req.body as CreateReportInput;

  if (!resolveAIConfigForUser(authedReq.user)) {
    throw new BadRequestError(AI_REQUIRED_MESSAGE);
  }

  // Quota up-front so users don't queue jobs they can't run.
  await checkAndConsume(authedReq.user);

  const report = await GrowthReport.create({
    user: authedReq.user._id,
    websiteUrl: url,
    hostname: hostnameFromUrl(url),
    status: "queued",
    statusStage: "queued",
  });

  // Fire-and-forget; the orchestrator catches all errors itself.
  runReportGeneration(String(report._id)).catch((err) => {
    logger.error({ err, reportId: report._id }, "Async generation crashed");
  });

  return res.status(202).json({
    success: true,
    message: "Report queued",
    data: { reportId: String(report._id) },
  });
});

export const getReport = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const report = await findOwnedReportOr404(authedReq.user._id, req.params.id);
  return ok(res, report);
});

export const retryReport = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const report = await findOwnedReportOr404(authedReq.user._id, req.params.id);
  if (report.status !== "failed" && report.status !== "completed") {
    throw new BadRequestError("Report is already in progress");
  }

  if (!resolveAIConfigForUser(authedReq.user)) {
    throw new BadRequestError(AI_REQUIRED_MESSAGE);
  }

  await checkAndConsume(authedReq.user);

  report.status = "queued";
  report.statusStage = "queued";
  report.error = null;
  await report.save();

  runReportGeneration(String(report._id)).catch((err) => {
    logger.error({ err, reportId: report._id }, "Async retry crashed");
  });

  return res.status(202).json({
    success: true,
    message: "Report retry queued",
    data: { reportId: String(report._id) },
  });
});

export const deleteReport = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const report = await findOwnedReportOr404(authedReq.user._id, req.params.id);
  await GrowthReport.deleteOne({ _id: report._id, user: authedReq.user._id });
  return ok(res, { deleted: true }, "Report deleted");
});

export const updateShare = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const report = await findOwnedReportOr404(authedReq.user._id, req.params.id);
  const { enabled } = req.body as ShareReportInput;

  if (enabled) {
    if (!report.share.slug) {
      let slug = nanoidSlug();
      let attempts = 0;
      while (attempts < 5 && (await GrowthReport.exists({ "share.slug": slug }))) {
        slug = nanoidSlug();
        attempts += 1;
      }
      report.share.slug = slug;
    }
    report.share.enabled = true;
  } else {
    report.share.enabled = false;
    report.share.slug = null;
  }
  await report.save();

  const publicBase = env.CLIENT_URL.replace(/\/$/, "");
  const url = report.share.enabled && report.share.slug ? `${publicBase}/reports/r/${report.share.slug}` : null;

  return ok(res, {
    enabled: report.share.enabled,
    slug: report.share.slug,
    url,
    viewCount: report.share.viewCount,
  });
});

function safeFilename(title: string, ext: string): string {
  const cleaned =
    (title || "growth-report")
      .replace(/[^a-z0-9-_ ]/gi, "")
      .replace(/\s+/g, "_")
      .slice(0, 80) || "growth-report";
  return `${cleaned}.${ext}`;
}

export const exportReportPdf = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const report = await findOwnedReportOr404(authedReq.user._id, req.params.id);
  const buffer = await renderReportPdf(report);
  const name = report.content?.websiteTitle || report.hostname;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(name, "pdf")}"`);
  res.setHeader("Content-Length", buffer.length.toString());
  res.end(buffer);
});

export const exportReportDocx = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const report = await findOwnedReportOr404(authedReq.user._id, req.params.id);
  const buffer = await renderReportDocx(report);
  const name = report.content?.websiteTitle || report.hostname;
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(name, "docx")}"`);
  res.setHeader("Content-Length", buffer.length.toString());
  res.end(buffer);
});

export const getPublicReport = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  if (!slug || typeof slug !== "string") throw new NotFoundError("Report not found");
  const report = await GrowthReport.findOne({ "share.slug": slug, "share.enabled": true });
  if (!report) throw new NotFoundError("Report not found");

  GrowthReport.updateOne(
    { _id: report._id },
    { $inc: { "share.viewCount": 1 } }
  ).catch(() => undefined);

  return ok(res, {
    websiteUrl: report.websiteUrl,
    hostname: report.hostname,
    content: report.content,
    snapshot: report.snapshot,
    status: report.status,
    statusStage: report.statusStage,
    generatedBy: report.generatedBy,
    createdAt: report.createdAt,
    share: { viewCount: report.share.viewCount + 1 },
  });
});
