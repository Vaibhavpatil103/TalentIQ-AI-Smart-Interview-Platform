import Feedback from "../models/Feedback.js";
import Session from "../models/Session.js";

export async function createFeedback(req, res) {
  try {
    const { sessionId, candidateId, codeQuality, problemSolving, communication, decision, notes } =
      req.body;

    const interviewerId = req.user.clerkId;

    // Verify session exists
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

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
