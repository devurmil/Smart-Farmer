const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");

const booleanFromEnv = (value, fallback = false) => {
  if (typeof value === "undefined") return fallback;
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const numberFromEnv = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const primaryHost =
  process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
const primaryPort =
  numberFromEnv(process.env.SMTP_PORT, undefined) ||
  numberFromEnv(process.env.EMAIL_PORT, 465);
const primaryUser =
  process.env.SMTP_USER || process.env.EMAIL_USER || process.env.ADMIN_MAIL;
const primaryPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const primaryService =
  process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE || undefined;
const smtpSecure =
  typeof process.env.SMTP_SECURE !== "undefined"
    ? booleanFromEnv(process.env.SMTP_SECURE)
    : typeof process.env.EMAIL_SECURE !== "undefined"
    ? booleanFromEnv(process.env.EMAIL_SECURE)
    : primaryPort === 465;
const smtpConnectionUrl =
  process.env.SMTP_URL || process.env.SMTP_CONNECTION_URL || undefined;
const smtpTimeout = numberFromEnv(process.env.SMTP_TIMEOUT_MS, 7000);
const allowEtherealFallback = !booleanFromEnv(
  process.env.DISABLE_ETHEREAL_FALLBACK,
  false
);
const fallbackFrom =
  process.env.SMTP_FROM ||
  process.env.EMAIL_FROM ||
  (primaryUser
    ? `Smart Farmer <${primaryUser}>`
    : "Smart Farmer <no-reply@smartfarmer.dev>");

const googleClientId =
  process.env.GOOGLE_CLIENT_ID || process.env.SMTP_GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET || process.env.SMTP_GOOGLE_CLIENT_SECRET;
const googleRedirectUri =
  process.env.GOOGLE_REDIRECT_URI ||
  process.env.SMTP_GOOGLE_REDIRECT_URI ||
  "https://developers.google.com/oauthplayground";
const googleRefreshToken =
  process.env.GOOGLE_REFRESH_TOKEN ||
  process.env.SMTP_GOOGLE_REFRESH_TOKEN ||
  (() => {
    const tokenFile = process.env.GOOGLE_TOKEN_FILE;
    if (!tokenFile) return undefined;
    try {
      const tokenData = JSON.parse(fs.readFileSync(tokenFile, "utf8"));
      return tokenData.refresh_token;
    } catch (err) {
      console.warn("[emailService] Failed to read GOOGLE_TOKEN_FILE:", err.message);
      return undefined;
    }
  })();
const googleUser =
  process.env.GOOGLE_EMAIL ||
  process.env.SMTP_GOOGLE_EMAIL ||
  primaryUser;

const hasGoogleOauthCredentials =
  googleClientId && googleClientSecret && googleRefreshToken && googleUser;

const hasPrimaryCredentials =
  hasGoogleOauthCredentials ||
  ((primaryHost || primaryService || smtpConnectionUrl) &&
    primaryUser &&
    primaryPass);

let cachedEtherealAccount = null;
let primaryTransportPromise = null;

const sanitizeHost = (value) =>
  typeof value === "string" ? value.replace(/:\/\/.*@/, "://***:***@") : value;

const logTransportConfig = (label, config) => {
  const safeConfig = { ...config };
  if (safeConfig.auth?.user) safeConfig.auth.user = "***";
  if (safeConfig.auth?.pass) safeConfig.auth.pass = "***";
  console.log(`[emailService] ${label}`, safeConfig);
};

const createGoogleOauthTransport = async () => {
  if (!hasGoogleOauthCredentials) {
    throw new Error(
      "Google OAuth credentials are missing. Provide GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN and GOOGLE_EMAIL."
    );
  }

  const oAuth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    googleRedirectUri
  );
  oAuth2Client.setCredentials({ refresh_token: googleRefreshToken });

  let accessTokenResponse;
  try {
    accessTokenResponse = await oAuth2Client.getAccessToken();
  } catch (err) {
    console.error("[emailService] Failed to fetch Google access token:", err);
    throw err;
  }

  const accessToken =
    typeof accessTokenResponse === "string"
      ? accessTokenResponse
      : accessTokenResponse?.token;

  if (!accessToken) {
    throw new Error("Unable to retrieve Google OAuth access token.");
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: googleUser,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      refreshToken: googleRefreshToken,
      accessToken,
    },
    connectionTimeout: smtpTimeout,
    greetingTimeout: smtpTimeout,
    socketTimeout: smtpTimeout,
  });

  logTransportConfig("Using Gmail OAuth2 transport", {
    service: "gmail",
    user: "***",
  });

  return transport;
};

