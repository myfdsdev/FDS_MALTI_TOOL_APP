import crypto from "node:crypto";
import type { Request, Response } from "express";
import { User, type UserDocument } from "../models/User.model.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "../services/auth.service.js";
import { verifyGoogleIdToken } from "../services/google.service.js";
import { ok, created } from "../utils/responses.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from "../utils/errors.js";
import { env, isProduction } from "../config/env.js";
import { logger } from "../config/logger.js";
import type {
  RegisterInput,
  LoginInput,
  GoogleAuthInput,
  VerifyEmailInput,
} from "../validators/auth.validator.js";

/** Emails configured (via ADMIN_EMAILS) to be auto-promoted to admin. */
const adminEmails = new Set(
  env.ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

/**
 * Promote a user to admin if their email is in the ADMIN_EMAILS allowlist.
 * Returns true if the role changed (caller is responsible for persisting).
 */
const applyAdminRole = (user: UserDocument): boolean => {
  if (adminEmails.has(user.email.toLowerCase()) && user.role !== "admin") {
    user.role = "admin";
    return true;
  }
  return false;
};

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

/** POST /api/auth/register */
export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError("Email is already registered");

  const user = await User.create({
    email,
    password,
    name,
    provider: "local",
  });

  if (applyAdminRole(user)) await user.save();

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setAuthCookies(res, accessToken, refreshToken);

  return created(res, { user: user.toPublicJSON(), accessToken }, "Account created");
};

/** POST /api/auth/login */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  user.lastLoginAt = new Date();
  applyAdminRole(user);
  await user.save();

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setAuthCookies(res, accessToken, refreshToken);

  return ok(res, { user: user.toPublicJSON(), accessToken }, "Logged in");
};

/** POST /api/auth/google */
export const googleAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body as GoogleAuthInput;

  const profile = await verifyGoogleIdToken(idToken);

  // Find user by googleId, then by email (link accounts)
  let user = await User.findOne({ googleId: profile.googleId });

  if (!user) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      // Existing local account — link Google
      user.googleId = profile.googleId;
      if (!user.avatar && profile.picture) user.avatar = profile.picture;
      if (profile.emailVerified) user.emailVerified = true;
    } else {
      // Brand new user via Google
      user = new User({
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
        avatar: profile.picture,
        provider: "google",
        emailVerified: profile.emailVerified,
      });
    }
  }

  user.lastLoginAt = new Date();
  applyAdminRole(user);
  await user.save();

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setAuthCookies(res, accessToken, refreshToken);

  return ok(res, { user: user.toPublicJSON(), accessToken }, "Logged in with Google");
};

/** POST /api/auth/refresh */
export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new UnauthorizedError("No refresh token");

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.userId);
  if (!user) throw new UnauthorizedError("User no longer exists");

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setAuthCookies(res, accessToken, refreshToken);

  return ok(res, { accessToken }, "Token refreshed");
};

/** POST /api/auth/logout */
export const logout = async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  return ok(res, null, "Logged out");
};

/** GET /api/auth/me */
export const me = async (req: Request, res: Response) => {
  if (!req.user) throw new NotFoundError("User not found");
  return ok(res, { user: req.user.toPublicJSON() });
};

/**
 * POST /api/auth/send-verification — protected.
 * Issues a fresh email-verification token. Since no mail transport is
 * configured, the link is logged server-side and (in non-production)
 * returned in the response so the flow is testable end-to-end.
 */
export const sendVerification = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  if (req.user.emailVerified) {
    throw new BadRequestError("Email is already verified");
  }

  const token = crypto.randomBytes(32).toString("hex");
  req.user.emailVerificationToken = token;
  req.user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
  await req.user.save();

  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  logger.info({ email: req.user.email, verificationUrl }, "Email verification link issued");

  return ok(
    res,
    {
      sent: true,
      // Only exposed outside production — no real mailer is wired up.
      ...(isProduction ? {} : { verificationUrl }),
    },
    "Verification email sent",
  );
};

/**
 * POST /api/auth/verify-email — public, token-based.
 * Confirms an email-verification token and marks the account verified.
 */
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body as VerifyEmailInput;

  const user = await User.findOne({
    emailVerificationToken: token,
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) throw new BadRequestError("Invalid or expired verification token");

  if (
    !user.emailVerificationExpires ||
    user.emailVerificationExpires.getTime() < Date.now()
  ) {
    throw new BadRequestError("Verification token has expired");
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return ok(res, { user: user.toPublicJSON() }, "Email verified");
};
