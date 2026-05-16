import { z } from "zod";

export const createReportSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2000)
    .url("Must be a valid URL")
    .refine((v) => /^https?:\/\//i.test(v), "URL must start with http or https"),
});

export const shareReportSchema = z.object({
  enabled: z.boolean(),
});

export const listReportsQuerySchema = z.object({
  status: z.enum(["queued", "processing", "completed", "failed"]).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  cursor: z.string().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ShareReportInput = z.infer<typeof shareReportSchema>;
export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
