import { getNotificationService } from "@/server/services/notification.service";

export async function GET(req) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized user" }, { status: 401 });
    }

    const notification = await getNotificationService(email);

    return new Response(JSON.stringify({ success: true, notification }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: err.status || 500 },
    );
  }
}
