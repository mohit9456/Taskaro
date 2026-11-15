import bcrypt from "bcryptjs";

export const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

export async function hashPassword(password) {
  if (!passwordRegex.test(password)) {
    throw {
      status: 400,
      message:
        "Password must be 8-16 characters long, alphanumeric, and include at least one special character (!@#$%^&*)",
    };
  }

  return bcrypt.hash(password, 10);
}
