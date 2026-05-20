import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceEnabled } from "../middleware/featureFlag.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createReportSchema,
  listReportsQuerySchema,
  shareReportSchema,
} from "../validators/report.validator.js";
import {
  createReport,
  deleteReport,
  exportReportDocx,
  exportReportPdf,
  getReport,
  listReports,
  retryReport,
  updateShare,
} from "../controllers/report.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceEnabled("reports"));

router.get("/", validate(listReportsQuerySchema, "query"), listReports);
router.post("/", validate(createReportSchema), createReport);
router.get("/:id", getReport);
router.get("/:id/export/pdf", exportReportPdf);
router.get("/:id/export/docx", exportReportDocx);
router.post("/:id/retry", retryReport);
router.delete("/:id", deleteReport);
router.post("/:id/share", validate(shareReportSchema), updateShare);

export default router;
