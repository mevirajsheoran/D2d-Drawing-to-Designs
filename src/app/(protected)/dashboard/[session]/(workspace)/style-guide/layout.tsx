"use client";

import { ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Images, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAppSelector } from "@/redux/store";
import { combinedSlug } from "@/lib/utils";

interface StyleGuideLayoutProps {
  children: ReactNode;
}

export default function StyleGuideLayout({ children }: StyleGuideLayoutProps) {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const user = useAppSelector((state) => state.profile.user);
  const userSlug = user ? combinedSlug(user.name) : "";

  const tabs = [
    { label: "Colors", value: "colors", icon: Palette },
    { label: "Typography", value: "typography", icon: Type },
    { label: "Mood Board", value: "moodboard", icon: Images },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4 px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/${userSlug}/canvas?project=${projectId}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Style Guide</h1>
                <p className="text-sm text-muted-foreground">
                  Manage colors, typography, and inspiration
                </p>
              </div>
            </div>

            {/* Right: Tabs - these are visual only, content is client-side */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-6 px-4">
        {children}
      </div>
    </div>
  );
}