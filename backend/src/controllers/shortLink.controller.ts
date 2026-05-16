import type { Request, Response } from "express";
import { ShortLink } from "../models/ShortLink.model.js";
import { NotFoundError } from "../utils/errors.js";

export const redirectShortLink = async (req: Request, res: Response) => {
  const code = req.params.code?.trim().toLowerCase();
  if (!code) throw new NotFoundError("Short link not found");

  const link = await ShortLink.findOne({ code, status: "active" });
  if (!link) throw new NotFoundError("Short link not found");

  await ShortLink.updateOne(
    { _id: link._id },
    { $inc: { clicks: 1 }, $set: { lastClickedAt: new Date() } },
  );

  return res.redirect(302, link.originalUrl);
};
