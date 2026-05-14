import { z } from "zod";
import { AI_PROVIDERS } from "../config/ai.config.js";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  role: z.enum(["user", "admin"]).optional(),
  plan: z.enum(["free", "pro", "team"]).optional(),
});

export const updateUserSchema = z
  .object({
    role: z.enum(["user", "admin"]).optional(),
    plan: z.enum(["free", "pro", "team"]).optional(),
  })
  .refine((data) => data.role !== undefined || data.plan !== undefined, {
    message: "Provide at least one of: role, plan",
  });

export const updateSettingsSchema = z
  .object({
    aiProvider: z.enum(AI_PROVIDERS).optional(),
    aiApiKey: z.string().trim().max(500).optional(),
    aiModel: z.string().trim().min(1).max(120).optional(),
    aiBaseUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  })
  .refine(
    (data) =>
      data.aiProvider !== undefined ||
      data.aiApiKey !== undefined ||
      data.aiModel !== undefined ||
      data.aiBaseUrl !== undefined,
    { message: "Provide at least one of: aiProvider, aiApiKey, aiModel, aiBaseUrl" },
  );

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
