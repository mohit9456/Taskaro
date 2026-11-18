import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  inviteOrgMemberService,
  removeOrgMemberService,
  updateMemberRoleService,
} from "@/server/services/team.service";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId || !body.email) {
      return NextResponse.json(
        { error: "Organization ID and member email are required." },
        { status: 400 }
      );
    }

    const result = await inviteOrgMemberService(user._id.toString(), body.orgId, {
      email: body.email,
      departmentId: body.departmentId,
      role: body.role,
      jobTitle: body.jobTitle,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to invite member" },
      { status: error.status || 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId || !body.memberId) {
      return NextResponse.json(
        { error: "orgId and memberId are required." },
        { status: 400 }
      );
    }

    const result = await updateMemberRoleService(
      user._id.toString(),
      body.orgId,
      body.memberId,
      {
        role: body.role,
        departmentId: body.departmentId,
        jobTitle: body.jobTitle,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update member role." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const memberId = searchParams.get("memberId");

    if (!orgId || !memberId) {
      return NextResponse.json(
        { error: "orgId and memberId are required." },
        { status: 400 }
      );
    }

    const result = await removeOrgMemberService(
      user._id.toString(),
      orgId,
      memberId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: error.status || 500 }
    );
  }
}
