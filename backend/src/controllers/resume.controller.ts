import type { Request, Response } from "express";
import { isValidObjectId, type Types } from "mongoose";
import { customAlphabet } from "nanoid";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/responses.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { Resume, type ResumeDocument } from "../models/Resume.model.js";
import { checkAndConsume } from "../services/usage.service.js";
import {
  runAtsCheck,
  runGenerateBullets,
  runImproveField,
  runStarterFill,
  runSuggestSkills,
} from "../services/resume/resume.ai.js";
import { renderResumeDocx } from "../services/resume/docxExporter.js";
import { renderResumePdf } from "../services/resume/pdfExporter.js";
import { env } from "../config/env.js";
import type {
  CreateResumeInput,
  GenerateBulletsInput,
  ImproveFieldInput,
  ShareInput,
  StarterFillInput,
  SuggestSkillsInput,
  UpdateResumeInput,
} from "../validators/resume.validator.js";

type UserRequest = Request & { user: NonNullable<Request["user"]> };

const nanoidSlug = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  12
);

function requireUser(req: Request): UserRequest {
  if (!req.user) throw new UnauthorizedError();
  return req as UserRequest;
}

function ensureObjectId(id: string): void {
  if (!isValidObjectId(id)) {
    throw new NotFoundError("Resume not found");
  }
}

async function findOwnedResumeOr404(userId: Types.ObjectId, id: string): Promise<ResumeDocument> {
  ensureObjectId(id);
  const resume = await Resume.findOne({ _id: id, user: userId });
  if (!resume) throw new NotFoundError("Resume not found");
  return resume;
}

function pickByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc === null || acc === undefined) return undefined;
    if (Array.isArray(acc)) {
      const index = Number(segment);
      return Number.isInteger(index) ? acc[index] : undefined;
    }
    if (typeof acc === "object") {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

function serializeListItem(resume: ResumeDocument) {
  return {
    _id: resume._id,
    title: resume.title,
    template: resume.template,
    themeColor: resume.themeColor,
    fontFamily: resume.fontFamily,
    atsScore: resume.atsScore,
    updatedAt: resume.updatedAt,
    createdAt: resume.createdAt,
    lastEditedAt: resume.lastEditedAt,
    share: { enabled: resume.share.enabled, slug: resume.share.slug, viewCount: resume.share.viewCount },
  };
}

export const listResumes = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resumes = await Resume.find({ user: authedReq.user._id })
    .sort({ updatedAt: -1 })
    .select("title template themeColor fontFamily atsScore updatedAt createdAt lastEditedAt share");
  return ok(res, resumes.map(serializeListItem));
});

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const input = req.body as CreateResumeInput;
  const resume = await Resume.create({
    user: authedReq.user._id,
    title: input.title?.trim() || "Untitled Resume",
    template: input.template,
    themeColor: input.themeColor,
    fontFamily: input.fontFamily,
    content: input.content,
    lastEditedAt: new Date(),
  });
  return created(res, resume, "Resume created");
});

export const getResume = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  return ok(res, resume);
});

export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const input = req.body as UpdateResumeInput;

  if (input.title !== undefined) resume.title = input.title.trim();
  if (input.template !== undefined) resume.template = input.template;
  if (input.themeColor !== undefined) resume.themeColor = input.themeColor;
  if (input.fontFamily !== undefined) resume.fontFamily = input.fontFamily;

  if (input.content !== undefined) {
    const incoming = input.content;
    resume.content.personal = { ...resume.content.personal, ...(incoming.personal ?? {}) };
    if (incoming.experience !== undefined) resume.content.experience = incoming.experience as typeof resume.content.experience;
    if (incoming.education !== undefined) resume.content.education = incoming.education as typeof resume.content.education;
    if (incoming.skills !== undefined) resume.content.skills = incoming.skills as typeof resume.content.skills;
    if (incoming.projects !== undefined) resume.content.projects = incoming.projects as typeof resume.content.projects;
    if (incoming.certifications !== undefined) resume.content.certifications = incoming.certifications as typeof resume.content.certifications;
    if (incoming.languages !== undefined) resume.content.languages = incoming.languages as typeof resume.content.languages;
    if (incoming.awards !== undefined) resume.content.awards = incoming.awards as typeof resume.content.awards;
    if (incoming.hiddenSections !== undefined) resume.content.hiddenSections = incoming.hiddenSections;
    resume.markModified("content");
  }

  resume.lastEditedAt = new Date();
  await resume.save();
  return ok(res, resume, "Resume updated");
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  await Resume.deleteOne({ _id: resume._id, user: authedReq.user._id });
  return ok(res, { deleted: true }, "Resume deleted");
});

