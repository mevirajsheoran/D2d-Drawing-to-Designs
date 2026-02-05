// src/inngest/functions.ts
import { inngest } from "./client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Create Convex client for server-side calls
const getConvexClient = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
  }
  return new ConvexHttpClient(url);
};

/**
 * Autosave Project Workflow
 * - Receives autosave request
 * - Updates project in Convex
 * - Retries on failure (3 attempts by Inngest default)
 */
export const autosaveProjectWorkflow = inngest.createFunction(
  {
    id: "autosave-project",
    name: "Autosave Project",
    retries: 3,
  },
  { event: "project/autosave.requested" },
  async ({ event, step }) => {
    const { projectId, shapes, viewportData } = event.data;

    console.log("[Inngest] Starting autosave for project:", projectId);

    // Step 1: Update project in database
    const result = await step.run("update-project", async () => {
      try {
        const convex = getConvexClient();
        
        await convex.mutation(api.projects.updateProject, {
          projectId: projectId as Id<"projects">,
          sketchesData: JSON.parse(shapes),
          viewportData: JSON.parse(viewportData),
        });

        console.log("[Inngest] Project saved successfully:", projectId);
        return { success: true };
      } catch (error) {
        console.error("[Inngest] Failed to save project:", error);
        throw error; // Inngest will retry
      }
    });

    return result;
  }
);

/**
 * Razorpay Webhook Handler
 * - Processes payment events
 * - Updates subscriptions in Convex
 */
export const razorpayWebhookHandler = inngest.createFunction(
  {
    id: "razorpay-webhook-handler",
    name: "Razorpay Webhook Handler",
    retries: 3,
  },
  { event: "razorpay/webhook.received" },
  async ({ event, step }) => {
    const { event: eventType, payload } = event.data;

    console.log("[Inngest] Processing Razorpay event:", eventType);

    // For now, just log the events
    // Full implementation will be added when Razorpay plans are set up
    await step.run("log-event", async () => {
      console.log("[Inngest] Razorpay payload:", JSON.stringify(payload, null, 2));
      return { logged: true };
    });

    return { processed: true, eventType };
  }
);

/**
 * AI Generation Workflow (Placeholder)
 * - Will be implemented when AI backend is ready
 */
export const generationWorkflow = inngest.createFunction(
  {
    id: "generate-design",
    name: "Generate Design from Sketch",
    retries: 2,
  },
  { event: "generation/requested" },
  async ({ event, step }) => {
    const { projectId, frameId } = event.data;

    console.log("[Inngest] Generation requested for frame:", frameId);

    // Placeholder - will connect to YOLO+OCR or LLM later
    const result = await step.run("generate-design", async () => {
      // TODO: Call AI backend here
      return {
        success: true,
        message: "Generation queued (placeholder)",
        projectId,
        frameId,
      };
    });

    return result;
  }
);

// Export all functions for the serve handler
export const functions = [
  autosaveProjectWorkflow,
  razorpayWebhookHandler,
  generationWorkflow,
];