import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { ConvexUserRaw, normalizeProfile } from "@/types/user";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Preload current user profile
 */
export const ProfileQuery = async () => {
  return await preloadQuery(
    api.user.getCurrentUser,
    {},
    { token: await convexAuthNextjsToken() }
  );
};

/**
 * Preload subscription entitlement status
 */
export const SubscriptionEntitlementQuery = async () => {
  const rawProfile = await ProfileQuery();

  const profile = normalizeProfile(
    rawProfile._valueJSON as unknown as ConvexUserRaw | null
  );

  if (!profile?.id) {
    return { entitlement: { _valueJSON: false }, profileName: null, profile: null };
  }

  // Note: Using api.subscription (singular) to match the file name
  const entitlement = await preloadQuery(
    api.subscription.hasEntitlement,
    { userId: profile.id as Id<"users"> },
    { token: await convexAuthNextjsToken() }
  );

  return { entitlement, profileName: profile.name, profile };
};

/**
 * Preload user's projects
 */
export const ProjectsQuery = async () => {
  const rawProfile = await ProfileQuery();

  const profile = normalizeProfile(
    rawProfile._valueJSON as unknown as ConvexUserRaw | null
  );

  if (!profile?.id) {
    return { projects: null, profile: null };
  }

  const projects = await preloadQuery(
    api.projects.getUserProjects,
    {
      userId: profile.id as Id<"users">,
      limit: 20,
    },
    { token: await convexAuthNextjsToken() }
  );

  return { projects, profile };
};

/**
 * Get normalized profile (helper for layout)
 */
export const getProfileFromPreload = async () => {
  try {
    const rawProfile = await ProfileQuery();
    return normalizeProfile(
      rawProfile._valueJSON as unknown as ConvexUserRaw | null
    );
  } catch {
    return null;
  }
};