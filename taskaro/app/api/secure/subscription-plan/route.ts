import { subscriptionPlanService } from "@/server/services/subscription.service";

export async function GET(request) {
  try {
    const email = request.headers.get("x-user-email");
    if (!email) {
      return Response.json(
        { error: "Unauthorized user or something went wrong" },
        { status: 401 }
      );
    }

    const result = await subscriptionPlanService(email);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    // console.error("Subscription check error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Something went wrong",
      }),
      { status: error.status || 500 }
    );
  }
}
