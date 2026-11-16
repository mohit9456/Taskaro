import { updateUserProfile } from "@/server/services/user.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let payload: any;

    if (contentType.includes("multipart/form-data")) {
      payload = await req.formData();
    } else {
      payload = await req.json();
    }

    const updatedUser = await updateUserProfile(email, payload);

    return Response.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          about: updatedUser.about,
          phone: updatedUser.phone,
          profileImage: updatedUser.profileImage,
          authProvider: updatedUser.authProvider,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Something went wrong updating profile" },
      { status: error.status || 500 }
    );
  }
}
