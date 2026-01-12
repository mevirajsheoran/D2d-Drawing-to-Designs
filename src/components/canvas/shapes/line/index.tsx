"use client";

import { LineShape } from "@/redux/slice/shapes";

interface LineProps {
  shape: LineShape;
  isSelected?: boolean;
}

export function Line({ shape, isSelected }: LineProps) {
  return (
    <svg
      className="absolute pointer-events-auto overflow-visible"
      style={{ left: 0, top: 0, width: "100%", height: "100%" }}
    >
      <line
        x1={shape.startX}
        y1={shape.startY}
        x2={shape.endX}
        y2={shape.endY}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}