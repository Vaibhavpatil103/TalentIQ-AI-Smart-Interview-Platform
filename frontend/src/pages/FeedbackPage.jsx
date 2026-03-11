import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { ClipboardCheckIcon, Loader2Icon, BrainCircuitIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import AIFeedbackCard from "../components/AIFeedbackCard";
import { axiosInstance } from "../lib/axios";
import { useAIFeedback } from "../hooks/useAIFeedback";

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
    const styles = {
      hire: "badge-success",
      "no-hire": "badge-error",
      maybe: "badge-warning",
    };
    return styles[decision] || "badge-ghost";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2Icon className="size-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <ClipboardCheckIcon className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Interview Feedback</h1>
            <p className="text-base-content/60">
              {session?.problem || "Session"} — {session?.difficulty}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Review */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <BrainCircuitIcon className="size-5 text-primary" />
              AI Review
            </h2>
            <AIFeedbackCard aiReview={aiReview || session?.aiReview} />
          </div>

          {/* Interviewer Feedback */}
          <div>
            <h2 className="text-lg font-bold mb-3">👤 Interviewer Feedback</h2>
            {feedback.length === 0 ? (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body items-center text-center py-8">
                  <p className="text-base-content/60">No feedback submitted yet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((fb) => (
                  <div key={fb._id} className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">Feedback</span>
                        <span className={`badge ${getDecisionBadge(fb.decision)} badge-lg capitalize`}>
                          {fb.decision}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Code Quality</span>
                          <span className="font-bold">{fb.codeQuality}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Problem Solving</span>
                          <span className="font-bold">{fb.problemSolving}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Communication</span>
                          <span className="font-bold">{fb.communication}/5</span>
                        </div>
                      </div>
                      {fb.notes && (
                        <div className="mt-3 p-3 bg-base-200 rounded-lg text-sm">
                          {fb.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
