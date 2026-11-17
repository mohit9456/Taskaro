import { subscriptionPlanService } from "@/server/services/subscription.service";

export async function GET(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const result = await subscriptionPlanService(email);
    return Response.json(result, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to fetch subscription status" },
      { status: error.status || 500 }
    );
  }
}
