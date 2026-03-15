import { inngest } from "../lib/inngestClient.js";
import { sendSessionReminder } from "../lib/email.js";
import { connectDB } from "../lib/db.js";
import Session from "../models/Session.js";
import User from "../models/User.js";

export const sessionReminder = inngest.createFunction(
  { id: "session-reminder", name: "Session Reminder Email" },
  { event: "session/scheduled" },
  async ({ event, step }) => {
    const { sessionId, scheduledAt } = event.data;

    // Wait until 30 minutes before the session
    const reminderTime = new Date(new Date(scheduledAt).getTime() - 30 * 60 * 1000);
    const now = new Date();

    if (reminderTime > now) {
      await step.sleepUntil("wait-for-reminder-time", reminderTime);
    }

    await step.run("send-reminder", async () => {
      await connectDB();

      const session = await Session.findById(sessionId)
        .populate("host", "name email")
        .populate("participant", "name email");

      if (!session || ["cancelled", "expired", "completed"].includes(session.status)) {
        console.log(`Session ${session?.status || "not found"} — skipping reminder`);
        return;
      }

      // Send reminder to candidate
      if (session.candidateId) {
        const candidate = await User.findOne({ clerkId: session.candidateId });
        if (candidate) {
          await sendSessionReminder({
            to: candidate.email,
            candidateName: candidate.name,
            scheduledAt: session.scheduledAt,
            sessionLink: session.joinCode
              ? `${process.env.CLIENT_URL || "http://localhost:5173"}/join?code=${session.joinCode}`
              : `${process.env.CLIENT_URL || "http://localhost:5173"}/session/${session._id}`,
          });
        }
      }

      // Send reminder to host/interviewer
      if (session.host?.email) {
        await sendSessionReminder({
          to: session.host.email,
          candidateName: session.host.name,
          scheduledAt: session.scheduledAt,
          sessionLink: `${process.env.CLIENT_URL || "http://localhost:5173"}/session/${session._id}`,
        });
      }
    });

    return { success: true, sessionId };
  }
);
