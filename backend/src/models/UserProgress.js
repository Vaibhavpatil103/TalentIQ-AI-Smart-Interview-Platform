import mongoose from "mongoose";

export const LEVELS = [
  { level: 1, title: "Junior", xpRequired: 0 },
  { level: 2, title: "Associate", xpRequired: 100 },
  { level: 3, title: "Mid-Level", xpRequired: 250 },
  { level: 4, title: "Senior", xpRequired: 500 },
  { level: 5, title: "Staff", xpRequired: 1000 },
  { level: 6, title: "Senior Staff", xpRequired: 1750 },
  { level: 7, title: "Principal", xpRequired: 2750 },
  { level: 8, title: "Distinguished", xpRequired: 4000 },
  { level: 9, title: "Fellow", xpRequired: 5500 },
  { level: 10, title: "Legend", xpRequired: 7500 },
];

export const XP_REWARDS = {
  session_completed: 50,
  perfect_score: 100,
  streak_day: 25,
  daily_challenge: 75,
  first_session: 150,
};

export const BADGE_DEFINITIONS = [
  { id: "first_session", label: "First Steps", emoji: "🚀", desc: "Complete your first session" },
  { id: "streak_3", label: "3-Day Streak", emoji: "🔥", desc: "Practice 3 days in a row" },
  { id: "streak_7", label: "Week Warrior", emoji: "⚡", desc: "Practice 7 days in a row" },
  { id: "perfect_score", label: "Perfect 10", emoji: "💎", desc: "Score 10/10 overall" },
  { id: "dp_master", label: "DP Master", emoji: "🧠", desc: "Score 8+ on Dynamic Programming" },
  { id: "daily_10", label: "Daily Devotee", emoji: "📅", desc: "Complete 10 daily challenges" },
  { id: "google_ready", label: "Google Ready", emoji: "🟢", desc: "Reach 80% Google readiness" },
  { id: "amazon_ready", label: "Amazon Ready", emoji: "🟠", desc: "Reach 80% Amazon readiness" },
  { id: "sessions_10", label: "Decade", emoji: "🏅", desc: "Complete 10 sessions" },
  { id: "sessions_50", label: "Half Century", emoji: "🏆", desc: "Complete 50 sessions" },
  { id: "voice_mode", label: "Vocal", emoji: "🎤", desc: "Complete a session with voice mode" },
  { id: "strict_mode", label: "Battle Tested", emoji: "⚔️", desc: "Complete a Strict persona session" },
  { id: "hard_difficulty", label: "Hard Mode", emoji: "💪", desc: "Complete a Hard difficulty session" },
  { id: "resume_upload", label: "Resume Pro", emoji: "📄", desc: "Complete a resume-based session" },
  { id: "all_topics", label: "Polyglot", emoji: "🌍", desc: "Practice all 10 topics" },
];

const userProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastSessionDate: { type: String },
  dailyChallengeCompleted: { type: String },
  dailyChallengeCount: { type: Number, default: 0 },
  badges: [{ type: String }],
  practicedTopics: [{ type: String }],
  companyTracks: [
    {
      company: String,
      completedTopics: [String],
      startedAt: Date,
    },
  ],
  totalSessions: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
});

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;
