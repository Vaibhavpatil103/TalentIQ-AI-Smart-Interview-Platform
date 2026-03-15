import { useState, useRef, useEffect } from "react";
import { SparklesIcon, SendIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import QuestionTimer from "./QuestionTimer";
import VoiceInputButton from "./VoiceInputButton";

const personaConfig = {
  Friendly: { emoji: "😊", cls: "badge-success" },
  Neutral:  { emoji: "🎯", cls: "badge-info" },
  Strict:   { emoji: "⚡", cls: "badge-error" },
};

function AIChatInterface({
  messages,
  onSendAnswer,
  isLoading,
  isComplete,
  onEndSession,
  questionCount,
  questionLimit = 5,
  durationSeconds = 120,
  persona = "Neutral",
  voiceModeEnabled = false,
}) {
  const [answer, setAnswer] = useState("");
  const [showEndModal, setShowEndModal] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [difficultyToast, setDifficultyToast] = useState(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Reset timer when a new AI message appears
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "ai") {
      setTimerKey((k) => k + 1);
    }
  }, [messages]);

  const handleSend = async () => {
    if (isLoading || isComplete) return;
    const text = answer.trim() || "(No answer provided)";
    const timeTaken = durationSeconds - getTimeLeft();
    setAnswer("");

    const result = await onSendAnswer({ userAnswer: text, timeTaken });

    // Adaptive difficulty toast
    if (result?.difficultyChanged && result?.newDifficulty) {
      const currentIdx = ["Easy", "Medium", "Hard"].indexOf(result.newDifficulty);
      setDifficultyToast({
        message: `Adapting session difficulty → ${result.newDifficulty}`,
        type: currentIdx > 0 ? "up" : "down",
      });
      setTimeout(() => setDifficultyToast(null), 4000);
    }
  };

  // Track time left for auto-submit
  const timeLeftRef = useRef(durationSeconds);
  const getTimeLeft = () => timeLeftRef.current;

  const handleTimeUp = () => {
    if (isLoading || isComplete) return;
    const text = answer.trim() || "(No answer provided)";
    onSendAnswer({ userAnswer: text, timeTaken: durationSeconds });
    setAnswer("");
  };

  const handleVoiceTranscript = (transcript) => {
    setAnswer((prev) => (prev ? prev + " " + transcript : transcript));
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between px-4 py-3 bg-base-200 rounded-t-xl border border-base-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="badge badge-primary badge-lg font-mono">
              Question {Math.ceil(questionCount / 2) || 1} of {questionLimit}
            </div>
            <progress
              className="progress progress-primary w-24"
              value={Math.ceil(questionCount / 2) || 1}
              max={questionLimit}
            />
            {/* Persona Badge */}
            <span className={`badge ${personaConfig[persona]?.cls} badge-sm gap-1`}>
              {personaConfig[persona]?.emoji} {persona}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <QuestionTimer
            key={timerKey}
            durationSeconds={durationSeconds}
            onTimeUp={handleTimeUp}
            isRunning={!isLoading && !isComplete}
          />
          <button
            className="btn btn-outline btn-error btn-sm"
            onClick={() => setShowEndModal(true)}
            disabled={isComplete}
          >
            End Interview
          </button>
        </div>
      </div>

      {/* ─── Adaptive Difficulty Toast ─── */}
      {difficultyToast && (
        <div className={`alert ${
          difficultyToast.type === "up" ? "alert-warning" : "alert-info"
        } py-2 px-4 text-sm flex items-center gap-2 rounded-none`}>
          {difficultyToast.type === "up" ? "📈" : "📉"}
          {difficultyToast.message}
        </div>
      )}

      {/* ─── Chat Messages ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100 border-x border-base-300">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                msg.role === "ai" ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-primary to-secondary"
                    : "bg-primary/20"
                }`}
              >
                {msg.role === "ai" ? (
                  <SparklesIcon className="size-4 text-white" />
                ) : (
                  <span className="text-xs font-bold text-primary">You</span>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-base-300 text-base-content"
                    : "bg-primary/20 text-base-content"
                }`}
              >
                {msg.content}
                {msg.timeTaken && (
                  <div className="text-xs text-base-content/40 mt-1">
                    answered in {msg.timeTaken}s
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="flex-shrink-0 size-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                <SparklesIcon className="size-4 text-white" />
              </div>
              <div className="bg-base-300 rounded-2xl px-4 py-3">
                <Loader2Icon className="size-5 animate-spin text-primary" />
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="text-center py-4">
            <div className="badge badge-success badge-lg gap-2 px-6 py-4">
              <SparklesIcon className="size-4" />
              Interview complete! Generating your feedback...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ─── Input Area ─── */}
      <div className="p-4 bg-base-200 rounded-b-xl border border-t-0 border-base-300">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            className="textarea textarea-bordered flex-1 min-h-[100px] resize-none text-sm"
            placeholder={
              isComplete
                ? "Interview complete"
                : "Type your answer... (Shift+Enter for new line)"
            }
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isComplete}
            rows={4}
          />
          <div className="flex flex-col gap-2">
            {voiceModeEnabled && (
              <VoiceInputButton
                onTranscript={handleVoiceTranscript}
                isDisabled={isLoading || isComplete}
              />
            )}
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={isLoading || isComplete}
            >
              {isLoading ? (
                <Loader2Icon className="size-5 animate-spin" />
              ) : (
                <SendIcon className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── End Interview Confirmation Modal ─── */}
      {showEndModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <XCircleIcon className="size-5 text-error" />
              End Interview?
            </h3>
            <p className="py-4 text-base-content/70">
              Are you sure you want to end this interview? AI will evaluate
              your performance and generate a scorecard.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowEndModal(false)}
              >
                Continue Interview
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  setShowEndModal(false);
                  onEndSession();
                }}
              >
                End Interview
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowEndModal(false)}
          />
        </dialog>
      )}
    </div>
  );
}

export default AIChatInterface;
