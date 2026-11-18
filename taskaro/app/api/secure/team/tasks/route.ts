import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  createDepartmentTaskService,
  getDepartmentTasksService,
  updateDepartmentTaskStatusService,
} from "@/server/services/team.service";

// GET /api/secure/team/tasks?orgId=...&departmentId=...
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const departmentId = searchParams.get("departmentId") || undefined;

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required." },
        { status: 400 }
      );
    }

    const result = await getDepartmentTasksService(
      user._id.toString(),
      orgId,
      departmentId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch department tasks" },
      { status: error.status || 500 }
    );
  }
}

// POST /api/secure/team/tasks (Delegate task to department member)
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId || !body.departmentId || !body.title || !body.assignedTo) {
      return NextResponse.json(
        { error: "orgId, departmentId, title, and assignedTo are required." },
        { status: 400 }
      );
    }

    const result = await createDepartmentTaskService(user._id.toString(), {
      orgId: body.orgId,
      departmentId: body.departmentId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      dueDate: body.dueDate,
      estimatedHours: body.estimatedHours,
      assignedTo: body.assignedTo,
      dependencyTaskId: body.dependencyTaskId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create department task" },
      { status: error.status || 500 }
    );
  }
}

// PATCH /api/secure/team/tasks (Update task status & unlock dependencies)
export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.taskId || !body.status) {
      return NextResponse.json(
        { error: "taskId and status are required." },
        { status: 400 }
      );
    }

    const result = await updateDepartmentTaskStatusService(
      user._id.toString(),
      body.taskId,
      body.status
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update department task" },
      { status: error.status || 500 }
    );
  }
}
