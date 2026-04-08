import {
  TrophyIcon,
  MessageSquareIcon,
  CodeIcon,
  LightbulbIcon,
  TargetIcon,
  TrendingUpIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  BuildingIcon,
  TimerIcon,
  BookOpenIcon,
  SparklesIcon,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";
import { motion } from "framer-motion";

function AIFeedbackCard({ feedback, variant = "code-review", sessionMeta }) {
  if (!feedback) return null;

  const features =
    variant === "code-review"
      ? [
          {
            label: "Code Quality",
            score: feedback.codeQuality,
            icon: CodeIcon,
            color: "#ffffff",
            desc: "Readability, maintainability, and best practices",
          },
          {
            label: "Efficiency",
            score: feedback.efficiency,
            icon: TimerIcon,
            color: "#d29922",
            desc: "Time and space complexity",
          },
          {
            label: "Edge Cases",
            score: feedback.edgeCases,
            icon: TargetIcon,
            color: "#f85149",
            desc: "Handling boundary conditions",
          },
        ]
      : [
          {
            label: "Communication",
            score: feedback.communication,
            icon: MessageSquareIcon,
            color: "#a371f7",
            desc: "Clarity and conciseness of explanations",
          },
          {
            label: "Technical Depth",
            score: feedback.technicalDepth,
            icon: CodeIcon,
            color: "#58a6ff",
            desc: "Understanding of underlying concepts",
          },
          {
            label: "Problem Solving",
            score: feedback.problemSolving,
            icon: LightbulbIcon,
            color: "#d29922",
            desc: "Approach to finding solutions",
          },
          {
            label: "Confidence",
            score: feedback.confidence,
            icon: TrophyIcon,
            color: "#ffffff",
            desc: "Delivery and assurance",
          },
        ];

  const chartData = features.map((f) => ({
    subject: f.label,
    A: f.score,
    fullMark: 10,
  }));

  const ScoreRing = ({ score }) => {
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference - (score / 10) * circumference;

    return (
      <div className="relative size-32 mx-auto flex items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 80 80">
          <circle
            className="text-[#30363d] stroke-current"
            strokeWidth="6"
            cx="40"
            cy="40"
            r="36"
            fill="transparent"
          />
          <motion.circle
            className="text-[#ffffff] stroke-current drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            strokeWidth="6"
            strokeLinecap="round"
            cx="40"
            cy="40"
            r="36"
            fill="transparent"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-[#e6edf3]">
            {score}
            <span className="text-base text-[#7d8590]">/10</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffffff]">
            Score
          </span>
        </div>
      </div>
    );
  };

  const getReadinessLevel = (company, overallScore) => {
    const thresholds = {
      "Google": { score: 8.5 },
      "Amazon": { score: 8.0 },
      "Startup": { score: 7.0 }
    };

    const req = thresholds[company].score;
    if (overallScore >= req) return { text: "Ready", color: "text-[#ffffff]", bg: "bg-[#ffffff20]", border: "border-[#ffffff40]", progress: "bg-[#ffffff]", emoji: "🟢" };
    if (overallScore >= req - 1) return { text: "Almost", color: "text-[#d29922]", bg: "bg-[#d2992220]", border: "border-[#d2992240]", progress: "bg-[#d29922]", emoji: "🟡" };
    return { text: "Needs Work", color: "text-[#f85149]", bg: "bg-[#f8514920]", border: "border-[#f8514940]", progress: "bg-[#f85149]", emoji: "🔴" };
  };

  return (
    <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
      {/* HEADER SECTION */}
      <div className="bg-[#161b22] border-b border-[#30363d] p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffffff] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0">
            <ScoreRing score={feedback.overallScore} />
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <SparklesIcon className="size-5 text-[#ffffff]" />
                <h2 className="text-2xl font-bold text-[#e6edf3]">Interview Feedback</h2>
              </div>
              
              {sessionMeta && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="text-xs bg-[#0d1117] text-[#7d8590] border border-[#30363d] px-2 py-1 rounded-md flex items-center gap-1.5">
                    <BookOpenIcon className="size-3" /> {sessionMeta.topic || "General"}
                  </span>
                  <span className="text-xs bg-[#0d1117] text-[#7d8590] border border-[#30363d] px-2 py-1 rounded-md flex items-center gap-1.5 capitalize">
                    <TargetIcon className="size-3" /> {sessionMeta.difficulty}
                  </span>
                  <span className="text-xs bg-[#0d1117] text-[#7d8590] border border-[#30363d] px-2 py-1 rounded-md flex items-center gap-1.5">
                    <TimerIcon className="size-3" /> {Math.ceil(sessionMeta.totalDuration / 60)} min
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-[#e6edf3] text-[15px] leading-relaxed max-w-2xl bg-[#0d1117] p-4 rounded-xl border border-[#30363d]">
              {feedback.summary}
            </p>
          </div>
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="p-6 lg:p-8 space-y-8 bg-[#0d1117]">
        {/* SKILLS RADAR & BARS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Radar Chart */}
          <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 h-[320px] shadow-sm flex flex-col items-center justify-center relative">
            <h3 className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider absolute top-6 left-6 flex items-center gap-2">
              <TargetIcon className="size-4 text-[#ffffff]" /> Skills Radar
            </h3>
            <div className="w-full h-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#30363d" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#7d8590", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "var(--dark-text-tertiary)" }} tickCount={6} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#ffffff"
                    fill="#ffffff"
                    fillOpacity={0.2}
                    isAnimationActive={true}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Bars */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider mb-2 flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-[#ffffff]" /> Score Breakdown
            </h3>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-[#1c2128] border border-[#30363d] rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                        <Icon className="size-4" />
                      </div>
                      <span className="font-semibold text-[#e6edf3] text-sm">{feature.label}</span>
                    </div>
                    <span className="font-bold text-[#e6edf3]">{feature.score}<span className="text-[#7d8590] text-xs font-normal">/10</span></span>
                  </div>
                  
                  <div className="h-2 w-full bg-[#0d1117] rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: feature.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(feature.score / 10) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <p className="text-[#7d8590] text-xs">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMPANY READINESS PREDICTION */}
        {variant !== "code-review" && (
          <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider mb-6 flex items-center gap-2">
              <BuildingIcon className="size-4 text-[#ffffff]" /> Target Company Readiness
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Google", "Amazon", "Startup"].map((company) => {
                const status = getReadinessLevel(company, feedback.overallScore);
                return (
                  <div key={company} className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-xl p-4 flex flex-col items-center text-center gap-2 relative overflow-hidden group hover:border-[var(--dark-text-tertiary)] transition-colors">
                    <div className="text-2xl mb-1">{status.emoji}</div>
                    <p className="font-bold text-[#e6edf3]">{company}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1 rounded-full border ${status.bg} ${status.color} ${status.border}`}>
                      {status.text}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs text-[var(--dark-text-tertiary)] mt-4 uppercase tracking-widest font-semibold">
              *Based on AI analysis of historical interview data
            </p>
          </div>
        )}

        {/* STRENGTHS & IMPROVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 shadow-sm hover:border-[#ffffff40] transition-colors">
            <h3 className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider mb-5 flex items-center gap-2">
              <CheckCircle2Icon className="size-4 text-[#ffffff]" /> Key Strengths
            </h3>
            <ul className="space-y-4">
              {feedback.strengths?.map((strength, index) => (
                <motion.li 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: index * 0.1 }} 
                  key={index} 
                  className="flex items-start gap-3"
                >
                  <div className="mt-1 flex-shrink-0 size-5 rounded-full bg-[#ffffff20] flex items-center justify-center">
                    <div className="size-1.5 bg-[#ffffff] rounded-full" />
                  </div>
                  <span className="text-[#e6edf3] text-sm leading-relaxed">{strength}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 shadow-sm hover:border-[#f8514940] transition-colors">
            <h3 className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider mb-5 flex items-center gap-2">
              <AlertCircleIcon className="size-4 text-[#f85149]" /> Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {feedback.improvements?.map((improvement, index) => (
                <motion.li 
                  initial={{ opacity: 0, x: 10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: index * 0.1 }} 
                  key={index} 
                  className="flex items-start gap-3"
                >
                  <div className="mt-1 flex-shrink-0 size-5 rounded-full bg-[#f8514920] flex items-center justify-center">
                    <div className="size-1.5 bg-[#f85149] rounded-full" />
                  </div>
                  <span className="text-[#e6edf3] text-sm leading-relaxed">{improvement}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* DETAILED QUESTION BREAKDOWN */}
        {feedback.questionBreakdown && feedback.questionBreakdown.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-[#e6edf3] mb-6 flex items-center gap-2">
              <CodeIcon className="size-5 text-[#ffffff]" /> Detailed Breakdown
            </h3>
            <div className="space-y-4">
              {feedback.questionBreakdown.map((q, idx) => (
                <div key={idx} className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: q.score >= 8 ? '#ffffff' : q.score >= 5 ? '#d29922' : '#f85149' }} />
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7d8590]">
                        <span>Question {idx + 1}</span>
                      </div>
                      <p className="text-[#e6edf3] font-medium leading-relaxed">{q.question}</p>
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 mt-4">
                        <p className="text-[#7d8590] text-xs uppercase tracking-wider font-semibold mb-2">Feedback Summary</p>
                        <p className="text-sm text-[#e6edf3] leading-relaxed">{q.comment}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="bg-[#ffffff05] border border-[#ffffff20] rounded-xl p-4">
                          <p className="text-[#ffffff] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle2Icon className="size-3" /> Ideal Approach</p>
                          <p className="text-[#e6edf3] text-[13px] leading-relaxed">{q.idealAnswer || "Provide a structured answer starting with core concepts."}</p>
                        </div>
                        <div className="bg-[#f8514905] border border-[#f8514920] rounded-xl p-4">
                          <p className="text-[#f85149] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><AlertCircleIcon className="size-3" /> Missing Elements</p>
                          <p className="text-[#e6edf3] text-[13px] leading-relaxed">{q.gapExplanation || "Lacked specific examples or deep technical details."}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-start justify-end md:w-24">
                      <div className="text-center bg-[#0d1117] border border-[#30363d] rounded-xl p-3 w-full">
                        <span className="block text-2xl font-black text-[#e6edf3]">{q.score}</span>
                        <span className="block text-[10px] uppercase tracking-widest text-[#7d8590] font-bold mt-1">Score</span>
                      </div>
                    </div>
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
