import { deleteAlarmService } from "@/server/services/alarm.service";

async function handleDelete(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { alarmId } = await req.json();
    const result = await deleteAlarmService({ email, alarmId });

    return Response.json(result);
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to delete alarm" },
      { status: err.status || 500 }
    );
  }
}

export const POST = handleDelete;
export const DELETE = handleDelete;
