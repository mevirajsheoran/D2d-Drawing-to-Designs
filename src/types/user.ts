import { combinedSlug } from "@/lib/utils";

export type ConvexUserRaw = {
  _creationTime: number;
  _id: string;
  email: string;
  emailVerificationTime?: number;
  image?: string;
  name?: string;
};

export type Profile = {
  id: string;
  createdAtMs: number;
  email: string;
  emailVerifiedAtMs?: number;
  image?: string;
  name: string; // Made required (we always generate a name)
};

/**
 * Extract a readable name from email address
 * e.g., "john.doe@gmail.com" -> "John Doe"
 */
const extractNameFromEmail = (email: string): string => {
  const username = email.split("@")[0];
  return username
    .split(/[._-]/)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(" ");
};

/**
 * Normalize raw Convex user data to Profile type
 */
export const normalizeProfile = (
  raw: ConvexUserRaw | null | undefined
): Profile | null => {
  if (!raw) return null;

  // Use provided name or extract from email
  const name = raw.name || extractNameFromEmail(raw.email);

  return {
    id: raw._id,
    createdAtMs: raw._creationTime,
    email: raw.email,
    emailVerifiedAtMs: raw.emailVerificationTime,
    image: raw.image,
    name,
  };
};

/**
 * Get user's display name (first name only)
 */
export const getDisplayName = (profile: Profile | null): string => {
  if (!profile?.name) return "User";
  return profile.name.split(" ")[0];
};

/**
 * Get user's initials for avatar fallback
 */
export const getInitials = (profile: Profile | null): string => {
  if (!profile?.name) return "U";
  const parts = profile.name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return profile.name.charAt(0).toUpperCase();
};