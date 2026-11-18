import { NextResponse } from "next/server";
import {
  verifyInviteTokenService,
  acceptInviteService,
} from "@/server/services/team.service";
import { auth } from "@/lib/auth";

// GET /api/team/invite?token=... (Public: inspect invitation details)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const result = await verifyInviteTokenService(token);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid invitation token." },
      { status: error.status || 500 }
    );
  }
}

// POST /api/team/invite (Authenticated: Accept invitation)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Please log in to accept this invitation." },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const result = await acceptInviteService(userId, body.token);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to accept invitation." },
      { status: error.status || 500 }
    );
  }
}
