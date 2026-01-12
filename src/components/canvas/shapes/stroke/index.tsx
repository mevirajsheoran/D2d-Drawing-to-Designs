"use client";

import { FreeDrawShape } from "@/redux/slice/shapes";

interface StrokeProps {
  shape: FreeDrawShape;
  isSelected?: boolean;
}

export function Stroke({ shape, isSelected }: StrokeProps) {
  if (shape.points.length < 2) return null;

  const pathData = shape.points
    .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg
      className="absolute pointer-events-auto overflow-visible"
      style={{ left: 0, top: 0, width: "100%", height: "100%" }}
    >
      <path
        d={pathData}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}