"use client";

import { Button } from "@/components/ui/button";
import {
  MousePointer2,
  Hand,
  Pencil,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Type,
  Frame,
  Eraser,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { setTool, Tool } from "@/redux/slice/shapes";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const tools: { id: Tool; icon: any; label: string; shortcut: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "pan", icon: Hand, label: "Pan", shortcut: "H" },
  { id: "freedraw", icon: Pencil, label: "Pen", shortcut: "P" },
  { id: "rect", icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "ellipse", icon: Circle, label: "Ellipse", shortcut: "O" },
  { id: "arrow", icon: ArrowUpRight, label: "Arrow", shortcut: "A" },
  { id: "line", icon: Minus, label: "Line", shortcut: "L" },
  { id: "text", icon: Type, label: "Text", shortcut: "T" },
  { id: "frame", icon: Frame, label: "Frame", shortcut: "F" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
];

export function ToolButtons() {
  const dispatch = useAppDispatch();
  const currentTool = useAppSelector((state) => state.shapes.tool);

  return (
    <TooltipProvider>
      <div className="flex items-center bg-background border rounded-full p-1 shadow-lg">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = currentTool === tool.id;

          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-colors",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => dispatch(setTool(tool.id))}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label} ({tool.shortcut})</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}