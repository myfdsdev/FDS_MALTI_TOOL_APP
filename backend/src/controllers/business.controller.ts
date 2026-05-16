import type { Request, Response } from "express";
import mongoose, { isValidObjectId, type Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { Note } from "../models/Note.model.js";
import { Project, type ProjectDocument } from "../models/Project.model.js";
import { Task, type ChecklistItem, type TaskDocument, type TaskPriority } from "../models/Task.model.js";
import type {
  CalendarQueryInput,
  CreateNoteInput,
  CreateProjectInput,
  CreateTaskInput,
  ListProjectsQueryInput,
  ListTasksQueryInput,
  ReorderTasksInput,
  UpdateNoteInput,
  UpdateProjectInput,
  UpdateTaskInput,
} from "../validators/business.validator.js";

type UserRequest = Request & { user: NonNullable<Request["user"]> };

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function requireUser(req: Request): UserRequest {
  if (!req.user) throw new UnauthorizedError();
  return req as UserRequest;
}

function ensureObjectId(id: string, label: string): void {
  if (!isValidObjectId(id)) {
    throw new NotFoundError(`${label} not found`);
  }
}

function normalizeTags(tags: string[] | undefined): string[] | undefined {
  if (!tags) return undefined;
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function normalizeChecklist(checklist: ChecklistItem[] | undefined): ChecklistItem[] | undefined {
  if (!checklist) return undefined;
  return checklist.map((item) => ({
    id: item.id,
    text: item.text.trim(),
    done: Boolean(item.done),
  }));
}

function serializeProject(project: unknown) {
  const data =
    project && typeof project === "object" && "toObject" in project && typeof project.toObject === "function"
      ? project.toObject()
      : (project as Record<string, unknown>);
  const taskCount = Number(data.taskCount ?? 0);
  const completedCount = Number(data.completedCount ?? 0);
  return {
    ...data,
    progressPercent: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
  };
}

async function findOwnedProjectOr404(userId: Types.ObjectId, projectId: string) {
  ensureObjectId(projectId, "Project");
  const project = await Project.findOne({ _id: projectId, user: userId });
  if (!project) throw new NotFoundError("Project not found");
  return project;
}

async function findOwnedTaskOr404(userId: Types.ObjectId, taskId: string) {
  ensureObjectId(taskId, "Task");
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) throw new NotFoundError("Task not found");
  return task;
}

async function findOwnedNoteOr404(userId: Types.ObjectId, noteId: string) {
  ensureObjectId(noteId, "Note");
  const note = await Note.findOne({ _id: noteId, user: userId });
  if (!note) throw new NotFoundError("Note not found");
  return note;
}

async function adjustProjectCounts(
  userId: Types.ObjectId,
  projectId: Types.ObjectId | string,
  changes: { taskDelta?: number; completedDelta?: number }
) {
  const update: Record<string, Record<string, number>> = {};
  if (changes.taskDelta) {
    update.$inc ??= {};
    update.$inc.taskCount = changes.taskDelta;
  }
  if (changes.completedDelta) {
    update.$inc ??= {};
    update.$inc.completedCount = changes.completedDelta;
  }
  if (update.$inc) {
    await Project.updateOne({ _id: projectId, user: userId }, update);
  }
}

function resolveTaskState(
  currentTask: Pick<TaskDocument, "status" | "progress" | "completedAt">,
  input: CreateTaskInput | UpdateTaskInput
) {
  let status = input.status ?? currentTask.status;
  let progress = input.progress ?? currentTask.progress;
  let completedAt = input.completedAt ?? currentTask.completedAt ?? null;

  if (status === "done" || progress === 100) {
    status = "done";
    progress = 100;
    completedAt = completedAt ?? new Date();
  } else if (status === "todo") {
    progress = 0;
    completedAt = null;
  } else if (currentTask.status === "done") {
    completedAt = null;
  }

  return { status, progress, completedAt };
}

function compareTasksForToday(a: { priority: TaskPriority; dueDate?: Date | null }, b: { priority: TaskPriority; dueDate?: Date | null }) {
  const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (priorityDiff !== 0) return priorityDiff;
  return (a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER);
}

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { status, page, limit } = req.query as unknown as ListProjectsQueryInput;

  const filter: Record<string, unknown> = { user: authedReq.user._id };
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    Project.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  return ok(res, {
    items: items.map((project) => serializeProject(project)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const input = req.body as CreateProjectInput;

  const project = await Project.create({
    user: authedReq.user._id,
    name: input.name.trim(),
    description: input.description.trim(),
    color: input.color,
    icon: input.icon,
  });

  return created(res, serializeProject(project), "Project created");
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const project = await findOwnedProjectOr404(authedReq.user._id, req.params.id);

  const recentTasks = await Task.find({
    user: authedReq.user._id,
    project: project._id,
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(8)
    .lean();

  return ok(res, {
    ...serializeProject(project),
    recentTasks,
  });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  ensureObjectId(req.params.id, "Project");

  const input = req.body as UpdateProjectInput;
  const update: UpdateProjectInput = {};
  if (input.name !== undefined) update.name = input.name.trim();
  if (input.description !== undefined) update.description = input.description.trim();
  if (input.color !== undefined) update.color = input.color;
  if (input.icon !== undefined) update.icon = input.icon.trim();
  if (input.status !== undefined) update.status = input.status;

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: authedReq.user._id },
    { $set: update },
    { new: true }
  );

  if (!project) throw new NotFoundError("Project not found");
  return ok(res, serializeProject(project), "Project updated");
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const project = await findOwnedProjectOr404(authedReq.user._id, req.params.id);
  const taskIds = await Task.find({
    user: authedReq.user._id,
    project: project._id,
  }).distinct("_id");

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Task.deleteMany({ user: authedReq.user._id, project: project._id }).session(session);
      await Note.deleteMany({
        user: authedReq.user._id,
        $or: [{ project: project._id }, { task: { $in: taskIds } }],
      }).session(session);
      await Project.deleteOne({ _id: project._id, user: authedReq.user._id }).session(session);
    });
  } catch {
    await Note.deleteMany({
      user: authedReq.user._id,
      $or: [{ project: project._id }, { task: { $in: taskIds } }],
    });
    await Task.deleteMany({ user: authedReq.user._id, project: project._id });
    await Project.deleteOne({ _id: project._id, user: authedReq.user._id });
  } finally {
    await session.endSession();
  }

  return ok(res, { deleted: true }, "Project deleted");
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { projectId } = req.params;
  const { status, priority, sortBy, page, limit } = req.query as unknown as ListTasksQueryInput;

  await findOwnedProjectOr404(authedReq.user._id, projectId);

  const filter: Record<string, unknown> = {
    user: authedReq.user._id,
    project: projectId,
  };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const sort: Record<string, 1 | -1> =
    sortBy === "dueDate"
      ? { dueDate: 1, position: 1, createdAt: 1 }
      : sortBy === "priority"
        ? { dueDate: 1, createdAt: -1 }
        : { status: 1, position: 1, createdAt: 1 };

  if (sortBy === "priority") {
    const all = await Task.find(filter).lean();
    all.sort((a, b) => compareTasksForToday(a, b));
    const total = all.length;
    const paged = all.slice((page - 1) * limit, page * limit);
    return ok(res, {
      items: paged,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }

  const [items, total] = await Promise.all([
    Task.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return ok(res, {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { projectId } = req.params;
  const input = req.body as CreateTaskInput;

  const project = await findOwnedProjectOr404(authedReq.user._id, projectId);
  const normalizedTags = normalizeTags(input.tags) ?? [];
  const normalizedChecklist = normalizeChecklist(input.checklist) ?? [];
  const resolvedState = resolveTaskState(
    { status: "todo", progress: 0, completedAt: null },
    input
  );

  const lastTask = await Task.findOne({
    user: authedReq.user._id,
    project: project._id,
    status: resolvedState.status,
  }).sort({ position: -1 });

  const task = await Task.create({
    user: authedReq.user._id,
    project: project._id,
    title: input.title.trim(),
    description: input.description.trim(),
    status: resolvedState.status,
    priority: input.priority,
    startDate: input.startDate,
    dueDate: input.dueDate,
    completedAt: resolvedState.completedAt,
    progress: resolvedState.progress,
    checklist: normalizedChecklist,
    tags: normalizedTags,
    assignee: input.assignee,
    position: (lastTask?.position ?? -1) + 1,
  });

  await adjustProjectCounts(authedReq.user._id, project._id, {
    taskDelta: 1,
    completedDelta: task.status === "done" ? 1 : 0,
  });

  return created(res, task, "Task created");
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const task = await findOwnedTaskOr404(authedReq.user._id, req.params.id);
  return ok(res, task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const task = await findOwnedTaskOr404(authedReq.user._id, req.params.id);
  const input = req.body as UpdateTaskInput;

  const normalizedTags = normalizeTags(input.tags);
  const normalizedChecklist = normalizeChecklist(input.checklist);
  const resolvedState = resolveTaskState(task, input);

  const previousStatus = task.status;
  const update: UpdateTaskInput = {
    status: resolvedState.status,
    progress: resolvedState.progress,
    completedAt: resolvedState.completedAt,
  };
  if (input.title !== undefined) update.title = input.title.trim();
  if (input.description !== undefined) update.description = input.description.trim();
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.startDate !== undefined) update.startDate = input.startDate;
  if (input.dueDate !== undefined) update.dueDate = input.dueDate;
  if (input.tags !== undefined) update.tags = normalizedTags;
  if (input.checklist !== undefined) update.checklist = normalizedChecklist;
  if (input.assignee !== undefined) update.assignee = input.assignee;

  Object.assign(task, update);
  await task.save();

  const completedDelta =
    previousStatus !== "done" && task.status === "done"
      ? 1
      : previousStatus === "done" && task.status !== "done"
        ? -1
        : 0;

  if (completedDelta !== 0) {
    await adjustProjectCounts(authedReq.user._id, task.project, { completedDelta });
  }

  return ok(res, task, "Task updated");
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const task = await findOwnedTaskOr404(authedReq.user._id, req.params.id);

  await Promise.all([
    Note.deleteMany({ user: authedReq.user._id, task: task._id }),
    Task.deleteOne({ _id: task._id, user: authedReq.user._id }),
  ]);

  await adjustProjectCounts(authedReq.user._id, task.project, {
    taskDelta: -1,
    completedDelta: task.status === "done" ? -1 : 0,
  });

  return ok(res, { deleted: true }, "Task deleted");
});

export const addChecklistItem = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const task = await findOwnedTaskOr404(authedReq.user._id, req.params.id);
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) throw new BadRequestError("Text is required");

  task.checklist.push({
    id: new mongoose.Types.ObjectId().toString(),
    text,
    done: false,
  });
  await task.save();

  return ok(res, task, "Checklist item added");
});

export const updateChecklistItem = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const task = await findOwnedTaskOr404(authedReq.user._id, req.params.id);
  const item = task.checklist.find((entry) => entry.id === req.params.itemId);

  if (!item) throw new NotFoundError("Checklist item not found");

  if (typeof req.body?.text === "string") {
    const text = req.body.text.trim();
    if (!text) throw new BadRequestError("Text is required");
    item.text = text;
  }
  if (typeof req.body?.done === "boolean") {
    item.done = req.body.done;
  }

  await task.save();
  return ok(res, task, "Checklist item updated");
});

