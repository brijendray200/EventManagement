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
  const smtpFrom = process.env.SMTP_FROM || process.env.FROM_EMAIL || "noreply@eventsphere.com";

  let transporter;
  let isEthereal = false;

  if (!process.env.SMTP_HOST || !smtpUser || !smtpPass || isPlaceholder(smtpUser) || isPlaceholder(smtpPass)) {
    console.log("--- Using Ethereal Virtual Mail Server ---");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isEthereal = true;
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  try {
    const info = await transporter.sendMail({
      from: isEthereal ? `"EventSphere" <noreply@eventsphere.com>` : smtpFrom,
      to: email,
      subject,
      text: message,
    });

    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('\n======================================================');
      console.log('VIRTUAL EMAIL SENT!');
      console.log(`Click to view email: ${previewUrl}`);
      console.log('======================================================\n');
    }

    return {
      delivered: !isEthereal,
    };
  } catch (error: any) {
    console.error("SMTP Error:", error.message);
    return {
      delivered: false,
      error: error.message
    };
  }
};
