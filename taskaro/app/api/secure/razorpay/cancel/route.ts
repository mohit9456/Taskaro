import { cancelSubscriptionOrder } from "@/server/services/subscription.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return Response.json({ error: "Order ID is required" }, { status: 400 });
    }

    const result = await cancelSubscriptionOrder({
      email,
      orderId,
      reason,
    });

    return Response.json(result, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to cancel order" },
      { status: error.status || 500 }
    );
  }
}
