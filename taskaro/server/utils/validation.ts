export const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateRegisterInput({
  name,
  email,
  phone,
  password,
  cPassword,
}: any) {
  if (!name || !email || !password || !cPassword || !phone) {
    throw { status: 400, message: "All fields are required" };
  }

  if (!emailRegex.test(email)) {
    throw {
      status: 400,
      message: "Please provide a valid email address (e.g. name@domain.com)",
    };
  }

  const cleanPhone = String(phone).replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    throw {
      status: 400,
      message: "Phone number should be at least 10 digits",
    };
  }

  if (password.length < 6) {
    throw {
      status: 400,
      message: "Password must be at least 6 characters",
    };
  }

  if (password !== cPassword) {
    throw {
      status: 400,
      message: "Passwords do not match",
    };
  }
}
