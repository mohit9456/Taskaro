import { connectToDatabase } from "../db/mongodb";
import User from "../models/User";
import { uploadProfileImage } from "../utils/fileUpload";
import generateOTP from "../utils/generateOtp";
import { sendMailService } from "../utils/mailer";
import { passwordChangeOTPText } from "../utils/passwordChangeOTPText";

export async function getUserById(userId) {
  await connectToDatabase();

  const user = await User.findById(userId).select("-password");
  return user;
}

export async function updateUserProfile(email, formData) {
  const name = formData.get("name");
  const about = formData.get("about");
  const file = formData.get("profileImage");

  await connectToDatabase();

  let imageUrl;
  if (file && file.name) {
    imageUrl = await uploadProfileImage(file);
  }

  const updatedUser = await User.findOneAndUpdate(
    { email },
    {
      name,
      about,
      ...(imageUrl && { profileImage: imageUrl }),
    },
    { new: true }
  );

  if (!updatedUser) {
    throw {
      status: 400,
      message: "User not found",
    };
  }

  return updatedUser;
}

export async function validateUserEmail(email) {
  await connectToDatabase();

  const user = await User.findOne({ email });

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

  const otp = generateOTP();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // ⏱ 10 minutes


  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpiry = expiry;
  await user.save();


  // 📧 Send OTP Mail
  await sendMailService({
    to: email,
    subject: "Verify Your Identity to Change Password – Taskaro",
    text: passwordChangeOTPText({
      name: user.name,
      otp,
    }),
  });

  return {
    message: "OTP sent to your registered email address",
  };
}

export async function verifyOtp(email, otp) {
  await connectToDatabase();

  const user = await User.findOne({ email });

  if (!user) {
    throw {
      status: 404,
      message: "User not found",
    };
  }

  // 🔐 Google login restriction
  if (user.authProvider === "google") {
    throw {
      status: 400,
      message:
        "Password change is not available for Google sign-in accounts",
    };
  }

  // ❌ OTP validation
  if (
    user.resetPasswordOTP !== otp ||
    !user.resetPasswordOTPExpiry ||
    Date.now() > user.resetPasswordOTPExpiry
  ) {
    throw {
      status: 400,
      message: "Invalid or expired OTP. Please request a new one.",
    };
  }

  // ✅ OTP verified → CLEANUP (important)
  user.resetPasswordOTP = null;
  user.resetPasswordOTPExpiry = null;

  await user.save();

  return {
    message: "OTP verified successfully. You can now change your password.",
  };
}
