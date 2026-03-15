import { useState, useEffect, useRef } from "react";

function QuestionTimer({ durationSeconds = 120, onTimeUp, isRunning }) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const intervalRef = useRef(null);

  // Reset timer when isRunning changes (new question arrives)
  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [isRunning, durationSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, onTimeUp, durationSeconds, timeLeft === durationSeconds]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const progress = timeLeft / durationSeconds;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  let strokeColor = "#22c55e"; // green
  let pulseClass = "";
  if (timeLeft <= 10) {
    strokeColor = "#ef4444"; // red
    pulseClass = "animate-pulse";
  } else if (timeLeft <= 30) {
    strokeColor = "#f59e0b"; // amber
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${pulseClass}`}>
      <svg width="96" height="96" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-base-300"
        />
        {/* Progress circle */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
        />
      </svg>
      <span className="absolute text-lg font-bold font-mono">{timeString}</span>
    </div>
  );
}

export default QuestionTimer;
