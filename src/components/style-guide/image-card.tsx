"use client";

import Image from "next/image";
import { MoodBoardImage } from "@/types/style-guide";
import { Button } from "@/components/ui/button";
import { X, Loader2, Check, AlertCircle } from "lucide-react";

interface UploadStatusProps {
  image: MoodBoardImage;
}

function UploadStatus({ image }: UploadStatusProps) {
  if (image.uploading) {
    return (
      <div className="absolute top-2 right-2 p-1 rounded-full bg-background/80">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (image.uploaded && !image.isFromServer) {
    return (
      <div className="absolute top-2 right-2 p-1 rounded-full bg-green-500">
        <Check className="h-3 w-3 text-white" />
      </div>
    );
  }

  if (image.error) {
    return (
      <div className="absolute top-2 right-2 p-1 rounded-full bg-destructive">
        <AlertCircle className="h-3 w-3 text-white" />
      </div>
    );
  }

  return null;
}

interface ImageCardProps {
  image: MoodBoardImage;
  index: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  onRemove: (id: string) => void;
}

export function ImageCard({
  image,
  index,
  rotation,
  offsetX,
  offsetY,
  onRemove,
}: ImageCardProps) {
  const imageUrl = image.preview || image.url;

  if (!imageUrl) return null;

  return (
    <div
      className="absolute group cursor-grab active:cursor-grabbing"
      style={{
        transform: `rotate(${rotation}deg)`,
        left: `${index * 100 + offsetX}px`,
        top: `${index * 30 + offsetY}px`,
        zIndex: index + 1,
      }}
    >
      {/* Polaroid-style frame */}
      <div className="relative w-40 h-48 rounded-sm bg-white shadow-lg border p-2 pb-8 transition-transform hover:scale-105 hover:shadow-xl">
        {/* Image */}
        <div className="relative w-full h-32 rounded-sm overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={`Mood board image ${index + 1}`}
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>

        {/* Upload status indicator */}
        <UploadStatus image={image} />

        {/* Delete button */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Caption area (like a polaroid) */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-xs text-gray-500 truncate">
            Image {index + 1}
          </p>
        </div>
      </div>
    </div>
  );
}