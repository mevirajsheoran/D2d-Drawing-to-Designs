import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},

  handler: async (ctx) => {
    // 1. Get the authenticated user's ID from the request
    const userId = await getAuthUserId(ctx);

    // 2. If no user is logged in, return null
    if (!userId) {
      return null;
    }

    // 3. Fetch and return the user document from the database
    return await ctx.db.get(userId);
  },
});
