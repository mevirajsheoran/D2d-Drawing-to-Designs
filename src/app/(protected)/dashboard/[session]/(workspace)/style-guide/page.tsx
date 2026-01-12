"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Images, Loader2 } from "lucide-react";
import { ColorsSection } from "@/components/style-guide/colors";
import { TypographySection } from "@/components/style-guide/typography";
import { MoodBoardSection } from "@/components/style-guide/mood-board";
import { StyleGuide, MoodBoardImage } from "@/types/style-guide";

export default function StyleGuidePage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const [activeTab, setActiveTab] = useState("colors");

  // Fetch project for style guide data
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  // Fetch mood board images
  const moodBoardImagesRaw = useQuery(
    api.moodboard.getMoodBoardImages,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  // Transform mood board images to match the type
  const moodBoardImages: MoodBoardImage[] = (moodBoardImagesRaw || []).map((img) => ({
    id: img.id,
    storageId: img.storageId,
    url: img.url || undefined,  // Convert null to undefined
    uploaded: img.uploaded,
    uploading: img.uploading,
    isFromServer: img.isFromServer,
  }));

  // No project selected
  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No project selected</p>
        <p className="text-sm text-muted-foreground">
          Select a project from the dashboard
        </p>
      </div>
    );
  }

  // Loading
  if (project === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Parse style guide if exists
  let styleGuide: StyleGuide | null = null;
  if (project?.styleGuide) {
    try {
      styleGuide = typeof project.styleGuide === "string"
        ? JSON.parse(project.styleGuide)
        : project.styleGuide;
    } catch {
      styleGuide = null;
    }
  }

  const tabs = [
    { label: "Colors", value: "colors", icon: Palette },
    { label: "Typography", value: "typography", icon: Type },
    { label: "Mood Board", value: "moodboard", icon: Images },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tab List */}
      <div className="flex justify-center mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Colors Tab */}
      <TabsContent value="colors" className="space-y-6">
        <ColorsSection colorGuide={styleGuide?.colors || null} />
      </TabsContent>

      {/* Typography Tab */}
      <TabsContent value="typography" className="space-y-6">
        <TypographySection typographyGuide={styleGuide?.typography || []} />
      </TabsContent>

      {/* Mood Board Tab */}
      <TabsContent value="moodboard" className="space-y-6">
        <MoodBoardSection
          projectId={projectId}
          initialImages={moodBoardImages}
        />
      </TabsContent>
    </Tabs>
  );
}