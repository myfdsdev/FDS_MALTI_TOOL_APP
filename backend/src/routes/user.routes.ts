import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { historyQuerySchema } from "../validators/tools.validator.js";
import { updateAISettingsSchema } from "../validators/user.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/usage", asyncHandler(userController.getMyUsage));
router.get("/ai-settings", asyncHandler(userController.getMyAISettings));
router.put("/ai-settings", validate(updateAISettingsSchema), asyncHandler(userController.updateMyAISettings));
router.get("/history", validate(historyQuerySchema, "query"), asyncHandler(userController.getMyHistory));
router.delete("/history", asyncHandler(userController.clearHistory));
router.delete("/history/:id", asyncHandler(userController.deleteHistoryItem));

export default router;
