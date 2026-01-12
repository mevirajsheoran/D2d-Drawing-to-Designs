import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ======================================================
   Generate Upload URL
====================================================== */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/* ======================================================
   Add Mood Board Image
====================================================== */
export const addMoodBoardImage = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.string(),
  },
  handler: async (ctx, { projectId, storageId }) => {
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

    const currentImages = project.moodBoardImages || [];

    // Check limit
    if (currentImages.length >= 5) {
      throw new Error("Maximum 5 mood board images allowed");
    }

    // Add new image
    const updatedImages = [...currentImages, storageId];

    await ctx.db.patch(projectId, {
      moodBoardImages: updatedImages,
      lastModified: Date.now(),
    });

    return {
      success: true,
      imageCount: updatedImages.length,
    };
  },
});

/* ======================================================
   Remove Mood Board Image
====================================================== */
export const removeMoodBoardImage = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.string(),
  },
  handler: async (ctx, { projectId, storageId }) => {
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

    const currentImages = project.moodBoardImages || [];
    const updatedImages = currentImages.filter((id) => id !== storageId);

    await ctx.db.patch(projectId, {
      moodBoardImages: updatedImages,
      lastModified: Date.now(),
    });

    // Delete from storage
    try {
      await ctx.storage.delete(storageId as any);
    } catch (error) {
      console.error("Failed to delete from storage:", error);
    }

    return {
      success: true,
      imageCount: updatedImages.length,
    };
  },
});

/* ======================================================
   Get Mood Board Images
====================================================== */
export const getMoodBoardImages = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      return [];
    }

    if (project.userId !== userId && !project.isPublic) {
      return [];
    }

    const storageIds = project.moodBoardImages || [];

    // Generate URLs for each image
    const images = await Promise.all(
      storageIds.map(async (storageId, index) => {
        try {
          const url = await ctx.storage.getUrl(storageId as any);
          return {
            id: `${storageId}-${index}`,
            storageId,
            url,
            uploaded: true,
            uploading: false,
            isFromServer: true,
          };
        } catch {
          return null;
        }
      })
    );

    return images.filter((img) => img !== null);
  },
});