export const duplicateResume = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const original = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const clone = await Resume.create({
    user: authedReq.user._id,
    title: `Copy of ${original.title}`,
    template: original.template,
    themeColor: original.themeColor,
    fontFamily: original.fontFamily,
    content: original.toObject().content,
    lastEditedAt: new Date(),
  });
  return created(res, clone, "Resume duplicated");
});

/* ─── AI endpoints ──────────────────────────────────────────── */

export const aiStarterFill = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const { bio } = req.body as StarterFillInput;

  await checkAndConsume(authedReq.user);
  const filledContent = await runStarterFill(bio, authedReq.user);
  resume.content = filledContent;
  resume.markModified("content");
  resume.lastEditedAt = new Date();
  await resume.save();

  return ok(res, resume, "Resume filled by AI");
});

export const aiImproveField = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const { field, context } = req.body as ImproveFieldInput;

  await checkAndConsume(authedReq.user);
  const currentValue = String(pickByPath(resume.content as unknown as Record<string, unknown>, field) ?? "");
  const result = await runImproveField(
    {
      field,
      currentValue,
      context,
      resume: resume.content,
    },
    authedReq.user
  );
  return ok(res, result);
});

export const aiGenerateBullets = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const input = req.body as GenerateBulletsInput;

  await checkAndConsume(authedReq.user);
  const result = await runGenerateBullets(input, authedReq.user);
  return ok(res, result);
});

export const aiSuggestSkills = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const input = req.body as SuggestSkillsInput;

  await checkAndConsume(authedReq.user);
  const result = await runSuggestSkills(input, authedReq.user);
  return ok(res, result);
});

export const aiAtsCheck = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);

  await checkAndConsume(authedReq.user);
  const result = await runAtsCheck(resume, authedReq.user);
  resume.atsScore = result.score;
  resume.atsIssues = result.issues;
  resume.atsSuggestions = result.suggestions;
  await resume.save();
  return ok(res, result);
});

/* ─── Share ─────────────────────────────────────────────────── */

export const updateShare = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const { enabled } = req.body as ShareInput;

  if (enabled) {
    if (!resume.share.slug) {
      // Ensure uniqueness — extremely unlikely collision, but guard anyway.
      let slug = nanoidSlug();
      let attempts = 0;
      while (attempts < 5 && (await Resume.exists({ "share.slug": slug }))) {
        slug = nanoidSlug();
        attempts += 1;
      }
      resume.share.slug = slug;
    }
    resume.share.enabled = true;
  } else {
    resume.share.enabled = false;
    resume.share.slug = null;
  }
  await resume.save();

  const publicBase = env.CLIENT_URL.replace(/\/$/, "");
  const url = resume.share.enabled && resume.share.slug ? `${publicBase}/r/${resume.share.slug}` : null;

  return ok(res, {
    enabled: resume.share.enabled,
    slug: resume.share.slug,
    url,
    viewCount: resume.share.viewCount,
  });
});

/* ─── Public ────────────────────────────────────────────────── */

export const getPublicResume = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  if (!slug || typeof slug !== "string") throw new NotFoundError("Resume not found");
  const resume = await Resume.findOne({ "share.slug": slug, "share.enabled": true });
  if (!resume) throw new NotFoundError("Resume not found");

  // Fire-and-forget view counter so we don't slow the response.
  Resume.updateOne(
    { _id: resume._id },
    { $inc: { "share.viewCount": 1 }, $set: { "share.lastViewedAt": new Date() } }
  ).catch(() => undefined);

  return ok(res, {
    title: resume.title,
    template: resume.template,
    themeColor: resume.themeColor,
    fontFamily: resume.fontFamily,
    content: resume.content,
    share: { viewCount: resume.share.viewCount + 1 },
  });
});

/* ─── Export ────────────────────────────────────────────────── */

function safeFilename(title: string, ext: string): string {
  const cleaned = title
    .replace(/[^a-z0-9-_ ]/gi, "")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "resume";
  return `${cleaned}.${ext}`;
}

export const exportPdf = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const buffer = await renderResumePdf(resume);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFilename(resume.title, "pdf")}"`
  );
  res.setHeader("Content-Length", buffer.length.toString());
  res.end(buffer);
});

export const exportDocx = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const resume = await findOwnedResumeOr404(authedReq.user._id, req.params.id);
  const buffer = await renderResumeDocx(resume);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFilename(resume.title, "docx")}"`
  );
  res.setHeader("Content-Length", buffer.length.toString());
  res.end(buffer);
});

/* ─── Public PDF export (uses share slug) ─────────────────── */

export const exportPublicPdf = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  if (!slug) throw new BadRequestError("Slug is required");
  const resume = await Resume.findOne({ "share.slug": slug, "share.enabled": true });
  if (!resume) throw new NotFoundError("Resume not found");
  const buffer = await renderResumePdf(resume);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFilename(resume.title, "pdf")}"`
  );
  res.setHeader("Content-Length", buffer.length.toString());
  res.end(buffer);
});
