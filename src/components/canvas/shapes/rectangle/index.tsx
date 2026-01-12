"use client";

import { RectShape } from "@/redux/slice/shapes";

interface RectangleProps {
  shape: RectShape;
  isSelected?: boolean;
}

export function Rectangle({ shape, isSelected }: RectangleProps) {
  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.w,
        height: shape.h,
        backgroundColor: shape.fill || "transparent",
        border: `${shape.strokeWidth}px solid ${shape.stroke}`,
        opacity: 1,
      }}
    />
  );
}