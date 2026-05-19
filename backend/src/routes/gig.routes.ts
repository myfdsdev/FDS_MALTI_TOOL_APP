import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createGigSchema,
  improveGigSectionSchema,
  listGigsQuerySchema,
  shareGigSchema,
  updateGigSchema,
} from "../validators/gig.validator.js";
import {
  createGig,
  deleteGig,
  duplicateGig,
  exportGigDocx,
  exportGigPdf,
  getGig,
  improveGig,
  listGigs,
  regenerateGig,
  updateGig,
  updateShare,
} from "../controllers/gig.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listGigsQuerySchema, "query"), listGigs);
router.post("/", validate(createGigSchema), createGig);

router.get("/:id", getGig);
router.patch("/:id", validate(updateGigSchema), updateGig);
router.delete("/:id", deleteGig);

router.post("/:id/regenerate", regenerateGig);
router.post("/:id/improve", validate(improveGigSectionSchema), improveGig);
router.post("/:id/duplicate", duplicateGig);
router.post("/:id/share", validate(shareGigSchema), updateShare);

router.get("/:id/export/pdf", exportGigPdf);
router.get("/:id/export/docx", exportGigDocx);

export default router;
