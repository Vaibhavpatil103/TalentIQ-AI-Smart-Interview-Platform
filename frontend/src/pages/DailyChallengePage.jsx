import { useState, useEffect } from "react";
import { CalendarIcon, Loader2Icon, SparklesIcon, CheckCircle2Icon } from "lucide-react";
import Navbar from "../components/Navbar";
import XPProgressBar from "../components/XPProgressBar";
import BadgeGrid from "../components/BadgeGrid";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
      ? "text-[#2cbe4e] border-[#2cbe4e40] bg-[#2cbe4e10]"
      : todayQuestion.difficulty === "Medium"
      ? "text-[#d29922] border-[#d2992240] bg-[#d2992210]"
      : "text-[#f85149] border-[#f8514940] bg-[#f8514910]";

  const [xpToast, setXpToast] = useState(false);

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
      setXpToast(res.data.xpEarned || 75);
      if (res.data.newBadges?.length > 0) {
        toast("🏅 New badge earned!", { style: { background: '#1c2128', color: '#e6edf3', border: '1px solid #30363d' }});
      }
      setCompleted(true);
      fetchProgress();
      setTimeout(() => setXpToast(false), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete", { style: { background: '#1c2128', color: '#e6edf3' }});
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 py-12"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="size-14 rounded-2xl bg-[#1c2128] border border-[#30363d] shadow-lg flex items-center justify-center">
              <CalendarIcon className="size-7 text-[#2cbe4e]" />
            </div>
            <h1 className="text-3xl font-black text-[#e6edf3]">Daily Challenge</h1>
          </div>
          <p className="text-[#7d8590]">
            Complete one question every day to build your streak
          </p>
        </div>

        {/* XP Bar */}
        {progress && (
          <div className="mb-8">
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

        {/* XP Toast Notification */}
        {xpToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className="card-dark border-[#2cbe4e] bg-[#2cbe4e10] p-4 text-center mb-6 shadow-[0_0_20px_rgba(44,190,78,0.2)]"
          >
            <p className="text-xl font-bold text-[#2cbe4e]">+{xpToast} XP Earned! 🎉</p>
            <p className="text-sm text-[#7d8590] mt-1">Challenge completed successfully.</p>
          </motion.div>
        )}

        {/* Today's Question Card */}
        <div className="card-dark p-8 border-l-4 border-l-[#2cbe4e] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <CalendarIcon className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#e6edf3] mb-2 drop-shadow-sm">{todayQuestion.title}</h2>
                <div className="flex gap-2">
                  <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full font-bold tracking-widest border ${diffColor}`}>
                    {todayQuestion.difficulty}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7d8590] border border-[#30363d] bg-[#1c2128] px-2.5 py-1 rounded-full">
                    {todayQuestion.topic}
                  </span>
                </div>
              </div>
              <span className="text-4xl drop-shadow-md">📅</span>
            </div>
            
            <p className="text-[15px] text-[#e6edf3] leading-relaxed p-5 bg-[#0d1117] rounded-xl border border-[#30363d] shadow-inner mb-6">
              {todayQuestion.desc}
            </p>

            {/* Countdown / Status */}
            <div className="flex items-center justify-between bg-[#161b22] border border-[#30363d] p-4 rounded-xl mb-6">
              <span className="text-sm font-bold text-[#7d8590] uppercase tracking-wider">
                ⏳ Resets in
              </span>
              <span className="font-mono text-3xl font-black text-[#2cbe4e] tracking-tight drop-shadow-[0_0_8px_rgba(44,190,78,0.4)]">
                {countdown}
              </span>
            </div>

            {/* Complete Button */}
            <div className="text-center">
              {completed ? (
                <div className="flex flex-col items-center justify-center p-4 bg-[#2cbe4e05] border border-[#2cbe4e40] rounded-xl text-center shadow-inner">
                  <CheckCircle2Icon className="size-8 text-[#2cbe4e] mb-2" />
                  <p className="text-[#2cbe4e] font-bold text-lg mb-1">
                    Completed Today!
                  </p>
                  <p className="text-[13px] text-[#7d8590]">
                    Come back tomorrow for a new challenge.
                  </p>
                </div>
              ) : (
                <button
                  className="btn-green w-full py-3.5 text-lg font-bold shadow-[0_4px_14px_rgba(44,190,78,0.3)] hover:shadow-[0_6px_20px_rgba(44,190,78,0.4)] transition-all flex items-center justify-center gap-3"
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
          </div>
        </div>

        {/* Badges */}
        {progress && (
          <div className="card-dark p-6 mt-8">
            <h3 className="text-xs font-bold text-[#7d8590] uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="text-[#d29922]">🏅</span> Your Badges
            </h3>
            <BadgeGrid
              earnedBadges={progress.progress.badges}
              allBadges={progress.allBadges}
            />
          </div>
        )}

      </motion.div>
    </div>
  );
}

export default DailyChallengePage;
