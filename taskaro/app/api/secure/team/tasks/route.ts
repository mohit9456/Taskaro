import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  createDepartmentTaskService,
  getDepartmentTasksService,
  updateDepartmentTaskStatusService,
  delegateDepartmentTaskService,
  deleteDepartmentTaskService,
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

// POST /api/secure/team/tasks (Create task or route cross-dept work order)
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId || !body.departmentId || !body.title) {
      return NextResponse.json(
        { error: "orgId, departmentId, and title are required." },
        { status: 400 }
      );
    }

    const result = await createDepartmentTaskService(user._id.toString(), {
      orgId: body.orgId,
      departmentId: body.departmentId,
      sourceDepartmentId: body.sourceDepartmentId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      dueDate: body.dueDate,
      estimatedHours: body.estimatedHours,
      assignedTo: body.assignedTo || null, // null if routing to department intake queue
      dependencyTaskId: body.dependencyTaskId,
      linkedTicketId: body.linkedTicketId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create department task" },
      { status: error.status || 500 }
    );
  }
}

// PATCH /api/secure/team/tasks (Update status / proofs / blockers OR delegate intake task)
export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.taskId) {
      return NextResponse.json(
        { error: "taskId is required." },
        { status: 400 }
      );
    }

    // Action 1: Delegate an intake task to a specific department member
    if (body.action === "delegate" && body.assignedTo) {
      const result = await delegateDepartmentTaskService(
        user._id.toString(),
        body.taskId,
        body.assignedTo
      );
      return NextResponse.json(result, { status: 200 });
    }

    // Action 2: Update status, deliverable proofs, or blocker handshake
    if (!body.status) {
      return NextResponse.json(
        { error: "status is required for status updates." },
        { status: 400 }
      );
    }

    const result = await updateDepartmentTaskStatusService(
      user._id.toString(),
      body.taskId,
      {
        status: body.status,
        proofUrl: body.proofUrl,
        completionNotes: body.completionNotes,
        blockedByDeptId: body.blockedByDeptId,
        blockerReason: body.blockerReason,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update department task" },
      { status: error.status || 500 }
    );
  }
}

// DELETE /api/secure/team/tasks?taskId=...
export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required." },
        { status: 400 }
      );
    }

    const result = await deleteDepartmentTaskService(user._id.toString(), taskId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete department task" },
      { status: error.status || 500 }
    );
  }
}
