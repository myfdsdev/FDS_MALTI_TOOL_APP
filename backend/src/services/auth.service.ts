import jwt, { type SignOptions } from "jsonwebtoken";
import type { Response } from "express";
import { env, isProduction } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

export interface JwtPayload {
  userId: string;
  type: "access" | "refresh";
}

export const signAccessToken = (userId: string): string => {
  return jwt.sign({ userId, type: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
};

export const signRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type !== "access") throw new UnauthorizedError("Invalid token type");
    return decoded;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    if (decoded.type !== "refresh") throw new UnauthorizedError("Invalid token type");
    return decoded;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};

const cookieBase = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/",
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, {
    ...cookieBase,
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", cookieBase);
  res.clearCookie("refreshToken", cookieBase);
};
