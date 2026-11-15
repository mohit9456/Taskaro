import { forgotPasswordService } from "@/server/services/auth.service";

export async function POST(req) {
  try {
    const { email } = await req.json();

    const result = await forgotPasswordService(email);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      { status: error.status || 500 }
    );
  }
}
