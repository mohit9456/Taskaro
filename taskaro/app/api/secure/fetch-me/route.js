import { getUserById } from "@/server/services/user.service";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth(); // ✅ v5 way
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  return Response.json(user);
}
