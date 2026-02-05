// src/lib/frame-snapshot.ts
"use client";

import {
  Shape,
  FrameShape,
  RectShape,
  EllipseShape,
  ArrowShape,
  LineShape,
  TextShape,
  FreeDrawShape,
} from "@/redux/slice/shapes";

/**
 * Check if a shape is inside a frame's boundaries
 */
export const isShapeInsideFrame = (
  shape: Shape,
  frame: FrameShape
): boolean => {
  // Skip the frame itself
  if (shape.id === frame.id) return false;

  // Get shape bounds based on type
  let shapeBounds: { x: number; y: number; w: number; h: number };

  switch (shape.type) {
    case "frame":
    case "rect":
    case "ellipse": {
      const s = shape as FrameShape | RectShape | EllipseShape;
      shapeBounds = { x: s.x, y: s.y, w: s.w, h: s.h };
      break;
    }

    case "arrow":
    case "line": {
      const s = shape as ArrowShape | LineShape;
      const minX = Math.min(s.startX, s.endX);
      const minY = Math.min(s.startY, s.endY);
      const maxX = Math.max(s.startX, s.endX);
      const maxY = Math.max(s.startY, s.endY);
      shapeBounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      break;
    }

    case "text": {
      const s = shape as TextShape;
      const textWidth = Math.max(100, s.text.length * s.fontSize * 0.6);
      const textHeight = s.fontSize * 1.5;
      shapeBounds = { x: s.x, y: s.y, w: textWidth, h: textHeight };
      break;
    }

    case "freedraw": {
      const s = shape as FreeDrawShape;
      if (!s.points || s.points.length === 0) return false;

      const xs = s.points.map((p) => p.x);
      const ys = s.points.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      shapeBounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      break;
    }

    default:
      return false;
  }

  // Check if shape is inside frame
  const frameLeft = frame.x;
  const frameRight = frame.x + frame.w;
  const frameTop = frame.y;
  const frameBottom = frame.y + frame.h;

  const shapeLeft = shapeBounds.x;
  const shapeRight = shapeBounds.x + shapeBounds.w;
  const shapeTop = shapeBounds.y;
  const shapeBottom = shapeBounds.y + shapeBounds.h;

  // Shape must be fully inside frame
  return (
    shapeLeft >= frameLeft &&
    shapeRight <= frameRight &&
    shapeTop >= frameTop &&
    shapeBottom <= frameBottom
  );
};

/**
 * Generate a PNG snapshot of a frame and its contents
 */
export const generateFrameSnapshot = async (
  frame: FrameShape,
  allShapes: Shape[]
): Promise<Blob> => {
  // Create offscreen canvas
  const canvas = document.createElement("canvas");
  const padding = 20;

  canvas.width = frame.w + padding * 2;
  canvas.height = frame.h + padding * 2;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Save initial state
  ctx.save();

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Optional: Draw frame border
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  ctx.strokeRect(padding, padding, frame.w, frame.h);

  // Filter shapes inside this frame
  const shapesInFrame = allShapes.filter((shape) =>
    isShapeInsideFrame(shape, frame)
  );

  // Draw each shape
  for (const shape of shapesInFrame) {
    ctx.save();

    // Calculate relative position (offset from frame origin)
    const offsetX = padding - frame.x;
    const offsetY = padding - frame.y;

    switch (shape.type) {
      case "rect": {
        const s = shape as RectShape;
        ctx.fillStyle = s.fill || "transparent";
        ctx.strokeStyle = s.stroke || "#000000";
        ctx.lineWidth = s.strokeWidth || 2;

        const x = s.x + offsetX;
        const y = s.y + offsetY;

        if (s.fill && s.fill !== "transparent") {
          ctx.fillRect(x, y, s.w, s.h);
        }
        ctx.strokeRect(x, y, s.w, s.h);
        break;
      }

      case "ellipse": {
        const s = shape as EllipseShape;
        ctx.fillStyle = s.fill || "transparent";
        ctx.strokeStyle = s.stroke || "#000000";
        ctx.lineWidth = s.strokeWidth || 2;

        const centerX = s.x + s.w / 2 + offsetX;
        const centerY = s.y + s.h / 2 + offsetY;
        const radiusX = s.w / 2;
        const radiusY = s.h / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

        if (s.fill && s.fill !== "transparent") {
          ctx.fill();
        }
        ctx.stroke();
        break;
      }

      case "line": {
        const s = shape as LineShape;
        ctx.strokeStyle = s.stroke || "#000000";
        ctx.lineWidth = s.strokeWidth || 2;

        ctx.beginPath();
        ctx.moveTo(s.startX + offsetX, s.startY + offsetY);
        ctx.lineTo(s.endX + offsetX, s.endY + offsetY);
        ctx.stroke();
        break;
      }

      case "arrow": {
        const s = shape as ArrowShape;
        ctx.strokeStyle = s.stroke || "#000000";
        ctx.lineWidth = s.strokeWidth || 2;

        const startX = s.startX + offsetX;
        const startY = s.startY + offsetY;
        const endX = s.endX + offsetX;
        const endY = s.endY + offsetY;

        // Draw line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowLength = 15;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle - Math.PI / 6),
          endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle + Math.PI / 6),
          endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
      }

      case "text": {
        const s = shape as TextShape;
        ctx.font = `${s.fontWeight || "normal"} ${s.fontSize || 16}px ${
          s.fontFamily || "Arial"
        }`;
        ctx.fillStyle = s.fontColor || "#000000";
        ctx.textBaseline = "top";

        const x = s.x + offsetX;
        const y = s.y + offsetY;

        // Handle text decorations
        ctx.fillText(s.text, x, y);

        if (s.underline) {
          const textWidth = ctx.measureText(s.text).width;
          ctx.beginPath();
          ctx.moveTo(x, y + s.fontSize + 2);
          ctx.lineTo(x + textWidth, y + s.fontSize + 2);
          ctx.strokeStyle = s.fontColor || "#000000";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;
      }

      case "freedraw": {
        const s = shape as FreeDrawShape;
        if (!s.points || s.points.length < 2) break;

        ctx.strokeStyle = s.stroke || "#000000";
        ctx.lineWidth = s.strokeWidth || 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(s.points[0].x + offsetX, s.points[0].y + offsetY);

        for (let i = 1; i < s.points.length; i++) {
          ctx.lineTo(s.points[i].x + offsetX, s.points[i].y + offsetY);
        }
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }

  // Restore canvas state
  ctx.restore();

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create image blob"));
        }
      },
      "image/png",
      1.0
    );
  });
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  URL.revokeObjectURL(url);
};

/**
 * Convert blob to base64 string (for API calls)
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};