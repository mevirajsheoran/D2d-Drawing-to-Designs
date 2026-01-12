"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAppSelector } from "@/redux/store";
import Link from "next/link";
import { Hash, LayoutTemplate, CircleHelp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CreateProjectButton } from "@/components/buttons/project";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { combinedSlug } from "@/lib/utils";
import { getInitials } from "@/types/user";

export function Navbar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const projectId = searchParams.get("project");

  // Get user profile from Redux store
  const user = useAppSelector((state) => state.profile.user);
  const userSlug = user ? combinedSlug(user.name) : "";

  // Get project details if on a project page
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  // Check current page
  const isOnCanvas = pathname?.includes("/canvas");
  const isOnStyleGuide = pathname?.includes("/style-guide");
  const showTabs = isOnCanvas || isOnStyleGuide || !!projectId;

  // Define tabs
  const tabs = [
    {
      label: "Canvas",
      href: `/dashboard/${userSlug}/canvas?project=${projectId || ""}`,
      icon: <Hash className="h-4 w-4" />,
      active: isOnCanvas,
    },
    {
      label: "Style Guide",
      href: `/dashboard/${userSlug}/style-guide?project=${projectId || ""}`,
      icon: <LayoutTemplate className="h-4 w-4" />,
      active: isOnStyleGuide,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left section - Logo and project name */}
        <div className="flex items-center gap-4">
          <Link
            href={user ? `/dashboard/${userSlug}` : "/"}
            className="font-bold text-lg flex items-center gap-2"
          >
            <span className="text-primary">D2D</span>
            <span className="text-muted-foreground text-sm font-normal hidden sm:inline">
              Drawing to Design
            </span>
          </Link>

          {/* Show project name when on a project page */}
          {project && (
            <span className="text-muted-foreground hidden md:flex items-center gap-2">
              <span>/</span>
              <span className="font-medium text-foreground">
                {project.name}
              </span>
            </span>
          )}
        </div>

        {/* Center section - Tabs (only show when on project page) */}
        {showTabs && (
          <div className="flex items-center gap-1">
            <div className="flex items-center rounded-lg bg-muted p-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm
                    transition-colors
                    ${
                      tab.active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <span className="hidden sm:inline">{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Right section - Credits, Help, Theme, Avatar, Create */}
        <div className="flex items-center gap-3">
          {/* Credits display */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
              <Coins className="h-4 w-4" />
              <span>10 credits</span>
            </div>
          )}

          {/* Help button */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <CircleHelp className="h-5 w-5" />
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User avatar or Sign in */}
          {user ? (
            <>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>

              {/* Create project button */}
              <CreateProjectButton />
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}