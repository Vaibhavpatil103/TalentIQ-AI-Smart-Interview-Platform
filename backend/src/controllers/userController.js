import User from "../models/User.js";
import Session from "../models/Session.js";
import Feedback from "../models/Feedback.js";

export async function getProfile(req, res) {
  try {
    const user = await User.findOne({ clerkId: req.user.clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in getProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { company, resumeUrl, githubUrl, techStack } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      { company, resumeUrl, githubUrl, techStack },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getInterviewHistory(req, res) {
  try {
    const clerkId = req.user.clerkId;

    const sessions = await Session.find({
      $or: [{ interviewerId: clerkId }, { candidateId: clerkId }],
      status: "completed",
    })
      .populate("host", "name profileImage email")
      .populate("participant", "name profileImage email")
      .sort({ createdAt: -1 })
      .limit(50);

    // Get feedback for these sessions
    const sessionIds = sessions.map((s) => s._id);
    const feedback = await Feedback.find({ sessionId: { $in: sessionIds } });

    const history = sessions.map((session) => ({
      session,
      feedback: feedback.filter((f) => f.sessionId.toString() === session._id.toString()),
    }));

    res.status(200).json({ history });
  } catch (error) {
    console.log("Error in getInterviewHistory controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.log("Error in getAllUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function setRole(req, res) {
  try {
    const { role } = req.body;

    // Only allow setting initial roles through this endpoint
    // Companies → interviewer, Developers → candidate
    if (!["candidate", "interviewer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      { role },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user, role: user.role });
  } catch (error) {
    console.log("Error in setRole controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["candidate", "interviewer", "recruiter", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in updateUserRole controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
