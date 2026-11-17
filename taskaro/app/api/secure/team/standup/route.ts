import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  submitDailyPulseService,
  getDepartmentDailyPulseService,
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

    if (!body.orgId || !body.departmentId) {
      return NextResponse.json(
        { error: "orgId and departmentId are required." },
        { status: 400 }
      );
    }

    const result = await submitDailyPulseService(user._id.toString(), {
      orgId: body.orgId,
      departmentId: body.departmentId,
      focusTasks: body.focusTasks || [],
      blockers: body.blockers,
      hasBlocker: body.hasBlocker,
      estimatedHours: body.estimatedHours,
      energyScore: body.energyScore,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit daily pulse" },
      { status: error.status || 500 }
    );
  }
}
