import { verifyPaymentService } from "@/server/services/subscription.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { error: "Missing required Razorpay verification parameters" },
        { status: 400 }
      );
    }

    const result = await verifyPaymentService({
      email,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return Response.json(result, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Payment verification failed" },
      { status: error.status || 500 }
    );
  }
}
