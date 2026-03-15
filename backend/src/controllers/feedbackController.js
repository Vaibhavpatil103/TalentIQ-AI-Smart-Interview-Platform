import Feedback from "../models/Feedback.js";
import Session from "../models/Session.js";
import Message from "../models/Message.js";

export async function createFeedback(req, res) {
  try {
    const { sessionId, codeQuality, problemSolving, communication, decision, notes } =
      req.body;

    const interviewerId = req.user.clerkId;

    // Verify session exists
    const session = await Session.findById(sessionId).populate("host participant");
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only session host or interviewer/admin can submit feedback
    const isHost = session.host?.clerkId === interviewerId || session.interviewerId === interviewerId;
    const isPrivileged = ["interviewer", "recruiter", "admin"].includes(req.user.role);
    if (!isHost && !isPrivileged) {
      return res.status(403).json({ message: "Only the session host can submit feedback" });
    }

    // Resolve candidateId from session participants
    let candidateId = req.body.candidateId || null;
    if (!candidateId) {
      if (session.candidateId) {
        candidateId = session.candidateId;
      } else if (session.participant?.clerkId) {
        candidateId = session.participant.clerkId;
      }
    }

    if (!candidateId) {
      return res.status(400).json({ message: "Could not resolve candidate. No participant found for this session." });
    }

    // Check if feedback already exists for this session by this interviewer
    const existingFeedback = await Feedback.findOne({ sessionId, interviewerId });
    if (existingFeedback) {
      return res.status(409).json({ message: "Feedback already submitted for this session" });
    }

    const feedback = await Feedback.create({
      sessionId,
      interviewerId,
      candidateId,
      codeQuality,
      problemSolving,
      communication,
      decision,
      notes: notes || "",
    });

    // Also update the session's embedded feedback
    await Session.findByIdAndUpdate(sessionId, {
      feedback: { codeQuality, problemSolving, communication, decision, notes },
    });

    // Auto-deliver feedback to candidate's inbox
    if (candidateId) {
      try {
        const decisionLabel = decision === "hire" ? "✅ Hire" : decision === "no-hire" ? "❌ No Hire" : "🤔 Maybe";
        const bodyLines = [
          `You have received interview feedback for session: ${session.problem || "Interview Session"}.`,
          "",
          `📊 Scores:`,
          `  • Code Quality: ${codeQuality}/5`,
          `  • Problem Solving: ${problemSolving}/5`,
          `  • Communication: ${communication}/5`,
          "",
          `📋 Decision: ${decisionLabel}`,
        ];
        if (notes) {
          bodyLines.push("", `📝 Notes:`, notes);
        }

        const inboxMsg = await Message.create({
          senderId: interviewerId,
          senderName: req.user.name,
          senderRole: req.user.role,
          recipientId: candidateId,
          type: "feedback",
          subject: `Interview Feedback — ${session.problem || "Session"}`,
          body: bodyLines.join("\n"),
          sessionId,
          feedbackId: feedback._id,
        });

        // Real-time: notify candidate
        const io = req.app.get("io");
        if (io) {
          io.to(`inbox:${candidateId}`).emit("inbox:new-message", inboxMsg.toObject());
          io.to(`inbox:${candidateId}`).emit("inbox:unread");
        }
      } catch (msgErr) {
        console.error("Failed to deliver feedback to inbox (non-critical):", msgErr.message);
      }
    }

    res.status(201).json({ feedback });
  } catch (error) {
    console.log("Error in createFeedback controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFeedbackBySession(req, res) {
  try {
    const { sessionId } = req.params;

    const feedback = await Feedback.find({ sessionId });
    res.status(200).json({ feedback });
  } catch (error) {
    console.log("Error in getFeedbackBySession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFeedbackByCandidate(req, res) {
  try {
    const { candidateId } = req.params;

    const feedback = await Feedback.find({ candidateId })
      .populate("sessionId")
      .sort({ createdAt: -1 });

    res.status(200).json({ feedback });
  } catch (error) {
    console.log("Error in getFeedbackByCandidate controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
