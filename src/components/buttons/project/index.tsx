"use client";

import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useProjectCreation } from "@/hooks/use-project";

interface CreateProjectButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export function CreateProjectButton({
  variant = "default",
  size = "sm",
  className,
  showText = true,
}: CreateProjectButtonProps) {
  const { createProject, isCreating, canCreate } = useProjectCreation();

  const handleClick = () => {
    createProject();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isCreating || !canCreate}
      variant={variant}
      size={size}
      className={className}
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && <span className="ml-2">Creating...</span>}
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          {showText && <span className="ml-2">New Project</span>}
        </>
      )}
    </Button>
  );
}