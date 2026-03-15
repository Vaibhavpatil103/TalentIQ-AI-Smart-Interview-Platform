import UserProgress, {
  LEVELS,
  XP_REWARDS,
  BADGE_DEFINITIONS,
} from "../models/UserProgress.js";

const COMPANY_TRACKS = {
  Google: {
    emoji: "🟢",
    color: "green",
    topics: ["Graphs", "Dynamic Programming", "System Design", "Arrays", "Trees"],
  },
  Amazon: {
    emoji: "🟠",
    color: "orange",
    topics: ["Behavioral", "Arrays", "System Design", "Trees", "SQL"],
  },
  Meta: {
    emoji: "🔵",
    color: "blue",
    topics: ["Trees", "Graphs", "React", "System Design", "Dynamic Programming"],
  },
  Microsoft: {
    emoji: "🪟",
    color: "purple",
    topics: ["Arrays", "Node.js", "System Design", "SQL", "Linked Lists"],
  },
  Apple: {
    emoji: "🍎",
    color: "red",
    topics: ["System Design", "SQL", "Trees", "Arrays", "Behavioral"],
  },
};

// ─── Internal XP award (called from aiPracticeController) ──────
export async function awardXPInternal(userId, sessionData) {
  let progress = await UserProgress.findOne({ userId });
  if (!progress) {
    progress = await UserProgress.create({ userId });
  }

  let xpEarned = XP_REWARDS.session_completed;
  const newBadges = [];

  // Perfect score
  if (sessionData.overallScore >= 10) {
    xpEarned += XP_REWARDS.perfect_score;
    if (!progress.badges.includes("perfect_score")) {
      progress.badges.push("perfect_score");
      newBadges.push("perfect_score");
    }
  }

  // Streak
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const twoDaysAgo = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString().split("T")[0];
  const isConsecutive = progress.lastSessionDate === yesterday ||
    progress.lastSessionDate === twoDaysAgo;
  if (isConsecutive) {
    progress.streak += 1;
    xpEarned += XP_REWARDS.streak_day;
  } else if (!isConsecutive && progress.lastSessionDate !== today) {
    progress.streak = 1;
  }
  progress.lastSessionDate = today;

  // Topic tracking
  if (sessionData.topic) {
    const topics = sessionData.topic.split(", ").map((t) => t.trim());
    topics.forEach((t) => {
      if (t && !progress.practicedTopics.includes(t)) {
        progress.practicedTopics.push(t);
      }
    });
  }

  // Increment BEFORE badge checks so thresholds are correct
  progress.totalSessions += 1;
  progress.totalScore += sessionData.overallScore || 0;
  progress.xp += xpEarned;

  // Badge checks
  if (progress.totalSessions === 1 && !progress.badges.includes("first_session")) {
    progress.badges.push("first_session");
    newBadges.push("first_session");
    xpEarned += XP_REWARDS.first_session;
  }
  if (progress.streak >= 3 && !progress.badges.includes("streak_3")) {
    progress.badges.push("streak_3");
    newBadges.push("streak_3");
  }
  if (progress.streak >= 7 && !progress.badges.includes("streak_7")) {
    progress.badges.push("streak_7");
    newBadges.push("streak_7");
  }
  if (progress.totalSessions >= 10 && !progress.badges.includes("sessions_10")) {
    progress.badges.push("sessions_10");
    newBadges.push("sessions_10");
  }
  if (progress.totalSessions >= 50 && !progress.badges.includes("sessions_50")) {
    progress.badges.push("sessions_50");
    newBadges.push("sessions_50");
  }
  if (sessionData.voiceModeEnabled && !progress.badges.includes("voice_mode")) {
    progress.badges.push("voice_mode");
    newBadges.push("voice_mode");
  }
  if (sessionData.persona === "Strict" && !progress.badges.includes("strict_mode")) {
    progress.badges.push("strict_mode");
    newBadges.push("strict_mode");
  }
  if (sessionData.difficulty === "Hard" && !progress.badges.includes("hard_difficulty")) {
    progress.badges.push("hard_difficulty");
    newBadges.push("hard_difficulty");
  }
  if (sessionData.mode === "resume" && !progress.badges.includes("resume_upload")) {
    progress.badges.push("resume_upload");
    newBadges.push("resume_upload");
  }
  if (progress.practicedTopics.length >= 10 && !progress.badges.includes("all_topics")) {
    progress.badges.push("all_topics");
    newBadges.push("all_topics");
  }
  if (
    sessionData.companyReadiness?.Google >= 80 &&
    !progress.badges.includes("google_ready")
  ) {
    progress.badges.push("google_ready");
    newBadges.push("google_ready");
  }
  if (
    sessionData.companyReadiness?.Amazon >= 80 &&
    !progress.badges.includes("amazon_ready")
  ) {
    progress.badges.push("amazon_ready");
    newBadges.push("amazon_ready");
  }
  if (
    sessionData.topic?.includes("Dynamic Programming") &&
    sessionData.overallScore >= 8 &&
    !progress.badges.includes("dp_master")
  ) {
    progress.badges.push("dp_master");
    newBadges.push("dp_master");
  }

  const newLevel = LEVELS.filter((l) => progress.xp >= l.xpRequired).length;
  const leveledUp = newLevel > progress.level;
  progress.level = newLevel;
  await progress.save();

  return {
    xpEarned,
    newBadges,
    leveledUp,
    newLevel,
    newLevelTitle: LEVELS[newLevel - 1]?.title,
    totalXP: progress.xp,
    streak: progress.streak,
  };
}

