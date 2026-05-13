import type { Request, Response } from "express";
import { User } from "../models/User.model.js";
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
} from "../utils/errors.js";
import type { RegisterInput, LoginInput, GoogleAuthInput } from "../validators/auth.validator.js";

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
