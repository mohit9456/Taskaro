import { snoozeAlarmService } from "@/server/services/alarm.service";

export async function POST(req) {
  try {
    const email = req.headers.get("x-user-email");

    const body = await req.json();

    const alarms = await snoozeAlarmService({ email, ...body });

    return Response.json({ alarms });
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }
}
