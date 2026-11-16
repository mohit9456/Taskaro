import { validateUserEmail } from "@/server/services/user.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const result = await validateUserEmail(email);
    return Response.json(result, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to validate email" },
      { status: error.status || 500 }
    );
  }
}
