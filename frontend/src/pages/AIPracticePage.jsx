import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  BookOpenIcon,
  FileTextIcon,
  Loader2Icon,
  SparklesIcon,
  UploadIcon,
  HistoryIcon,
  RotateCcwIcon,
  DownloadIcon,
  AlertTriangleIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AIChatInterface from "../components/AIChatInterface";
import AIFeedbackCard from "../components/AIFeedbackCard";
import { useAIPractice } from "../hooks/useAIPractice";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const TOPICS = [
  "Arrays", "Linked Lists", "Trees", "Dynamic Programming",
  "Graphs", "System Design", "React", "Node.js", "SQL", "Behavioral",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const INTERVIEW_TYPES = [
  "Coding Interview", "Technical Q&A", "System Design",
  "Behavioral", "HR Interview",
];

const QUESTION_LIMITS = [3, 5, 8, 10];
const DURATIONS = [15, 30, 45, 60];

const PERSONAS = [
  { value: "Friendly", emoji: "😊", desc: "Warm & encouraging" },
  { value: "Neutral", emoji: "🎯", desc: "Professional" },
  { value: "Strict", emoji: "⚡", desc: "Challenging & direct" },
];

const BADGE_DEFINITIONS_MAP = {
  first_session: { emoji: "🚀", label: "First Steps" },
  streak_3: { emoji: "🔥", label: "3-Day Streak" },
  streak_7: { emoji: "⚡", label: "Week Warrior" },
  perfect_score: { emoji: "💎", label: "Perfect 10" },
  sessions_10: { emoji: "🏅", label: "Decade" },
  sessions_50: { emoji: "🏆", label: "Half Century" },
  voice_mode: { emoji: "🎤", label: "Vocal" },
  strict_mode: { emoji: "⚔️", label: "Battle Tested" },
  hard_difficulty: { emoji: "💪", label: "Hard Mode" },
  resume_upload: { emoji: "📄", label: "Resume Pro" },
  all_topics: { emoji: "🌍", label: "Polyglot" },
  google_ready: { emoji: "🟢", label: "Google Ready" },
  amazon_ready: { emoji: "🟠", label: "Amazon Ready" },
};

function AIPracticePage() {
  const navigate = useNavigate();
  const {
    sessionId, messages, isLoading, isComplete, feedback,
    mode, questionCount, startTime,
    startSession, sendAnswer, endSession, reset,
  } = useAIPractice();

  const [screen, setScreen] = useState("setup");
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [resumeFile, setResumeFile] = useState(null);
  const [interviewType, setInterviewType] = useState("Coding Interview");
  const [questionLimit, setQuestionLimit] = useState(5);
  const [duration, setDuration] = useState(30);
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [showTopicWarning, setShowTopicWarning] = useState(false);
  const [persona, setPersona] = useState("Neutral");
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const fileInputRef = useRef(null);
  const sessionStartRef = useRef(null);

  const getTopicSkillLevel = (topic) => {
    const sessions = JSON.parse(
      localStorage.getItem("talentiq_topic_scores") || "{}"
    );
    const score = sessions[topic];
    if (!score) return "New";
    if (score >= 7) return "Strong";
    if (score >= 4) return "Average";
    return "Weak";
  };

  const getWeakestTopic = () => {
    const sessions = JSON.parse(
      localStorage.getItem("talentiq_topic_scores") || "{}"
    );
    if (Object.keys(sessions).length === 0) return null;
    return Object.entries(sessions)
      .sort((a, b) => a[1] - b[1])[0];
  };

  const weakestTopic = getWeakestTopic();

  const handleTopicToggle = (t) => {
    setSelectedTopics((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      if (prev.length >= 5) {
        toast.error("Max 5 topics allowed", { style: { background: '#1c2128', color: '#e6edf3' } });
        return prev;
      }
      return [...prev, t];
    });
    setShowTopicWarning(false);
  };

  const getStreak = () => {
    const data = JSON.parse(
      localStorage.getItem("talentiq_streak") ||
      '{"days":{"Mon":false,"Tue":false,"Wed":false,"Thu":false,"Fri":false,"Sat":false,"Sun":false}}'
    );
    return data.days;
  };
  const streakDays = getStreak();
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = DAY_LABELS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const extractSkillsFromFilename = (filename) => {
    const knownSkills = [
      "React", "Node", "JavaScript", "TypeScript", "Python", "Java",
      "MongoDB", "SQL", "PostgreSQL", "Express", "Next", "Vue",
      "Docker", "AWS", "Git", "Redux", "GraphQL", "Spring", "Django",
      "Flutter", "Kotlin", "Swift", "Angular", "PHP", "Ruby",
    ];
    return knownSkills.filter((skill) =>
      filename?.toLowerCase().includes(skill.toLowerCase())
    );
  };

  const handleDownloadReport = (feedback, sessionMeta) => {
    const lines = [
      "TALENTIQ — INTERVIEW REPORT",
      "════════════════════════════════",
      `Date:       ${new Date().toLocaleDateString()}`,
      `Topic:      ${sessionMeta?.topic || "Resume Interview"}`,
      `Type:       ${sessionMeta?.interviewType || "—"}`,
      `Difficulty: ${sessionMeta?.difficulty || "—"}`,
      `Persona:    ${sessionMeta?.persona || "Neutral"}`,
      `Duration:   ${Math.round((sessionMeta?.totalDuration || 0) / 60)} min`,
      `Questions:  ${sessionMeta?.questionCount || 0}`,
      "",
      "── SCORES ──────────────────────",
      `Overall Score:    ${feedback?.overallScore || 0}/10`,
      `Communication:    ${feedback?.communication || 0}/10`,
      `Technical Depth:  ${feedback?.technicalDepth || 0}/10`,
      `Problem Solving:  ${feedback?.problemSolving || 0}/10`,
      `Confidence:       ${feedback?.confidence || 0}/10`,
      "",
      "── STRENGTHS ───────────────────",
      ...(feedback?.strengths?.map((s) => `• ${s}`) || ["—"]),
      "",
      "── IMPROVEMENTS ────────────────",
      ...(feedback?.improvements?.map((i) => `• ${i}`) || ["—"]),
      "",
      "── SUMMARY ─────────────────────",
      feedback?.summary || "—",
      "",
      "── QUESTION BREAKDOWN ──────────",
      ...(feedback?.questionBreakdown?.flatMap((q, i) => [
        `Q${i + 1}: ${q.question}`,
        `     Score: ${q.score}/10 — ${q.comment}`,
        "",
      ]) || ["—"]),
      "════════════════════════════════",
      "Generated by TalentIQ",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TalentIQ_Report_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStart = async () => {
    try {
      if (selectedMode === "topic" && selectedTopics.length === 0) {
        setShowTopicWarning(true);
        return;
      }
      if (selectedMode === "resume" && !resumeFile) {
        toast.error("Please upload your resume", { style: { background: '#1c2128', color: '#e6edf3' } });
        return;
      }
      if (!selectedMode) {
        toast.error("Please select a mode", { style: { background: '#1c2128', color: '#e6edf3' } });
        return;
      }

      sessionStartRef.current = Date.now();

      await startSession({
        mode: selectedMode,
        topic: selectedTopics.join(", "),
        difficulty: selectedDifficulty,
        interviewType,
        persona,
        voiceModeEnabled,
        resumeFile,
      });

      localStorage.setItem(
        "talentiq_last_session",
        JSON.stringify({
          mode: selectedMode,
          topics: selectedTopics,
          difficulty: selectedDifficulty,
          interviewType,
          persona,
          voiceModeEnabled,
          questionLimit,
          duration,
        })
      );

      setScreen("interview");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start session", { style: { background: '#1c2128', color: '#e6edf3' } });
    }
  };

  const handleSendAnswer = async ({ userAnswer, timeTaken }) => {
    try {
      const result = await sendAnswer({ userAnswer, timeTaken });
      if (result?.isComplete) {
        setScreen("loading_feedback");
        handleEndSession();
      }
      return result;
    } catch (error) {
      toast.error("Failed to send answer", { style: { background: '#1c2128', color: '#e6edf3' } });
    }
  };

  const handleEndSession = async () => {
    setScreen("loading_feedback");
    try {
      const totalDuration = Math.round(
        (Date.now() - (sessionStartRef.current || Date.now())) / 1000
      );
      const result = await endSession({ totalDuration });
      if (result?.xpResult?.xpEarned) {
        toast.success(`+${result.xpResult.xpEarned} XP earned! 🎉`, { duration: 4000, style: { background: '#1c2128', color: '#e6edf3' } });
      }
      if (result?.xpResult?.leveledUp) {
        toast.success(
          `🚀 Level Up! You are now ${result.xpResult.newLevelTitle}!`,
          { duration: 6000, style: { background: '#1c2128', color: '#e6edf3' } }
        );
      }
      if (result?.xpResult?.newBadges?.length > 0) {
        const badge = BADGE_DEFINITIONS_MAP[result.xpResult.newBadges[0]];
        toast.success(
          `${badge?.emoji || "🏅"} New badge: ${badge?.label || result.xpResult.newBadges[0]}`,
          { duration: 5000, style: { background: '#1c2128', color: '#e6edf3' } }
        );
      }
      setScreen("feedback");
    } catch (error) {
      toast.error("Failed to get feedback", { style: { background: '#1c2128', color: '#e6edf3' } });
      setScreen("interview");
    }
  };

  const handleReset = () => {
    reset();
    setScreen("setup");
    setSelectedMode(null);
    setSelectedTopics([]);
    setSelectedDifficulty("Medium");
    setResumeFile(null);
    setInterviewType("Coding Interview");
    setQuestionLimit(5);
    setDuration(30);
    setDetectedSkills([]);
    setShowTopicWarning(false);
    setPersona("Neutral");
    setVoiceModeEnabled(false);
  };

  const getDifficultyColor = (diff) => {
    if (diff === "Easy") return "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e]";
    if (diff === "Medium") return "bg-[#d2992220] text-[#d29922] border-[#d29922]";
    if (diff === "Hard") return "bg-[#f8514920] text-[#f85149] border-[#f85149]";
    return "";
  };

  // ── STATE 1: SETUP ──
  if (screen === "setup") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }} 
          className="max-w-4xl mx-auto px-4 py-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-[#2cbe4e] to-[#1a7f37] flex items-center justify-center shadow-lg">
                <SparklesIcon className="size-6 text-white" />
              </div>
              <h1 className="text-3xl font-black">AI Practice Interview</h1>
            </div>
            <p className="text-[#7d8590] max-w-lg mx-auto">
              Sharpen your skills with AI-powered mock interviews. Get real-time
              questions and detailed feedback on your performance.
            </p>
          </div>

          {/* 7-Day Streak Strip */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-[#7d8590] mr-1">🔥 Streak:</span>
            {DAY_LABELS.map((day) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  streakDays[day]
                    ? "bg-[#2cbe4e] border-[#2cbe4e] text-[#0d1117]"
                    : day === today
                      ? "border-[#2cbe4e] text-[#2cbe4e]"
                      : "border-[#30363d] text-[#484f58]"
                }`}>
                  {day[0]}
                </div>
                <span className="text-[9px] text-[#484f58]">{day}</span>
              </div>
            ))}
          </div>

          {/* History + Quick Retry Buttons */}
          <div className="flex justify-end gap-3 mb-4">
            {JSON.parse(localStorage.getItem("talentiq_last_session") || "null") && (
              <button
                className="btn-outline-dark px-3 py-1.5 text-sm gap-2"
                onClick={() => {
                  const last = JSON.parse(localStorage.getItem("talentiq_last_session"));
                  if (last) {
                    setSelectedMode(last.mode);
                    setSelectedTopics(last.topics || []);
                    setSelectedDifficulty(last.difficulty);
                    setInterviewType(last.interviewType);
                    setPersona(last.persona);
                    setVoiceModeEnabled(last.voiceModeEnabled);
                    setQuestionLimit(last.questionLimit);
                    setDuration(last.duration);
                  }
                }}
              >
                ⚡ Quick Retry
              </button>
            )}
            <button
              className="btn-outline-dark px-3 py-1.5 text-sm gap-2 flex items-center"
              onClick={() => navigate("/ai-practice/history")}
            >
              <HistoryIcon className="size-4" />
              View History
            </button>
          </div>

          {/* AI Recommendation Banner */}
          {weakestTopic && (
            <div className="bg-[#2cbe4e10] border border-[#2cbe4e30] rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[#2cbe4e] text-sm">
                <SparklesIcon className="size-4 shrink-0" />
                <span>
                  <strong>AI suggests:</strong> Practice {weakestTopic[0]} · Medium
                  <span className="text-[#2cbe4e] ml-1">(weakest topic — score: {weakestTopic[1]}/10)</span>
                </span>
              </div>
              <button
                className="btn-green text-sm px-4 py-1.5"
                onClick={() => {
                  setSelectedMode("topic");
                  setSelectedTopics([weakestTopic[0]]);
                  setSelectedDifficulty("Medium");
                }}
              >
                Use this &rarr;
              </button>
            </div>
          )}

          {/* Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* ── Topic Mode Card ── */}
            <div
              className={`card-dark-hover p-6 cursor-pointer border-2 transition-all duration-200 ${
                selectedMode === "topic" ? "border-[#2cbe4e] shadow-[0_0_0_1px_#2cbe4e]" : "border-transparent"
              }`}
              onClick={() => setSelectedMode("topic")}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                  selectedMode === "topic" ? "bg-[#2cbe4e] text-black" : "bg-[#1c2128] text-[#7d8590]"
                }`}>
                  <BookOpenIcon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#e6edf3]">Practice by Topic</h3>
                  <p className="text-xs text-[#7d8590]">
                    Choose a topic and difficulty. AI will interview you.
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {selectedMode === "topic" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-5 overflow-hidden">
                    {/* Topic Pills */}
                    <div>
                      <label className="text-sm font-semibold text-[#e6edf3] mb-2 block">
                        Select Topic (up to 3)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map((t) => {
                          const isSelected = selectedTopics.includes(t);
                          return (
                            <button
                              key={t}
                              className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                                isSelected
                                  ? "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e]"
                                  : "bg-[#1c2128] text-[#7d8590] border-[#30363d] hover:bg-[#2cbe4e15] hover:text-[#2cbe4e] hover:border-[#2cbe4e40]"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTopicToggle(t);
                              }}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {showTopicWarning && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#f85149] text-xs mt-2 flex items-center gap-1">
                            <AlertTriangleIcon className="size-3" />
                            Select at least 1 topic to continue
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Difficulty Pills */}
                    <div>
                      <label className="text-sm font-semibold text-[#e6edf3] mb-2 block">Difficulty</label>
                      <div className="flex gap-2">
                        {DIFFICULTIES.map((d) => {
                          const isSelected = selectedDifficulty === d;
                          return (
                            <button
                              key={d}
                              className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                                isSelected ? getDifficultyColor(d) : "bg-[#1c2128] text-[#7d8590] border-[#30363d] hover:bg-[#30363d] hover:text-[#e6edf3]"
                              }`}
                              onClick={(e) => { e.stopPropagation(); setSelectedDifficulty(d); }}
                            >
                              {d}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Interview Type */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Interview Type</label>
                      <div className="flex flex-wrap gap-2">
                        {INTERVIEW_TYPES.map((type) => (
                          <button
                            key={type}
                            className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                              interviewType === type 
                                ? "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e]" 
                                : "bg-[#1c2128] text-[#7d8590] border-[#30363d] hover:bg-[#30363d] hover:text-[#e6edf3]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setInterviewType(type); }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Questions Limit</label>
                      <div className="flex gap-2">
                        {QUESTION_LIMITS.map((q) => (
                          <button
                            key={q}
                            className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                              questionLimit === q
                                ? "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e]"
                                : "bg-[#1c2128] text-[#7d8590] border-[#30363d] hover:bg-[#30363d] hover:text-[#e6edf3]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setQuestionLimit(q); }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Duration</label>
                      <div className="flex gap-2">
                        {DURATIONS.map((d) => (
                          <button
                            key={d}
                            className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                              duration === d
                                ? "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e]"
                                : "bg-[#1c2128] text-[#7d8590] border-[#30363d] hover:bg-[#30363d] hover:text-[#e6edf3]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setDuration(d); }}
                          >
                            {d} min
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interviewer Persona */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Interviewer Persona</label>
                      <div className="flex gap-2">
                        {PERSONAS.map((p) => (
                          <button
                            key={p.value}
                            className={`rounded-full px-3 py-1 text-sm border transition-colors flex-1 ${
                              persona === p.value
                                ? "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e]"
                                : "bg-[#1c2128] text-[#7d8590] border-[#30363d] hover:bg-[#30363d] hover:text-[#e6edf3]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setPersona(p.value); }}
                          >
                            {p.emoji} {p.value}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#161b22] rounded-xl border border-[#30363d]">
                      <div>
                        <p className="text-sm font-semibold text-[#e6edf3]">🎤 Voice Mode</p>
                        <p className="text-xs text-[#7d8590]">Speak answers using microphone</p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={voiceModeEnabled}
                        onChange={(e) => { e.stopPropagation(); setVoiceModeEnabled(e.target.checked); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Resume Mode Card ── */}
            <div
              className={`card-dark-hover p-6 cursor-pointer border-2 transition-all duration-200 flex flex-col ${
                selectedMode === "resume" ? "border-[#2cbe4e] shadow-[0_0_0_1px_#2cbe4e]" : "border-transparent"
              }`}
              onClick={() => setSelectedMode("resume")}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                  selectedMode === "resume" ? "bg-[#2cbe4e] text-black" : "bg-[#1c2128] text-[#7d8590]"
                }`}>
                  <FileTextIcon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#e6edf3]">Practice from Resume</h3>
                  <p className="text-xs text-[#7d8590]">
                    Upload your resume. AI asks experience-based questions.
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {selectedMode === "resume" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden w-full">
                    <div
                      className="border-2 border-dashed border-[#30363d] rounded-xl p-6 text-center hover:border-[#2cbe4e] transition-colors cursor-pointer bg-[#161b22]"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type === "application/pdf") {
                          setResumeFile(file);
                          setDetectedSkills(extractSkillsFromFilename(file.name));
                        } else {
                          toast.error("Only PDF files are accepted", { style: { background: '#1c2128', color: '#e6edf3' } });
                        }
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setResumeFile(file);
                          setDetectedSkills(extractSkillsFromFilename(file?.name));
                        }}
                      />
                      {resumeFile ? (
                        <>
                          <div className="flex items-center justify-center gap-2 text-[#2cbe4e]">
                            <FileTextIcon className="size-5 shrink-0" />
                            <span className="font-medium truncate">{resumeFile.name}</span>
                          </div>
                          {detectedSkills.length > 0 && (
                            <div className="mt-4 text-left">
                              <p className="text-xs font-semibold text-[#7d8590] mb-2 uppercase tracking-wide">
                                Detected Skills:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {detectedSkills.map((skill) => (
                                  <span key={skill} className="bg-[#2cbe4e15] border border-[#2cbe4e40] text-[#2cbe4e] text-xs px-2 py-0.5 rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-[#7d8590] mt-3">
                            AI will analyze your full resume content
                          </p>
                        </>
                      ) : (
                        <>
                          <UploadIcon className="size-8 mx-auto mb-3 text-[#484f58]" />
                          <p className="text-sm text-[#e6edf3]">Drag & drop or click to upload</p>
                          <p className="text-xs text-[#7d8590] mt-1">PDF only • Max 5MB</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {(selectedMode === "topic" && selectedTopics.length > 0) || (selectedMode === "resume" && resumeFile) ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                {selectedMode === "topic" && (
                  <div className="card-dark border-l-2 border-[#2cbe4e] p-4 mb-6">
                    <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-wider mb-2">
                      Session Preview
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-[#e6edf3]">
                      <span className="flex items-center gap-1.5"><BookOpenIcon className="size-4 text-[#2cbe4e]" /> {selectedTopics.join(", ")}</span>
                      <span className="flex items-center gap-1.5"><SparklesIcon className="size-4 text-[#2cbe4e]" /> {selectedDifficulty}</span>
                      <span className="flex items-center gap-1.5"><AlertTriangleIcon className="size-4 text-[#2cbe4e]" /> {questionLimit} qs</span>
                      <span className="flex items-center gap-1.5">⏱ ~{duration} min</span>
                      <span className="flex items-center gap-1.5 capitalize text-[#7d8590]">{interviewType}</span>
                      {voiceModeEnabled && <span className="text-[#2cbe4e] flex items-center gap-1">🎤 Voice</span>}
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="btn-green text-base px-10 py-3 w-full sm:w-auto shadow-xl flex items-center justify-center gap-2 mx-auto"
                    disabled={isLoading}
                    onClick={handleStart}
                  >
                    {isLoading ? (
                      <Loader2Icon className="size-5 animate-spin" />
                    ) : (
                      <SparklesIcon className="size-5" />
                    )}
                    Start Practice Session
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }

  // ── STATE 2: INTERVIEW ──
  if (screen === "interview") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col">
        <Navbar />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          <AIChatInterface
            messages={messages}
            onSendAnswer={handleSendAnswer}
            isLoading={isLoading}
            isComplete={isComplete}
            onEndSession={handleEndSession}
            questionCount={questionCount}
            questionLimit={questionLimit}
            durationSeconds={duration * 60}
            persona={persona}
            voiceModeEnabled={voiceModeEnabled}
          />
        </motion.div>
      </div>
    );
  }

  // ── STATE 3: LOADING FEEDBACK ──
  if (screen === "loading_feedback") {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Navbar />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="relative">
            <div className="size-20 rounded-full bg-[#1c2128] border border-[#30363d] flex items-center justify-center shadow-2xl">
              <SparklesIcon className="size-10 text-[#2cbe4e] animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-[#e6edf3]">Generating your scorecard...</h2>
            <p className="text-[#7d8590] text-sm">AI is evaluating your performance across {questionCount} questions.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── STATE 4: FEEDBACK ──
  if (screen === "feedback") {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Navbar />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 py-10">
          <div className="card-dark max-w-3xl mx-auto border-none p-0 overflow-hidden shadow-2xl">
            <AIFeedbackCard
              variant="practice"
              feedback={feedback}
              sessionMeta={{
                mode: selectedMode,
                topic: selectedTopics.join(", "),
                difficulty: selectedDifficulty,
                interviewType,
                persona,
                questionCount,
                totalDuration: Math.round(
                  (Date.now() - (sessionStartRef.current || Date.now())) / 1000
                ),
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button className="btn-green gap-2 flex items-center justify-center px-6" onClick={handleReset}>
              <RotateCcwIcon className="size-4" /> Practice Again
            </button>
            <button
              className="btn-outline-dark gap-2 flex items-center justify-center px-6 h-12"
              onClick={() =>
                handleDownloadReport(feedback, {
                  topic: selectedTopics.join(", "),
                  interviewType,
                  difficulty: selectedDifficulty,
                  persona,
                  questionCount,
                  totalDuration: Math.round(
                    (Date.now() - (sessionStartRef.current || Date.now())) / 1000
                  ),
                })
              }
            >
              <DownloadIcon className="size-4" /> Download Report
            </button>
            <button className="btn-outline-dark gap-2 flex items-center justify-center px-6 h-12" onClick={() => navigate("/ai-practice/history")}>
              <HistoryIcon className="size-4" /> View History
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

export default AIPracticePage;
