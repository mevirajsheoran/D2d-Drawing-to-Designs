interface RectanglePreviewProps {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function RectanglePreview({ x, y, w, h }: RectanglePreviewProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        border: "2px dashed hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
      }}
    />
  );
}