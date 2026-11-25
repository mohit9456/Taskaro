import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import { updateNotifcationService } from "@/server/services/notification.service";

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    const result = await updateNotifcationService(user._id.toString());

    return NextResponse.json(
      { success: true, notification: result },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to mark all as read" },
      { status: err.status || 500 }
    );
  }
}
