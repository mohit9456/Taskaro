import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  sendTeamMessageService,
  getTeamMessagesService,
} from "@/server/services/chat.service";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const channelType = searchParams.get("channelType") as
      | "department"
      | "direct"
      | "ticket";

    if (!orgId || !channelType) {
      return NextResponse.json(
        { error: "orgId and channelType are required." },
        { status: 400 }
      );
    }

    const result = await getTeamMessagesService(user._id.toString(), {
      orgId,
      channelType,
      departmentId: searchParams.get("departmentId") || undefined,
      ticketId: searchParams.get("ticketId") || undefined,
      recipientId: searchParams.get("recipientId") || undefined,
      limit: Number(searchParams.get("limit")) || 50,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId || !body.channelType || !body.content) {
      return NextResponse.json(
        { error: "orgId, channelType, and content are required." },
        { status: 400 }
      );
    }

    const result = await sendTeamMessageService(user._id.toString(), {
      orgId: body.orgId,
      channelType: body.channelType,
      departmentId: body.departmentId,
      ticketId: body.ticketId,
      recipientId: body.recipientId,
      content: body.content,
      attachments: body.attachments,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: error.status || 500 }
    );
  }
}
