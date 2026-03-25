import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidateId: { type: String, required: true }, // Clerk ID
    candidateObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterId: { type: String, required: true }, // Clerk ID of job creator
    status: {
      type: String,
      enum: [
        "applied",
        "screening",
        "shortlisted",
        "interview_scheduled",
        "interviewed",
        "offer_sent",
        "hired",
        "rejected",
      ],
      default: "applied",
    },
    resumeUrl: { type: String },
    coverLetter: { type: String },

    // AI Resume matching scores
    matchScore: { type: Number, default: 0 }, // 0-100
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    aiSummary: { type: String },

    // Interview tracking
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },
    interviewScheduledAt: { type: Date },

    // Feedback
    interviewScore: { type: Number },
    interviewNotes: { type: String },
    hiringDecision: {
      type: String,
      enum: ["pending", "hire", "no-hire", "maybe"],
      default: "pending",
    },

    // Offer
    offerSent: { type: Boolean, default: false },
    offerSentAt: { type: Date },
    offerStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected", "negotiating"],
      default: "pending",
    },
    offeredSalary: { type: Number },

    recruiterNotes: { type: String },
  },
  { timestamps: true }
);

// One application per candidate per job
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
