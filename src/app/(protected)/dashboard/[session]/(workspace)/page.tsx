import { ProjectsQuery } from "@/convex/query.config";
import { ProjectList } from "@/components/projects/list";
import { ProjectsProvider } from "@/components/projects/provider";
import { getDisplayName } from "@/types/user";

export default async function WorkspacePage() {
  const { projects, profile } = await ProjectsQuery();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  return (
    <ProjectsProvider initialProjects={projects}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {getDisplayName(profile)}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here are your recent projects
          </p>
        </div>
        <ProjectList />
      </div>
    </ProjectsProvider>
  );
}