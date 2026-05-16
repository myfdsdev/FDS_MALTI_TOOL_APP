import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./auth.routes.js";
import toolsRoutes from "./tools.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";
import businessRoutes from "./business.routes.js";
import resumeRoutes from "./resume.routes.js";
import publicResumeRoutes from "./publicResume.routes.js";
import reportRoutes from "./report.routes.js";
import publicReportRoutes from "./publicReport.routes.js";

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
router.use("/business/resumes", resumeRoutes);
router.use("/business/reports", reportRoutes);
router.use("/public", publicResumeRoutes);
router.use("/public/reports", publicReportRoutes);

export default router;
