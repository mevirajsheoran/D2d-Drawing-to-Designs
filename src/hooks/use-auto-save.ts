// src/hooks/use-auto-save.ts
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { toast } from "sonner";

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds between retries

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error" | "retrying";

interface UseAutoSaveProps {
  projectId: string | null;
}

interface SaveQueueItem {
  shapes: string;
  viewportData: string;
  attempts: number;
}

export function useAutoSave({ projectId }: UseAutoSaveProps) {
  // Status state
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Redux state
  const shapesState = useAppSelector((state) => state.shapes);
  const viewportState = useAppSelector((state) => state.viewport);
  const user = useAppSelector((state) => state.profile.user);

  // Refs
  const lastSaveRef = useRef<string>("");
  const isSavingRef = useRef(false);
  const retryQueueRef = useRef<SaveQueueItem | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current state as string for comparison
  const getCurrentStateString = useCallback(() => {
    const sketchesData = JSON.stringify({
      shapes: shapesState.shapes,
      tool: shapesState.tool,
      frameCounter: shapesState.frameCounter,
    });

    const viewportData = JSON.stringify({
      translate: viewportState.translate,
      scale: viewportState.scale,
    });

    return { sketchesData, viewportData, combined: sketchesData + viewportData };
  }, [shapesState, viewportState]);

  // Perform the save operation
  const performSave = useCallback(
    async (sketchesData: string, viewportData: string, attempt: number = 1) => {
      if (!projectId || !user?.id) return false;

      try {
        const response = await fetch("/api/project", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            userId: user.id,
            shapes: sketchesData,
            viewportData,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
      } catch (error) {
        console.error(`[AutoSave] Attempt ${attempt} failed:`, error);
        return false;
      }
    },
    [projectId, user?.id]
  );

  // Main save function with retry logic
  const saveProject = useCallback(async () => {
    if (!projectId || !user?.id || isSavingRef.current) return;

    const { sketchesData, viewportData, combined } = getCurrentStateString();

    // Skip if nothing changed
    if (combined === lastSaveRef.current) {
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");

    const success = await performSave(sketchesData, viewportData, 1);

    if (success) {
      lastSaveRef.current = combined;
      setStatus("saved");
      setLastSaved(new Date());

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 2000);

      // Clear any pending retries
      retryQueueRef.current = null;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    } else {
      // Queue for retry
      setStatus("error");
      retryQueueRef.current = {
        shapes: sketchesData,
        viewportData,
        attempts: 1,
      };

      // Start retry process
      retryTimeoutRef.current = setTimeout(() => {
        processRetryQueue();
      }, RETRY_DELAY);
    }

    isSavingRef.current = false;
  }, [projectId, user?.id, getCurrentStateString, performSave]);

  // Process retry queue
  const processRetryQueue = useCallback(async () => {
    const item = retryQueueRef.current;
    if (!item || !projectId || !user?.id) return;

    if (item.attempts >= MAX_RETRY_ATTEMPTS) {
      // Max retries reached
      setStatus("error");
      toast.error("Failed to save project. Please check your connection.");
      retryQueueRef.current = null;
      return;
    }

    setStatus("retrying");
    isSavingRef.current = true;

    const success = await performSave(
      item.shapes,
      item.viewportData,
      item.attempts + 1
    );

    if (success) {
      const { combined } = getCurrentStateString();
      lastSaveRef.current = combined;
      setStatus("saved");
      setLastSaved(new Date());
      retryQueueRef.current = null;

      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } else {
      // Schedule another retry
      item.attempts += 1;
      retryTimeoutRef.current = setTimeout(() => {
        processRetryQueue();
      }, RETRY_DELAY);
    }

    isSavingRef.current = false;
  }, [projectId, user?.id, performSave, getCurrentStateString]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (isSavingRef.current) {
      toast.info("Save already in progress...");
      return;
    }

    await saveProject();

    if (status === "saved") {
      toast.success("Project saved!");
    }
  }, [saveProject, status]);

  // Auto-save interval
  useEffect(() => {
    if (!projectId || !user?.id) return;

    const intervalId = setInterval(saveProject, AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [projectId, user?.id, saveProject]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Format last saved time
  const getLastSavedText = useCallback(() => {
    if (!lastSaved) return null;

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }, [lastSaved]);

  return {
    status,
    lastSaved,
    lastSavedText: getLastSavedText(),
    saveProject,
    manualSave,
    isSaving: status === "saving" || status === "retrying",
  };
}