import { z } from "zod";

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

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
