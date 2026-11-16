import { getTaskStatsService } from "@/server/services/task.service";

export async function GET(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized user" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || undefined;

    const data = await getTaskStatsService(email, filter);

    return Response.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: err.status || 500 }
    );
  }
}
