import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Strict rate limit for auth endpoints (per IP).
 * Prevents brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  max: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    error: { code: "RATE_LIMITED" },
  },
});

/**
 * General API rate limit (per user when logged in, per IP otherwise).
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_API_WINDOW_MS,
  max: env.RATE_LIMIT_API_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip || "anonymous",
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
    error: { code: "RATE_LIMITED" },
  },
});
