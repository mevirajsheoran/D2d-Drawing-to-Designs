export const isBypassRoutes = [
  "/api/polar/webhook",
  "/api/inngest(.*)",
  "/api/auth(.*)",
  "/convex(.*)",
];

export const isPublicRoutes = ['/auth(.*)', '/'];

export const isProtectedRoutes = ['/dashboard(.*)'];