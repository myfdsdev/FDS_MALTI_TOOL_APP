import { logger } from "../../config/logger.js";
import { Gig, type GigDocument } from "../../models/Gig.model.js";
import { User } from "../../models/User.model.js";
import { resolveAIConfigForUser } from "../ai/config.js";
import {
  generateGigCore,
  generateOutreach,
} from "./generator.js";
import { calculateGigScore } from "./scorer.js";

const AI_REQUIRED_MESSAGE =
  "AI is not configured. Add an AI API key before generating gigs.";

/**
 * Fire-and-forget orchestrator. Runs the three AI calls in parallel, persists
 * each subtree independently, and computes the final score when the gig stage
 * succeeded. Never throws — failures are recorded on the document.
 */
export async function runGeneration(gigId: string): Promise<void> {
  const start = Date.now();
  try {
    const gig = await Gig.findById(gigId);
    if (!gig) {
      logger.warn({ gigId }, "Gig not found for generation");
      return;
    }
    const user = await User.findById(gig.user).select("+aiSettings.aiApiKey");

    // Resolve AI config — fail fast if missing.
    const config = resolveAIConfigForUser(user ?? undefined);
    if (!config) {
      await Gig.findByIdAndUpdate(gigId, {
        $set: {
          status: "failed",
          "generationStages.gig.status": "failed",
          "generationStages.gig.error": AI_REQUIRED_MESSAGE,
          "generationStages.leads.status": "done",
          "generationStages.leads.error": null,
          "generationStages.outreach.status": "failed",
          "generationStages.outreach.error": AI_REQUIRED_MESSAGE,
          generationMs: Date.now() - start,
        },
      });
      return;
    }

    // Mark processing + running.
    await Gig.findByIdAndUpdate(gigId, {
      $set: {
        status: "processing",
        "generationStages.gig.status": "running",
        "generationStages.gig.error": null,
        "generationStages.leads.status": "done",
        "generationStages.leads.error": null,
        "generationStages.outreach.status": "running",
        "generationStages.outreach.error": null,
      },
    });

    const gigRes = await settleGeneration(() => generateGigCore(config, gig.input));
    await persistStage(gigId, "gig", "content.gig", gigRes);

    const outreachRes = await settleGeneration(() =>
      generateOutreach(config, gig.input)
    );
    await persistStage(gigId, "outreach", "content.outreach", outreachRes);

    const results = [gigRes, outreachRes];
    const successCount = results.filter((r) => r.status === "fulfilled").length;

    let nextStatus: GigDocument["status"];
    if (successCount === 2) nextStatus = "completed";
    else if (successCount === 0) nextStatus = "failed";
    else nextStatus = "partial";

    const finalUpdate: Record<string, unknown> = {
      status: nextStatus,
      generationMs: Date.now() - start,
      generatedBy: successCount > 0 ? "ai" : null,
    };

    // Compute the deterministic score only when the gig stage itself succeeded.
    if (gigRes.status === "fulfilled") {
      const score = calculateGigScore(gigRes.value);
      finalUpdate.score = score;
    }

    await Gig.findByIdAndUpdate(gigId, { $set: finalUpdate });
  } catch (err) {
    logger.error({ err, gigId }, "Gig orchestrator crashed");
    try {
      await Gig.findByIdAndUpdate(gigId, {
        $set: {
          status: "failed",
          generationMs: Date.now() - start,
          "generationStages.gig.status": "failed",
          "generationStages.gig.error":
            err instanceof Error ? err.message : "Unknown orchestrator error",
        },
      });
    } catch (saveErr) {
      logger.error({ saveErr, gigId }, "Failed to mark gig as failed");
    }
  }
}

async function settleGeneration<T>(
  generate: () => Promise<T>
): Promise<PromiseSettledResult<T>> {
  try {
    return { status: "fulfilled", value: await generate() };
  } catch (reason) {
    return { status: "rejected", reason };
  }
}

async function persistStage(
  gigId: string,
  stageKey: "gig" | "outreach",
  contentPath: "content.gig" | "content.outreach",
  result: PromiseSettledResult<unknown>
): Promise<void> {
  if (result.status === "fulfilled") {
    await Gig.findByIdAndUpdate(gigId, {
      $set: {
        [contentPath]: result.value,
        [`generationStages.${stageKey}.status`]: "done",
        [`generationStages.${stageKey}.error`]: null,
      },
    });
  } else {
    const message =
      result.reason instanceof Error ? result.reason.message : String(result.reason);
    await Gig.findByIdAndUpdate(gigId, {
      $set: {
        [`generationStages.${stageKey}.status`]: "failed",
        [`generationStages.${stageKey}.error`]: message,
      },
    });
  }
}
