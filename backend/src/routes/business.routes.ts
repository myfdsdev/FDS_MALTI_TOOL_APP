import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceEnabled } from "../middleware/featureFlag.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  reorderTasksSchema,
  createNoteSchema,
  updateNoteSchema,
  calendarQuerySchema,
  listProjectsQuerySchema,
  listTasksQuerySchema,
} from "../validators/business.validator.js";
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderTasks,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  getTodayTasks,
  getCalendarTasks,
  getStats,
} from "../controllers/business.controller.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// ============ PROJECTS (gated) ============
router.get("/projects", requireWorkspaceEnabled("projects"), validate(listProjectsQuerySchema, "query"), listProjects);
router.post("/projects", requireWorkspaceEnabled("projects"), validate(createProjectSchema), createProject);
router.get("/projects/:id", requireWorkspaceEnabled("projects"), getProject);
router.patch("/projects/:id", requireWorkspaceEnabled("projects"), validate(updateProjectSchema), updateProject);
router.delete("/projects/:id", requireWorkspaceEnabled("projects"), deleteProject);

// ============ TASKS (gated by projects workspace) ============
router.get("/projects/:projectId/tasks", requireWorkspaceEnabled("projects"), validate(listTasksQuerySchema, "query"), listTasks);
router.post("/projects/:projectId/tasks", requireWorkspaceEnabled("projects"), validate(createTaskSchema), createTask);
router.get("/tasks/:id", requireWorkspaceEnabled("projects"), getTask);
router.patch("/tasks/:id", requireWorkspaceEnabled("projects"), validate(updateTaskSchema), updateTask);
router.delete("/tasks/:id", requireWorkspaceEnabled("projects"), deleteTask);

router.post("/tasks/:id/checklist", requireWorkspaceEnabled("projects"), addChecklistItem);
router.patch("/tasks/:id/checklist/:itemId", requireWorkspaceEnabled("projects"), updateChecklistItem);
router.delete("/tasks/:id/checklist/:itemId", requireWorkspaceEnabled("projects"), deleteChecklistItem);

router.post("/tasks/reorder", requireWorkspaceEnabled("projects"), validate(reorderTasksSchema), reorderTasks);

// ============ NOTES (gated) ============
router.get("/notes", requireWorkspaceEnabled("notes"), listNotes);
router.post("/notes", requireWorkspaceEnabled("notes"), validate(createNoteSchema), createNote);
router.patch("/notes/:id", requireWorkspaceEnabled("notes"), validate(updateNoteSchema), updateNote);
router.delete("/notes/:id", requireWorkspaceEnabled("notes"), deleteNote);

// ============ CROSS-CUTTING (always available — small read-only widgets) ============
router.get("/today", getTodayTasks);
router.get("/calendar", requireWorkspaceEnabled("calendar"), validate(calendarQuerySchema, "query"), getCalendarTasks);
router.get("/stats", getStats);

export default router;
