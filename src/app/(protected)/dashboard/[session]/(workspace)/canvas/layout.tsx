import { ReactNode } from "react";
import { Toolbar } from "@/components/canvas/toolbar";

interface CanvasLayoutProps {
  children: ReactNode;
}

export default function CanvasLayout({ children }: CanvasLayoutProps) {
  return (
    <div className="relative w-full h-[calc(100vh-56px)] bg-background overflow-hidden">
      {children}
      <Toolbar />
    </div>
  );
}