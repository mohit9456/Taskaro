import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  createTicketService,
  listTicketsService,
  updateTicketService,
  checkAndEscalateBreachedTicketsService,
  deleteTicketService,
} from "@/server/services/ticket.service";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required." }, { status: 400 });
    }

    // Auto-escalate any overdue tickets in background for this org
    await checkAndEscalateBreachedTicketsService(orgId).catch(() => {});

    const filters = {
      status: searchParams.get("status") || "all",
      priority: searchParams.get("priority") || "all",
      type: searchParams.get("type") || "all",
      targetDeptId: searchParams.get("targetDeptId") || undefined,
      sourceDeptId: searchParams.get("sourceDeptId") || undefined,
      search: searchParams.get("search") || undefined,
      isEscalated: searchParams.get("isEscalated") === "true" ? true : undefined,
    };

    const result = await listTicketsService(user._id.toString(), orgId, filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch tickets" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.orgId || !body.title || !body.sourceDeptId || !body.targetDeptId) {
      return NextResponse.json(
        { error: "orgId, title, sourceDeptId, and targetDeptId are required." },
        { status: 400 }
      );
    }

    const result = await createTicketService(user._id.toString(), {
      orgId: body.orgId,
      title: body.title,
      description: body.description,
      type: body.type,
      priority: body.priority,
      sourceDeptId: body.sourceDeptId,
      targetDeptId: body.targetDeptId,
      tags: body.tags,
      attachments: body.attachments,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create ticket" },
      { status: error.status || 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.ticketId) {
      return NextResponse.json({ error: "ticketId is required." }, { status: 400 });
    }

    const result = await updateTicketService(user._id.toString(), body.ticketId, {
      status: body.status,
      assignedMemberId: body.assignedMemberId,
      resolutionSummary: body.resolutionSummary,
      priority: body.priority,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update ticket" },
      { status: error.status || 500 }
    );
  }
}

// DELETE /api/secure/team/tickets?ticketId=...
export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required." }, { status: 400 });
    }

    const result = await deleteTicketService(user._id.toString(), ticketId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete ticket" },
      { status: error.status || 500 }
    );
  }
}
