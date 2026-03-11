import { useState } from "react";
import { StarIcon, SendIcon, XIcon, Loader2Icon } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function FeedbackModal({ isOpen, onClose, sessionId, candidateId }) {
  const [feedback, setFeedback] = useState({
    codeQuality: 3,
    problemSolving: 3,
    communication: 3,
    decision: "maybe",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
        <span className="font-medium text-base-content/80">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110"
            >
              <StarIcon
                className={`size-5 ${
                  star <= value ? "fill-warning text-warning" : "text-base-content/20"
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
        className="range range-primary range-sm"
      />
    </div>
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-2xl">Interview Feedback</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
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

          <div className="divider" />

          {/* Decision */}
          <div className="space-y-2">
            <span className="font-medium text-base-content/80">Decision</span>
            <div className="flex gap-2">
              {[
                { value: "hire", label: "✅ Hire", style: "btn-success" },
                { value: "maybe", label: "🤔 Maybe", style: "btn-warning" },
                { value: "no-hire", label: "❌ No Hire", style: "btn-error" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFeedback({ ...feedback, decision: opt.value })}
                  className={`btn btn-sm flex-1 ${
                    feedback.decision === opt.value ? opt.style : "btn-ghost"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="font-medium text-base-content/80">Notes</label>
            <textarea
              className="textarea textarea-bordered w-full h-24"
              placeholder="Additional observations, strengths, areas for improvement..."
              value={feedback.notes}
              onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary gap-2"
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
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default FeedbackModal;
