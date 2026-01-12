"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { zoomIn, zoomOut, resetView } from "@/redux/slice/viewport";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ZoomControls() {
  const dispatch = useAppDispatch();
  const scale = useAppSelector((state) => state.viewport.scale);

  const zoomPercentage = Math.round(scale * 100);

  const handleZoomOut = () => {
    dispatch(zoomOut());
  };

  const handleZoomIn = () => {
    dispatch(zoomIn());
  };

  const handleResetZoom = () => {
    dispatch(resetView());
  };

  return (
    <TooltipProvider>
      <div className="flex items-center bg-background border rounded-full p-1 shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-2 rounded-full min-w-[60px] font-mono text-sm"
              onClick={handleResetZoom}
            >
              {zoomPercentage}%
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Zoom (100%)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}