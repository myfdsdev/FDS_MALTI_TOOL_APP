import type { Request, Response } from "express";
import {
  TOOLS,
  CATEGORIES,
  getToolById,
  getToolsByCategory,
  type ToolCategory,
} from "../config/tools.config.js";
import { generate } from "../services/ai.service.js";
import { checkAndConsume } from "../services/usage.service.js";
import { Generation } from "../models/Generation.model.js";
import { ok } from "../utils/responses.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { logger } from "../config/logger.js";

/** GET /api/tools — public, lists all tools */
export const listTools = (_req: Request, res: Response) => {
  return ok(res, { categories: CATEGORIES, tools: TOOLS });
};

/** GET /api/tools/category/:category */
export const listToolsByCategory = (req: Request, res: Response) => {
  const cat = req.params.category as ToolCategory;
  if (!(cat in CATEGORIES)) throw new NotFoundError(`Unknown category: ${cat}`);
  return ok(res, { category: CATEGORIES[cat], tools: getToolsByCategory(cat) });
};

/** GET /api/tools/:toolId */
export const getTool = (req: Request, res: Response) => {
  const tool = getToolById(req.params.toolId);
  if (!tool) throw new NotFoundError(`Unknown tool: ${req.params.toolId}`);
  return ok(res, tool);
};

/** POST /api/tools/:toolId/generate — protected */
export const generateForTool = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();

  const tool = getToolById(req.params.toolId);
  if (!tool) throw new NotFoundError(`Unknown tool: ${req.params.toolId}`);

  // Enforce quota (throws QuotaExceededError if over)
  await checkAndConsume(req.user);

  // Run generation
  const result = await generate({
    toolId: tool.id,
    toolName: tool.name,
    inputs: req.body,
    user: req.user,
    requestBaseUrl: `${req.protocol}://${req.get("host")}`,
  });

  // Persist to history (fire-and-forget; failure shouldn't block response)
  Generation.create({
    user: req.user._id,
    toolId: tool.id,
    toolName: tool.name,
    category: tool.category,
    inputs: req.body,
    output: result.output,
    mode: result.mode,
    durationMs: result.durationMs,
    tokenCount: result.tokenCount,
  }).catch((err) => logger.error({ err }, "Failed to save generation history"));

  return ok(res, {
    toolId: tool.id,
    toolName: tool.name,
    output: result.output,
    mode: result.mode,
    durationMs: result.durationMs,
    generatedAt: new Date().toISOString(),
  });
};
