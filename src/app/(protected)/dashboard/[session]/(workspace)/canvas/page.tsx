"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { InfiniteCanvas } from "@/components/canvas";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { loadProject, clearAll } from "@/redux/slice/shapes";
import { restoreViewport, resetView } from "@/redux/slice/viewport";

export default function CanvasPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const dispatch = useAppDispatch();

  // Fetch project data
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  // Load project data into Redux
  useEffect(() => {
    if (project) {
      // Load shapes
      if (project.sketchesData) {
        try {
          const data =
            typeof project.sketchesData === "string"
              ? JSON.parse(project.sketchesData)
              : project.sketchesData;

          if (data.shapes) {
            dispatch(loadProject(data));
          }
        } catch (e) {
          console.error("Failed to parse sketches data:", e);
        }
      } else {
        dispatch(clearAll());
      }

      // Load viewport
      if (project.viewportData) {
        try {
          const data =
            typeof project.viewportData === "string"
              ? JSON.parse(project.viewportData)
              : project.viewportData;

          dispatch(
            restoreViewport({
              scale: data.scale || 1,
              translate: data.translate || { x: 0, y: 0 },
            })
          );
        } catch (e) {
          console.error("Failed to parse viewport data:", e);
          dispatch(resetView());
        }
      } else {
        dispatch(resetView());
      }
    }
  }, [project, dispatch]);

  // No project selected
  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-lg">No project selected</p>
        <p className="text-sm">Select a project from the dashboard</p>
      </div>
    );
  }

  // Loading
  if (project === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found
  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-lg">Project not found</p>
        <p className="text-sm">The project may have been deleted</p>
      </div>
    );
  }

  return <InfiniteCanvas />;
}