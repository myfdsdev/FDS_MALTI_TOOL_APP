import { Router } from "express";
import { getPublicReport } from "../controllers/report.controller.js";

const router = Router();

router.get("/:slug", getPublicReport);

export default router;
