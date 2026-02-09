export const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

export function validateRegisterInput({
  name,
  email,
  phone,
  password,
  cPassword,
}) {
  if (!name || !email || !password || !cPassword || !phone) {
    throw { status: 400, message: "All fields are required" };
  }

  if (!gmailRegex.test(email)) {
    throw {
      status: 400,
      message:
        "Please provide a valid Gmail address (e.g., example@gmail.com). To use a company email, kindly subscribe to our community plan.",
    };
  }

  if (phone.length < 10) {
    throw {
      status: 400,
      message: "Phone number should be 10 digits long",
    };
  }

  if (password !== cPassword) {
    throw {
      status: 400,
      message: "Passwords do not match",
    };
  }
}
