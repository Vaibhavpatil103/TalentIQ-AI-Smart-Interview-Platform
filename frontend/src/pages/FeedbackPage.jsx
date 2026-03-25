import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Loader2Icon, ChevronLeftIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import AIFeedbackCard from "../components/AIFeedbackCard";
import { axiosInstance } from "../lib/axios";
import { useAIFeedback } from "../hooks/useAIFeedback";
import { motion, AnimatePresence } from "framer-motion";

function FeedbackPage() {
  const { id: sessionId } = useParams();
  const [feedback, setFeedback] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: aiReview } = useAIFeedback(sessionId);

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      const [feedbackRes, sessionRes] = await Promise.all([
        axiosInstance.get(`/feedback/session/${sessionId}`),
        axiosInstance.get(`/sessions/${sessionId}`),
      ]);
      setFeedback(feedbackRes.data.feedback || []);
      setSession(sessionRes.data.session);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionBadge = (decision) => {
    if (decision === 'hire') return 'badge-easy';
    if (decision === 'no-hire') return 'badge-hard';
    if (decision === 'maybe') return 'badge-medium';
    return "badge-ghost";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
        <div className="animate-pulse space-y-2 w-full max-w-md">
          <div className="h-4 bg-[#1c2128] rounded-full w-1/3" />
          <div className="h-3 bg-[#1c2128] rounded-full w-2/3" />
          <div className="h-3 bg-[#1c2128] rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto px-6 py-10"
      >
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-[#7d8590] hover:text-[#e6edf3] mb-6 transition-colors">
          <ChevronLeftIcon className="size-4" /> Back to Dashboard
        </Link>

        {/* ... (Feedback headers, overall circle) ... */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#e6edf3] mb-1">Interview Feedback</h1>
          <p className="text-[#7d8590] text-sm">
            {session?.problem || "Session"} — {session?.difficulty}
          </p>
        </div>

        <div className="space-y-6">
          {/* AI Review */}
          <div className="card-dark p-6 mb-6">
             <h2 className="uppercase tracking-wider text-xs text-[#7d8590] font-semibold mb-4">AI Review</h2>
             <AIFeedbackCard variant="code-review" aiReview={aiReview || session?.aiReview} />
          </div>

          {/* Interviewer Feedback */}
          <div>
            <h2 className="uppercase tracking-wider text-xs text-[#7d8590] font-semibold mb-4">Interviewer Feedback</h2>
            {feedback.length === 0 ? (
              <div className="text-[#484f58] text-sm text-center py-8 card-dark">
                No feedback submitted yet.
              </div>
            ) : (
              <div className="space-y-6">
                {feedback.map((fb) => {
                  const totalScore = ((fb.codeQuality + fb.problemSolving + fb.communication) / 15) * 100;
                  const circumference = 2 * Math.PI * 24;
                  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

                  return (
                    <motion.div 
                      key={fb._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="card-dark p-6"
                    >
                      <div className="flex flex-col sm:flex-row gap-8">
                        {/* Overall Score Ring */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <div className="relative size-16">
                            <svg className="size-16 rotate-[-90deg]">
                              <circle cx="32" cy="32" r="24" stroke="#1c2128" strokeWidth="6" fill="transparent" />
                              <motion.circle
                                cx="32" cy="32" r="24"
                                stroke="#2cbe4e" strokeWidth="6" fill="transparent" strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-bold text-sm text-[#e6edf3]">{Math.round(totalScore)}%</span>
                            </div>
                          </div>
                          <div className={`mt-3 ${getDecisionBadge(fb.decision)} uppercase tracking-wider`}>
                            {fb.decision}
                          </div>
                        </div>

                        {/* Detail Bars */}
                        <div className="flex-1 space-y-4">
                          {[
                            { label: "Code Quality", val: fb.codeQuality },
                            { label: "Problem Solving", val: fb.problemSolving },
                            { label: "Communication", val: fb.communication },
                          ].map((item) => (
                            <div key={item.label}>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-[#e6edf3] font-medium">{item.label}</span>
                                <span className="text-[#7d8590]">{item.val}/5</span>
                              </div>
                              <div className="bg-[#1c2128] rounded-full h-2 overflow-hidden w-full relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.val / 5) * 100}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                  className="absolute left-0 top-0 h-full bg-[#2cbe4e] rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {fb.notes && (
                        <div className="mt-6 pt-4 border-t border-[#30363d]">
                          <span className="uppercase tracking-wider text-[10px] text-[#7d8590] font-semibold mb-2 block">
                            Interviewer Notes
                          </span>
                          <p className="text-sm text-[#e6edf3] leading-relaxed">
                            {fb.notes}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default FeedbackPage;
