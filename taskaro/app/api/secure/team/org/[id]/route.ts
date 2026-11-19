import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  getOrganizationDetailsService,
  deleteOrganizationService,
} from "@/server/services/team.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;

    const result = await getOrganizationDetailsService(user._id.toString(), id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch organization details" },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;

    const result = await deleteOrganizationService(user._id.toString(), id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete organization" },
      { status: error.status || 500 }
    );
  }
}
