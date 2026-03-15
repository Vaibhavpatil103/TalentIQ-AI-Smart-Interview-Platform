import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not configured — emails disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

const fromAddress = () => `"Talent IQ" <${process.env.GMAIL_USER}>`;

// ─── Shared email wrapper ────────────────────────────────────────
const sendMail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn("Email transporter not configured — skipping email to:", to);
    return;
  }
  try {
    await transporter.sendMail({ from: fromAddress(), to, subject, html });
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

// ─── Dark-themed email layout helper ─────────────────────────────
const wrapInLayout = (bodyContent) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background-color:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#818cf8);padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Talent IQ</h1>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      ${bodyContent}
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #334155;text-align:center;">
      <p style="margin:0;color:#64748b;font-size:12px;">Powered by Talent IQ • Smart Interview Platform</p>
    </div>
  </div>
</body>
</html>`;

const btn = (href, label) =>
  `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${href}" style="display:inline-block;background:#818cf8;color:#ffffff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">${label}</a>
  </div>`;

const infoBox = (content) =>
  `<div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px 20px;margin:20px 0;text-align:center;">
    ${content}
  </div>`;

const formatScheduledAt = (scheduledAt) => {
  const d = new Date(scheduledAt);
  return d.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }) + " — please convert to your local timezone";
};

// ─── 1. Session Invite Email ─────────────────────────────────────
export const sendInterviewInvite = async ({
  to,
  candidateName,
  interviewerName,
  scheduledAt,
  sessionLink,
  joinCode,
}) => {
  const formattedDate = formatScheduledAt(scheduledAt);

  const html = wrapInLayout(`
    <p style="color:#e2e8f0;font-size:16px;margin:0 0 20px;">Hi ${candidateName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 8px;">
      Your interview has been scheduled with <strong style="color:#e2e8f0;">${interviewerName}</strong>.
    </p>

    ${infoBox(`
      <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Scheduled For</p>
      <p style="margin:0;color:#e2e8f0;font-size:16px;font-weight:700;">${formattedDate}</p>
    `)}

    ${joinCode ? infoBox(`
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Join Code</p>
      <p style="margin:0;color:#818cf8;font-size:32px;font-weight:900;letter-spacing:6px;">${joinCode}</p>
      <p style="margin:8px 0 0;color:#64748b;font-size:12px;">Enter this code at the join page to enter the session</p>
    `) : ""}

    ${btn(sessionLink, "Join Interview →")}
  `);

  await sendMail({
    to,
    subject: `Interview Scheduled — ${interviewerName} @ Talent IQ`,
    html,
  });
};

// ─── 2. Session Reminder Email (30 min before) ───────────────────
export const sendSessionReminder = async ({
  to,
  candidateName,
  scheduledAt,
  sessionLink,
}) => {
  const formattedDate = formatScheduledAt(scheduledAt);

  const html = wrapInLayout(`
    <p style="color:#e2e8f0;font-size:16px;margin:0 0 20px;">Hi ${candidateName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 8px;">
      ⏰ Your interview starts in <strong style="color:#fbbf24;">30 minutes</strong>!
    </p>

    ${infoBox(`
      <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Starting At</p>
      <p style="margin:0;color:#e2e8f0;font-size:16px;font-weight:700;">${formattedDate}</p>
    `)}

    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:16px 0 0;">
      Make sure you're in a quiet environment with a stable internet connection.
    </p>

    ${btn(sessionLink, "Join Now →")}
  `);

  await sendMail({
    to,
    subject: "Reminder: Your Interview Starts in 30 Minutes",
    html,
  });
};

// ─── 3. Session Confirmation Email (after session ends) ──────────
export const sendSessionConfirmation = async ({
  to,
  candidateName,
  interviewerName,
  sessionLink,
  duration,
}) => {
  const html = wrapInLayout(`
    <p style="color:#e2e8f0;font-size:16px;margin:0 0 20px;">Hi ${candidateName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 8px;">
      Your interview session with <strong style="color:#e2e8f0;">${interviewerName}</strong> has ended.
    </p>

    ${duration ? infoBox(`
      <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Session Duration</p>
      <p style="margin:0;color:#e2e8f0;font-size:24px;font-weight:800;">${duration} minutes</p>
    `) : ""}

    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:16px 0 0;">
      Your feedback will be shared with you shortly via your inbox.
    </p>

    ${btn(sessionLink, "View Session →")}
  `);

  await sendMail({
    to,
    subject: `Interview Completed — Thank you, ${candidateName}`,
    html,
  });
};
