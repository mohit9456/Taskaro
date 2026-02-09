// app/api/user/update/route.js
import { updateUserProfile } from "@/server/services/user.service";

export async function POST(req) {
  try {
    const email = req.headers.get("x-user-email");

    if (!email) {
      return Response.json({ error: "Unauthorized user" }, { status: 401 });
    }

    const formData = await req.formData();

    const updatedUser = await updateUserProfile(email, formData);

    return new Response(
      JSON.stringify({ message: "Profile updated", user: updatedUser }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      { status: error.status || 500 }
    );
  }
}
