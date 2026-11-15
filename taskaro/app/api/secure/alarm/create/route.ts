import { createAlarmService } from "@/server/services/alarm.service";

export async function POST(req) {
  try {
    const email = req.headers.get("x-user-email");

    if (!email) {
      return Response.json({ error: "Unauthorized user" }, { status: 401 });
    }

    const body = await req.json();

    const alarm = await createAlarmService({
      email,
      ...body,
    });

    return new Response(JSON.stringify({ success: true, alarm }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message || "Something went wrong",
      }),
      { status: err.status || 500 },
    );
  }
}
