import { ReactNode } from "react";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  // This is a pass-through layout for the workspace route group
  // The actual layout with Navbar is in the parent [session]/layout.tsx
  return <>{children}</>;
}