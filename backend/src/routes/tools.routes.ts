import { Router } from "express";
import * as toolsController from "../controllers/tools.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { apiLimiter } from "../middleware/rateLimit.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateInputSchema } from "../validators/tools.validator.js";

const router = Router();

// Public discovery endpoints
router.get("/", toolsController.listTools);
router.get("/category/:category", toolsController.listToolsByCategory);
router.get("/:toolId", toolsController.getTool);

// Protected generation endpoint
router.post(
  "/:toolId/generate",
  requireAuth,
  apiLimiter,
  validate(generateInputSchema),
  asyncHandler(toolsController.generateForTool)
);

export default router;
