import { createHabitService } from "@/server/services/habit.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const habit = await createHabitService({ email, ...body });

    return Response.json({ success: true, habit }, { status: 201 });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to create habit" },
      { status: err.status || 500 }
    );
  }
}
