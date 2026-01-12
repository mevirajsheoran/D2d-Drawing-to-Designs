"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { fetchProjectsSuccess } from "@/redux/slice/projects";

interface ProjectsProviderProps {
  children: React.ReactNode;
  initialProjects: any;
}

export function ProjectsProvider({
  children,
  initialProjects,
}: ProjectsProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (initialProjects?._valueJSON) {
      const projectData = initialProjects._valueJSON;
      dispatch(
        fetchProjectsSuccess({
          projects: projectData.projects || [],
          total: projectData.total || 0,
        })
      );
    }
  }, [initialProjects, dispatch]);

  return <>{children}</>;
}