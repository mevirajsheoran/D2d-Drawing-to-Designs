"use client";

import { FrameShape } from "@/redux/slice/shapes";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface FrameProps {
  shape: FrameShape;
  isSelected?: boolean;
}

export function Frame({ shape, isSelected }: FrameProps) {
  const handleExport = () => {
    // TODO: Implement frame export
    console.log("Export frame:", shape.id);
  };

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.w,
        height: shape.h,
        backgroundColor: shape.fill || "rgba(255, 255, 255, 0.02)",
        border: `${shape.strokeWidth}px solid ${shape.stroke || "transparent"}`,
      }}
    >
      {/* Frame label */}
      <div
        className="absolute -top-6 left-0 text-xs font-medium text-muted-foreground"
        style={{ pointerEvents: "none" }}
      >
        Frame {shape.frameNumber}
      </div>

      {/* Export button - only show when selected */}
      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-xs"
            onClick={handleExport}
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      )}
    </div>
  );
}