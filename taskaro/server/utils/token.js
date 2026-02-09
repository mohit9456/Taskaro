import jwt from "jsonwebtoken";

export async function verifyResetToken(token) {
  try {
    return jwt.verify(token, process.env.AUTH_SECRET);
  } catch (error) {
    return null;
  }
}
