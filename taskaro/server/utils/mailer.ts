import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMailService({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const mailOptions = {
    from: process.env.EMAIL_USER || "noreply.taskaro@gmail.com",
    to,
    subject,
    text: text || "",
    html: html || undefined,
  };

  await transporter.sendMail(mailOptions);
}
