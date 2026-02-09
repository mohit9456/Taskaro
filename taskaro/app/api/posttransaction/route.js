import { connectToDatabase } from "@/server/db/mongodb";
import { verifyAndProcessPayment } from "@/server/services/payment.service";

export async function POST(request) {
  try {
    const body = await request.formData();
    const email = req.headers.get("x-user-email");

    await connectToDatabase();

    const result = await verifyAndProcessPayment({
      razorpay_payment_id: body.get("razorpay_payment_id"),
      razorpay_order_id: body.get("razorpay_order_id"),
      razorpay_signature: body.get("razorpay_signature"),
      upgradeFrom: body.get("upgradeFrom"),
      email,
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Payment Verify API:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Payment verification failed",
      }),
      { status: error.status || 500 }
    );
  }
}
