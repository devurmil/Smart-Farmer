const { sendViaGmailApi } = require("./gmailApiSend");

const defaultFrom =
  process.env.SMTP_FROM ||
  process.env.EMAIL_FROM ||
  process.env.GOOGLE_EMAIL ||
  "Smart Farmer <no-reply@smartfarmer.dev>";

const requiredEnv = [
  "GOOGLE_EMAIL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.warn(
    `[emailService] Missing Gmail API env vars: ${missingEnv.join(
      ", "
    )}. OTP emails will fail until these are set.`
  );
}

const sendEmail = async ({ to, subject, html, from }) => {
  try {
    const resolvedFrom = from || defaultFrom;
    const result = await sendViaGmailApi({ to, subject, html, from: resolvedFrom });
    return { success: true, provider: "gmail-api", id: result.id };
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

const sendOtpEmail = async ({ email, otp, name }) => {
  const html = `<p>Hello${name ? ` ${name}` : ""},</p>
    <p>Your OTP for Smart Farmer is: <strong>${otp}</strong></p>
    <p>This code is valid for 10 minutes.</p>`;

  return sendEmail({
    to: email,
    subject: "Your Smart Farmer OTP",
    html,
  });
};

const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const html = `<p>Hello${name ? ` ${name}` : ""},</p>
    <p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`;

  return sendEmail({
    to: email,
    subject: "Reset Your Smart Farmer Password",
    html,
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
};
