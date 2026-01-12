"use client";

import { EllipseShape } from "@/redux/slice/shapes";

interface EllipseProps {
  shape: EllipseShape;
  isSelected?: boolean;
}

export function Ellipse({ shape, isSelected }: EllipseProps) {
  return (
    <div
      className="absolute pointer-events-auto rounded-full"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.w,
        height: shape.h,
        backgroundColor: shape.fill || "transparent",
        border: `${shape.strokeWidth}px solid ${shape.stroke}`,
      }}
    />
  );
}