import { updateHabitService } from "@/server/services/habit.service";

async function handleUpdate(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId, ...updates } = await req.json();
    const habit = await updateHabitService({ email, habitId, updates });

    return Response.json({ success: true, habit });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to update habit" },
      { status: err.status || 500 }
    );
  }
}

export const POST = handleUpdate;
export const PUT = handleUpdate;
