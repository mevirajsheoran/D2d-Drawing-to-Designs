"use client";

import { useState, useEffect, useCallback, DragEvent, ChangeEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { MoodBoardImage } from "@/types/style-guide";
import { toast } from "sonner";

interface UseMoodBoardProps {
  projectId: string;
  initialImages: MoodBoardImage[];
}

export function useMoodBoard({ projectId, initialImages }: UseMoodBoardProps) {
  const [images, setImages] = useState<MoodBoardImage[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // Convex mutations
  const generateUploadUrl = useMutation(api.moodboard.generateUploadUrl);
  const addMoodBoardImage = useMutation(api.moodboard.addMoodBoardImage);
  const removeMoodBoardImage = useMutation(api.moodboard.removeMoodBoardImage);

  // Load initial images from server
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      const serverImages: MoodBoardImage[] = initialImages.map((img: any) => ({
        id: img.id || `server-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        storageId: img.storageId,
        url: img.url,
        uploaded: true,
        uploading: false,
        isFromServer: true,
      }));
      setImages(serverImages);
    }
  }, [initialImages]);

  // Upload image to Convex storage
  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const { storageId } = await response.json();

        // Associate with project
        await addMoodBoardImage({
          projectId: projectId as Id<"projects">,
          storageId,
        });

        return storageId;
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },
    [generateUploadUrl, addMoodBoardImage, projectId]
  );

  // Add new image
  const addImage = useCallback(
    async (file: File) => {
      if (images.length >= 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const preview = URL.createObjectURL(file);

      // Add to state with uploading status
      const newImage: MoodBoardImage = {
        id: tempId,
        file,
        preview,
        uploaded: false,
        uploading: true,
        isFromServer: false,
      };

      setImages((prev) => [...prev, newImage]);

      try {
        // Upload to Convex
        const storageId = await uploadImage(file);

        if (storageId) {
          // Update status to uploaded
          setImages((prev) =>
            prev.map((img) =>
              img.id === tempId
                ? { ...img, storageId, uploaded: true, uploading: false }
                : img
            )
          );
          toast.success("Image uploaded");
        }
      } catch (error) {
        // Update status to error
        setImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? { ...img, error: "Upload failed", uploading: false }
              : img
          )
        );
        toast.error("Failed to upload image");
      }
    },
    [images.length, uploadImage]
  );

  // Remove image
  const removeImage = useCallback(
    async (imageId: string) => {
      const imageToRemove = images.find((img) => img.id === imageId);

      if (!imageToRemove) return;

      // Optimistically remove from UI
      setImages((prev) => prev.filter((img) => img.id !== imageId));

      // Clean up blob URL
      if (imageToRemove.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      // If it's a server image, delete from database
      if (imageToRemove.storageId) {
        try {
          await removeMoodBoardImage({
            projectId: projectId as Id<"projects">,
            storageId: imageToRemove.storageId,
          });
          toast.success("Image removed");
        } catch (error) {
          // Add back if delete failed
          setImages((prev) => [...prev, imageToRemove]);
          toast.error("Failed to remove image");
        }
      }
    },
    [images, projectId, removeMoodBoardImage]
  );

  // Drag handlers
  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  // Drop handler
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length === 0) {
        toast.error("Please drop image files only");
        return;
      }

      const remainingSlots = 5 - images.length;
      const filesToAdd = files.slice(0, remainingSlots);

      if (files.length > remainingSlots) {
        toast.warning(`Only ${remainingSlots} more image(s) can be added`);
      }

      filesToAdd.forEach((file) => {
        addImage(file);
      });
    },
    [images.length, addImage]
  );

  // File input handler
  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remainingSlots = 5 - images.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);

      if (files.length > remainingSlots) {
        toast.warning(`Only ${remainingSlots} more image(s) can be added`);
      }

      filesToAdd.forEach((file) => {
        addImage(file);
      });

      // Reset input
      e.target.value = "";
    },
    [images.length, addImage]
  );

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  return {
    images,
    isDragActive,
    handleDrag,
    handleDrop,
    handleFileInput,
    addImage,
    removeImage,
  };
}