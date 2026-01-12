import { Point } from "@/redux/slice/viewport";

interface StrokePreviewProps {
  points: Point[];
}

export function StrokePreview({ points }: StrokePreviewProps) {
  if (points.length < 2) return null;

  const pathData = points
    .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg
      className="absolute pointer-events-none overflow-visible"
      style={{ left: 0, top: 0, width: "100%", height: "100%" }}
    >
      <path
        d={pathData}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 4"
        fill="none"
      />
    </svg>
  );
}