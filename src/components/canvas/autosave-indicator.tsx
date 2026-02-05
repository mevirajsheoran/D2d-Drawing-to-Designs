// src/components/canvas/autosave-indicator.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useAutoSave, AutoSaveStatus } from "@/hooks/use-auto-save";
import { Check, AlertCircle, Loader2, RefreshCw, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AutosaveIndicator() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const { status, lastSavedText, manualSave, isSaving } = useAutoSave({
    projectId,
  });

  // Don't show if not on a project page
  if (!projectId) return null;

  const getStatusConfig = (
    status: AutoSaveStatus
  ): {
    icon: React.ReactNode;
    text: string;
    className: string;
  } => {
    switch (status) {
      case "saving":
        return {
          icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
          text: "Saving...",
          className: "text-yellow-600 dark:text-yellow-500",
        };
      case "saved":
        return {
          icon: <Check className="h-3.5 w-3.5" />,
          text: "Saved",
          className: "text-green-600 dark:text-green-500",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          text: "Error",
          className: "text-red-600 dark:text-red-500",
        };
      case "retrying":
        return {
          icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" />,
          text: "Retrying...",
          className: "text-orange-600 dark:text-orange-500",
        };
      default:
        return {
          icon: <Cloud className="h-3.5 w-3.5" />,
          text: lastSavedText || "Auto-save on",
          className: "text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={manualSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
              "hover:bg-muted/50 transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-70",
              config.className
            )}
          >
            {config.icon}
            <span className="hidden sm:inline">{config.text}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {status === "error"
              ? "Click to retry saving"
              : status === "idle"
              ? "Auto-saves every 30 seconds. Click to save now."
              : config.text}
          </p>
          {lastSavedText && status === "idle" && (
            <p className="text-muted-foreground text-xs">
              Last saved: {lastSavedText}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}