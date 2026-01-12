"use client";

import { HistoryButtons } from "./history";
import { ToolButtons } from "./tools";
import { ZoomControls } from "./zoom";

export function Toolbar() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
      <HistoryButtons />
      <ToolButtons />
      <ZoomControls />
    </div>
  );
}

// Default export for flexibility
export default Toolbar;