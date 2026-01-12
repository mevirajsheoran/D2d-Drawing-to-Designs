"use client";

import { useRef, DragEvent, ChangeEvent } from "react";
import { useMoodBoard } from "@/hooks/use-mood-board";
import { MoodBoardImage } from "@/types/style-guide";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, ImagePlus } from "lucide-react";
import { ImageCard } from "./image-card";

// Generate random transform for scattered effect
function getRandomTransform(seed: string) {
  const hash = seed.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const random1 = Math.abs(Math.sin(hash));
  const random2 = Math.abs(Math.sin(hash * 2));
  const random3 = Math.abs(Math.sin(hash * 3));

  const rotation = (random1 - 0.5) * 20; // -10 to 10 degrees
  const offsetX = (random2 - 0.5) * 40; // -20 to 20 px
  const offsetY = (random3 - 0.5) * 40; // -20 to 20 px

  return { rotation, offsetX, offsetY };
}

interface MoodBoardSectionProps {
  projectId: string;
  initialImages: MoodBoardImage[];
}

export function MoodBoardSection({
  projectId,
  initialImages,
}: MoodBoardSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    images,
    isDragActive,
    handleDrag,
    handleDrop,
    handleFileInput,
    removeImage,
  } = useMoodBoard({ projectId, initialImages });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEvent = (e: DragEvent<HTMLDivElement>) => {
    handleDrag(e);
  };

  const handleDropEvent = (e: DragEvent<HTMLDivElement>) => {
    handleDrop(e);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileInput(e);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative min-h-[400px] rounded-lg border-2 border-dashed transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        )}
        onDragEnter={handleDragEvent}
        onDragLeave={handleDragEvent}
        onDragOver={handleDragEvent}
        onDrop={handleDropEvent}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none rounded-lg" />

        {images.length > 0 ? (
          <>
            {/* Mobile View - Stacked */}
            <div className="md:hidden p-4">
              <div className="relative min-h-[300px]">
                {images.map((image, index) => {
                  const { rotation, offsetX, offsetY } = getRandomTransform(image.id);
                  return (
                    <ImageCard
                      key={image.id}
                      image={image}
                      index={index}
                      rotation={rotation}
                      offsetX={offsetX}
                      offsetY={offsetY}
                      onRemove={removeImage}
                    />
                  );
                })}
              </div>
            </div>

            {/* Desktop View - Scattered */}
            <div className="hidden md:block p-8">
              <div className="relative min-h-[400px] w-full max-w-4xl mx-auto">
                {images.map((image, index) => {
                  const { rotation, offsetX, offsetY } = getRandomTransform(image.id);
                  return (
                    <ImageCard
                      key={image.id}
                      image={image}
                      index={index}
                      rotation={rotation}
                      offsetX={offsetX}
                      offsetY={offsetY}
                      onRemove={removeImage}
                    />
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Add Inspiration Images</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Drag and drop up to 5 images, or click to upload. These will be
              used by AI to generate your style guide.
            </p>
            <Button onClick={handleUploadClick} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Actions */}
      {images.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          {images.length < 5 && (
            <Button onClick={handleUploadClick} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Add More ({5 - images.length} remaining)
            </Button>
          )}
          <Button size="sm" disabled>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Style Guide (Coming Soon)
          </Button>
        </div>
      )}

      {/* Info text */}
      <p className="text-center text-xs text-muted-foreground">
        Maximum 5 images • Supported formats: JPG, PNG, GIF, WebP
      </p>
    </div>
  );
}