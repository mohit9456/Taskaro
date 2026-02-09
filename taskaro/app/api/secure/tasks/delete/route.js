import { deleteTaskService } from "@/server/services/task.service";

export async function POST(req) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized user" }, { status: 401 });
    }

    const { _id } = await req.json();

    if (!_id) {
      return Response.json({ error: "Task id is required" }, { status: 400 });
    }

    const deletedTask = await deleteTaskService({ email, _id });

    return new Response(
      JSON.stringify({ success: true, task: deletedTask }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: err.status || 500 }
    );
  }
}
