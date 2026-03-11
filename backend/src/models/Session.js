import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
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
      enum: ["scheduled", "active", "completed", "cancelled"],
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
    },
    // stream video call ID
    callId: {
      type: String,
      default: "",
    },
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
