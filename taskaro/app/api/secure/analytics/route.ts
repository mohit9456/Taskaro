import { getAnalyticsService, AnalyticsQueryOptions } from "@/server/services/analytics.service";

export async function GET(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "30d";

    const validRanges: AnalyticsQueryOptions["range"][] = ["7d", "30d", "90d", "year"];
    const range = validRanges.includes(rangeParam as any)
      ? (rangeParam as AnalyticsQueryOptions["range"])
      : "30d";

    const data = await getAnalyticsService({ email, range });

    return Response.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to fetch analytics" },
      { status: err.status || 500 }
    );
  }
}
