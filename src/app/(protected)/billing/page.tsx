// src/app/(protected)/billing/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAppSelector } from "@/redux/store";
import { PLANS, formatPrice } from "@/types/razorpay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Coins,
  CreditCard,
  Loader2,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Get user from Redux
  const user = useAppSelector((state) => state.profile.user);

  // Get subscription data from Convex
  const subscription = useQuery(api.subscription.getSubscription);
  const creditBalance = useQuery(api.subscription.getCreditBalance);
  const creditHistory = useQuery(api.subscription.getCreditHistory, {
    limit: 10,
  });

  // Mutations
  const createSubscription = useMutation(
    api.subscription.createSubscriptionForUser
  );
  const cancelSubscription = useMutation(api.subscription.cancelSubscription);

  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle subscription purchase
  const handleSubscribe = async (planCode: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    const plan = PLANS[planCode];
    if (!plan || plan.price === 0) return;

    setIsLoading(planCode);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load payment gateway");
      }

      // For now, we'll show a demo message since we don't have real Razorpay plans
      // In production, you would:
      // 1. Create a subscription on your server
      // 2. Get the subscription ID
      // 3. Open Razorpay checkout

      toast.info(
        "Payment integration is in test mode. In production, this would open Razorpay checkout.",
        { duration: 5000 }
      );

      // Demo: Simulate subscription creation
      // In production, replace with actual Razorpay integration:
      /*
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId, // From your server
        name: "D2D - Drawing to Design",
        description: plan.name,
        handler: async function (response: any) {
          // Verify payment on server
          // Update subscription in Convex
          await createSubscription({
            razorpaySubscriptionId: response.razorpay_subscription_id,
            razorpayPlanId: plan.razorpayPlanId,
            planCode: plan.code,
            planName: plan.name,
            amount: plan.price,
            currency: plan.currency,
          });
          toast.success("Subscription activated!");
        },
        prefill: {
          email: user.email,
          name: user.name,
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      */
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to start subscription");
    } finally {
      setIsLoading(null);
    }
  };

  // Handle cancellation
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      await cancelSubscription({});
      toast.success("Subscription will be cancelled at the end of the period");
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  // Format date
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "MMM dd, yyyy");
  };

  return (
    <div className="container max-w-6xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and credits
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <Badge
              variant={
                subscription?.status === "active" ? "default" : "secondary"
              }
            >
              {subscription?.status || "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Plan Name */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-lg font-semibold">
                {subscription?.planName || "Free Plan"}
              </p>
            </div>

            {/* Credits */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Credits Available</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                {creditBalance?.balance || 0}
              </p>
            </div>

            {/* Next Billing */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {subscription?.cancelAt ? "Cancels On" : "Next Billing"}
              </p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {subscription?.cancelAt
                  ? formatDate(subscription.cancelAt)
                  : formatDate(subscription?.currentPeriodEnd)}
              </p>
            </div>
          </div>

          {/* Cancel warning */}
          {subscription?.cancelAt && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              <span>
                Your subscription will be cancelled on{" "}
                {formatDate(subscription.cancelAt)}
              </span>
            </div>
          )}
        </CardContent>
        {subscription?.hasSubscription && !subscription?.cancelAt && (
          <CardFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel Subscription
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Choose a Plan</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(PLANS).map((plan) => (
            <Card
              key={plan.code}
              className={`relative ${
                plan.code === "pro_monthly"
                  ? "border-primary shadow-lg"
                  : ""
              }`}
            >
              {plan.code === "pro_monthly" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? "Free" : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">
                      /{plan.interval === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.code === "free" ? "outline" : "default"}
                  disabled={
                    plan.price === 0 ||
                    isLoading !== null ||
                    subscription?.planCode === plan.code
                  }
                  onClick={() => handleSubscribe(plan.code)}
                >
                  {isLoading === plan.code ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : subscription?.planCode === plan.code ? (
                    "Current Plan"
                  ) : plan.price === 0 ? (
                    "Current Plan"
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Credit History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Credit History
          </CardTitle>
          <CardDescription>Your recent credit transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {!creditHistory || creditHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {creditHistory.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.reason || transaction.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.amount > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Mode Notice */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Test Mode Active</span>
        </div>
        <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
          Payment integration is in test mode. No real charges will be made.
          Use test card: 4111 1111 1111 1111
        </p>
      </div>
    </div>
  );
}