import { verifyOtp } from "@/server/services/user.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { otp } = await req.json();
    if (!otp) {
      return Response.json({ error: "OTP is required" }, { status: 400 });
    }

    const result = await verifyOtp(email, otp);
    return Response.json(result, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to verify OTP" },
      { status: error.status || 500 }
    );
  }
}
