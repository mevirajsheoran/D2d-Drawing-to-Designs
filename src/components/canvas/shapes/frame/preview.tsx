interface FramePreviewProps {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function FramePreview({ x, y, w, h }: FramePreviewProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        border: "2px dashed hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.05)",
      }}
    >
      <div className="absolute -top-5 left-0 text-xs text-primary">
        New Frame
      </div>
    </div>
  );
}