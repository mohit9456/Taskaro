import { deleteHabitService } from "@/server/services/habit.service";

async function handleDelete(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId } = await req.json();
    const result = await deleteHabitService({ email, habitId });

    return Response.json(result);
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to delete habit" },
      { status: err.status || 500 }
    );
  }
}

export const POST = handleDelete;
export const DELETE = handleDelete;
