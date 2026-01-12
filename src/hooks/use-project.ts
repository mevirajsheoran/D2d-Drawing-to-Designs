"use client";

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  addProject,
} from "@/redux/slice/projects";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { generateGradientThumbnail } from "@/lib/thumbnail";
import { useRouter } from "next/navigation";
import { combinedSlug } from "@/lib/utils";

export function useProjectCreation() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.profile.user);
  const projectState = useAppSelector((state) => state.projects);
  const shapesState = useAppSelector((state) => state.shapes);
  const viewportState = useAppSelector((state) => state.viewport);

  const createProjectMutation = useMutation(api.projects.createProject);

  const createProject = async (name?: string) => {
    if (!user?.id) {
      toast.error("Please sign in to create a project");
      return null;
    }

    dispatch(createProjectStart());

    try {
      // Generate thumbnail
      const thumbnail = generateGradientThumbnail();

      // Get initial sketch data from Redux
      const sketchesData = {
        shapes: shapesState.shapes,
        tool: shapesState.tool,
        frameCounter: shapesState.frameCounter,
        selected: shapesState.selected,
      };

      // Get viewport data
      const viewportData = {
        translate: viewportState.translate,
        scale: viewportState.scale,
      };

      // Create project in Convex
      const result = await createProjectMutation({
        name,
        thumbnail,
        sketchesData: JSON.stringify(sketchesData),
        viewportData: JSON.stringify(viewportData),
      });

      // Update Redux store
      dispatch(
        addProject({
          id: result.projectId,
          name: result.name,
          projectNumber: result.projectNumber,
          thumbnail,
          lastModified: Date.now(),
          createdAt: Date.now(),
        })
      );

      dispatch(createProjectSuccess());
      toast.success("Project created successfully!");

      // Navigate to the new project
      const userSlug = combinedSlug(user.name);
      router.push(`/dashboard/${userSlug}/canvas?project=${result.projectId}`);

      return result;
    } catch (error) {
      console.error("Failed to create project:", error);
      dispatch(createProjectFailure("Failed to create project"));
      toast.error("Failed to create project");
      return null;
    }
  };

  return {
    createProject,
    isCreating: projectState.isCreating,
    projects: projectState.projects,
    projectsTotal: projectState.total,
    canCreate: !!user?.id,
  };
}

/**
 * Hook for project operations (update, delete, duplicate)
 */
export function useProjectActions() {
  const dispatch = useAppDispatch();
  const updateMutation = useMutation(api.projects.updateProject);
  const deleteMutation = useMutation(api.projects.deleteProject);
  const duplicateMutation = useMutation(api.projects.duplicateProject);

  const updateProject = async (
    projectId: string,
    updates: Record<string, any>
  ) => {
    try {
      await updateMutation({
        projectId: projectId as any,
        ...updates,
      });
      toast.success("Project updated");
      return true;
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project");
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteMutation({ projectId: projectId as any });
      toast.success("Project deleted");
      return true;
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
      return false;
    }
  };

  const duplicateProject = async (projectId: string) => {
    try {
      const result = await duplicateMutation({ projectId: projectId as any });
      toast.success("Project duplicated");
      return result;
    } catch (error) {
      console.error("Failed to duplicate project:", error);
      toast.error("Failed to duplicate project");
      return null;
    }
  };

  return {
    updateProject,
    deleteProject,
    duplicateProject,
  };
}