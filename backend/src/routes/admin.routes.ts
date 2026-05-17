import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import {
  adminGetFeatureFlags,
  adminUpdateFeatureFlags,
} from "../controllers/featureFlags.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listUsersQuerySchema,
  updateUserSchema,
  updateSettingsSchema,
} from "../validators/admin.validator.js";
import { updateFeatureFlagsSchema } from "../validators/featureFlags.validator.js";

const router = Router();

// Every admin route requires an authenticated admin.
router.use(requireAuth, requireAdmin);

router.get("/stats", asyncHandler(adminController.getStats));
router.get(
  "/users",
  validate(listUsersQuerySchema, "query"),
  asyncHandler(adminController.listUsers)
);
router.patch(
  "/users/:id",
  validate(updateUserSchema),
  asyncHandler(adminController.updateUser)
);
router.delete("/users/:id", asyncHandler(adminController.deleteUser));

router.get("/settings", asyncHandler(adminController.getSettings));
router.put(
  "/settings",
  validate(updateSettingsSchema),
  asyncHandler(adminController.updateSettings)
);

// Feature flags — toggle tools and workspaces site-wide.
router.get("/feature-flags", adminGetFeatureFlags);
router.patch(
  "/feature-flags",
  validate(updateFeatureFlagsSchema),
  adminUpdateFeatureFlags
);

export default router;
