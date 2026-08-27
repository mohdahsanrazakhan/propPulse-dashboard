import { withApiHandler, errorResponse } from "@/lib/api-utils";
import { runSeed } from "@/seed/seed";

// Re-seeds the demo database. Used by the "Reset Demo Data" button in Settings.
// Requires an authenticated session (any role); this is a demo-data reset,
// not a destructive action against real production data.
export async function POST() {
  return withApiHandler(async (session) => {
    if (session.user.role !== "owner") {
      return errorResponse("Only the agency owner can reset demo data.", 403);
    }
    const result = await runSeed();
    return { success: true, ...result };
  });
}
