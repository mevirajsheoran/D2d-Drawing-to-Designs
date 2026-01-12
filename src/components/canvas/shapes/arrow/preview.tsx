interface ArrowPreviewProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function ArrowPreview({ startX, startY, endX, endY }: ArrowPreviewProps) {
  const angle = Math.atan2(endY - startY, endX - startX);
  const headLength = 12;

  return (
    <svg
      className="absolute pointer-events-none overflow-visible"
      style={{ left: 0, top: 0, width: "100%", height: "100%" }}
    >
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <polygon
        points={`
          ${endX},${endY}
          ${endX - headLength * Math.cos(angle - Math.PI / 6)},${endY - headLength * Math.sin(angle - Math.PI / 6)}
          ${endX - headLength * Math.cos(angle + Math.PI / 6)},${endY - headLength * Math.sin(angle + Math.PI / 6)}
        `}
        fill="hsl(var(--primary))"
        opacity={0.5}
      />
    </svg>
  );
}