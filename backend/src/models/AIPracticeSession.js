import mongoose from "mongoose";

const aiPracticeSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  mode: {
    type: String,
    enum: ["topic", "resume"],
    required: true,
  },

  // For topic mode
  topic: { type: String },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
  },

  // For resume mode
  resumeText: { type: String },

  // Interviewer persona
  persona: {
    type: String,
    enum: ["Friendly", "Neutral", "Strict"],
    default: "Neutral",
  },

  // Adaptive difficulty tracking
  currentDifficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  consecutiveHighScores: { type: Number, default: 0 },
  consecutiveLowScores: { type: Number, default: 0 },

  // Voice mode
  voiceModeEnabled: { type: Boolean, default: false },

  // Conversation
  messages: [
    {
      role: { type: String, enum: ["ai", "user"] },
      content: { type: String },
      timeTaken: { type: Number },
      timestamp: { type: Date, default: Date.now },
    },
  ],

  // Final scorecard
  feedback: {
    overallScore: { type: Number },
    communication: { type: Number },
    technicalDepth: { type: Number },
    problemSolving: { type: Number },
    confidence: { type: Number },
    clarity: { type: Number },
    depth: { type: Number },
    correctness: { type: Number },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    summary: { type: String },
    companyReadiness: {
      Google: { type: Number },
      Amazon: { type: Number },
      Meta: { type: Number },
      Microsoft: { type: Number },
    },
    questionBreakdown: [
      {
        question: { type: String },
        score: { type: Number },
        comment: { type: String },
        idealAnswer: { type: String },
        clarityScore: { type: Number },
        depthScore: { type: Number },
        correctnessScore: { type: Number },
        weaknessTags: [{ type: String }],
        gapExplanation: { type: String },
      },
    ],
  },

  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },

  totalDuration: { type: Number },
  questionCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

// ─── Compound Index ──────────────────────────────────────────────
// Query: getSessions (paginated history for a user)
aiPracticeSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

const AIPracticeSession = mongoose.model("AIPracticeSession", aiPracticeSessionSchema);
export default AIPracticeSession;
