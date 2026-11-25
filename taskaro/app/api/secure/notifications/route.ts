import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  getNotificationService,
  updateNotifcationService,
} from "@/server/services/notification.service";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const result = await getNotificationService(user._id.toString());

    return NextResponse.json(
      {
        success: true,
        notification: result.notifications,
        unreadCount: result.unreadCount,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch notifications" },
      { status: err.status || 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json().catch(() => ({}));
    const result = await updateNotifcationService(
      user._id.toString(),
      body.notificationId
    );

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update notification" },
      { status: err.status || 500 }
    );
  }
}
