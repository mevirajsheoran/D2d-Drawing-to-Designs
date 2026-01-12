import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

/* ======================================================
   Helper: Get next project number for user
====================================================== */
async function getNextProjectNumber(
  ctx: any,
  userId: Id<"users">
): Promise<number> {
  const counter = await ctx.db
    .query("project_counters")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!counter) {
    // Create new counter starting at 2 (first project is 1)
    await ctx.db.insert("project_counters", {
      userId,
      nextProjectNumber: 2,
    });
    return 1;
  }

  // Get current and increment
  const nextNumber = counter.nextProjectNumber;
  await ctx.db.patch(counter._id, {
    nextProjectNumber: counter.nextProjectNumber + 1,
  });

  return nextNumber;
}

/* ======================================================
   Queries
====================================================== */

/**
 * Get a single project by ID
 */
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    // Check ownership or public access
    if (project.userId !== userId && !project.isPublic) {
      throw new Error("Access denied");
    }

    return project;
  },
});

/**
 * Get all projects for a user
 */
export const getUserProjects = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 20 }) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return {
      projects: projects.map((p) => ({
        id: p._id,
        name: p.name,
        projectNumber: p.projectNumber,
        thumbnail: p.thumbnail,
        lastModified: p.lastModified,
        createdAt: p.createdAt,
        description: p.description,
      })),
      total: projects.length,
    };
  },
});

/* ======================================================
   Mutations
====================================================== */

/**
 * Create a new project
 */
export const createProject = mutation({
  args: {
    name: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    sketchesData: v.optional(v.string()),
    viewportData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Get next project number
    const projectNumber = await getNextProjectNumber(ctx, userId);
    const projectName = args.name || `Project ${projectNumber}`;

    // Parse JSON data if provided
    let sketchesData = null;
    let viewportData = null;

    try {
      if (args.sketchesData) {
        sketchesData = JSON.parse(args.sketchesData);
      }
      if (args.viewportData) {
        viewportData = JSON.parse(args.viewportData);
      }
    } catch (e) {
      console.error("Error parsing project data:", e);
    }

    // Insert project
    const projectId = await ctx.db.insert("projects", {
      userId,
      name: projectName,
      projectNumber,
      thumbnail: args.thumbnail,
      sketchesData,
      viewportData,
      createdAt: Date.now(),
      lastModified: Date.now(),
      isPublic: false,
    });

    console.log(`Project created: ${projectId} for user: ${userId}`);

    return {
      projectId,
      name: projectName,
      projectNumber,
      message: "Project created successfully",
    };
  },
});

/**
 * Update an existing project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sketchesData: v.optional(v.any()),
    viewportData: v.optional(v.any()),
    styleGuide: v.optional(v.string()),
    moodBoardImages: v.optional(v.array(v.string())),
    inspirationImages: v.optional(v.array(v.string())),
    thumbnail: v.optional(v.string()),
    generatedDesignData: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.userId !== userId) {
      throw new Error("Access denied");
    }

    // Build update object (only include provided fields)
    const { projectId, ...updates } = args;
    const updateData: Record<string, any> = {
      lastModified: Date.now(),
    };

    // Only add fields that were provided
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await ctx.db.patch(projectId, updateData);

    return { success: true, projectId };
  },
});

/**
 * Delete a project
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(projectId);

    return { success: true, message: "Project deleted" };
  },
});

/**
 * Duplicate a project
 */
export const duplicateProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.userId !== userId && !project.isPublic) {
      throw new Error("Access denied");
    }

    // Get next project number
    const projectNumber = await getNextProjectNumber(ctx, userId);
    const projectName = `${project.name} (Copy)`;

    // Create duplicate
    const newProjectId = await ctx.db.insert("projects", {
      userId,
      name: projectName,
      projectNumber,
      description: project.description,
      thumbnail: project.thumbnail,
      sketchesData: project.sketchesData,
      viewportData: project.viewportData,
      styleGuide: project.styleGuide,
      moodBoardImages: project.moodBoardImages,
      inspirationImages: project.inspirationImages,
      tags: project.tags,
      createdAt: Date.now(),
      lastModified: Date.now(),
      isPublic: false,
    });

    return {
      projectId: newProjectId,
      name: projectName,
      projectNumber,
    };
  },
});