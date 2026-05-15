import { z } from "zod";

const objectIdSchema = z.string().min(1);
const hexColorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color");

const checklistItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1).max(300),
  done: z.boolean(),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional().default(""),
  color: hexColorSchema.optional().default("#4F46E5"),
  icon: z.string().trim().min(1).max(80).optional().default("folder"),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    color: hexColorSchema.optional(),
    icon: z.string().trim().min(1).max(80).optional(),
    status: z.enum(["active", "archived", "completed"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  status: z.enum(["todo", "in_progress", "review", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  startDate: z.coerce.date().nullable().optional().default(null),
  dueDate: z.coerce.date().nullable().optional().default(null),
  completedAt: z.coerce.date().nullable().optional(),
  progress: z.number().int().min(0).max(100).optional().default(0),
  checklist: z.array(checklistItemSchema).optional().default([]),
  tags: z.array(z.string().trim().min(1).max(50)).optional().default([]),
  assignee: objectIdSchema.nullable().optional().default(null),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    startDate: z.coerce.date().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    progress: z.number().int().min(0).max(100).optional(),
    checklist: z.array(checklistItemSchema).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).optional(),
    assignee: objectIdSchema.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const reorderTasksSchema = z.object({
  projectId: objectIdSchema,
  status: z.enum(["todo", "in_progress", "review", "done"]),
  taskIds: z.array(objectIdSchema),
});

export const createNoteSchema = z.object({
  projectId: objectIdSchema.optional(),
  taskId: objectIdSchema.optional(),
  title: z.string().trim().max(200).optional().default(""),
  content: z.string().max(50000).optional().default(""),
  pinned: z.boolean().optional().default(false),
});

export const updateNoteSchema = z
  .object({
    title: z.string().trim().max(200).optional(),
    content: z.string().max(50000).optional(),
    pinned: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const calendarQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  sortBy: z.enum(["position", "dueDate", "priority"]).optional().default("position"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(100),
});

export const listProjectsQuerySchema = z.object({
  status: z.enum(["active", "archived", "completed"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(100),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>;
export type ListTasksQueryInput = z.infer<typeof listTasksQuerySchema>;
export type ListProjectsQueryInput = z.infer<typeof listProjectsQuerySchema>;
