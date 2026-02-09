import jwt from "jsonwebtoken";
import { sendMailService } from "../utils/mailer";
import { verifyResetToken } from "../utils/token";
import { hashPassword } from "../utils/password";
import { validateRegisterInput } from "../utils/validation";
import User from "../models/User";
import { connectToDatabase } from "../db/mongodb";
import bcrypt from "bcryptjs";
import { resetPasswordText } from "../utils/resetPasswordText";

export async function forgotPasswordService(email) {
  if (!email) {
    throw { status: 400, message: "Please provide an email" };
  }

  await connectToDatabase();

  const user = await User.findOne({ email });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  if (user.authProvider === "google") {
    throw {
      status: 400,
      message: "Password cannot be changed for Google sign-in accounts",
    };
  }

  const token = jwt.sign({ userId: user._id }, process.env.AUTH_SECRET, {
    expiresIn: "1h",
  });
  const resetURL = `${process.env.BASE_URL}/auth/reset-password?token=${token}`;

  await sendMailService({
    to: email,
    subject: "Password Reset Request for Your Task Management Account",
    text: resetPasswordText({ name: user?.name, resetURL }),
  });

  return { message: "Password reset link sent" };
}

export async function resetPasswordService(token, password, cPassword) {
  if (!token) {
    throw {
      status: 400,
      message:
        "The reset link is invalid or has expired. Please request a new password reset link",
    };
  }

  const decoded = verifyResetToken(token);
  if (!decoded || !decoded.userId) {
    throw {
      status: 400,
      message:
        "This URL is invalid or has expired. Please request a new password reset link",
    };
  }

  if (!password || !cPassword) {
    throw { status: 400, message: "All fields are required" };
  }

  if (password !== cPassword) {
    throw { status: 400, message: "Passwords do not match" };
  }

  await connectToDatabase();

  const user = await User.findById(decoded.userId);

  if (!user || user.authProvider === "google") {
    throw { status: 400, message: "User not found" };
  }

  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;
  await user.save();

  return { message: "Password updated successfully" };
}

export async function registerUserService(data) {
  const { name, email, phone, password } = data;

  // Step 1: Validate input
  validateRegisterInput(data);

  await connectToDatabase();

  // Step 2: Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw { status: 400, message: "Email already exists" };
  }

  // Step 3: Hash password
  const hashedPassword = await hashPassword(password);

  // Step 4: Create user
  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    authProvider: "credentials",
    role: "user",
  });

  return {
    message: "User registered successfully. Please log in.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function validateCredentials(email, password) {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user || user.authProvider !== "credentials") {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function findOrCreateGoogleUser(user) {
  await connectToDatabase();

  let exisitingUser = await User.findOne({ email: user?.email });

  if (exisitingUser && exisitingUser.authProvider === "credentials") {
    throw new Error("Use email/password login");
  }

  if (!exisitingUser) {
    exisitingUser = await User.create({
      name: user?.name,
      email: user?.email,
      profileImage: user?.image,
      authProvider: "google",
      role: "user",
      isEmailVerified: true,
    });
  }

  return exisitingUser;
}

export async function updatePasswordService(email, password, cPassword) {
  if (!password || !cPassword) {
    throw { status: 400, message: "All fields are required" };
  }

  if (password !== cPassword) {
    throw { status: 400, message: "Passwords do not match" };
  }

  await connectToDatabase();
  const user = await User.findOne({email});

  if (!user) {
    throw {
      status: 404,
      message: "User not found",
    };
  }

  // 🔐 Google login restriction (important)
  if (user.authProvider === "google") {
    throw {
      status: 400,
      message: "Password change is not available for Google sign-in accounts",
    };
  }

  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;
  await user.save();

  return { message: "Password updated successfully" };
}
