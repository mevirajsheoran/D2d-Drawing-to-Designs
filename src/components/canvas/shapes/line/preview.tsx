interface LinePreviewProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function LinePreview({ startX, startY, endX, endY }: LinePreviewProps) {
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
    </svg>
  );
}