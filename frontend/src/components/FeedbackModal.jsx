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
      toast.success("Feedback submitted successfully!");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingSlider = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-[var(--dark-text)]">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <StarIcon
                className={`size-5 ${
                  star <= value ? "fill-[var(--dark-accent)] text-[var(--dark-accent)]" : "text-[var(--dark-text-tertiary)]"
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
        className="w-full h-2 bg-[var(--dark-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--dark-accent)]"
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
            className="bg-[var(--dark-elevated)] border border-[var(--dark-border)] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl relative z-10 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[var(--dark-text)]">Interview Feedback</h3>
              <button onClick={onClose} className="text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] transition-colors">
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

              <div className="border-t border-[var(--dark-border)]" />

              {/* Decision */}
              <div className="space-y-3">
                <span className="font-medium text-sm text-[var(--dark-text)]">Decision</span>
                <div className="flex gap-2">
                  {[
                    { value: "hire", label: "✅ Hire", activeBg: "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]" },
                    { value: "maybe", label: "🤔 Maybe", activeBg: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]" },
                    { value: "no-hire", label: "❌ No Hire", activeBg: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]" },
                  ].map((opt) => {
                    const isActive = feedback.decision === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setFeedback({ ...feedback, decision: opt.value })}
                        className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                          isActive 
                            ? opt.activeBg 
                            : "bg-transparent border-[var(--dark-border)] text-[var(--dark-text-secondary)] hover:bg-[var(--dark-elevated)]"
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
                <label className="font-medium text-sm text-[var(--dark-text)] block">Notes</label>
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
