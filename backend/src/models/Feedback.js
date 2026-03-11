import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    interviewerId: {
      type: String, // Clerk userId
      required: true,
    },
    candidateId: {
      type: String, // Clerk userId
      required: true,
    },
    codeQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    decision: {
      type: String,
      enum: ["hire", "no-hire", "maybe"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
