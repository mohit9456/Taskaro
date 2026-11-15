import jwt from "jsonwebtoken";

export function verifyResetToken(token: string): any {
  try {
    return jwt.verify(token, process.env.AUTH_SECRET as string);
  } catch (error) {
    return null;
  }
}
