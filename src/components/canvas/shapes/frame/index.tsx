// src/components/canvas/shapes/frame/index.tsx
"use client";

import { useState } from "react";
import { FrameShape, Shape } from "@/redux/slice/shapes";
import { useAppSelector } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateFrameSnapshot, downloadBlob } from "@/lib/frame-snapshot";
import { toast } from "sonner";

interface FrameProps {
  shape: FrameShape;
  isSelected?: boolean;
}

export function Frame({ shape, isSelected }: FrameProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Get all shapes from Redux
  const shapesState = useAppSelector((state) => state.shapes);
  const allShapes: Shape[] = Object.values(shapesState.shapes.entities).filter(
    (s): s is Shape => s !== undefined
  );

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      // Generate snapshot
      const blob = await generateFrameSnapshot(shape, allShapes);

      // Download file
      const fileName = `Frame-${shape.frameNumber || 1}.png`;
      downloadBlob(blob, fileName);

      toast.success(`Exported ${fileName}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export frame");
    } finally {
      setIsExporting(false);
    }
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
        border: `${shape.strokeWidth || 1}px solid ${
          shape.stroke || "hsl(var(--border))"
        }`,
      }}
    >
      {/* Frame label */}
      <div
        className="absolute -top-6 left-0 text-xs font-medium text-muted-foreground select-none"
        style={{ pointerEvents: "none" }}
      >
        Frame {shape.frameNumber || 1}
      </div>

      {/* Export button - only show when selected */}
      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-xs"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" />
                Export
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}