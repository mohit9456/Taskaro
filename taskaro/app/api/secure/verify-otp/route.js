import { verifyOtp } from "@/server/services/user.service";

export async function POST(req) {
  try {
    const email = req.headers.get("x-user-email");

    if (!email) {
      return Response.json({ error: "Unauthorized user or something went wrong" }, { status: 401 });
    }
    const {otp} = await req.json();
    const result = await verifyOtp(email, otp);

    return new Response(
      JSON.stringify(result),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      { status: error.status || 500 }
    );
  }
}
