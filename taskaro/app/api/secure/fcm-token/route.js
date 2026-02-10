import { generateToken } from "@/server/services/notification.service";

export async function POST(req) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized user" }, { status: 401 });
    }
    const {token} = await req.json();

    await generateToken({ email, token });

    return new Response(JSON.stringify({ success: true, message: "token is generated" }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: err.status || 500 },
    );
  }
}
