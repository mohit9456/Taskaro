import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  createDepartmentService,
  updateDepartmentLeadService,
} from "@/server/services/team.service";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId || !body.name) {
      return NextResponse.json(
        { error: "Organization ID and department name are required." },
        { status: 400 }
      );
    }

    const result = await createDepartmentService(user._id.toString(), body.orgId, {
      name: body.name,
      code: body.code,
      description: body.description,
      color: body.color,
      icon: body.icon,
      leadId: body.leadId,
      defaultSlaHours: body.defaultSlaHours,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create department" },
      { status: error.status || 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId || !body.departmentId || !body.leadUserId) {
      return NextResponse.json(
        { error: "orgId, departmentId, and leadUserId are required." },
        { status: 400 }
      );
    }

    const result = await updateDepartmentLeadService(
      user._id.toString(),
      body.orgId,
      body.departmentId,
      body.leadUserId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update department lead" },
      { status: error.status || 500 }
    );
  }
}
