import { toggleAlarmService } from "@/server/services/alarm.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { alarmId, isActive } = await req.json();
    const alarm = await toggleAlarmService({ email, alarmId, isActive });

    return Response.json({ success: true, alarm });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to toggle alarm" },
      { status: err.status || 500 }
    );
  }
}
