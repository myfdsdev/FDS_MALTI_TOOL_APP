import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
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

// ============ PROJECTS ============
router.get("/projects", validate(listProjectsQuerySchema, "query"), listProjects);
router.post("/projects", validate(createProjectSchema), createProject);
router.get("/projects/:id", getProject);
router.patch("/projects/:id", validate(updateProjectSchema), updateProject);
router.delete("/projects/:id", deleteProject);

// ============ TASKS ============
router.get("/projects/:projectId/tasks", validate(listTasksQuerySchema, "query"), listTasks);
router.post("/projects/:projectId/tasks", validate(createTaskSchema), createTask);
router.get("/tasks/:id", getTask);
router.patch("/tasks/:id", validate(updateTaskSchema), updateTask);
router.delete("/tasks/:id", deleteTask);

// Checklist operations
router.post("/tasks/:id/checklist", addChecklistItem);
router.patch("/tasks/:id/checklist/:itemId", updateChecklistItem);
router.delete("/tasks/:id/checklist/:itemId", deleteChecklistItem);

// Bulk reorder
router.post("/tasks/reorder", validate(reorderTasksSchema), reorderTasks);

// ============ NOTES ============
router.get("/notes", listNotes);
router.post("/notes", validate(createNoteSchema), createNote);
router.patch("/notes/:id", validate(updateNoteSchema), updateNote);
router.delete("/notes/:id", deleteNote);

// ============ CROSS-CUTTING ============
router.get("/today", getTodayTasks);
router.get("/calendar", validate(calendarQuerySchema, "query"), getCalendarTasks);
router.get("/stats", getStats);

export default router;
