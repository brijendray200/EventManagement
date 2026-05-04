const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // If credentials are not set, create a temporary Ethereal test account automatically
  if (process.env.SMTP_EMAIL === 'your_email@example.com' || !process.env.SMTP_EMAIL) {
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
    console.log('--- Using Ethereal Virtual Mail Server ---');
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || 'EventSphere'} <${process.env.FROM_EMAIL || 'noreply@eventsphere.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    
    // If using Ethereal, generate a preview link that the user can click
    if (process.env.SMTP_EMAIL === 'your_email@example.com' || !process.env.SMTP_EMAIL) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('\n======================================================');
        console.log('EMAIL SENT TO VIRTUAL INBOX!');
        console.log(`Click to view email: ${previewUrl}`);
        console.log('======================================================\n');
    }
    
    return true;
  } catch (error) {
    console.error('SMTP Error:', error.message);
    return false;
  }
};

module.exports = sendEmail;
