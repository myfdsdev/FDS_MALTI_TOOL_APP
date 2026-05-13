import type { UserDocument } from "../models/User.model.js";
import { env } from "../config/env.js";
import { QuotaExceededError } from "../utils/errors.js";

const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const monthKey = (d = new Date()) => d.toISOString().slice(0, 7);

interface PlanLimits {
  daily: number;
  monthly: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { daily: env.FREE_PLAN_DAILY_LIMIT, monthly: env.FREE_PLAN_MONTHLY_LIMIT },
  pro: { daily: 500, monthly: 10_000 },
  team: { daily: 2000, monthly: 50_000 },
};

/**
 * Check if the user can consume another generation.
 * Throws QuotaExceededError if not.
 * Also resets counters when the day/month rolls over.
 */
export const checkAndConsume = async (user: UserDocument): Promise<void> => {
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  const today = todayKey();
  const month = monthKey();

  // Reset daily counter if new day
  if (user.usage.today.date !== today) {
    user.usage.today = { date: today, count: 0 };
  }
  // Reset monthly counter if new month
  if (user.usage.month.yearMonth !== month) {
    user.usage.month = { yearMonth: month, count: 0 };
  }

  if (user.usage.today.count >= limits.daily) {
    throw new QuotaExceededError(
      `Daily limit of ${limits.daily} generations reached. Resets at midnight UTC.`
    );
  }
  if (user.usage.month.count >= limits.monthly) {
    throw new QuotaExceededError(
      `Monthly limit of ${limits.monthly} generations reached.`
    );
  }

  user.usage.today.count += 1;
  user.usage.month.count += 1;
  user.usage.total += 1;
  await user.save();
};

export const getUsageStatus = (user: UserDocument) => {
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  const today = todayKey();
  const month = monthKey();
  const dailyUsed = user.usage.today.date === today ? user.usage.today.count : 0;
  const monthlyUsed = user.usage.month.yearMonth === month ? user.usage.month.count : 0;
  return {
    plan: user.plan,
    daily: { used: dailyUsed, limit: limits.daily, remaining: limits.daily - dailyUsed },
    monthly: {
      used: monthlyUsed,
      limit: limits.monthly,
      remaining: limits.monthly - monthlyUsed,
    },
    total: user.usage.total,
  };
};