const createPrimaryTransport = async () => {
  if (booleanFromEnv(process.env.SMTP_USE_GOOGLE, false) && hasGoogleOauthCredentials) {
    return createGoogleOauthTransport();
  }

  if (!primaryPass && hasGoogleOauthCredentials && !smtpConnectionUrl && !primaryService) {
    return createGoogleOauthTransport();
  }

  if (smtpConnectionUrl) {
    const transport = nodemailer.createTransport(smtpConnectionUrl);
    logTransportConfig("Using SMTP connection URL", {
      url: sanitizeHost(smtpConnectionUrl),
    });
    return transport;
  }

  if (!hasPrimaryCredentials) {
    throw new Error(
      "Missing SMTP credentials. Please set SMTP_HOST/PORT/USER/PASS (or SMTP_URL)."
    );
  }

  if (primaryService) {
    const serviceTransport = nodemailer.createTransport({
      service: primaryService,
      auth: {
        user: primaryUser,
        pass: primaryPass,
      },
      pool: booleanFromEnv(process.env.SMTP_POOL, true),
      maxConnections: numberFromEnv(process.env.SMTP_MAX_CONNECTIONS, 3),
      connectionTimeout: smtpTimeout,
      greetingTimeout: smtpTimeout,
      socketTimeout: smtpTimeout,
    });
    logTransportConfig("Using SMTP service transport", {
      service: primaryService,
      pool: serviceTransport.options.pool,
    });
    return serviceTransport;
  }

  const hostTransport = nodemailer.createTransport({
    host: primaryHost,
    port: primaryPort,
    secure: smtpSecure,
    pool: booleanFromEnv(process.env.SMTP_POOL, true),
    maxConnections: numberFromEnv(process.env.SMTP_MAX_CONNECTIONS, 3),
    connectionTimeout: smtpTimeout,
    greetingTimeout: smtpTimeout,
    socketTimeout: smtpTimeout,
    tls: booleanFromEnv(process.env.SMTP_TLS_INSECURE, false)
      ? { rejectUnauthorized: false }
      : undefined,
    auth: {
      user: primaryUser,
      pass: primaryPass,
    },
  });

  logTransportConfig("Using SMTP host transport", {
    host: primaryHost,
    port: primaryPort,
    secure: smtpSecure,
    pool: hostTransport.options.pool,
  });
  return hostTransport;
};

const createEtherealTransport = async () => {
  if (!allowEtherealFallback) {
    throw new Error(
      "Ethereal fallback is disabled and primary transport is unavailable."
    );
  }

  if (!cachedEtherealAccount) {
    cachedEtherealAccount = await nodemailer.createTestAccount();
    console.warn(
      "Using autogenerated Ethereal SMTP credentials for email delivery (development-only)."
    );
    console.warn(`Ethereal user: ${cachedEtherealAccount.user}`);
  }

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    connectionTimeout: smtpTimeout,
    greetingTimeout: smtpTimeout,
    socketTimeout: smtpTimeout,
    auth: {
      user: cachedEtherealAccount.user,
      pass: cachedEtherealAccount.pass,
    },
  });
};

const resetPrimaryTransport = () => {
  primaryTransportPromise = null;
};

const getPrimaryTransport = async () => {
  if (!primaryTransportPromise) {
    primaryTransportPromise = createPrimaryTransport()
      .then(async (transport) => {
        try {
          await transport.verify();
        } catch (verifyError) {
          console.warn(
            "[emailService] SMTP verify failed, transport will be retried per-send.",
            verifyError.code || verifyError.message
          );
        }
        return transport;
      })
      .catch((error) => {
        resetPrimaryTransport();
        throw error;
      });
  }
  return primaryTransportPromise;
};

const isConnectionError = (error) =>
  error &&
  (error.code === "ETIMEDOUT" ||
    error.code === "EAI_AGAIN" ||
    error.code === "ECONNREFUSED" ||
    error.code === "ECONNRESET" ||
    error.code === "ENOTFOUND" ||
    error.command === "CONN");

const sendEmail = async ({ to, subject, html, from }) => {
  try {
    let transport;
    try {
      transport = await getPrimaryTransport();
    } catch (setupError) {
      console.error("[emailService] Unable to init primary transport:", setupError);
      transport = null;
    }

    const resolvedFrom =
      from ||
      (transport?.options?.auth?.user
        ? `Smart Farmer <${transport.options.auth.user}>`
        : fallbackFrom);

    const attemptSend = async (activeTransport, viaFallback = false) => {
      const info = await activeTransport.sendMail({
        from: resolvedFrom,
        to,
        subject,
        html,
      });

      if (activeTransport.options?.host === "smtp.ethereal.email") {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.warn(
            `Email delivered via Ethereal${viaFallback ? " fallback" : ""}. Preview at:`,
            previewUrl
          );
        }
      }

      return { success: true, fallback: viaFallback };
    };

    if (transport) {
      try {
        return await attemptSend(transport, false);
      } catch (primaryError) {
        if (!isConnectionError(primaryError)) {
          throw primaryError;
        }

        console.warn(
          `[emailService] Primary transport failed (${primaryError.code || primaryError.message}).`
        );
        resetPrimaryTransport();
      }
    }

    const fallbackTransport = await createEtherealTransport();
    return await attemptSend(fallbackTransport, true);
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
