import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./auth.routes.js";
import toolsRoutes from "./tools.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";
import businessRoutes from "./business.routes.js";
import financeRoutes from "./finance.routes.js";
import resumeRoutes from "./resume.routes.js";
import publicResumeRoutes from "./publicResume.routes.js";
import reportRoutes from "./report.routes.js";
import publicReportRoutes from "./publicReport.routes.js";
import gigRoutes from "./gig.routes.js";
import publicGigRoutes from "./publicGig.routes.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getPublicFeatureFlags } from "../controllers/featureFlags.controller.js";

const router = Router();

/** Health check with DB status */
router.get("/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";
  res.json({
    success: true,
    message: "API is healthy",
    data: {
      uptime: process.uptime(),
      database: dbStatus,
      timestamp: new Date().toISOString(),
    },
  });
});

router.use("/auth", authRoutes);
router.use("/tools", toolsRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/business", businessRoutes);
router.use("/finance", financeRoutes);
router.use("/business/resumes", resumeRoutes);
router.use("/business/reports", reportRoutes);
router.use("/gigs", gigRoutes);
router.use("/public", publicResumeRoutes);
router.use("/public/reports", publicReportRoutes);
router.use("/public/gigs", publicGigRoutes);

// Authenticated users can read the current feature-flag state to drive their UI.
router.get("/feature-flags", requireAuth, getPublicFeatureFlags);

export default router;
