import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/utils/getAuthUser";
import {
  createOrganizationService,
  getUserOrganizationsService,
} from "@/server/services/team.service";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const result = await getUserOrganizationsService(user._id.toString());
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch organizations" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Organization name is required." },
        { status: 400 }
      );
    }

    const result = await createOrganizationService(user._id.toString(), {
      name: body.name,
      description: body.description,
      website: body.website,
      logo: body.logo,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create organization" },
      { status: error.status || 500 }
    );
  }
}
