import { registerUserService } from "@/server/services/auth.service";

export async function POST(req) {
  try {
    const body = await req.json();

    const result = await registerUserService(body);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      { status: error.status || 500 }
    );
  }
}
