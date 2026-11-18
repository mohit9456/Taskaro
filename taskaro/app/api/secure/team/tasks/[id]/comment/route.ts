import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import { addTaskCommentService } from "@/server/services/team.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const body = await req.json();

    if (!body.text || !body.text.trim()) {
      return NextResponse.json(
        { error: "Comment text cannot be empty." },
        { status: 400 }
      );
    }

    const result = await addTaskCommentService(
      user._id.toString(),
      id,
      body.text
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add comment." },
      { status: error.status || 500 }
    );
  }
}
