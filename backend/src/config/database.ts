import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { ensureGigShareSlugIndex } from "../models/Gig.model.js";
import { ensureReportShareSlugIndex } from "../models/GrowthReport.model.js";

mongoose.set("strictQuery", true);

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
    });
    await ensureGigShareSlugIndex();
    await ensureReportShareSlugIndex();
    logger.info("✅ MongoDB connected");
  } catch (err) {
    logger.fatal({ err }, "❌ MongoDB connection failed");
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected cleanly");
};
