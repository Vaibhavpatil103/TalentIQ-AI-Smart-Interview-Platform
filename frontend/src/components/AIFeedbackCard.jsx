import {
  BrainCircuitIcon, Loader2Icon, SparklesIcon,
  ClockIcon, MessageSquareIcon, TrophyIcon,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";

function AIFeedbackCard({ variant = "practice", aiReview, feedback, sessionMeta }) {

  // ═══════════════════════════════════════════
  // CODE-REVIEW VARIANT (unchanged)
  // ═══════════════════════════════════════════
  if (variant === "code-review") {
    if (!aiReview) {
      return (
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body items-center text-center py-8">
            <Loader2Icon className="size-8 animate-spin text-primary mb-3" />
            <h3 className="text-lg font-semibold">AI Review in Progress...</h3>
            <p className="text-base-content/60 text-sm">
              Our AI is analyzing the submitted code. This usually takes 10-30 seconds.
            </p>
          </div>
        </div>
      );
    }
    const { scores, suggestions, completedAt } = aiReview;
    const getScoreColor = (score) => {
      if (score >= 4) return "text-success";
      if (score >= 3) return "text-warning";
      return "text-error";
    };
    const getScoreBar = (score) => {
      const percentage = (score / 5) * 100;
      const color = score >= 4 ? "bg-success" : score >= 3 ? "bg-warning" : "bg-error";
      return (
        <div className="w-full bg-base-300 rounded-full h-2">
          <div className={`${color} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }} />
        </div>
      );
    };
    return (
      <div className="card bg-gradient-to-br from-base-100 to-primary/5 shadow-lg border border-primary/20">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BrainCircuitIcon className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                AI Code Review <SparklesIcon className="size-4 text-primary" />
              </h3>
              {completedAt && (
                <p className="text-xs text-base-content/50">
                  Reviewed {new Date(completedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          {scores && (
            <div className="space-y-3 mb-5">
              {Object.entries(scores).map(([key, score]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className={`font-bold ${getScoreColor(score)}`}>{score}/5</span>
                  </div>
                  {getScoreBar(score)}
                </div>
              ))}
            </div>
          )}
          {suggestions && (
            <div className="bg-base-200 rounded-lg p-4 border border-base-300">
              <h4 className="font-semibold text-sm mb-2 text-primary">💡 Suggestions</h4>
              <p className="text-sm text-base-content/80 leading-relaxed">{suggestions}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PRACTICE VARIANT (extended)
  // ═══════════════════════════════════════════
  if (!feedback) {
    return (
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body items-center text-center py-8">
          <Loader2Icon className="size-8 animate-spin text-primary mb-3" />
          <h3 className="text-lg font-semibold">Generating Feedback...</h3>
          <p className="text-base-content/60 text-sm">AI is evaluating your interview performance.</p>
        </div>
      </div>
    );
  }

  const getColor10 = (score) => {
    if (score >= 7) return "text-success";
    if (score >= 4) return "text-warning";
    return "text-error";
  };
  const getBarColor10 = (score) => {
    if (score >= 7) return "bg-success";
    if (score >= 4) return "bg-warning";
    return "bg-error";
  };
  const scoreBadgeColor = (score) => {
    if (score >= 7) return "badge-success";
    if (score >= 4) return "badge-warning";
    return "badge-error";
  };
  const scoreBar = (label, score) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={`font-bold ${getColor10(score)}`}>{score}/10</span>
      </div>
      <div className="w-full bg-base-300 rounded-full h-2">
        <div className={`${getBarColor10(score)} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${(score / 10) * 100}%` }} />
      </div>
    </div>
  );
  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    return `${Math.round(seconds / 60)} min`;
  };

  // Radar chart data
  const radarData = [
    { skill: "Communication", score: feedback.communication || 0 },
    { skill: "Technical", score: feedback.technicalDepth || 0 },
    { skill: "Problem Solving", score: feedback.problemSolving || 0 },
    { skill: "Confidence", score: feedback.confidence || 0 },
    { skill: "Clarity", score: feedback.clarity || 0 },
    { skill: "Depth", score: feedback.depth || 0 },
    { skill: "Correctness", score: feedback.correctness || 0 },
    { skill: "Overall", score: feedback.overallScore || 0 },
  ];

  return (
    <div className="card bg-gradient-to-br from-base-100 to-primary/5 shadow-xl border border-primary/20">
      <div className="card-body">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <TrophyIcon className="size-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              Interview Scorecard <SparklesIcon className="size-4 text-primary" />
            </h3>
          </div>
        </div>

        {/* ── Session Meta Badges ── */}
        {sessionMeta && (
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`badge badge-sm ${sessionMeta.mode === "topic" ? "badge-info" : "badge-secondary"}`}>
              {sessionMeta.mode === "topic" ? "Topic" : "Resume"}
            </span>
            {sessionMeta.topic && <span className="badge badge-sm badge-outline">{sessionMeta.topic}</span>}
            {sessionMeta.difficulty && (
              <span className={`badge badge-sm ${
                sessionMeta.difficulty === "Easy" ? "badge-success"
                : sessionMeta.difficulty === "Medium" ? "badge-warning" : "badge-error"
              }`}>{sessionMeta.difficulty}</span>
            )}
            <span className="badge badge-sm badge-ghost gap-1">
              <ClockIcon className="size-3" />{formatDuration(sessionMeta.totalDuration)}
            </span>
            <span className="badge badge-sm badge-ghost gap-1">
              <MessageSquareIcon className="size-3" />{sessionMeta.questionCount || 0} questions
            </span>
          </div>
        )}

        {/* ── Overall Score Ring ── */}
        <div className="flex justify-center mb-6">
          <div className="relative inline-flex items-center justify-center">
            <svg width="120" height="120" className="-rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor"
                strokeWidth="6" className="text-base-300" />
              <circle cx="60" cy="60" r="50" fill="none"
                stroke={feedback.overallScore >= 7 ? "#22c55e" : feedback.overallScore >= 4 ? "#f59e0b" : "#ef4444"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - feedback.overallScore / 10)}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-black ${getColor10(feedback.overallScore)}`}>
                {feedback.overallScore}
              </span>
              <span className="text-xs text-base-content/50">/10</span>
            </div>
          </div>
        </div>

        {/* ── Score Bars (original 4 + new 3) ── */}
        <div className="space-y-3 mb-6">
          {scoreBar("Communication", feedback.communication)}
          {scoreBar("Technical Depth", feedback.technicalDepth)}
          {scoreBar("Problem Solving", feedback.problemSolving)}
          {scoreBar("Confidence", feedback.confidence)}
          {scoreBar("Clarity", feedback.clarity || 0)}
          {scoreBar("Depth", feedback.depth || 0)}
          {scoreBar("Correctness", feedback.correctness || 0)}
        </div>

        {/* ── Skill Radar Chart ── */}
        <div className="card bg-base-200 border border-base-300 mb-5">
          <div className="card-body py-4">
            <h4 className="font-semibold text-sm mb-2 text-primary">
              🕸 Skill Radar
            </h4>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="skill"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <PolarRadiusAxis domain={[0, 10]}
                  tick={{ fontSize: 8, fill: "#6B7280" }} />
                <Radar dataKey="score" stroke="#22C55E"
                  fill="#22C55E" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip formatter={(v) => [`${v}/10`, "Score"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Summary ── */}
        {feedback.summary && (
          <div className="bg-base-200 rounded-lg p-4 border border-base-300 mb-5">
            <h4 className="font-semibold text-sm mb-2 text-primary">📝 Summary</h4>
            <p className="text-sm text-base-content/80 leading-relaxed">{feedback.summary}</p>
          </div>
        )}

        {/* ── Company Readiness ── */}
        {feedback.companyReadiness && (
          <div className="card bg-base-200 border border-base-300 mb-5">
            <div className="card-body py-4">
              <h4 className="font-semibold text-sm mb-3 text-primary">
                🏢 Company Readiness
              </h4>
              <div className="space-y-2">
                {Object.entries(feedback.companyReadiness).map(([co, pct]) => (
                  <div key={co} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24">{co}</span>
                    <progress className={`progress flex-1 ${
                      pct >= 70 ? "progress-success"
                      : pct >= 40 ? "progress-warning"
                      : "progress-error"
                    }`} value={pct} max={100} />
                    <span className="text-sm font-mono w-12 text-right">
                      {pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Strengths & Improvements ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {feedback.strengths?.length > 0 && (
            <div className="bg-success/10 rounded-lg p-4 border border-success/20">
              <h4 className="font-semibold text-sm mb-2 text-success">💪 Strengths</h4>
              <ul className="space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.improvements?.length > 0 && (
            <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
              <h4 className="font-semibold text-sm mb-2 text-warning">📈 Areas to Improve</h4>
              <ul className="space-y-1">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-warning mt-0.5">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Extended Question Breakdown ── */}
        {feedback.questionBreakdown?.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3 text-primary">
              📋 Question Breakdown
            </h4>
            <div className="space-y-4">
              {feedback.questionBreakdown.map((q, i) => (
                <div key={i} className="card bg-base-200 border border-base-300">
                  <div className="card-body py-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm font-semibold flex-1">
                        Q{i + 1}: {q.question}
                      </p>
                      <span className={`badge badge-lg flex-shrink-0 ${scoreBadgeColor(q.score)}`}>
                        {q.score}/10
                      </span>
                    </div>

                    {/* Per-question sub-scores */}
                    <div className="flex gap-2 mb-3">
                      {[
                        { label: "Clarity", val: q.clarityScore },
                        { label: "Depth", val: q.depthScore },
                        { label: "Correctness", val: q.correctnessScore },
                      ].map((m) => (
                        <div key={m.label}
                          className="flex-1 text-center bg-base-300 rounded-lg p-2">
                          <p className="text-xs text-base-content/50">
                            {m.label}
                          </p>
                          <p className={`font-bold text-sm ${getColor10(m.val || 0)}`}>
                            {m.val || 0}/10
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Ideal Answer */}
                    {q.idealAnswer && (
                      <div className="bg-success/10 border border-success/30 rounded-lg p-3 mb-2">
                        <p className="text-xs font-semibold text-success mb-1">
                          ✅ Ideal Answer
                        </p>
                        <p className="text-xs text-base-content/70 leading-relaxed">
                          {q.idealAnswer}
                        </p>
                      </div>
                    )}

                    {/* Gap Explanation */}
                    {q.gapExplanation && (
                      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-2">
                        <p className="text-xs font-semibold text-warning mb-1">
                          ⚠ Gap
                        </p>
                        <p className="text-xs text-base-content/70">
                          {q.gapExplanation}
                        </p>
                      </div>
                    )}

                    {/* Weakness Tags */}
                    {q.weaknessTags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {q.weaknessTags.map((tag) => (
                          <span key={tag} className="badge badge-error badge-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comment */}
                    {q.comment && (
                      <p className="text-xs text-base-content/50 mt-2 italic">
                        {q.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFeedbackCard;