// ─── GET /gamification/progress ──────
export const getProgress = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }

    const currentLevelData = LEVELS[progress.level - 1];
    const nextLevelData = LEVELS[progress.level] || null;
    const xpToNext = nextLevelData ? nextLevelData.xpRequired - progress.xp : 0;

    return res.json({
      progress,
      currentLevelData,
      nextLevelData,
      xpToNext,
      allBadges: BADGE_DEFINITIONS,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch progress", error: error.message });
  }
};

// ─── POST /gamification/daily-complete ──────
export const completeDailyChallenge = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }

    const today = new Date().toISOString().split("T")[0];
    if (progress.dailyChallengeCompleted === today) {
      return res.status(400).json({ message: "Already completed today" });
    }

    progress.dailyChallengeCompleted = today;
    progress.dailyChallengeCount += 1;
    progress.xp += XP_REWARDS.daily_challenge;

    const newBadges = [];
    if (
      progress.dailyChallengeCount >= 10 &&
      !progress.badges.includes("daily_10")
    ) {
      progress.badges.push("daily_10");
      newBadges.push("daily_10");
    }

    const newLevel = LEVELS.filter((l) => progress.xp >= l.xpRequired).length;
    progress.level = newLevel;
    await progress.save();

    return res.json({
      xpEarned: XP_REWARDS.daily_challenge,
      newBadges,
      progress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to complete challenge", error: error.message });
  }
};

// ─── GET /gamification/tracks ──────
export const getCompanyTracks = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }

    const tracks = Object.entries(COMPANY_TRACKS).map(([company, def]) => {
      const userTrack = progress.companyTracks.find(
        (t) => t.company === company
      );
      return {
        company,
        ...def,
        started: !!userTrack,
        completedTopics: userTrack?.completedTopics || [],
        startedAt: userTrack?.startedAt || null,
      };
    });

    return res.json({ tracks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tracks", error: error.message });
  }
};

// ─── POST /gamification/tracks/:company ──────
export const startCompanyTrack = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const { company } = req.params;

    if (!COMPANY_TRACKS[company]) {
      return res.status(400).json({ message: "Invalid company" });
    }

    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }

    const existing = progress.companyTracks.find((t) => t.company === company);
    if (existing) {
      return res.json({
        message: `${company} track already started`,
        companyTracks: progress.companyTracks,
      });
    }

    progress.companyTracks.push({
      company,
      completedTopics: [],
      startedAt: new Date(),
    });
    await progress.save();

    return res.json({
      message: `${company} track started`,
      companyTracks: progress.companyTracks,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to start track", error: error.message });
  }
};
