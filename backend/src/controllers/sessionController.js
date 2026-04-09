import crypto from "crypto";
import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { inngest } from "../lib/inngestClient.js";
import { sendInterviewInvite, sendSessionConfirmation } from "../lib/email.js";
import Problem from "../models/Problem.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, scheduledAt, candidateEmail } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // determine session status
    const status = scheduledAt ? "scheduled" : "active";

    // generate a secure 6-character join code
    const joinCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const joinLink = `${frontendUrl}/join?code=${joinCode}`;

    // create session in db
    const sessionData = {
      host: userId,
      callId,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      interviewerId: clerkId,
      joinCode,
      joinLink,
    };
    if (problem) sessionData.problem = problem;
    if (difficulty) sessionData.difficulty = difficulty;
    if (candidateEmail) sessionData.candidateEmail = candidateEmail;

    const session = await Session.create(sessionData);

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: {
          problem: problem || "No problem selected",
          difficulty: difficulty || "easy",
          sessionId: session._id.toString(),
        },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem || "Interview"} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    // Send invite email if candidate email provided
    if (candidateEmail && scheduledAt) {
      await sendInterviewInvite({
        to: candidateEmail,
        candidateName: candidateEmail.split("@")[0],
        interviewerName: req.user.name,
        scheduledAt,
        sessionLink: `${process.env.CLIENT_URL || "http://localhost:5173"}/join?code=${joinCode}`,
        joinCode,
      });

      // Schedule reminder via Inngest
      await inngest.send({
        name: "session/scheduled",
        data: { sessionId: session._id.toString(), scheduledAt },
      });
    }

    res.status(201).json({ session, joinCode, joinLink });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const filter = {
      status: "active",
      $or: [{ host: userId }, { participant: userId }],
    };

    const [sessions, totalCount] = await Promise.all([
      Session.find(filter)
        .populate("host", "name profileImage email clerkId")
        .populate("participant", "name profileImage email clerkId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Session.countDocuments(filter),
    ]);

    res.status(200).json({
      sessions,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const filter = {
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    };

    const [sessions, totalCount] = await Promise.all([
      Session.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Session.countDocuments(filter),
    ]);

    res.status(200).json({
      sessions,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId")
      .populate("pendingParticipants.user", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Authorization: only host, participant, or pending users can view
    const requestingUserId = req.user._id.toString();
    const isHost = session.host?._id?.toString() === requestingUserId;
    const isParticipant = session.participant?._id?.toString() === requestingUserId;
    const isPending = session.pendingParticipants?.some(
      (p) => p.user?._id?.toString() === requestingUserId
    );

    if (!isHost && !isParticipant && !isPending) {
      return res.status(403).json({
        message: "Access denied. You are not a participant of this session.",
      });
    }

    const now = new Date();

    // Auto-transition: scheduled → active when scheduledAt has arrived
    if (session.status === "scheduled" && session.scheduledAt && session.scheduledAt <= now) {
      session.status = "active";
      await session.save();
    }

    // Auto-expire: if session is active, was scheduled, and 15 min have passed with no participant
    if (
      session.status === "active" &&
      session.scheduledAt &&
      !session.participant &&
      now - new Date(session.scheduledAt) > 15 * 60 * 1000
    ) {
      session.status = "expired";
      await session.save();
    }

    // Compute canJoin: allow joining if active, or if scheduled but within 2-min buffer
    let canJoin = session.status === "active";
    if (session.status === "scheduled" && session.scheduledAt) {
      const msUntilStart = new Date(session.scheduledAt) - now;
      canJoin = msUntilStart <= 2 * 60 * 1000; // 2-minute early buffer
    }

    res.status(200).json({ session, canJoin });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;
    const { joinCode } = req.body;

    const session = await Session.findById(id)
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .populate("pendingParticipants.user", "name profileImage email clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Block expired sessions
    if (session.status === "expired") {
      return res.status(403).json({ message: "This interview session has expired." });
    }

    // Block completed/cancelled sessions
    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    // Scheduled session: enforce 2-minute early join buffer
    if (session.status === "scheduled" && session.scheduledAt) {
      const now = new Date();
      const msUntilStart = new Date(session.scheduledAt) - now;

      if (msUntilStart > 2 * 60 * 1000) {
        return res.status(403).json({
          message: `This session hasn't started yet. You can join 2 minutes before the scheduled time.`,
          scheduledAt: session.scheduledAt,
        });
      }

      // Within buffer → auto-transition to active
      session.status = "active";
      await session.save();
    }

    // Host can always access their own session
    if (session.host._id.toString() === userId.toString()) {
      return res.status(200).json({ session, status: "approved" });
    }

    // Already a participant → rejoin
    if (session.participant && session.participant._id.toString() === userId.toString()) {
      return res.status(200).json({ session, status: "approved" });
    }

    // ── Join code required for non-host / non-participant ──
    if (!joinCode) {
      return res.status(403).json({ message: "Please enter a valid session code to join this interview." });
    }

    // Validate sessionId + joinCode combo
    if (session.joinCode !== joinCode.toUpperCase()) {
      return res.status(403).json({ message: "Invalid session code. Please check and try again." });
    }

    // Check if session is already full
    if (session.participant) {
      return res.status(409).json({ message: "Session is full" });
    }

    // Check if already in pending list
    const alreadyPending = session.pendingParticipants.some(
      (p) => p.user && p.user._id.toString() === userId.toString()
    );

    if (alreadyPending) {
      return res.status(200).json({ session, status: "pending" });
    }

    // Add to waiting room (pending)
    session.pendingParticipants.push({ user: userId });
    await session.save();

    // Re-populate to get the user details
    await session.populate("pendingParticipants.user", "name profileImage email clerkId");

    // Notify host via Socket.io
    const io = req.app.get("io");
    if (io) {
      const pendingUser = session.pendingParticipants.find(
        (p) => p.user && p.user._id.toString() === userId.toString()
      );
      io.to(id).emit("join:request", {
        userId: userId.toString(),
        clerkId,
        name: req.user.name,
        profileImage: req.user.profileImage,
        requestedAt: pendingUser?.requestedAt || new Date(),
      });
    }

    res.status(200).json({ session, status: "pending" });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { code, language } = req.body || {};

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // delete stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    // delete stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    session.endedAt = new Date();
    await session.save();

    // Send confirmation email to candidate
    try {
      if (session.candidateEmail) {
        const startTime = session.scheduledAt || session.createdAt;
        const durationMins = startTime
          ? Math.round((new Date() - new Date(startTime)) / 60000)
          : 0;
        await sendSessionConfirmation({
          to: session.candidateEmail,
          candidateName: session.candidateEmail.split("@")[0],
          interviewerName: req.user.name,
          sessionLink: session.joinCode
            ? `${process.env.CLIENT_URL || "http://localhost:5173"}/join?code=${session.joinCode}`
            : `${process.env.CLIENT_URL || "http://localhost:5173"}/session/${session._id}`,
          duration: durationMins,
        });
      }
    } catch (emailErr) {
      console.error("Confirmation email failed (non-critical):", emailErr.message);
    }

    // Trigger AI code review via Inngest if code was submitted
    // (confirmation email block is above)
    if (code) {
      await inngest.send({
        name: "session/completed",
        data: {
          sessionId: session._id.toString(),
          code,
          language: language || "javascript",
          problemTitle: session.problem,
        },
      });
    }

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Approve a pending participant (host only)
export async function approveParticipant(req, res) {
  try {
    const { id } = req.params;
    const { userId: pendingUserId } = req.body;
    const hostId = req.user._id;

    const session = await Session.findById(id)
      .populate("pendingParticipants.user", "name profileImage email clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only host can approve
    if (session.host.toString() !== hostId.toString()) {
      return res.status(403).json({ message: "Only the host can approve participants" });
    }

    // Already has a participant
    if (session.participant) {
      return res.status(409).json({ message: "Session already has a participant" });
    }

    // Find the pending user
    const pendingEntry = session.pendingParticipants.find(
      (p) => p.user && p.user._id.toString() === pendingUserId
    );

    if (!pendingEntry) {
      return res.status(404).json({ message: "User not found in waiting room" });
    }

    const approvedUser = pendingEntry.user;

    // Move from pending to participant
    session.participant = approvedUser._id;
    session.pendingParticipants = session.pendingParticipants.filter(
      (p) => p.user && p.user._id.toString() !== pendingUserId
    );
    await session.save();

    // Add to Stream chat channel
    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.addMembers([approvedUser.clerkId]);
    } catch (streamErr) {
      console.error("Failed to add to Stream channel:", streamErr.message);
    }

    // Notify via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("join:approved", {
        userId: pendingUserId,
        clerkId: approvedUser.clerkId,
        name: approvedUser.name,
      });
    }

    res.status(200).json({ session, message: "Participant approved" });
  } catch (error) {
    console.log("Error in approveParticipant controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Reject a pending participant (host only)
export async function rejectParticipant(req, res) {
  try {
    const { id } = req.params;
    const { userId: pendingUserId } = req.body;
    const hostId = req.user._id;

    const session = await Session.findById(id)
      .populate("pendingParticipants.user", "name profileImage email clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only host can reject
    if (session.host.toString() !== hostId.toString()) {
      return res.status(403).json({ message: "Only the host can reject participants" });
    }

    // Find and remove from pending
    const pendingEntry = session.pendingParticipants.find(
      (p) => p.user && p.user._id.toString() === pendingUserId
    );

    if (!pendingEntry) {
      return res.status(404).json({ message: "User not found in waiting room" });
    }

    session.pendingParticipants = session.pendingParticipants.filter(
      (p) => p.user && p.user._id.toString() !== pendingUserId
    );
    await session.save();

    // Notify via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("join:rejected", {
        userId: pendingUserId,
        clerkId: pendingEntry.user.clerkId,
        name: pendingEntry.user.name,
      });
    }

    res.status(200).json({ session, message: "Participant rejected" });
  } catch (error) {
    console.log("Error in rejectParticipant controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getScheduledSessions(req, res) {
  try {
    const clerkId = req.user.clerkId;
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "scheduled",
      $or: [
        { host: userId },
        { interviewerId: clerkId },
        { candidateId: clerkId },
      ],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ scheduledAt: 1 });

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getScheduledSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Join a session using a join code
export async function joinSessionByCode(req, res) {
  try {
    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(400).json({ message: "Join code is required" });
    }

    const session = await Session.findOne({
      joinCode: joinCode.toUpperCase(),
    });

    if (!session) {
      return res.status(404).json({ message: "Invalid or expired code" });
    }

    if (session.status === "completed" || session.status === "cancelled" || session.status === "expired") {
      return res.status(404).json({ message: "Invalid or expired code" });
    }

    res.status(200).json({ sessionId: session._id });
  } catch (error) {
    console.log("Error in joinSessionByCode controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Push/change problem for a session (interviewer only)
export async function pushProblem(req, res) {
  try {
    const { id } = req.params;
    const { problemId } = req.body;
    const userId = req.user._id;

    if (!problemId) {
      return res.status(400).json({ message: "problemId is required" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only the host (interviewer) can push problems
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the interviewer can push problems" });
    }

    // Look up the problem to get title and difficulty
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Update session with new problem
    session.problemId = problemId;
    session.problem = problem.title;
    session.difficulty = problem.difficulty?.toLowerCase();
    await session.save();

    // Broadcast to all clients in the session room via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("problem:pushed", {
        problemId,
        problemTitle: problem.title,
        difficulty: problem.difficulty,
      });
    }

    res.status(200).json({ session, message: "Problem pushed successfully" });
  } catch (error) {
    console.log("Error in pushProblem controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
