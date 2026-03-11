import { Resend } from "resend";
import { ENV } from "./env.js";

const resend = ENV.RESEND_API_KEY ? new Resend(ENV.RESEND_API_KEY) : null;

export const sendInterviewInvite = async ({
  to,
  candidateName,
  interviewerName,
  scheduledAt,
  sessionLink,
}) => {
  if (!resend) {
    console.warn("Resend API key not configured — skipping email");
    return;
  }

  try {
    await resend.emails.send({
      from: "Talent IQ <onboarding@resend.dev>",
      to,
      subject: `Interview Scheduled — ${interviewerName} @ Talent IQ`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f172a; color: #e2e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #818cf8; font-size: 28px; margin: 0;">✨ Talent IQ</h1>
            <p style="color: #94a3b8; margin-top: 4px;">Technical Interview Platform</p>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
            <h2 style="color: #f1f5f9; margin-top: 0;">Hi ${candidateName},</h2>
            <p style="color: #cbd5e1; line-height: 1.6;">
              Your technical interview has been scheduled with <strong style="color: #818cf8;">${interviewerName}</strong>.
            </p>
            <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 24px 0; border: 1px solid #334155;">
              <p style="margin: 0; color: #94a3b8;">📅 Scheduled for</p>
              <p style="margin: 8px 0 0; color: #f1f5f9; font-size: 18px; font-weight: 600;">${new Date(scheduledAt).toLocaleString()}</p>
            </div>
            <a href="${sessionLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Join Interview →
            </a>
          </div>
          <p style="text-align: center; color: #64748b; margin-top: 32px; font-size: 13px;">
            Powered by Talent IQ
          </p>
        </div>
      `,
    });
    console.log("Interview invite email sent to:", to);
  } catch (error) {
    console.error("Failed to send interview invite email:", error);
  }
};

export const sendSessionReminder = async ({
  to,
  candidateName,
  scheduledAt,
  sessionLink,
}) => {
  if (!resend) {
    console.warn("Resend API key not configured — skipping email");
    return;
  }

  try {
    await resend.emails.send({
      from: "Talent IQ <onboarding@resend.dev>",
      to,
      subject: "Reminder: Your Interview Starts in 30 Minutes",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f172a; color: #e2e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #818cf8; font-size: 28px; margin: 0;">⏰ Talent IQ</h1>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
            <h2 style="color: #f1f5f9; margin-top: 0;">Hi ${candidateName},</h2>
            <p style="color: #cbd5e1; line-height: 1.6;">
              Your interview starts in <strong style="color: #fbbf24;">30 minutes</strong>!
            </p>
            <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 24px 0; border: 1px solid #334155;">
              <p style="margin: 0; color: #f1f5f9; font-size: 18px; font-weight: 600;">${new Date(scheduledAt).toLocaleString()}</p>
            </div>
            <a href="${sessionLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
              Join Now →
            </a>
          </div>
        </div>
      `,
    });
    console.log("Session reminder email sent to:", to);
  } catch (error) {
    console.error("Failed to send session reminder email:", error);
  }
};
