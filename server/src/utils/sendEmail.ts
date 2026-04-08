import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const isPlaceholder = (value?: string) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("your_") ||
    normalized.includes("example.com") ||
    normalized.includes("placeholder")
  );
};

export const sendEmail = async ({ email, subject, message }: EmailOptions) => {
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || process.env.FROM_EMAIL || smtpUser;

  if (!process.env.SMTP_HOST || !smtpUser || !smtpPass || isPlaceholder(smtpUser) || isPlaceholder(smtpPass)) {
    console.log("Email transport not configured. Email payload:", { email, subject, message });
    return {
      delivered: false,
      reason: "Email transport is not configured",
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject,
    text: message,
  });

  return {
    delivered: true,
  };
};
