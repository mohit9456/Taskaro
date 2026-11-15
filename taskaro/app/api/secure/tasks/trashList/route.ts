import { getAllTrashService } from "@/server/services/task.service";

export async function GET(req) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized user" }, { status: 401 });
    }

    const trashList = await getAllTrashService(email);

    return new Response(
      JSON.stringify({ success: true, trash: trashList }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: err.status || 500 }
    );
  }
}
