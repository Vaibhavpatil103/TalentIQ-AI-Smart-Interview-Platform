import { useState, useEffect } from "react";
import { TrophyIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import XPProgressBar from "../components/XPProgressBar";
import CompanyTrackCard from "../components/CompanyTrackCard";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const TRACK_DEFINITIONS = {
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

function CompanyTracksPage() {
  const [progress, setProgress] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingTrack, setStartingTrack] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progressRes, tracksRes] = await Promise.all([
        axiosInstance.get("/gamification/progress"),
        axiosInstance.get("/gamification/tracks"),
      ]);
      setProgress(progressRes.data);
      setTracks(tracksRes.data.tracks);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrack = async (company) => {
    setStartingTrack(company);
    try {
      await axiosInstance.post(`/gamification/tracks/${company}`);
      toast.success(`${company} track started! 🎯`, { style: { background: '#1c2128', color: '#e6edf3' }});
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start track", { style: { background: '#1c2128', color: '#e6edf3' }});
    } finally {
      setStartingTrack(null);
    }
  };

  const startedCount = tracks.filter((t) => t.started).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="size-14 rounded-2xl bg-[#1c2128] border border-[#30363d] shadow-lg flex items-center justify-center">
              <TrophyIcon className="size-7 text-[#d29922]" />
            </div>
            <h1 className="text-3xl font-black text-[#e6edf3]">Company Tracks</h1>
          </div>
          <p className="text-[#7d8590]">
            Practice curated question sequences designed for top tech companies.
          </p>
        </motion.div>

        {/* XP Bar */}
        {progress && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <XPProgressBar
              xp={progress.progress.xp}
              level={progress.progress.level}
              levelTitle={progress.currentLevelData?.title}
              nextLevelTitle={progress.nextLevelData?.title}
              xpToNext={progress.xpToNext}
              xpForCurrentLevel={progress.currentLevelData?.xpRequired || 0}
            />
          </motion.div>
        )}

        {/* Summary */}
        {startedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-3 bg-[#58a6ff10] border border-[#58a6ff40] p-4 rounded-xl mb-8"
          >
            <span className="text-xl">🎯</span>
            <span className="text-sm text-[#e6edf3]">
              You are currently preparing for <strong className="text-[#58a6ff]">{startedCount}</strong>{" "}
              {startedCount === 1 ? "company" : "companies"}. Keep up the great work!
            </span>
          </motion.div>
        )}

        {/* Company Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Object.entries(TRACK_DEFINITIONS).map(([company, def]) => {
            const userTrack = tracks.find((t) => t.company === company);
            return (
              <motion.div variants={itemVariants} className="h-full" key={company}>
                <CompanyTrackCard
                  company={company}
                  emoji={def.emoji}
                  color={def.color}
                  topics={def.topics}
                  completedTopics={userTrack?.completedTopics || []}
                  started={!!userTrack?.started}
                  onStart={() => handleStartTrack(company)}
                  isLoading={startingTrack === company}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export default CompanyTracksPage;
