import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled", "expired"],
      default: "active",
    },
    scheduledAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    interviewerId: {
      type: String, // Clerk userId
    },
    candidateId: {
      type: String, // Clerk userId
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: false,
    },
    // stream video call ID
    callId: {
      type: String,
      default: "",
    },
    // Secure join code
    joinCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    joinLink: {
      type: String,
    },
    candidateEmail: {
      type: String,
    },
    // Waiting room: candidates pending host approval
    pendingParticipants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
    feedback: {
      codeQuality: { type: Number, min: 1, max: 5 },
      problemSolving: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      decision: { type: String, enum: ["hire", "no-hire", "maybe"] },
      notes: { type: String },
    },
    aiReview: {
      scores: { type: Object },
      suggestions: { type: String },
      completedAt: { type: Date },
    },
    tabViolations: [
      {
        count: { type: Number },
        timestamp: { type: Date },
      },
    ],
    violations: [
      {
        userId: String,
        type: { type: String, enum: ["tab_switch", "window_blur"] },
        timestamp: { type: Date, default: Date.now },
        count: Number,
      },
    ],
    chatHistory: [
      {
        sender: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
