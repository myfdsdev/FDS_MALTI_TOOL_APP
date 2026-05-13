import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

const client = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleProfile> => {
  if (!client || !env.GOOGLE_CLIENT_ID) {
    throw new UnauthorizedError("Google OAuth is not configured on this server");
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedError("Invalid Google token payload");
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      picture: payload.picture,
      emailVerified: payload.email_verified ?? false,
    };
  } catch {
    throw new UnauthorizedError("Invalid Google ID token");
  }
};
