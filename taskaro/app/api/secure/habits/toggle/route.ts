import { toggleHabitDayService } from "@/server/services/habit.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId, date } = await req.json();
    const result = await toggleHabitDayService({ email, habitId, date });

    return Response.json(result);
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to toggle habit" },
      { status: err.status || 500 }
    );
  }
}
