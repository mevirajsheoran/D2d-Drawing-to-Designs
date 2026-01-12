"use client";

import { Shape } from "@/redux/slice/shapes";
import { Frame } from "./frame";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Stroke } from "./stroke";
import { Arrow } from "./arrow";
import { Line } from "./line";
import { Text } from "./text";

interface ShapeRendererProps {
  shape: Shape;
  isSelected?: boolean;
}

export function ShapeRenderer({ shape, isSelected = false }: ShapeRendererProps) {
  switch (shape.type) {
    case "frame":
      return <Frame shape={shape} isSelected={isSelected} />;
    case "rect":
      return <Rectangle shape={shape} isSelected={isSelected} />;
    case "ellipse":
      return <Ellipse shape={shape} isSelected={isSelected} />;
    case "freedraw":
      return <Stroke shape={shape} isSelected={isSelected} />;
    case "arrow":
      return <Arrow shape={shape} isSelected={isSelected} />;
    case "line":
      return <Line shape={shape} isSelected={isSelected} />;
    case "text":
      return <Text shape={shape} isSelected={isSelected} />;
    default:
      return null;
  }
}