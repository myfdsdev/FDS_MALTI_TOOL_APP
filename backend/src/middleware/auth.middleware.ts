import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/auth.service.js";
import { User } from "../models/User.model.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

const extractToken = (req: Request): string | null => {
  // Prefer cookie (more secure), fall back to Authorization header
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
};

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) throw new UnauthorizedError("Authentication required");

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (!user) throw new UnauthorizedError("User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Admin guard — must run after `requireAuth`. Rejects non-admin users.
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new UnauthorizedError("Authentication required"));
  if (req.user.role !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }
  next();
};

/**
 * Optional auth — attaches user if token is valid, otherwise continues anonymously.
 * Useful for endpoints that work better with auth but don't require it.
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (user) req.user = user;
    next();
  } catch {
    next(); // silently continue if token invalid
  }
};
