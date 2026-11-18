import nodemailer from "nodemailer";

function getTransporter() {
  const port = Number(process.env.EMAIL_PORT) || 587;
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure: isSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

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
}): Promise < { success: boolean; error?: string } > {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply.taskaro@gmail.com",
      to,
      subject,
      text: text || "",
      html: html || undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Email dispatched successfully to ${to}. MessageId: ${info?.messageId}`);
    return { success: true };
  } catch(err: any) {
    console.error(`[Mailer] Failed to send email to ${to}:`, err?.message || err);
    return { success: false, error: err?.message || "Failed to dispatch email." };
  }
}
