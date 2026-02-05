// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

/**
 * AI Generation API Endpoint
 * 
 * This is a placeholder that will be connected to either:
 * 1. YOLO + OCR pipeline (your approach)
 * 2. LLM (GPT-4 Vision / Claude) as fallback
 * 
 * For now, it queues the job and returns a job ID.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, projectId, frameId, styleGuide } = body;

    // Validate required fields
    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing required field: imageBase64" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing required field: projectId" },
        { status: 400 }
      );
    }

    // Generate a job ID
    const jobId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log("[Generate API] Received request:", {
      projectId,
      frameId,
      imageSize: imageBase64.length,
      hasStyleGuide: !!styleGuide,
    });

    // Queue the generation job with Inngest
    await inngest.send({
      name: "generation/requested",
      data: {
        projectId,
        frameId: frameId || "frame_1",
        imageBase64,
        styleGuide,
      },
    });

    // Return job ID immediately
    // The actual generation will happen in the background
    return NextResponse.json({
      success: true,
      message: "Generation queued",
      jobId,
      status: "queued",
      note: "This is a placeholder. AI generation will be implemented when the YOLO+OCR or LLM backend is ready.",
    });
  } catch (error) {
    console.error("[Generate API] Error:", error);

    return NextResponse.json(
      { error: "Failed to queue generation" },
      { status: 500 }
    );
  }
}

/**
 * Check generation status
 * In future: This would check the job status from a queue/database
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId parameter" },
      { status: 400 }
    );
  }

  // Placeholder response
  // In future: Check actual job status from database
  return NextResponse.json({
    jobId,
    status: "pending",
    message: "Generation is being processed (placeholder)",
    progress: 0,
  });
}