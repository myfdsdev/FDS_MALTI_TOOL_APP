import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../utils/errors.js";
import { logger } from "../config/logger.js";
import { isProduction } from "../config/env.js";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: { code: "ROUTE_NOT_FOUND" },
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // 1. Operational errors (our own thrown errors)
  if (err instanceof AppError) {
    logger.warn(
      { err, requestId: req.requestId, path: req.path, method: req.method },
      err.message
    );
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: { code: err.code, details: err.details },
    });
  }

  // 2. Zod validation errors that escaped middleware
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: { code: "VALIDATION_ERROR", details: err.flatten().fieldErrors },
    });
  }

  // 3. Mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Database validation failed",
      error: {
        code: "DB_VALIDATION_ERROR",
        details: Object.fromEntries(
          Object.entries(err.errors).map(([k, v]) => [k, v.message])
        ),
      },
    });
  }

  // 4. Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      error: { code: "DUPLICATE_KEY", details: { field } },
    });
  }

  // 5. Unknown errors — log everything, hide stack from clients in prod
  logger.error(
    { err, requestId: req.requestId, path: req.path, method: req.method },
    "Unhandled error"
  );
  res.status(500).json({
    success: false,
    message: isProduction ? "Internal server error" : err.message,
    error: {
      code: "INTERNAL_ERROR",
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};
