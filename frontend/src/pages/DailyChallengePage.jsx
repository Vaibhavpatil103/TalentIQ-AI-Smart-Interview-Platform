import { useState, useEffect } from "react";
import { CalendarIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import XPProgressBar from "../components/XPProgressBar";
import BadgeGrid from "../components/BadgeGrid";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const DAILY_QUESTIONS = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    desc: "Given an array of integers, return indices of two numbers that add up to a target.",
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stacks",
    desc: "Given a string of brackets, determine if it is valid.",
  },
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    topic: "Linked Lists",
    desc: "Reverse a singly linked list.",
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    desc: "Find the contiguous subarray with the largest sum.",
  },
  {
    title: "LRU Cache",
    difficulty: "Hard",
    topic: "Design",
    desc: "Design a data structure that follows the LRU cache constraint.",
  },
  {
    title: "Binary Tree Level Order",
    difficulty: "Medium",
    topic: "Trees",
    desc: "Return the level order traversal of a binary tree's node values.",
  },
  {
    title: "Course Schedule",
    difficulty: "Medium",
    topic: "Graphs",
    desc: "Determine if you can finish all courses given prerequisites.",
  },
  {
    title: "Coin Change",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    desc: "Find the fewest coins to make up a given amount.",
  },
  {
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    topic: "Linked Lists",
    desc: "Merge k sorted linked lists and return one sorted list.",
  },
  {
    title: "Word Break",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    desc: "Determine if a string can be segmented into dictionary words.",
  },
];

function DailyChallengePage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState("");

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const todayQuestion = DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length];
  const today = new Date().toISOString().split("T")[0];

  const diffColor =
    todayQuestion.difficulty === "Easy"
      ? "badge-success"
      : todayQuestion.difficulty === "Medium"
      ? "badge-warning"
      : "badge-error";

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await axiosInstance.get("/gamification/progress");
      setProgress(res.data);
      if (res.data.progress.dailyChallengeCompleted === today) {
        setCompleted(true);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    setCountdown(`${h}:${m}:${s}`);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await axiosInstance.post("/gamification/daily-complete");
      toast.success(`+${res.data.xpEarned} XP 🎉`);
      if (res.data.newBadges?.length > 0) {
        toast.success("🏅 New badge earned!");
      }
      setCompleted(true);
      fetchProgress();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-warning to-error flex items-center justify-center shadow-lg">
              <CalendarIcon className="size-6 text-white" />
            </div>
            <h1 className="text-3xl font-black">Daily Challenge</h1>
          </div>
          <p className="text-base-content/60">
            Complete one question every day to build your streak
          </p>
        </div>

        {/* XP Bar */}
        {progress && (
          <div className="mb-6">
            <XPProgressBar
              xp={progress.progress.xp}
              level={progress.progress.level}
              levelTitle={progress.currentLevelData?.title}
              nextLevelTitle={progress.nextLevelData?.title}
              xpToNext={progress.xpToNext}
              xpForCurrentLevel={progress.currentLevelData?.xpRequired || 0}
            />
          </div>
        )}

        {/* Today's Question */}
        <div className="card bg-base-100 shadow-lg border border-base-300 mb-6">
          <div className="card-body">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold">{todayQuestion.title}</h2>
                <div className="flex gap-2 mt-1">
                  <span className={`badge badge-sm ${diffColor}`}>
                    {todayQuestion.difficulty}
                  </span>
                  <span className="badge badge-sm badge-outline">
                    {todayQuestion.topic}
                  </span>
                </div>
              </div>
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-sm text-base-content/70 leading-relaxed">
              {todayQuestion.desc}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="card bg-base-100 border border-base-300 mb-6">
          <div className="card-body py-3 flex-row items-center justify-between">
            <span className="text-sm text-base-content/60">
              ⏳ Resets in
            </span>
            <span className="font-mono font-bold text-primary">
              {countdown}
            </span>
          </div>
        </div>

        {/* Complete Button */}
        <div className="text-center mb-8">
          {completed ? (
            <div className="card bg-success/10 border border-success/30">
              <div className="card-body py-4 items-center">
                <p className="text-success font-bold text-lg">
                  ✅ Completed Today!
                </p>
                <p className="text-sm text-base-content/60">
                  Come back tomorrow for a new challenge
                </p>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-lg gap-2 px-10 shadow-lg"
              onClick={handleComplete}
              disabled={completing || loading}
            >
              {completing ? (
                <Loader2Icon className="size-5 animate-spin" />
              ) : (
                <SparklesIcon className="size-5" />
              )}
              Mark as Complete (+75 XP)
            </button>
          )}
        </div>

        {/* Badges */}
        {progress && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">🏅 Your Badges</h3>
            <BadgeGrid
              earnedBadges={progress.progress.badges}
              allBadges={progress.allBadges}
            />
          </div>
        )}

        {/* Leaderboard placeholder */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body py-4 items-center text-center">
            <p className="text-base-content/50 text-sm">
              🏆 Community leaderboard coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyChallengePage;
