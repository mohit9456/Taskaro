import { createSubscription } from "@/server/services/subscription.service";

export async function POST(request) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      return Response.json(
        { error: "Unauthorized user or something went wrong" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = await createSubscription({
      email,
      ...body,
    });
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    // console.error("Subscription check error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Something went wrong",
      }),
      { status: error.status || 500 }
    );
  }
}
