import User from "../models/User";
import { connectToDatabase } from "../db/mongodb";

export async function getAuthUser(req: Request) {
  await connectToDatabase();

  const userId = req.headers.get("x-user-id");
  const email = req.headers.get("x-user-email");

  if (!email && !userId) {
    throw { status: 401, message: "Unauthorized access: Please sign in." };
  }

  let user: any = null;
  if (userId) {
    user = await (User as any).findById(userId).select("_id name email role isPro plan").lean();
  }

  if (!user && email) {
    user = await (User as any).findOne({ email: email.toLowerCase() }).select("_id name email role isPro plan").lean();
  }

  if (!user) {
    throw { status: 401, message: "User account not found." };
  }

  return user;
}
