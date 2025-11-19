const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground';
const GMAIL_USER = process.env.GOOGLE_EMAIL;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_SECURE = process.env.SMTP_SECURE;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || `Smart Farmer <${SMTP_USER || GMAIL_USER || 'no-reply@smartfarmer.local'}>`;

const hasGoogleCredentials =
  CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN && GMAIL_USER;

const hasSmtpCredentials =
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;

const createTransport = async () => {
  if (hasSmtpCredentials) {
    const port = Number(SMTP_PORT) || 587;
    const secure =
      typeof SMTP_SECURE === 'string'
        ? SMTP_SECURE.toLowerCase() === 'true'
        : port === 465;

    return nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  if (hasGoogleCredentials) {
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
  }

  // Development fallback - create disposable Ethereal account
  const testAccount = await nodemailer.createTestAccount();
  console.warn(
    '[emailService] Missing SMTP/Google credentials. Using Ethereal test account.'
  );

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendEmail = async ({ to, subject, html, from }) => {
  try {
    const transport = await createTransport();
    await transport.sendMail({
      from: from || SMTP_FROM,
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

