import { Router } from "express";
import { exportPublicPdf, getPublicResume } from "../controllers/resume.controller.js";

const router = Router();

router.get("/resumes/:slug", getPublicResume);
router.get("/resumes/:slug/export/pdf", exportPublicPdf);

export default router;
