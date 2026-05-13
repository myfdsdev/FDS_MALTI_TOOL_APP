import { z } from "zod";

export const generateInputSchema = z
  .record(z.union([z.string(), z.number(), z.boolean()]))
  .refine((obj) => Object.keys(obj).length > 0, "At least one input is required")
  .refine(
    (obj) => Object.values(obj).every((v) => String(v).length <= 5000),
    "Input values must be under 5000 characters each"
  );

export const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  toolId: z.string().optional(),
});
