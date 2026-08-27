import { withApiHandler } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import { getQuickAlerts } from "@/lib/alerts";

// Powers the header notification bell; same underlying signals as the
// dashboard's Quick Alerts panel, kept lightweight since this loads on
// every page (only the fields getQuickAlerts actually needs are queried).
export async function GET() {
  return withApiHandler(async () => {
    await connectDB();
    const alerts = await getQuickAlerts();
    return { alerts };
  });
}