export const deleteChecklistItem = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const task = await findOwnedTaskOr404(authedReq.user._id, req.params.id);

  task.checklist = task.checklist.filter((entry) => entry.id !== req.params.itemId);
  await task.save();

  return ok(res, task, "Checklist item deleted");
});

export const reorderTasks = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const input = req.body as ReorderTasksInput;

  await findOwnedProjectOr404(authedReq.user._id, input.projectId);

  const tasks = await Task.find({
    _id: { $in: input.taskIds },
    user: authedReq.user._id,
    project: input.projectId,
  }).select("_id");

  if (tasks.length !== input.taskIds.length) {
    throw new NotFoundError("One or more tasks were not found");
  }

  await Task.bulkWrite(
    input.taskIds.map((taskId, index) => ({
      updateOne: {
        filter: {
          _id: taskId,
          user: authedReq.user._id,
          project: input.projectId,
        },
        update: {
          $set: {
            status: input.status,
            position: index,
          },
        },
      },
    }))
  );

  return ok(res, { reordered: true }, "Tasks reordered");
});

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { projectId, taskId, pinned } = req.query as {
    projectId?: string;
    taskId?: string;
    pinned?: string;
  };

  const filter: Record<string, unknown> = { user: authedReq.user._id };
  let ownedProject: ProjectDocument | null = null;

  if (projectId) {
    ownedProject = await findOwnedProjectOr404(authedReq.user._id, projectId);
    filter.project = ownedProject._id;
  }
  if (taskId) {
    const task = await findOwnedTaskOr404(authedReq.user._id, taskId);
    if (ownedProject && String(task.project) !== String(ownedProject._id)) {
      throw new NotFoundError("Task not found");
    }
    filter.task = task._id;
  }
  if (pinned === "true") {
    filter.pinned = true;
  }

  const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1, createdAt: -1 }).lean();
  return ok(res, notes);
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const input = req.body as CreateNoteInput;

  if (input.projectId) {
    await findOwnedProjectOr404(authedReq.user._id, input.projectId);
  }
  if (input.taskId) {
    await findOwnedTaskOr404(authedReq.user._id, input.taskId);
  }

  const note = await Note.create({
    user: authedReq.user._id,
    project: input.projectId ?? null,
    task: input.taskId ?? null,
    title: input.title.trim(),
    content: input.content,
    pinned: input.pinned,
  });

  return created(res, note, "Note created");
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const note = await findOwnedNoteOr404(authedReq.user._id, req.params.id);
  const input = req.body as UpdateNoteInput;

  if (input.title !== undefined) note.title = input.title.trim();
  if (input.content !== undefined) note.content = input.content;
  if (input.pinned !== undefined) note.pinned = input.pinned;

  await note.save();
  return ok(res, note, "Note updated");
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const note = await findOwnedNoteOr404(authedReq.user._id, req.params.id);
  await Note.deleteOne({ _id: note._id, user: authedReq.user._id });
  return ok(res, { deleted: true }, "Note deleted");
});

