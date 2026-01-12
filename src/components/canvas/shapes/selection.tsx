"use client";

import { useAppSelector } from "@/redux/store";
import { Shape, FreeDrawShape, ArrowShape, LineShape } from "@/redux/slice/shapes";
import { cn } from "@/lib/utils";

type ResizeCorner = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface SelectionOverlayProps {
  onResizeStart: (shapeId: string, corner: ResizeCorner, e: React.PointerEvent) => void;
}

export function SelectionOverlay({ onResizeStart }: SelectionOverlayProps) {
  const selected = useAppSelector((state) => state.shapes.selected);
  const entities = useAppSelector((state) => state.shapes.shapes.entities);

  const selectedIds = Object.keys(selected || {});

  if (selectedIds.length === 0) return null;

  return (
    <>
      {selectedIds.map((id) => {
        const shape = entities[id];
        if (!shape) return null;

        return (
          <SelectionBox
            key={id}
            shape={shape}
            onResizeStart={(corner, e) => onResizeStart(id, corner, e)}
          />
        );
      })}
    </>
  );
}

interface SelectionBoxProps {
  shape: Shape;
  onResizeStart: (corner: ResizeCorner, e: React.PointerEvent) => void;
}

function SelectionBox({ shape, onResizeStart }: SelectionBoxProps) {
  let bounds = { x: 0, y: 0, w: 0, h: 0 };

  // Calculate bounds based on shape type
  if (["frame", "rect", "ellipse", "text"].includes(shape.type)) {
    bounds = {
      x: (shape as any).x,
      y: (shape as any).y,
      w: (shape as any).w || 100,
      h: (shape as any).h || 24,
    };
  } else if (shape.type === "freedraw") {
    const freeShape = shape as FreeDrawShape;
    if (freeShape.points.length > 0) {
      const xs = freeShape.points.map((p) => p.x);
      const ys = freeShape.points.map((p) => p.y);
      bounds = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys),
      };
    }
  } else if (shape.type === "arrow" || shape.type === "line") {
    const lineShape = shape as ArrowShape | LineShape;
    bounds = {
      x: Math.min(lineShape.startX, lineShape.endX),
      y: Math.min(lineShape.startY, lineShape.endY),
      w: Math.abs(lineShape.endX - lineShape.startX),
      h: Math.abs(lineShape.endY - lineShape.startY),
    };
  }

  const padding = 4;
  const handleSize = 8;
  const halfHandle = handleSize / 2;

  const handles: { corner: ResizeCorner; x: number; y: number; cursor: string }[] = [
    { corner: "nw", x: -halfHandle, y: -halfHandle, cursor: "nwse-resize" },
    { corner: "n", x: bounds.w / 2 - halfHandle, y: -halfHandle, cursor: "ns-resize" },
    { corner: "ne", x: bounds.w - halfHandle, y: -halfHandle, cursor: "nesw-resize" },
    { corner: "e", x: bounds.w - halfHandle, y: bounds.h / 2 - halfHandle, cursor: "ew-resize" },
    { corner: "se", x: bounds.w - halfHandle, y: bounds.h - halfHandle, cursor: "nwse-resize" },
    { corner: "s", x: bounds.w / 2 - halfHandle, y: bounds.h - halfHandle, cursor: "ns-resize" },
    { corner: "sw", x: -halfHandle, y: bounds.h - halfHandle, cursor: "nesw-resize" },
    { corner: "w", x: -halfHandle, y: bounds.h / 2 - halfHandle, cursor: "ew-resize" },
  ];

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: bounds.x - padding,
        top: bounds.y - padding,
        width: bounds.w + padding * 2,
        height: bounds.h + padding * 2,
      }}
    >
      {/* Selection border - using primary color */}
      <div
        className="absolute inset-0 border-2 rounded-sm"
        style={{ borderColor: "hsl(var(--primary))" }}
      />

      {/* Resize handles - 8 handles */}
      {handles.map(({ corner, x, y, cursor }) => (
        <div
          key={corner}
          className={cn(
            "absolute pointer-events-auto",
            "w-2 h-2 rounded-full",
            "bg-background border-2",
            "transition-transform hover:scale-125"
          )}
          style={{
            left: x + padding,
            top: y + padding,
            cursor,
            borderColor: "hsl(var(--primary))",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(corner, e);
          }}
        />
      ))}
    </div>
  );
}