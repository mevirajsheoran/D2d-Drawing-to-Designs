import { createRouteMatcher, convexAuthNextjsMiddleware, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
import { isBypassRoutes,isPublicRoutes,isProtectedRoutes } from "./lib/permission";

const publicRouteMatcher = createRouteMatcher(isPublicRoutes);
const bypassRouteMatcher = createRouteMatcher(isBypassRoutes);
const protectedRouteMatcher = createRouteMatcher(isProtectedRoutes);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // 1. Skip auth logic completely for bypass routes
    if (bypassRouteMatcher(request)) {
      return;
    }

    // 2. Check authentication status once
    const isAuthenticated = await convexAuth.isAuthenticated();

    // 3. If user is authenticated and tries to access public pages
    //    redirect them to dashboard
    if (publicRouteMatcher(request) && isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }

    // 4. If user is NOT authenticated and tries to access protected pages
    //    redirect them to sign-in
    if (protectedRouteMatcher(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/auth/sign-in");
    }

    // 5. Otherwise, allow the request
    return;
  },
  {
    cookieConfig: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  }
);

 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};