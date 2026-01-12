import { Navbar } from "@/components/Navbar";

interface SessionLayoutProps {
  children: React.ReactNode;
}

export default function SessionLayout({ children }: SessionLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}