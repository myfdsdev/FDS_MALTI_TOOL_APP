import { logger } from "../../config/logger.js";
import { GrowthReport } from "../../models/GrowthReport.model.js";
import { User } from "../../models/User.model.js";
import { fetchSiteSnapshot, hostnameFromUrl } from "./scraper.js";
import { buildReport } from "./generator.js";

/**
 * Fire-and-forget orchestrator. Loads the report, scrapes the URL, builds the
 * content (AI with fallback), and persists each stage. Never throws — failures
 * are recorded on the document instead.
 */
export async function runReportGeneration(reportId: string): Promise<void> {
  const start = Date.now();
  const report = await GrowthReport.findById(reportId);
  if (!report) {
    logger.warn({ reportId }, "Report not found for generation");
    return;
  }

  try {
    report.status = "processing";
    report.statusStage = "scraping";
    report.error = null;
    await report.save();

    const snapshot = await fetchSiteSnapshot(report.websiteUrl);
    report.snapshot = snapshot;
    report.statusStage = "analyzing";
    await report.save();

    const user = await User.findById(report.user);

    report.statusStage = "generating";
    await report.save();

    const { content, generatedBy } = await buildReport(report.websiteUrl, snapshot, user);

    report.content = content;
    report.generatedBy = generatedBy;
    report.status = "completed";
    report.statusStage = "completed";
    report.generationMs = Date.now() - start;
    report.hostname = hostnameFromUrl(report.websiteUrl);
    report.error = null;
    await report.save();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown generation error";
    logger.error({ err, reportId }, "Report generation failed");
    try {
      report.status = "failed";
      report.statusStage = "failed";
      report.error = message;
      report.generationMs = Date.now() - start;
      await report.save();
    } catch (saveErr) {
      logger.error({ saveErr, reportId }, "Failed to mark report as failed");
    }
  }
}
