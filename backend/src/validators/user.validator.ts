import { z } from "zod";
import { AI_PROVIDERS } from "../config/ai.config.js";

export const updateAISettingsSchema = z
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

export type UpdateAISettingsInput = z.infer<typeof updateAISettingsSchema>;
