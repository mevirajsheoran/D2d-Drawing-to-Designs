"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/redux/store";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface UseAutoSaveProps {
  projectId: string | null;
}

export function useAutoSave({ projectId }: UseAutoSaveProps) {
  const shapesState = useAppSelector((state) => state.shapes);
  const viewportState = useAppSelector((state) => state.viewport);
  const lastSaveRef = useRef<string>("");
  const isSavingRef = useRef(false);

  const updateProject = useMutation(api.projects.updateProject);

  const saveProject = useCallback(async () => {
    if (!projectId || isSavingRef.current) return;

    const sketchesData = JSON.stringify({
      shapes: shapesState.shapes,
      tool: shapesState.tool,
      frameCounter: shapesState.frameCounter,
    });

    const viewportData = JSON.stringify({
      translate: viewportState.translate,
      scale: viewportState.scale,
    });

    const currentState = sketchesData + viewportData;

    // Skip if nothing changed
    if (currentState === lastSaveRef.current) return;

    isSavingRef.current = true;

    try {
      await updateProject({
        projectId: projectId as Id<"projects">,
        sketchesData: JSON.parse(sketchesData),
        viewportData: JSON.parse(viewportData),
      });

      lastSaveRef.current = currentState;
      console.log("Auto-saved project");
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast.error("Failed to save project");
    } finally {
      isSavingRef.current = false;
    }
  }, [projectId, shapesState, viewportState, updateProject]);

  // Auto-save interval
  useEffect(() => {
    if (!projectId) return;

    const intervalId = setInterval(saveProject, AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [projectId, saveProject]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (projectId) {
        saveProject();
      }
    };
  }, [projectId, saveProject]);

  return {
    saveProject,
    isSaving: isSavingRef.current,
  };
}