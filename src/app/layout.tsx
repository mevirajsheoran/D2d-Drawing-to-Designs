import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/theme/provider";
import { Toaster } from "sonner";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/convex/provider";
import { ReduxProvider } from "@/redux/provider";
import { getProfileFromPreload } from "@/convex/query.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D2D - Drawing to Design",
  description: "AI-powered design generation from your drawings and wireframes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Preload profile for Redux (null if not authenticated)
  let profile = null;
  try {
    profile = await getProfileFromPreload();
  } catch {
    // User not logged in - that's okay
  }

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <ReduxProvider
                preloadedState={{
                  profile: { user: profile, isLoading: false },
                }}
              >
                {children}
              </ReduxProvider>
            </ConvexClientProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}