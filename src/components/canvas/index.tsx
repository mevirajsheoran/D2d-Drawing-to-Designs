"use client";

import { useCanvas } from "@/hooks/use-canvas";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useSearchParams } from "next/navigation";
import { TextSidebar } from "./text-sidebar";
import { ShapeRenderer } from "./shapes";
import { SelectionOverlay } from "./shapes/selection";
import { RectanglePreview } from "./shapes/rectangle/preview";
import { EllipsePreview } from "./shapes/ellipse/preview";
import { FramePreview } from "./shapes/frame/preview";
import { ArrowPreview } from "./shapes/arrow/preview";
import { LinePreview } from "./shapes/line/preview";
import { StrokePreview } from "./shapes/stroke/preview";
import { cn } from "@/lib/utils";

export function InfiniteCanvas() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const {
    viewport,
    shapeList,
    currentTool,
    selectedIds,
    sidebarOpen,
    setSidebarOpen,
    attachCanvasRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    getDraftShape,
    getFreeDrawPoints,
    startResize,
  } = useCanvas();

  // Auto-save
  useAutoSave({ projectId });

  const draftShape = getDraftShape();
  const freeDrawPoints = getFreeDrawPoints();

  // Cursor based on tool
  const getCursor = () => {
    switch (currentTool) {
      case "pan":
        return "grab";
      case "select":
        return "default";
      case "text":
        return "text";
      case "eraser":
        return "crosshair";
      default:
        return "crosshair";
    }
  };

  return (
    <>
      {/* Text Sidebar */}
      <TextSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Canvas */}
      <div
        ref={attachCanvasRef}
        role="application"
        aria-label="Drawing canvas"
        className={cn("w-full h-full overflow-hidden relative")}
        style={{
          cursor: getCursor(),
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      >
        {/* Dot Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)`,
            backgroundSize: `${24 * viewport.scale}px ${24 * viewport.scale}px`,
            backgroundPosition: `${viewport.translate.x}px ${viewport.translate.y}px`,
          }}
        />

        {/* Transformed Layer */}
        <div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${viewport.translate.x}px, ${viewport.translate.y}px) scale(${viewport.scale})`,
          }}
        >
          {/* Render all shapes */}
          {shapeList.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              isSelected={selectedIds.includes(shape.id)}
            />
          ))}

          {/* Selection overlay */}
          <SelectionOverlay onResizeStart={startResize} />

          {/* Draft previews */}
          {draftShape?.type === "rect" && (
            <RectanglePreview
              x={Math.min(draftShape.startX, draftShape.endX)}
              y={Math.min(draftShape.startY, draftShape.endY)}
              w={Math.abs(draftShape.endX - draftShape.startX)}
              h={Math.abs(draftShape.endY - draftShape.startY)}
            />
          )}

          {draftShape?.type === "ellipse" && (
            <EllipsePreview
              x={Math.min(draftShape.startX, draftShape.endX)}
              y={Math.min(draftShape.startY, draftShape.endY)}
              w={Math.abs(draftShape.endX - draftShape.startX)}
              h={Math.abs(draftShape.endY - draftShape.startY)}
            />
          )}

          {draftShape?.type === "frame" && (
            <FramePreview
              x={Math.min(draftShape.startX, draftShape.endX)}
              y={Math.min(draftShape.startY, draftShape.endY)}
              w={Math.abs(draftShape.endX - draftShape.startX)}
              h={Math.abs(draftShape.endY - draftShape.startY)}
            />
          )}

          {draftShape?.type === "arrow" && (
            <ArrowPreview
              startX={draftShape.startX}
              startY={draftShape.startY}
              endX={draftShape.endX}
              endY={draftShape.endY}
            />
          )}

          {draftShape?.type === "line" && (
            <LinePreview
              startX={draftShape.startX}
              startY={draftShape.startY}
              endX={draftShape.endX}
              endY={draftShape.endY}
            />
          )}

          {/* Freehand preview */}
          {currentTool === "freedraw" && freeDrawPoints.length > 1 && (
            <StrokePreview points={freeDrawPoints} />
          )}
        </div>
      </div>
    </>
  );
}