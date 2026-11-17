import { createSubscription } from "@/server/services/subscription.service";

export async function POST(req: Request) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { planName = "pro", interval = "monthly" } = body;

    const result = await createSubscription({
      email,
      planName,
      interval,
    });

    return Response.json(result, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to create subscription order" },
      { status: error.status || 500 }
    );
  }
}
