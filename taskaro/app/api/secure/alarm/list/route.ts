import { listAlarmService } from "@/server/services/alarm.service";

export async function GET(req) {
  try {
    const email = req.headers.get("x-user-email");

    const alarms = await listAlarmService({ email });

    return Response.json({ alarms });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: err.status || 500 }
    );
  }
}