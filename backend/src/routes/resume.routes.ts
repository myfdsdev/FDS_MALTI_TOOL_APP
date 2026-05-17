import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceEnabled } from "../middleware/featureFlag.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createResumeSchema,
  updateResumeSchema,
  starterFillSchema,
  improveFieldSchema,
  generateBulletsSchema,
  suggestSkillsSchema,
  shareSchema,
} from "../validators/resume.validator.js";
import {
  aiAtsCheck,
  aiGenerateBullets,
  aiImproveField,
  aiStarterFill,
  aiSuggestSkills,
  createResume,
  deleteResume,
  duplicateResume,
  exportDocx,
  exportPdf,
  getResume,
  listResumes,
  updateResume,
  updateShare,
} from "../controllers/resume.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceEnabled("resumes"));

router.get("/", listResumes);
router.post("/", validate(createResumeSchema), createResume);
router.get("/:id", getResume);
router.patch("/:id", validate(updateResumeSchema), updateResume);
router.delete("/:id", deleteResume);
router.post("/:id/duplicate", duplicateResume);

router.post("/:id/ai/starter-fill", validate(starterFillSchema), aiStarterFill);
router.post("/:id/ai/improve-field", validate(improveFieldSchema), aiImproveField);
router.post("/:id/ai/generate-bullets", validate(generateBulletsSchema), aiGenerateBullets);
router.post("/:id/ai/suggest-skills", validate(suggestSkillsSchema), aiSuggestSkills);
router.post("/:id/ai/ats-check", aiAtsCheck);

router.post("/:id/share", validate(shareSchema), updateShare);

router.get("/:id/export/pdf", exportPdf);
router.get("/:id/export/docx", exportDocx);

export default router;
