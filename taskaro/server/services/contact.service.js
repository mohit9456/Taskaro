import { connectToDatabase } from "../db/mongodb";
import Contact from "../models/Contact";
import EmailSubscription from "../models/EmailSubscription";
import { sendMailService } from "../utils/mailer";
import { subscribeMailText } from "../utils/subscribemailText";
import { gmailRegex } from "../utils/validation";

export const createContactInquiry = async (payload) => {
  const { name, email, topic, message } = payload;

  if (!name || !email || !topic || !message) {
    throw { status: 400, message: "All fields are required" };
  }

  await connectToDatabase();

  const inquiry = await Contact.create({
    name,
    email,
    topic,
    message,
  });

  return { inquiry, message: "Inquiry submitted successfully" };
};

export const subscribedLetter = async (payload) => {
  const { email } = payload;

  if (!email) {
    throw { status: 400, message: "Please provide a valid email For updates" };
  }

  if (!gmailRegex.test(email)) {
    throw {
      status: 400,
      message:
        "Please provide a valid Gmail address (e.g., example@gmail.com). To use a company email, kindly subscribe to our community plan.",
    };
  }

  await connectToDatabase();

  const isEmailInDB = await EmailSubscription.findOne({ email });

  if (!isEmailInDB) {
    await EmailSubscription.create({ email });
    await sendMailService({
        to: email,
        subject: "Welcome to Taskaro 🚀 Simplify Tasks. Empower Teams.",
        text: subscribeMailText(),
      });
  }
  return {
    message: `You're Subscribed!\n You'll now receive updates and insights from us right in your inbox.`,
  };
};
