import { listHabitsService } from "@/server/services/habit.service";

export async function GET(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await listHabitsService({ email });
    return Response.json({ success: true, ...result });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to fetch habits" },
      { status: err.status || 500 }
    );
  }
}