export const getTodayTasks = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const tasks = await Task.find({
    user: authedReq.user._id,
    status: { $ne: "done" },
    dueDate: {
      $ne: null,
      $lt: endOfToday,
    },
  })
    .populate({ path: "project", select: "name color status" })
    .lean();

  tasks.sort((a, b) => compareTasksForToday(a, b));

  return ok(res, tasks);
});

export const getCalendarTasks = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { from, to } = req.query as unknown as CalendarQueryInput;

  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  if (end < start) {
    throw new BadRequestError("The 'to' date must be on or after the 'from' date");
  }

  const tasks = await Task.find({
    user: authedReq.user._id,
    dueDate: {
      $gte: start,
      $lte: end,
    },
  })
    .populate({ path: "project", select: "name color status" })
    .sort({ dueDate: 1, position: 1, createdAt: 1 })
    .lean();

  const grouped = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    if (!task.dueDate) return acc;
    const dateKey = task.dueDate.toISOString().slice(0, 10);
    acc[dateKey] ??= [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  return ok(res, grouped);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);

  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [totalProjects, activeProjects, totalTasks, completedThisWeek, overdueCount] = await Promise.all([
    Project.countDocuments({ user: authedReq.user._id }),
    Project.countDocuments({ user: authedReq.user._id, status: "active" }),
    Task.countDocuments({ user: authedReq.user._id }),
    Task.countDocuments({
      user: authedReq.user._id,
      status: "done",
      completedAt: { $gte: startOfWeek },
    }),
    Task.countDocuments({
      user: authedReq.user._id,
      status: { $ne: "done" },
      dueDate: { $ne: null, $lt: new Date() },
    }),
  ]);

  return ok(res, {
    totalProjects,
    activeProjects,
    totalTasks,
    completedThisWeek,
    overdueCount,
  });
});
