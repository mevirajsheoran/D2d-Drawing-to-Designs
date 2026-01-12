import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  /* =====================================
     PROJECTS
  ===================================== */
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    styleGuide: v.optional(v.string()),

    // Design data (stored as JSON)
    sketchesData: v.any(),
    viewportData: v.optional(v.any()),
    generatedDesignData: v.optional(v.any()),

    // Media
    thumbnail: v.optional(v.string()),
    moodBoardImages: v.optional(v.array(v.string())),
    inspirationImages: v.optional(v.array(v.string())),

    // Meta
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),

    // Tracking
    projectNumber: v.number(),
    createdAt: v.number(),
    lastModified: v.number(),
  }).index("by_userId", ["userId"]),

  /* =====================================
     PROJECT COUNTERS
  ===================================== */
  project_counters: defineTable({
    userId: v.id("users"),
    nextProjectNumber: v.number(),
  }).index("by_userId", ["userId"]),

  /* =====================================
     SUBSCRIPTIONS (Razorpay)
  ===================================== */
  subscriptions: defineTable({
    userId: v.id("users"),

    // Razorpay IDs
    razorpayCustomerId: v.optional(v.string()),
    razorpaySubscriptionId: v.optional(v.string()),
    razorpayPlanId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),

    // Plan info
    planCode: v.optional(v.string()),      // "free" | "pro" | "enterprise"
    planName: v.optional(v.string()),

    // Subscription state
    status: v.string(),                    // "active" | "cancelled" | "expired" | "pending" | "created"
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    
    // Trial
    trialEndsAt: v.optional(v.number()),
    
    // Cancellation
    cancelAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),

    // Billing
    amount: v.optional(v.number()),        // Amount in paise (INR) or cents (USD)
    currency: v.optional(v.string()),      // "INR" | "USD"

    // Credits system
    creditsBalance: v.number(),
    creditsGrantPerPeriod: v.number(),
    creditsRolloverLimit: v.number(),
    lastGrantCursor: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),

    metadata: v.optional(v.any()),
  })
    .index("by_userId", ["userId"])
    .index("by_razorpaySubscriptionId", ["razorpaySubscriptionId"])
    .index("by_razorpayCustomerId", ["razorpayCustomerId"])
    .index("by_status", ["status"]),

  /* =====================================
     CREDITS LEDGER (History)
  ===================================== */
  credits_ledger: defineTable({
    userId: v.id("users"),
    subscriptionId: v.optional(v.id("subscriptions")),

    amount: v.number(),                    // + or -
    type: v.string(),                      // "grant" | "consume" | "adjust" | "purchase" | "refund"
    reason: v.optional(v.string()),

    // Razorpay payment reference (for purchases)
    razorpayPaymentId: v.optional(v.string()),
    razorpayOrderId: v.optional(v.string()),

    // Prevent duplicate transactions
    idempotencyKey: v.optional(v.string()),
    
    createdAt: v.number(),
    meta: v.optional(v.any()),
  })
    .index("by_userId", ["userId"])
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_idempotencyKey", ["idempotencyKey"])
    .index("by_type", ["type"]),

  /* =====================================
     RAZORPAY ORDERS (Track payment orders)
  ===================================== */
  razorpay_orders: defineTable({
    userId: v.id("users"),
    
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    
    amount: v.number(),                    // Amount in paise
    currency: v.string(),                  // "INR"
    
    status: v.string(),                    // "created" | "attempted" | "paid" | "failed"
    type: v.string(),                      // "subscription" | "credits" | "one_time"
    
    // What they're buying
    planCode: v.optional(v.string()),
    creditsAmount: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    
    metadata: v.optional(v.any()),
  })
    .index("by_userId", ["userId"])
    .index("by_razorpayOrderId", ["razorpayOrderId"])
    .index("by_status", ["status"]),
});

export default schema;