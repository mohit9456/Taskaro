import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  submitDailyPulseService,
  getDepartmentDailyPulseService,
  broadcastStandupDigestService,
  nudgeMemberStandupService,
} from "@/server/services/standup.service";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const departmentId = searchParams.get("departmentId");
    const date = searchParams.get("date") || undefined;

    if (!orgId || !departmentId) {
      return NextResponse.json(
        { error: "orgId and departmentId are required." },
        { status: 400 }
      );
    }

    const result = await getDepartmentDailyPulseService(
      user._id.toString(),
      orgId,
      departmentId,
      date
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch daily standup pulse" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId) {
      return NextResponse.json(
        { error: "orgId is required." },
        { status: 400 }
      );
    }

    // 1-Click Action: Broadcast Daily Digest to Team Chat
    if (body.action === "broadcast") {
      if (!body.departmentId) {
        return NextResponse.json(
          { error: "departmentId is required for broadcast." },
          { status: 400 }
        );
      }
      const broadcastResult = await broadcastStandupDigestService(
        user._id.toString(),
        body.orgId,
        body.departmentId,
        body.date
      );
      return NextResponse.json(broadcastResult, { status: 200 });
    }

    // 1-Click Action: Nudge Missing Member in Chat
    if (body.action === "nudge") {
      if (!body.targetUserId) {
        return NextResponse.json(
          { error: "targetUserId is required for nudge." },
          { status: 400 }
        );
      }
      const nudgeResult = await nudgeMemberStandupService(
        user._id.toString(),
        body.targetUserId,
        body.orgId
      );
      return NextResponse.json(nudgeResult, { status: 200 });
    }

    // Standard Daily Pulse Submission
    if (!body.departmentId) {
      return NextResponse.json(
        { error: "departmentId is required." },
        { status: 400 }
      );
    }

    const result = await submitDailyPulseService(user._id.toString(), {
      orgId: body.orgId,
      departmentId: body.departmentId,
      yesterdayTasks: body.yesterdayTasks || [],
      focusTasks: body.focusTasks || [],
      blockers: body.blockers,
      hasBlocker: body.hasBlocker,
      blockedByDepartmentId: body.blockedByDepartmentId || null,
      estimatedHours: body.estimatedHours,
      energyScore: body.energyScore,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process standup action" },
      { status: error.status || 500 }
    );
  }
}
