const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground';
const GMAIL_USER = process.env.GOOGLE_EMAIL;

const hasGoogleCredentials =
  CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN && GMAIL_USER;

const createTransport = async () => {
  if (!hasGoogleCredentials) {
    throw new Error(
      'Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and GOOGLE_EMAIL.'
    );
  }

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: GMAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken?.token || accessToken,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transport = await createTransport();
    await transport.sendMail({
      from: `Smart Farmer <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

const sendOtpEmail = async ({ email, otp, name }) => {
  const html = `<p>Hello${name ? ` ${name}` : ''},</p>
    <p>Your OTP for Smart Farmer is: <strong>${otp}</strong></p>
    <p>This code is valid for 10 minutes.</p>`;

  return sendEmail({
    to: email,
    subject: 'Your Smart Farmer OTP',
    html,
  });
};

const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const html = `<p>Hello${name ? ` ${name}` : ''},</p>
    <p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`;

  return sendEmail({
    to: email,
    subject: 'Reset Your Smart Farmer Password',
    html,
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
};

