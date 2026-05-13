import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { BadRequestError } from "../utils/errors.js";

type Source = "body" | "query" | "params";

export const validate =
  (schema: ZodSchema, source: Source = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      return next(new BadRequestError("Validation failed", details));
    }
    // Replace with parsed (coerced/stripped) data
    (req as any)[source] = result.data;
    next();
  };
