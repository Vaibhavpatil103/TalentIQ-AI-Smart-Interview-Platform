import { useState, useEffect } from "react";
import { TrophyIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import XPProgressBar from "../components/XPProgressBar";
import CompanyTrackCard from "../components/CompanyTrackCard";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

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
      toast.success(`${company} track started! 🎯`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start track");
    } finally {
      setStartingTrack(null);
    }
  };

  const startedCount = tracks.filter((t) => t.started).length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg">
              <TrophyIcon className="size-6 text-white" />
            </div>
            <h1 className="text-3xl font-black">Company Tracks</h1>
          </div>
          <p className="text-base-content/60">
            Practice curated question sequences for top companies
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

        {/* Summary */}
        {startedCount > 0 && (
          <div className="alert alert-info mb-6">
            <span className="text-sm">
              🎯 You are preparing for <strong>{startedCount}</strong>{" "}
              {startedCount === 1 ? "company" : "companies"}
            </span>
          </div>
        )}

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(TRACK_DEFINITIONS).map(([company, def]) => {
            const userTrack = tracks.find((t) => t.company === company);
            return (
              <CompanyTrackCard
                key={company}
                company={company}
                emoji={def.emoji}
                color={def.color}
                topics={def.topics}
                completedTopics={userTrack?.completedTopics || []}
                started={!!userTrack?.started}
                onStart={() => handleStartTrack(company)}
                isLoading={startingTrack === company}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CompanyTracksPage;
