// src/app/api/project/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, userId, shapes, viewportData } = body;

    // Validate required fields
    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: projectId and userId" },
        { status: 400 }
      );
    }

    // Send event to Inngest for background processing
    await inngest.send({
      name: "project/autosave.requested",
      data: {
        projectId,
        userId,
        shapes: shapes || "{}",
        viewportData: viewportData || "{}",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project save queued",
    });
  } catch (error) {
    console.error("[API] Autosave error:", error);

    return NextResponse.json(
      { error: "Failed to queue project save" },
      { status: 500 }
    );
  }
}