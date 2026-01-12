import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Check if user has active subscription
export const hasEntitlement = query({
  args: { 
    userId: v.optional(v.id("users")) 
  },
  handler: async (ctx, args) => {
    const userId = args.userId || (await getAuthUserId(ctx));
    if (!userId) return false;

    const now = Date.now();

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) return false;

    const status = String(subscription.status || "").toLowerCase();
    const periodOk =
      subscription.currentPeriodEnd == null ||
      subscription.currentPeriodEnd > now;

    return status === "active" && periodOk;
  },
});

// Get subscription details
export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) {
      return {
        hasSubscription: false,
        status: "none",
        planCode: "free",
        planName: "Free Plan",
        creditsBalance: 0,
        currentPeriodEnd: null,
      };
    }

    return {
      hasSubscription: true,
      status: subscription.status,
      planCode: subscription.planCode || "free",
      planName: subscription.planName || "Free Plan",
      creditsBalance: subscription.creditsBalance,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEndsAt: subscription.trialEndsAt,
    };
  },
});

// Get credit balance
export const getCreditBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { balance: 0, transactions: 0 };

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) {
      return { balance: 0, transactions: 0 };
    }

    // Count transactions
    const transactions = await ctx.db
      .query("credits_ledger")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return {
      balance: subscription.creditsBalance,
      transactions: transactions.length,
    };
  },
});

// Get credit history
export const getCreditHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 20;

    const history = await ctx.db
      .query("credits_ledger")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return history;
  },
});