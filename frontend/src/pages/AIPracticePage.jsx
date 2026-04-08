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
        toast.error("Max 5 topics allowed", { style: { background: '#ffffff', color: '#0f172a' } });
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
        toast.error("Please upload your resume", { style: { background: '#ffffff', color: '#0f172a' } });
        return;
      }
      if (!selectedMode) {
        toast.error("Please select a mode", { style: { background: '#ffffff', color: '#0f172a' } });
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
      toast.error(error.response?.data?.message || "Failed to start session", { style: { background: '#ffffff', color: '#0f172a' } });
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
      toast.error("Failed to send answer", { style: { background: '#ffffff', color: '#0f172a' } });
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
        toast.success(`+${result.xpResult.xpEarned} XP earned! 🎉`, { duration: 4000, style: { background: '#ffffff', color: '#0f172a' } });
      }
      if (result?.xpResult?.leveledUp) {
        toast.success(
          `🚀 Level Up! You are now ${result.xpResult.newLevelTitle}!`,
          { duration: 6000, style: { background: '#ffffff', color: '#0f172a' } }
        );
      }
      if (result?.xpResult?.newBadges?.length > 0) {
        const badge = BADGE_DEFINITIONS_MAP[result.xpResult.newBadges[0]];
        toast.success(
          `${badge?.emoji || "🏅"} New badge: ${badge?.label || result.xpResult.newBadges[0]}`,
          { duration: 5000, style: { background: '#ffffff', color: '#0f172a' } }
        );
      }
      setScreen("feedback");
    } catch (error) {
      toast.error("Failed to get feedback", { style: { background: '#ffffff', color: '#0f172a' } });
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
    if (diff === "Easy") return "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]";
    if (diff === "Medium") return "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]";
    if (diff === "Hard") return "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]";
    return "";
  };

  // ── STATE 1: SETUP ──
  if (screen === "setup") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[var(--dark-bg)] text-[var(--dark-text)]">
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
              <div className="size-12 rounded-2xl bg-gradient-to-br from-[var(--dark-accent)] to-[var(--dark-accent-hover)] flex items-center justify-center shadow-lg">
                <SparklesIcon className="size-6 text-white" />
              </div>
              <h1 className="text-3xl font-black">AI Practice Interview</h1>
            </div>
            <p className="text-[var(--dark-text-secondary)] max-w-lg mx-auto">
              Sharpen your skills with AI-powered mock interviews. Get real-time
              questions and detailed feedback on your performance.
            </p>
          </div>

          {/* 7-Day Streak Strip */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-[var(--dark-text-secondary)] mr-1">🔥 Streak:</span>
            {DAY_LABELS.map((day) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  streakDays[day]
                    ? "bg-[var(--dark-accent)] border-[var(--dark-accent)] text-white"
                    : day === today
                      ? "border-[var(--dark-accent)] text-[var(--dark-accent)]"
                      : "border-[var(--dark-border)] text-[var(--dark-text-tertiary)]"
                }`}>
                  {day[0]}
                </div>
                <span className="text-[9px] text-[var(--dark-text-tertiary)]">{day}</span>
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
            <div className="bg-[var(--dark-accent-bg)] border border-[var(--dark-accent-border)] rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[var(--dark-accent)] text-sm">
                <SparklesIcon className="size-4 shrink-0" />
                <span>
                  <strong>AI suggests:</strong> Practice {weakestTopic[0]} · Medium
                  <span className="text-[var(--dark-text-secondary)] ml-1">(weakest topic — score: {weakestTopic[1]}/10)</span>
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
                selectedMode === "topic" ? "border-[var(--dark-accent)] shadow-[0_0_0_1px_var(--dark-accent)]" : "border-transparent"
              }`}
              onClick={() => setSelectedMode("topic")}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                  selectedMode === "topic" ? "bg-[var(--dark-accent)] text-white" : "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)]"
                }`}>
                  <BookOpenIcon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--dark-text)]">Practice by Topic</h3>
                  <p className="text-xs text-[var(--dark-text-secondary)]">
                    Choose a topic and difficulty. AI will interview you.
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {selectedMode === "topic" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-5 overflow-hidden">
                    {/* Topic Pills */}
                    <div>
                      <label className="text-sm font-semibold text-[var(--dark-text)] mb-2 block">
                        Select Topic (up to 3)
                      </label>
                      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Select Topics">
                        {TOPICS.map((t) => {
                          const isSelected = selectedTopics.includes(t);
                          return (
                            <button
                              key={t}
                              role="option"
                              aria-selected={isSelected}
                              className={`rounded-full px-3 py-1 text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--dark-accent)] focus:ring-offset-[var(--dark-bg)] ${
                                isSelected
                                  ? "bg-[var(--dark-accent-bg)] text-[var(--dark-accent)] border-[var(--dark-accent)]"
                                  : "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)] border-[var(--dark-border)] hover:bg-[var(--dark-accent-bg)] hover:text-[var(--dark-accent)] hover:border-[var(--dark-accent-border)]"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTopicToggle(t);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  e.currentTarget.nextElementSibling?.focus();
                                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  e.currentTarget.previousElementSibling?.focus();
                                }
                              }}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {showTopicWarning && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[var(--color-danger)] text-xs mt-2 flex items-center gap-1">
                            <AlertTriangleIcon className="size-3" />
                            Select at least 1 topic to continue
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Difficulty Pills */}
                    <div>
                      <label className="text-sm font-semibold text-[var(--dark-text)] mb-2 block">Difficulty</label>
                      <div className="flex gap-2" role="listbox" aria-label="Select Difficulty">
                        {DIFFICULTIES.map((d) => {
                          const isSelected = selectedDifficulty === d;
                          return (
                            <button
                              key={d}
                              role="option"
                              aria-selected={isSelected}
                              className={`rounded-full px-3 py-1 text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--dark-accent)] focus:ring-offset-[var(--dark-bg)] ${
                                isSelected ? getDifficultyColor(d) : "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)] border-[var(--dark-border)] hover:bg-[var(--dark-border)] hover:text-[var(--dark-text)]"
                              }`}
                              onClick={(e) => { e.stopPropagation(); setSelectedDifficulty(d); }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  e.currentTarget.nextElementSibling?.focus();
                                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  e.currentTarget.previousElementSibling?.focus();
                                }
                              }}
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
                      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Select Interview Type">
                        {INTERVIEW_TYPES.map((type) => (
                          <button
                            key={type}
                            role="option"
                            aria-selected={interviewType === type}
                            className={`rounded-full px-3 py-1 text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--dark-accent)] focus:ring-offset-[var(--dark-bg)] ${
                              interviewType === type 
                                ? "bg-[var(--dark-accent-bg)] text-[var(--dark-accent)] border-[var(--dark-accent)]" 
                                : "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)] border-[var(--dark-border)] hover:bg-[var(--dark-border)] hover:text-[var(--dark-text)]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setInterviewType(type); }}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                e.currentTarget.nextElementSibling?.focus();
                              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                e.preventDefault();
                                e.currentTarget.previousElementSibling?.focus();
                              }
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Questions Limit</label>
                      <div className="flex gap-2" role="listbox" aria-label="Select Questions Limit">
                        {QUESTION_LIMITS.map((q) => (
                          <button
                            key={q}
                            role="option"
                            aria-selected={questionLimit === q}
                            className={`rounded-full px-3 py-1 text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--dark-accent)] focus:ring-offset-[var(--dark-bg)] ${
                              questionLimit === q
                                ? "bg-[var(--dark-accent)] text-white border-[var(--dark-accent)]"
                                : "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)] border-[var(--dark-border)] hover:bg-[var(--dark-border)] hover:text-[var(--dark-text)]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setQuestionLimit(q); }}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                e.currentTarget.nextElementSibling?.focus();
                              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                e.preventDefault();
                                e.currentTarget.previousElementSibling?.focus();
                              }
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Duration</label>
                      <div className="flex gap-2" role="listbox" aria-label="Select Duration">
                        {DURATIONS.map((d) => (
                          <button
                            key={d}
                            role="option"
                            aria-selected={duration === d}
                            className={`rounded-full px-3 py-1 text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--dark-accent)] focus:ring-offset-[var(--dark-bg)] ${
                              duration === d
                                ? "bg-[var(--dark-accent-bg)] text-[var(--dark-accent)] border-[var(--dark-accent)]"
                                : "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)] border-[var(--dark-border)] hover:bg-[var(--dark-border)] hover:text-[var(--dark-text)]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setDuration(d); }}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                e.currentTarget.nextElementSibling?.focus();
                              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                e.preventDefault();
                                e.currentTarget.previousElementSibling?.focus();
                              }
                            }}
                          >
                            {d} min
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interviewer Persona */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Interviewer Persona</label>
                      <div className="flex gap-2" role="listbox" aria-label="Select Persona">
                        {PERSONAS.map((p) => (
                          <button
                            key={p.value}
                            role="option"
                            aria-selected={persona === p.value}
                            className={`rounded-full px-3 py-1 text-sm border transition-colors flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--dark-accent)] focus:ring-offset-[var(--dark-bg)] ${
                              persona === p.value
                                ? "bg-[var(--dark-accent-bg)] text-[var(--dark-accent)] border-[var(--dark-accent)]"
                                : "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)] border-[var(--dark-border)] hover:bg-[var(--dark-border)] hover:text-[var(--dark-text)]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setPersona(p.value); }}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                e.currentTarget.nextElementSibling?.focus();
                              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                e.preventDefault();
                                e.currentTarget.previousElementSibling?.focus();
                              }
                            }}
                          >
                            {p.emoji} {p.value}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[var(--dark-card)] rounded-xl border border-[var(--dark-border)]">
                      <div>
                        <p className="text-sm font-semibold text-[var(--dark-text)]">🎤 Voice Mode</p>
                        <p className="text-xs text-[var(--dark-text-secondary)]">Speak answers using microphone</p>
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
                selectedMode === "resume" ? "border-[var(--dark-accent)] shadow-[0_0_0_1px_var(--dark-accent)]" : "border-transparent"
              }`}
              onClick={() => setSelectedMode("resume")}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                  selectedMode === "resume" ? "bg-[var(--dark-accent)] text-white" : "bg-[var(--dark-elevated)] text-[var(--dark-text-secondary)]"
                }`}>
                  <FileTextIcon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--dark-text)]">Practice from Resume</h3>
                  <p className="text-xs text-[var(--dark-text-secondary)]">
                    Upload your resume. AI asks experience-based questions.
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {selectedMode === "resume" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden w-full">
                    <div
                      className="border-2 border-dashed border-[var(--dark-border)] rounded-xl p-6 text-center hover:border-[var(--dark-accent)] transition-colors cursor-pointer bg-[var(--dark-card)]"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type === "application/pdf") {
                          setResumeFile(file);
                          setDetectedSkills(extractSkillsFromFilename(file.name));
                        } else {
                          toast.error("Only PDF files are accepted", { style: { background: '#ffffff', color: '#0f172a' } });
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
                          <div className="flex items-center justify-center gap-2 text-[var(--dark-accent)]">
                            <FileTextIcon className="size-5 shrink-0" />
                            <span className="font-medium truncate">{resumeFile.name}</span>
                          </div>
                          {detectedSkills.length > 0 && (
                            <div className="mt-4 text-left">
                              <p className="text-xs font-semibold text-[var(--dark-text-secondary)] mb-2 uppercase tracking-wide">
                                Detected Skills:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {detectedSkills.map((skill) => (
                                  <span key={skill} className="bg-[var(--dark-accent-bg)] border border-[var(--dark-accent-border)] text-[var(--dark-accent)] text-xs px-2 py-0.5 rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-[var(--dark-text-secondary)] mt-3">
                            AI will analyze your full resume content
                          </p>
                        </>
                      ) : (
                        <>
                          <UploadIcon className="size-8 mx-auto mb-3 text-[var(--dark-text-tertiary)]" />
                          <p className="text-sm text-[var(--dark-text)]">Drag & drop or click to upload</p>
                          <p className="text-xs text-[var(--dark-text-secondary)] mt-1">PDF only • Max 5MB</p>
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
                  <div className="card-dark border-l-2 border-[var(--dark-accent)] p-4 mb-6">
                    <p className="text-xs font-semibold text-[var(--dark-text-secondary)] uppercase tracking-wider mb-2">
                      Session Preview
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--dark-text)]">
                      <span className="flex items-center gap-1.5"><BookOpenIcon className="size-4 text-[var(--dark-accent)]" /> {selectedTopics.join(", ")}</span>
                      <span className="flex items-center gap-1.5"><SparklesIcon className="size-4 text-[var(--dark-accent)]" /> {selectedDifficulty}</span>
                      <span className="flex items-center gap-1.5"><AlertTriangleIcon className="size-4 text-[var(--dark-accent)]" /> {questionLimit} qs</span>
                      <span className="flex items-center gap-1.5">⏱ ~{duration} min</span>
                      <span className="flex items-center gap-1.5 capitalize text-[var(--dark-text-secondary)]">{interviewType}</span>
                      {voiceModeEnabled && <span className="text-[var(--dark-accent)] flex items-center gap-1">🎤 Voice</span>}
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
      <div className="min-h-screen bg-[var(--dark-bg)] flex flex-col">
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
      <div className="min-h-screen bg-[var(--dark-bg)] text-[var(--dark-text)]">
        <Navbar />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="relative">
            <div className="size-20 rounded-full bg-[var(--dark-elevated)] border border-[var(--dark-border)] flex items-center justify-center shadow-2xl">
              <SparklesIcon className="size-10 text-[var(--dark-accent)] animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-[var(--dark-text)]">Generating your scorecard...</h2>
            <p className="text-[var(--dark-text-secondary)] text-sm">AI is evaluating your performance across {questionCount} questions.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── STATE 4: FEEDBACK ──
  if (screen === "feedback") {
    return (
      <div className="min-h-screen bg-[var(--dark-bg)] text-[var(--dark-text)]">
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
