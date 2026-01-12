"use client";

import { ColorSection, ColorSwatch } from "@/types/style-guide";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ColorSwatchCardProps {
  swatch: ColorSwatch;
}

function ColorSwatchCard({ swatch }: ColorSwatchCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(swatch.hexColor);
    setCopied(true);
    toast.success(`Copied ${swatch.hexColor}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group space-y-2">
      <div
        className="aspect-square rounded-lg border shadow-sm cursor-pointer relative overflow-hidden transition-transform hover:scale-105"
        style={{ backgroundColor: swatch.hexColor }}
        onClick={handleCopy}
      >
        {/* Copy overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <Copy className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium truncate">{swatch.name}</p>
        <p className="text-xs text-muted-foreground uppercase font-mono">
          {swatch.hexColor}
        </p>
        {swatch.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {swatch.description}
          </p>
        )}
      </div>
    </div>
  );
}

interface ColorCategoryProps {
  title: string;
  swatches: ColorSwatch[];
  className?: string;
}

function ColorCategory({ title, swatches, className }: ColorCategoryProps) {
  if (!swatches || swatches.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {swatches.map((swatch, index) => (
          <ColorSwatchCard key={`${swatch.name}-${index}`} swatch={swatch} />
        ))}
      </div>
    </div>
  );
}

interface ColorsSectionProps {
  colorGuide: ColorSection | null;
}

export function ColorsSection({ colorGuide }: ColorsSectionProps) {
  // Empty state
  if (!colorGuide) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Colors Generated Yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Add inspiration images to your mood board, then generate a style guide
          to see AI-recommended colors for your project.
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
      <ColorCategory title="Primary Colors" swatches={colorGuide.primary} />
      <ColorCategory title="Secondary Colors" swatches={colorGuide.secondary} />
      <ColorCategory title="Accent Colors" swatches={colorGuide.accent} />
      <ColorCategory title="Neutral Colors" swatches={colorGuide.neutral} />
      <ColorCategory title="Semantic Colors" swatches={colorGuide.semantic} />
    </div>
  );
}