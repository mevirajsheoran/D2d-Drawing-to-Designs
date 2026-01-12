interface EllipsePreviewProps {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function EllipsePreview({ x, y, w, h }: EllipsePreviewProps) {
  return (
    <div
      className="absolute pointer-events-none rounded-full"
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