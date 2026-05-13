import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import type { Request } from "express";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import apiRouter from "./routes/index.js";
import { requestId } from "./middleware/requestId.middleware.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

export const createApp = (): Application => {
  const app = express();

  // Trust proxy (Render/Fly sit behind a load balancer)
  app.set("trust proxy", 1);

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // CORS — cookies require credentials: true on both sides
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  // Body + cookies
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  // Request tracing + logging
  app.use(requestId);
  app.use(
    pinoHttp.default({
      logger,
      customProps: (req: Request) => ({ requestId: req.requestId }),
      autoLogging: {
        ignore: (req: Request) => req.url === "/api/health",
      },
    })
  );

  // Root
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Multi-Tool AI API",
      version: "1.0.0",
      docs: "/api/health",
    });
  });

  // API routes
  app.use("/api", apiRouter);

  // 404 + error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
