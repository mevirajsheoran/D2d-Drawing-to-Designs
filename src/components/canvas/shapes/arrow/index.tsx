"use client";

import { ArrowShape } from "@/redux/slice/shapes";

interface ArrowProps {
  shape: ArrowShape;
  isSelected?: boolean;
}

export function Arrow({ shape, isSelected }: ArrowProps) {
  const angle = Math.atan2(
    shape.endY - shape.startY,
    shape.endX - shape.startX
  );
  const headLength = 12;

  return (
    <svg
      className="absolute pointer-events-auto overflow-visible"
      style={{
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Line */}
      <line
        x1={shape.startX}
        y1={shape.startY}
        x2={shape.endX}
        y2={shape.endY}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
      />

      {/* Arrowhead */}
      <polygon
        points={`
          ${shape.endX},${shape.endY}
          ${shape.endX - headLength * Math.cos(angle - Math.PI / 6)},${shape.endY - headLength * Math.sin(angle - Math.PI / 6)}
          ${shape.endX - headLength * Math.cos(angle + Math.PI / 6)},${shape.endY - headLength * Math.sin(angle + Math.PI / 6)}
        `}
        fill={shape.stroke}
      />
    </svg>
  );
}