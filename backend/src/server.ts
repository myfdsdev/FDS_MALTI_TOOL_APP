import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const bootstrap = async () => {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${env.PORT}`);
    logger.info(`📡 CORS allowing ${env.CLIENT_URL}`);
    logger.info(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
  });

  // ─── Graceful shutdown ─────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(async (err) => {
      if (err) {
        logger.error({ err }, "Error during HTTP server close");
        process.exit(1);
      }
      try {
        await disconnectDatabase();
        logger.info("Goodbye 👋");
        process.exit(0);
      } catch (dbErr) {
        logger.error({ dbErr }, "Error closing DB");
        process.exit(1);
      }
    });

    // Force-exit if shutdown takes too long
    setTimeout(() => {
      logger.fatal("Forced shutdown after 10s");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    logger.fatal({ reason }, "Unhandled rejection");
    shutdown("unhandledRejection");
  });
};

bootstrap().catch((err) => {
  logger.fatal({ err }, "Bootstrap failed");
  process.exit(1);
});
