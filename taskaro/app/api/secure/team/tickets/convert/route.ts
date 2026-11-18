import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import { convertTicketToTaskService } from "@/server/services/ticket.service";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.ticketId) {
      return NextResponse.json(
        { error: "ticketId is required." },
        { status: 400 }
      );
    }

    const result = await convertTicketToTaskService(
      user._id.toString(),
      body.ticketId,
      {
        assignedTo: body.assignedTo,
        dueDate: body.dueDate,
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to convert ticket to task." },
      { status: error.status || 500 }
    );
  }
}
