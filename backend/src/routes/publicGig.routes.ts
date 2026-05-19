import { Router } from "express";
import { getPublicGig } from "../controllers/gig.controller.js";

const router = Router();

router.get("/:slug", getPublicGig);

export default router;
