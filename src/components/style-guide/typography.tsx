"use client";

import { TypographySection as TypographySectionType } from "@/types/style-guide";
import { Button } from "@/components/ui/button";
import { Sparkles, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TypographySectionProps {
  typographyGuide: TypographySectionType[];
}

export function TypographySection({ typographyGuide }: TypographySectionProps) {
  // Empty state
  if (!typographyGuide || typographyGuide.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Typography Generated Yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Add inspiration images to your mood board, then generate a style guide
          to see AI-recommended typography for your project.
        </p>
        <Button disabled>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI (Coming Soon)
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {typographyGuide.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {section.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{section.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Styles */}
          <div className="space-y-4">
            {section.styles.map((style, styleIndex) => (
              <div
                key={styleIndex}
                className="p-4 rounded-lg border bg-card space-y-3"
              >
                {/* Style Info */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-medium">{style.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span>{style.fontFamily}</span>
                    <span className="text-border">•</span>
                    <span>{style.fontSize}</span>
                    <span className="text-border">•</span>
                    <span>{style.fontWeight}</span>
                  </div>
                </div>

                {/* Preview */}
                <p
                  className="text-foreground border-t pt-3"
                  style={{
                    fontFamily: style.fontFamily,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight as any,
                    lineHeight: style.lineHeight,
                    letterSpacing: style.letterSpacing,
                  }}
                >
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}