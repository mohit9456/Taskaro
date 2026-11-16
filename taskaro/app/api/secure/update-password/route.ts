import { updatePasswordService } from "@/server/services/auth.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { password, cPassword } = await req.json();
    const result = await updatePasswordService(email, password, cPassword);

    return Response.json(result, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to update password" },
      { status: error.status || 500 }
    );
  }
}
