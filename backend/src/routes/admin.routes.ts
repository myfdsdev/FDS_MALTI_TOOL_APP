import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listUsersQuerySchema,
  updateUserSchema,
} from "../validators/admin.validator.js";

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

export default router;
