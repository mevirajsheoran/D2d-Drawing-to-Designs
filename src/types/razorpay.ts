// src/types/razorpay.ts

/**
 * Razorpay Subscription Status
 */
export type RazorpaySubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired";

/**
 * Razorpay Payment Status
 */
export type RazorpayPaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "refunded"
  | "failed";

/**
 * Razorpay Plan Interface
 */
export interface RazorpayPlan {
  id: string;
  entity: "plan";
  interval: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  item: {
    id: string;
    active: boolean;
    amount: number;
    unit_amount: number;
    currency: string;
    name: string;
    description: string | null;
  };
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Razorpay Subscription Interface
 */
export interface RazorpaySubscription {
  id: string;
  entity: "subscription";
  plan_id: string;
  customer_id: string;
  status: RazorpaySubscriptionStatus;
  current_start: number;
  current_end: number;
  ended_at: number | null;
  quantity: number;
  notes: Record<string, string>;
  charge_at: number;
  start_at: number;
  end_at: number | null;
  auth_attempts: number;
  total_count: number;
  paid_count: number;
  remaining_count: number;
  customer_notify: 0 | 1;
  created_at: number;
  expire_by: number | null;
  short_url: string;
  has_scheduled_changes: boolean;
  change_scheduled_at: number | null;
  source: string;
  payment_method: string;
  offer_id: string | null;
}

/**
 * Razorpay Payment Interface
 */
export interface RazorpayPayment {
  id: string;
  entity: "payment";
  amount: number;
  currency: string;
  status: RazorpayPaymentStatus;
  order_id: string | null;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  customer_id: string;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: Record<string, any>;
  created_at: number;
}

/**
 * Razorpay Webhook Event Types
 */
export type RazorpayWebhookEvent =
  | "subscription.activated"
  | "subscription.charged"
  | "subscription.completed"
  | "subscription.updated"
  | "subscription.pending"
  | "subscription.halted"
  | "subscription.cancelled"
  | "subscription.paused"
  | "subscription.resumed"
  | "payment.authorized"
  | "payment.captured"
  | "payment.failed"
  | "order.paid";

/**
 * Razorpay Webhook Payload
 */
export interface RazorpayWebhookPayload {
  entity: "event";
  account_id: string;
  event: RazorpayWebhookEvent;
  contains: string[];
  payload: {
    subscription?: {
      entity: RazorpaySubscription;
    };
    payment?: {
      entity: RazorpayPayment;
    };
    order?: {
      entity: any;
    };
  };
  created_at: number;
}

/**
 * Plan configuration for the app
 */
export interface PlanConfig {
  code: string;
  name: string;
  description: string;
  razorpayPlanId: string;
  price: number; // in paise (INR) or cents (USD)
  currency: string;
  interval: "monthly" | "yearly";
  creditsPerPeriod: number;
  features: string[];
}

/**
 * Available plans
 */
export const PLANS: Record<string, PlanConfig> = {
  free: {
    code: "free",
    name: "Free",
    description: "Get started with basic features",
    razorpayPlanId: "",
    price: 0,
    currency: "INR",
    interval: "monthly",
    creditsPerPeriod: 5,
    features: [
      "5 AI generations per month",
      "3 projects",
      "Basic export",
      "Community support",
    ],
  },
  pro_monthly: {
    code: "pro_monthly",
    name: "Pro Monthly",
    description: "For serious designers",
    razorpayPlanId: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID || "",
    price: 49900, // ₹499
    currency: "INR",
    interval: "monthly",
    creditsPerPeriod: 100,
    features: [
      "100 AI generations per month",
      "Unlimited projects",
      "Priority export",
      "Email support",
      "Custom style guides",
    ],
  },
  pro_yearly: {
    code: "pro_yearly",
    name: "Pro Yearly",
    description: "Best value - 2 months free!",
    razorpayPlanId: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID || "",
    price: 499900, // ₹4,999
    currency: "INR",
    interval: "yearly",
    creditsPerPeriod: 1200,
    features: [
      "1200 AI generations per year",
      "Unlimited projects",
      "Priority export",
      "Priority support",
      "Custom style guides",
      "Early access to features",
    ],
  },
};

/**
 * Format price for display
 */
export const formatPrice = (amount: number, currency: string = "INR"): string => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Convert from paise to rupees
  return formatter.format(amount / 100);
};