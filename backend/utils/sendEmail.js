// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (e.g., using Gmail SMTP, Mailtrap for testing, SendGrid, Mailgun)
  // For production, consider services like SendGrid, Mailgun, AWS SES.
  // For development/testing, Mailtrap.io is excellent for catching emails.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // Use true for 465, false for other ports (like 587)
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Optional: For some hosts like Gmail, you might need:
    // tls: {
    //   rejectUnauthorized: false
    // }
  });

  // 2. Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Sender address
    to: options.email, // List of receivers
    subject: options.subject, // Subject line
    html: options.message, // HTML body
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;