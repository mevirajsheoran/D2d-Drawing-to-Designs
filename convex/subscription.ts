// convex/subscription.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ======================================================
   QUERIES
====================================================== */

// Check if user has active subscription
export const hasEntitlement = query({
  args: {
    userId: v.optional(v.id("users")),
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
        creditsBalance: 5, // Free tier credits
        currentPeriodEnd: null,
      };
    }

    return {
      hasSubscription: true,
      subscriptionId: subscription._id,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      status: subscription.status,
      planCode: subscription.planCode || "free",
      planName: subscription.planName || "Free Plan",
      creditsBalance: subscription.creditsBalance,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEndsAt: subscription.trialEndsAt,
      cancelAt: subscription.cancelAt,
    };
  },
});

// Get credit balance
export const getCreditBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { balance: 5, transactions: 0 }; // Free tier

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) {
      return { balance: 5, transactions: 0 };
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

/* ======================================================
   MUTATIONS
====================================================== */

// Create or update subscription (called from Razorpay webhook)
export const upsertSubscription = mutation({
  args: {
    razorpaySubscriptionId: v.string(),
    razorpayCustomerId: v.optional(v.string()),
    razorpayPlanId: v.optional(v.string()),
    status: v.string(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    planCode: v.optional(v.string()),
    planName: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find existing subscription by Razorpay ID
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_razorpaySubscriptionId", (q) =>
        q.eq("razorpaySubscriptionId", args.razorpaySubscriptionId)
      )
      .first();

    const now = Date.now();

    // Determine credits based on plan
    const creditsPerPeriod = args.planCode === "pro_yearly" ? 1200 : 100;

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        planCode: args.planCode || existing.planCode,
        planName: args.planName || existing.planName,
        amount: args.amount || existing.amount,
        currency: args.currency || existing.currency,
        updatedAt: now,
      });

      // Grant credits if status is active and period changed
      if (
        args.status === "active" &&
        args.currentPeriodStart !== existing.currentPeriodStart
      ) {
        // Add credits
        await ctx.db.patch(existing._id, {
          creditsBalance: existing.creditsBalance + creditsPerPeriod,
        });

        // Log in ledger
        await ctx.db.insert("credits_ledger", {
          userId: existing.userId,
          subscriptionId: existing._id,
          amount: creditsPerPeriod,
          type: "grant",
          reason: "Subscription renewal",
          createdAt: now,
        });
      }

      return { subscriptionId: existing._id, action: "updated" };
    } else {
      // We need userId - this should come from notes in Razorpay
      // For now, we'll need to handle this differently
      console.error(
        "[Subscription] Cannot create subscription without userId"
      );
      throw new Error("Cannot create subscription without userId");
    }
  },
});

// Update subscription status (for cancellation, etc.)
export const updateSubscriptionStatus = mutation({
  args: {
    razorpaySubscriptionId: v.string(),
    status: v.string(),
    cancelledAt: v.optional(v.number()),
    cancelAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_razorpaySubscriptionId", (q) =>
        q.eq("razorpaySubscriptionId", args.razorpaySubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await ctx.db.patch(subscription._id, {
      status: args.status,
      cancelledAt: args.cancelledAt,
      cancelAt: args.cancelAt,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Create subscription for user (called when user starts subscription)
export const createSubscriptionForUser = mutation({
  args: {
    razorpaySubscriptionId: v.string(),
    razorpayCustomerId: v.optional(v.string()),
    razorpayPlanId: v.string(),
    planCode: v.string(),
    planName: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const now = Date.now();

    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        razorpaySubscriptionId: args.razorpaySubscriptionId,
        razorpayCustomerId: args.razorpayCustomerId,
        razorpayPlanId: args.razorpayPlanId,
        planCode: args.planCode,
        planName: args.planName,
        amount: args.amount,
        currency: args.currency,
        status: "created",
        updatedAt: now,
      });

      return { subscriptionId: existing._id };
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId,
      razorpaySubscriptionId: args.razorpaySubscriptionId,
      razorpayCustomerId: args.razorpayCustomerId,
      razorpayPlanId: args.razorpayPlanId,
      planCode: args.planCode,
      planName: args.planName,
      amount: args.amount,
      currency: args.currency,
      status: "created",
      creditsBalance: 0,
      creditsGrantPerPeriod: args.planCode === "pro_yearly" ? 1200 : 100,
      creditsRolloverLimit: args.planCode === "pro_yearly" ? 2400 : 200,
      createdAt: now,
    });

    return { subscriptionId };
  },
});

// Consume credits
export const consumeCredits = mutation({
  args: {
    amount: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    // Check balance
    const currentBalance = subscription?.creditsBalance || 5; // Free tier

    if (currentBalance < args.amount) {
      throw new Error("Insufficient credits");
    }

    const now = Date.now();

    if (subscription) {
      // Deduct credits
      await ctx.db.patch(subscription._id, {
        creditsBalance: currentBalance - args.amount,
        updatedAt: now,
      });

      // Log in ledger
      await ctx.db.insert("credits_ledger", {
        userId,
        subscriptionId: subscription._id,
        amount: -args.amount,
        type: "consume",
        reason: args.reason || "AI generation",
        createdAt: now,
      });
    }

    return {
      success: true,
      remainingBalance: currentBalance - args.amount,
    };
  },
});

// Cancel subscription
export const cancelSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    // Mark for cancellation at period end
    await ctx.db.patch(subscription._id, {
      cancelAt: subscription.currentPeriodEnd,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      cancelAt: subscription.currentPeriodEnd,
    };
  },
});