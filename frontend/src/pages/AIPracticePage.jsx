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

  // ─── Skill badge helpers ──────
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

  const skillBadgeStyle = {
    Strong: "badge-success",
    Average: "badge-warning",
    Weak: "badge-error",
    New: "badge-ghost",
  };

  // ─── AI recommendation helpers ──────
  const getWeakestTopic = () => {
    const sessions = JSON.parse(
      localStorage.getItem("talentiq_topic_scores") || "{}"
    );
    if (Object.keys(sessions).length === 0) return null;
    return Object.entries(sessions)
      .sort((a, b) => a[1] - b[1])[0];
  };

  const weakestTopic = getWeakestTopic();

  // ─── Multi-topic toggle handler ──────
  const handleTopicToggle = (t) => {
    setSelectedTopics((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      if (prev.length >= 5) {
        toast.error("Max 5 topics allowed");
        return prev;
      }
      return [...prev, t];
    });
    setShowTopicWarning(false);
  };

  // ─── Streak helpers ──────
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

  // ─── Skills extraction helper ──────
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

  // ─── Download report helper ──────
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

  // ─── Handle session start ──────
  const handleStart = async () => {
    try {
      if (selectedMode === "topic" && selectedTopics.length === 0) {
        setShowTopicWarning(true);
        return;
      }
      if (selectedMode === "resume" && !resumeFile) {
        toast.error("Please upload your resume");
        return;
      }
      if (!selectedMode) {
        toast.error("Please select a mode");
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
      toast.error(error.response?.data?.message || "Failed to start session");
    }
  };

  // ─── Handle sending answer ────
  const handleSendAnswer = async ({ userAnswer, timeTaken }) => {
    try {
      const result = await sendAnswer({ userAnswer, timeTaken });
      if (result?.isComplete) {
        setScreen("loading_feedback");
        handleEndSession();
      }
      return result;
    } catch (error) {
      toast.error("Failed to send answer");
    }
  };

  // ─── Handle end session ───────
  const handleEndSession = async () => {
    setScreen("loading_feedback");
    try {
      const totalDuration = Math.round(
        (Date.now() - (sessionStartRef.current || Date.now())) / 1000
      );
      const result = await endSession({ totalDuration });
      if (result?.xpResult?.xpEarned) {
        toast.success(`+${result.xpResult.xpEarned} XP earned! 🎉`, { duration: 4000 });
      }
      if (result?.xpResult?.leveledUp) {
        toast.success(
          `🚀 Level Up! You are now ${result.xpResult.newLevelTitle}!`,
          { duration: 6000 }
        );
      }
      if (result?.xpResult?.newBadges?.length > 0) {
        const badge = BADGE_DEFINITIONS_MAP[result.xpResult.newBadges[0]];
        toast.success(
          `${badge?.emoji || "🏅"} New badge: ${badge?.label || result.xpResult.newBadges[0]}`,
          { duration: 5000 }
        );
      }
      setScreen("feedback");
    } catch (error) {
      toast.error("Failed to get feedback");
      setScreen("interview");
    }
  };

  // ─── Handle restart ───────────
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

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  // ── STATE 1: SETUP ──
  if (screen === "setup") {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <SparklesIcon className="size-6 text-white" />
              </div>
              <h1 className="text-3xl font-black">AI Practice Interview</h1>
            </div>
            <p className="text-base-content/60 max-w-lg mx-auto">
              Sharpen your skills with AI-powered mock interviews. Get real-time
              questions and detailed feedback on your performance.
            </p>
          </div>

          {/* 7-Day Streak Strip */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-base-content/50 mr-1">🔥 Streak:</span>
            {DAY_LABELS.map((day) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${streakDays[day]
                    ? "bg-primary border-primary text-primary-content"
                    : day === today
                      ? "border-primary text-primary"
                      : "border-base-300 text-base-content/30"
                  }`}>
                  {day[0]}
                </div>
                <span className="text-[9px] text-base-content/40">{day}</span>
              </div>
            ))}
          </div>

          {/* History + Quick Retry Buttons */}
          <div className="flex justify-end gap-2 mb-4">
            {JSON.parse(localStorage.getItem("talentiq_last_session") || "null") && (
              <button
                className="btn btn-outline btn-sm gap-2"
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
              className="btn btn-outline btn-sm gap-2"
              onClick={() => navigate("/ai-practice/history")}
            >
              <HistoryIcon className="size-4" />
              View History
            </button>
          </div>

          {/* AI Recommendation Banner */}
          {weakestTopic && (
            <div className="alert alert-success mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4" />
                <span className="text-sm">
                  <strong>AI suggests:</strong> Practice {weakestTopic[0]} · Medium
                  (your weakest topic — score: {weakestTopic[1]}/10)
                </span>
              </div>
              <button
                className="btn btn-success btn-sm"
                onClick={() => {
                  setSelectedMode("topic");
                  setSelectedTopics([weakestTopic[0]]);
                  setSelectedDifficulty("Medium");
                }}
              >
                Use this →
              </button>
            </div>
          )}

          {/* Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* ── Topic Mode Card ── */}
            <div
              className={`card bg-base-100 shadow-md border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedMode === "topic"
                  ? "border-primary shadow-primary/10"
                  : "border-base-300"
                }`}
              onClick={() => setSelectedMode("topic")}
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center ${selectedMode === "topic"
                        ? "bg-primary text-primary-content"
                        : "bg-base-300"
                      }`}
                  >
                    <BookOpenIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Practice by Topic</h3>
                    <p className="text-xs text-base-content/60">
                      Choose a topic and difficulty. AI will interview you.
                    </p>
                  </div>
                </div>

                {selectedMode === "topic" && (
                  <div className="mt-2 space-y-4 animate-in fade-in">
                    {/* Topic Pills */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Select Topic (up to 3)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map((t) => (
                          <button
                            key={t}
                            className={`btn btn-sm relative ${selectedTopics.includes(t) ? "btn-primary" : "btn-outline"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTopicToggle(t);
                            }}
                          >
                            {t}
                            <span className={`badge badge-xs ${skillBadgeStyle[getTopicSkillLevel(t)]}`}>
                              {getTopicSkillLevel(t)}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Inline topic warning */}
                      {showTopicWarning && (
                        <div className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                          <AlertTriangleIcon className="size-3" />
                          Select at least 1 topic to continue
                        </div>
                      )}

                      {/* Live complexity indicator */}
                      {selectedTopics.length > 0 && (
                        <p className="text-xs text-base-content/50 mt-1">
                          {selectedTopics.length} topic{selectedTopics.length > 1 ? "s" : ""} selected
                          {selectedTopics.length === 2 && " · Moderate complexity"}
                          {selectedTopics.length === 3 && " · High complexity"}
                        </p>
                      )}
                    </div>

                    {/* Difficulty Toggle */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Difficulty
                      </label>
                      <div className="join">
                        {DIFFICULTIES.map((d) => (
                          <button
                            key={d}
                            className={`btn btn-sm join-item ${selectedDifficulty === d
                                ? d === "Easy"
                                  ? "btn-success"
                                  : d === "Medium"
                                    ? "btn-warning"
                                    : "btn-error"
                                : "btn-outline"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDifficulty(d);
                            }}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interview Type */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Interview Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {INTERVIEW_TYPES.map((type) => (
                          <button
                            key={type}
                            className={`btn btn-xs ${interviewType === type
                                ? "btn-primary"
                                : "btn-outline"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInterviewType(type);
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Number of Questions
                      </label>
                      <div className="join">
                        {QUESTION_LIMITS.map((q) => (
                          <button
                            key={q}
                            className={`btn btn-sm join-item ${questionLimit === q
                                ? "btn-primary"
                                : "btn-outline"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuestionLimit(q);
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Duration
                      </label>
                      <div className="join">
                        {DURATIONS.map((d) => (
                          <button
                            key={d}
                            className={`btn btn-sm join-item ${duration === d
                                ? "btn-secondary"
                                : "btn-outline"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDuration(d);
                            }}
                          >
                            {d} min
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interviewer Persona */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Interviewer Persona
                      </label>
                      <div className="flex gap-2">
                        {PERSONAS.map((p) => (
                          <button
                            key={p.value}
                            className={`btn btn-sm flex-1 gap-1 ${persona === p.value ? "btn-primary" : "btn-outline"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPersona(p.value);
                            }}
                          >
                            {p.emoji} {p.value}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-base-content/40 mt-1">
                        {PERSONAS.find((p) => p.value === persona)?.desc}
                      </p>
                    </div>

                    {/* Voice Mode Toggle */}
                    <div className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold">🎤 Voice Mode</p>
                        <p className="text-xs text-base-content/40">
                          Speak your answers using microphone
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={voiceModeEnabled}
                        onChange={(e) => {
                          e.stopPropagation();
                          setVoiceModeEnabled(e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Resume Mode Card ── */}
            <div
              className={`card bg-base-100 shadow-md border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedMode === "resume"
                  ? "border-secondary shadow-secondary/10"
                  : "border-base-300"
                }`}
              onClick={() => setSelectedMode("resume")}
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center ${selectedMode === "resume"
                        ? "bg-secondary text-secondary-content"
                        : "bg-base-300"
                      }`}
                  >
                    <FileTextIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      Practice from Resume
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Upload your resume. AI asks questions based on your
                      experience.
                    </p>
                  </div>
                </div>

                {selectedMode === "resume" && (
                  <div className="mt-2 animate-in fade-in">
                    <div
                      className="border-2 border-dashed border-base-300 rounded-xl p-6 text-center hover:border-secondary transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type === "application/pdf") {
                          setResumeFile(file);
                          setDetectedSkills(extractSkillsFromFilename(file.name));
                        } else {
                          toast.error("Only PDF files are accepted");
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
                          <div className="flex items-center justify-center gap-2 text-secondary">
                            <FileTextIcon className="size-5" />
                            <span className="font-medium">
                              {resumeFile.name}
                            </span>
                          </div>
                          {detectedSkills.length > 0 && (
                            <div className="mt-3 text-left">
                              <p className="text-xs font-semibold text-base-content/60 mb-1">
                                Skills detected from filename:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {detectedSkills.map((skill) => (
                                  <span key={skill} className="badge badge-secondary badge-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-base-content/40 mt-2">
                            AI will analyze your full resume content and ask role-specific questions
                          </p>
                        </>
                      ) : (
                        <>
                          <UploadIcon className="size-8 mx-auto mb-2 text-base-content/40" />
                          <p className="text-sm text-base-content/60">
                            Drag & drop or click to upload
                          </p>
                          <p className="text-xs text-base-content/40 mt-1">
                            PDF only • Max 5MB
                          </p>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-base-content/50 mt-2 text-center">
                      AI will analyze your resume and ask relevant questions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Preview Card */}
          {selectedMode === "topic" && selectedTopics.length > 0 && (
            <div className="card bg-base-100 border border-primary/30 shadow mb-6">
              <div className="card-body py-3 px-5">
                <p className="text-sm font-semibold text-base-content/70 mb-1">
                  Session Preview
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span>📚 {selectedTopics.join(" + ")}</span>
                  <span>🎯 {selectedDifficulty}</span>
                  <span>❓ {questionLimit} questions</span>
                  <span>⏱ ~{duration} min</span>
                  <span>💼 {interviewType}</span>
                  <span>{PERSONAS.find((p) => p.value === persona)?.emoji} {persona}</span>
                  {voiceModeEnabled && <span>🎤 Voice On</span>}
                </div>
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="text-center">
            <button
              className="btn btn-primary btn-lg gap-2 px-10 shadow-lg"
              disabled={isLoading}
              onClick={handleStart}
            >
              {isLoading ? (
                <Loader2Icon className="size-5 animate-spin" />
              ) : (
                <SparklesIcon className="size-5" />
              )}
              Start Practice Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STATE 2: INTERVIEW ──
  if (screen === "interview") {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
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
        </div>
      </div>
    );
  }

  // ── STATE 3: LOADING FEEDBACK ──
  if (screen === "loading_feedback") {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <div className="relative">
            <div className="size-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse shadow-2xl">
              <SparklesIcon className="size-10 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold mt-4">
            AI is evaluating your performance...
          </h2>
          <p className="text-base-content/60">
            This usually takes 10–15 seconds
          </p>
          <Loader2Icon className="size-6 animate-spin text-primary mt-2" />
        </div>
      </div>
    );
  }

  // ── STATE 4: FEEDBACK ──
  if (screen === "feedback") {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
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
          <div className="flex justify-center gap-4 mt-8">
            <button
              className="btn btn-primary gap-2"
              onClick={handleReset}
            >
              <RotateCcwIcon className="size-4" />
              Practice Again
            </button>
            <button
              className="btn btn-outline gap-2"
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
              <DownloadIcon className="size-4" />
              Download Report
            </button>
            <button
              className="btn btn-outline gap-2"
              onClick={() => navigate("/ai-practice/history")}
            >
              <HistoryIcon className="size-4" />
              View History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AIPracticePage;
