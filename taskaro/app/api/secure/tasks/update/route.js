import { updateTaskService } from "@/server/services/task.service";

export async function POST(req) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const task = await updateTaskService({
      email,
      ...body,
    });

    return new Response(
      JSON.stringify({ success: true, task, message: "Task updated Successfully !" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: err.status || 500 }
    );
  }
}
