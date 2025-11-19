const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const booleanFromEnv = (value, fallback = false) => {
  if (typeof value === "undefined") return fallback;
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const resolveTokenFromFile = () => {
  const tokenFile =
    process.env.GOOGLE_TOKEN_FILE || process.env.SMTP_GOOGLE_TOKEN_FILE;
  if (!tokenFile) return undefined;

  try {
    const resolvedPath = path.resolve(tokenFile);
    const tokenJson = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    return tokenJson.refresh_token;
  } catch (error) {
    console.warn(
      `[gmailApiSend] Failed to read refresh token from ${tokenFile}:`,
      error.message
    );
    return undefined;
  }
};

const clientId =
  process.env.GOOGLE_CLIENT_ID || process.env.SMTP_GOOGLE_CLIENT_ID;
const clientSecret =
  process.env.GOOGLE_CLIENT_SECRET || process.env.SMTP_GOOGLE_CLIENT_SECRET;
const redirectUri =
  process.env.GOOGLE_REDIRECT_URI ||
  process.env.SMTP_GOOGLE_REDIRECT_URI ||
  "https://developers.google.com/oauthplayground";
const refreshToken =
  process.env.GOOGLE_REFRESH_TOKEN ||
  process.env.SMTP_GOOGLE_REFRESH_TOKEN ||
  resolveTokenFromFile();
const gmailSender =
  process.env.GOOGLE_EMAIL ||
  process.env.SMTP_GOOGLE_EMAIL ||
  process.env.SMTP_FROM ||
  process.env.EMAIL_FROM ||
  process.env.SMTP_USER ||
  process.env.EMAIL_USER;
const gmailApiEnabled = booleanFromEnv(
  process.env.USE_GMAIL_API ?? process.env.SMTP_USE_GOOGLE_API,
  true
);

const hasGmailApiConfig =
  gmailApiEnabled && clientId && clientSecret && refreshToken && gmailSender;

let oauthClient = null;

const getOauthClient = () => {
  if (!oauthClient) {
    oauthClient = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }
  oauthClient.setCredentials({ refresh_token: refreshToken });
  return oauthClient;
};

const buildRawMessage = ({ to, subject, html, from }) => {
  if (!to) throw new Error("Missing recipient for Gmail API email");
  if (!subject) throw new Error("Missing subject for Gmail API email");
  if (!html) throw new Error("Missing HTML body for Gmail API email");

  const fromHeader = from || `Smart Farmer <${gmailSender}>`;

  const messageParts = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ];

  const message = messageParts.join("\n");
  return Buffer.from(message, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const sendViaGmailApi = async ({ to, subject, html, from }) => {
  if (!hasGmailApiConfig) {
    throw new Error("Gmail API credentials are not fully configured.");
  }

  const oauth2Client = getOauthClient();
  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const rawMessage = buildRawMessage({ to, subject, html, from });

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: rawMessage },
  });

  console.log("[gmailApiSend] Email sent via Gmail API:", response.data.id);
  return {
    success: true,
    id: response.data.id,
    labelIds: response.data.labelIds,
  };
};

module.exports = {
  hasGmailApiConfig,
  sendViaGmailApi,
};

