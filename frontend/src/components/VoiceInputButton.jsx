import { useState, useRef, useEffect } from "react";
import { MicIcon } from "lucide-react";

const SpeechRecognition = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

function VoiceInputButton({ onTranscript, isDisabled }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Don't render if browser doesn't support SpeechRecognition
  if (!SpeechRecognition) return null;

  const startListening = () => {
    if (isDisabled || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      // Auto-stop after 10 seconds of silence
      timeoutRef.current = setTimeout(() => {
        recognition.stop();
      }, 10000);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript?.(transcript);
      clearTimeout(timeoutRef.current);
      setIsListening(false);
    };

    recognition.onerror = () => {
      clearTimeout(timeoutRef.current);
      setIsListening(false);
    };

    recognition.onend = () => {
      clearTimeout(timeoutRef.current);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    clearTimeout(timeoutRef.current);
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        className={`btn btn-circle ${
          isListening
            ? "btn-error animate-pulse shadow-lg shadow-error/30"
            : "btn-ghost"
        }`}
        onClick={isListening ? stopListening : startListening}
        disabled={isDisabled}
        title={isListening ? "Stop listening" : "Speak your answer"}
      >
        <MicIcon className="size-5" />
      </button>
      {isListening && (
        <span className="text-xs text-error font-medium animate-pulse">
          Listening...
        </span>
      )}
    </div>
  );
}

export default VoiceInputButton;
