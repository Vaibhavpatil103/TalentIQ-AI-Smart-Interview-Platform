import { useState } from "react";
import { StarIcon, SendIcon, XIcon, Loader2Icon } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function FeedbackModal({ isOpen, onClose, sessionId, candidateId }) {
  const [feedback, setFeedback] = useState({
    codeQuality: 3,
    problemSolving: 3,
    communication: 3,
    decision: "maybe",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/feedback", {
        sessionId,
        candidateId,
        ...feedback,
      });
      toast.success("Feedback submitted successfully!", { 
        style: { background: '#1c2128', color: '#e6edf3', border: '1px solid #30363d' }
      });
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback", {
        style: { background: '#1c2128', color: '#e6edf3', border: '1px solid #30363d' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingSlider = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-[#e6edf3]">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <StarIcon
                className={`size-5 ${
                  star <= value ? "fill-[#2cbe4e] text-[#2cbe4e]" : "text-[#484f58]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-[#0d1117] rounded-lg appearance-none cursor-pointer accent-[#2cbe4e]"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl relative z-10 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[#e6edf3]">Interview Feedback</h3>
              <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="space-y-6">
              <RatingSlider
                label="💻 Code Quality"
                value={feedback.codeQuality}
                onChange={(v) => setFeedback({ ...feedback, codeQuality: v })}
              />
              <RatingSlider
                label="🧩 Problem Solving"
                value={feedback.problemSolving}
                onChange={(v) => setFeedback({ ...feedback, problemSolving: v })}
              />
              <RatingSlider
                label="💬 Communication"
                value={feedback.communication}
                onChange={(v) => setFeedback({ ...feedback, communication: v })}
              />

              <div className="border-t border-[#30363d]" />

              {/* Decision */}
              <div className="space-y-3">
                <span className="font-medium text-sm text-[#e6edf3]">Decision</span>
                <div className="flex gap-2">
                  {[
                    { value: "hire", label: "✅ Hire", activeBg: "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e]" },
                    { value: "maybe", label: "🤔 Maybe", activeBg: "bg-[#d2992220] text-[#d29922] border-[#d29922]" },
                    { value: "no-hire", label: "❌ No Hire", activeBg: "bg-[#f8514920] text-[#f85149] border-[#f85149]" },
                  ].map((opt) => {
                    const isActive = feedback.decision === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setFeedback({ ...feedback, decision: opt.value })}
                        className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                          isActive 
                            ? opt.activeBg 
                            : "bg-transparent border-[#30363d] text-[#7d8590] hover:bg-[#30363d]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="font-medium text-sm text-[#e6edf3] block">Notes</label>
                <textarea
                  className="input-dark w-full h-24 py-3 resize-none"
                  placeholder="Additional observations, strengths, areas for improvement..."
                  value={feedback.notes}
                  onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button className="btn-ghost-dark" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-green gap-2 flex items-center"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SendIcon className="size-4" />
                )}
                Submit Feedback
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default FeedbackModal;
