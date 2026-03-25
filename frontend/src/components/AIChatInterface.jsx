import { useState, useEffect, useRef } from "react";
import { SendIcon, MicIcon, SquareIcon, Loader2Icon, SparklesIcon, BotIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SpeechRecognition = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

function AIChatInterface({
  messages,
  onSendAnswer,
  isLoading,
  isComplete,
  onEndSession,
  questionCount,
  questionLimit,
  durationSeconds,
  persona,
  voiceModeEnabled,
}) {
  const [input, setInput] = useState("");
  const [remainingTime, setRemainingTime] = useState(durationSeconds);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isComplete) return;
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isComplete, onEndSession]);

  useEffect(() => {
    if (!isLoading && !isComplete) {
      inputRef.current?.focus();
    }
  }, [isLoading, isComplete]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || isComplete) return;

    if (isListening) {
      stopListening();
    }

    onSendAnswer({
      userAnswer: input,
      timeTaken: durationSeconds - remainingTime,
    });
    setInput("");
  };

  const startListening = () => {
    if (isLoading || isComplete || isListening) return;
    
    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support speech recognition.", { style: { background: '#1c2128', color: '#e6edf3' }});
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = input ? input + " " : "";

    recognition.onstart = () => {
      setIsListening(true);
      timeoutRef.current = setTimeout(() => {
        recognition.stop();
      }, 15000);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let currentFinal = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (currentFinal) {
        finalTranscript += currentFinal + " ";
      }
      
      setInput(finalTranscript + interimTranscript);
      
      // Reset timeout on speech
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        recognition.stop();
      }, 10000);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeProgress = (remainingTime / durationSeconds) * 100;
  const isTimeLow = remainingTime < 60;

  return (
    <div className="flex flex-col h-[85vh] bg-[#1c2128] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl relative">
      {/* HEADER */}
      <div className="bg-[#161b22] border-b border-[#30363d] p-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-[#2cbe4e] to-[#1a7f37] flex items-center justify-center shadow-lg relative">
            <BotIcon className="size-5 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-[#161b22] rounded-full flex items-center justify-center">
              <div className="size-2 bg-[#2cbe4e] rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-[#e6edf3] flex items-center gap-2">
              AI Interviewer
              <span className="text-xs bg-[#30363d] text-[#e6edf3] px-2 py-0.5 rounded-full capitalize font-semibold shadow-inner">
                {persona} Persona
              </span>
            </h3>
            <p className="text-xs text-[#7d8590] mt-0.5">
              Question {Math.min(questionCount + 1, questionLimit)} of {questionLimit}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="relative size-12 flex items-center justify-center">
              <svg className="size-full -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#30363d" strokeWidth="3" fill="transparent" />
                <motion.circle
                  cx="24" cy="24" r="20"
                  stroke={isTimeLow ? "#f85149" : "#2cbe4e"}
                  strokeWidth="3"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: (1 - remainingTime / durationSeconds) * (2 * Math.PI * 20) }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <div className="absolute flex items-center justify-center">
                <span className={`font-mono text-xs font-bold ${isTimeLow ? "text-[#f85149] animate-pulse" : "text-[#e6edf3]"}`}>
                  {formatTime(remainingTime)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onEndSession}
            className="btn-outline-dark h-10 px-4 gap-2 text-[#f85149] border-[#f8514940] hover:bg-[#f8514920] hover:border-[#f85149]"
          >
            <SquareIcon className="size-4 fill-current" />
            End Now
          </button>
        </div>
      </div>

      {/* PROGRESS BAR (Questions) */}
      <div className="h-1 bg-[#0d1117] w-full shrink-0">
        <motion.div
          className="h-full bg-gradient-to-r from-[#2cbe4e] to-[#1a7f37]"
          initial={{ width: 0 }}
          animate={{ width: `${(questionCount / questionLimit) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-[#0d1117] relative">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md">
              <div className="size-16 bg-[#1c2128] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#30363d] shadow-xl">
                <SparklesIcon className="size-8 text-[#2cbe4e]" />
              </div>
              <p className="text-[#e6edf3] font-semibold text-lg mb-2">Ready when you are!</p>
              <p className="text-[#7d8590] text-sm leading-relaxed">
                The AI interviewer will ask you questions based on your selected topic and difficulty. Take your time to answer thoughtfully.
              </p>
            </motion.div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#2cbe4e15] text-[#e6edf3] border border-[#2cbe4e40] rounded-br-sm"
                    : "bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-bl-sm"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#30363d]/50">
                    <SparklesIcon className="size-3.5 text-[#2cbe4e]" />
                    <span className="text-xs font-bold text-[#7d8590] uppercase tracking-wider">AI Interviewer</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-[#1c2128] text-[#e6edf3] border border-[#30363d] rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-3">
              <Loader2Icon className="size-4 animate-spin text-[#2cbe4e]" />
              <span className="text-sm font-medium">Thinking of next question...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-[#161b22] border-t border-[#30363d] shrink-0 z-10 pb-6 md:pb-4">
        {isListening && (
          <div className="text-center mb-2 animate-pulse flex items-center justify-center gap-2">
            <div className="size-2 bg-[#f85149] rounded-full" />
            <span className="text-xs text-[#f85149] font-bold uppercase tracking-wider">Listening...</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex gap-3">
          <textarea
            ref={inputRef}
            className={`input-dark w-full min-h-[56px] max-h-32 py-3 px-4 resize-none rounded-xl pr-14 text-[15px] leading-relaxed shadow-inner ${isListening ? 'border-[#f8514940] focus:border-[#f85149] ring-1 ring-[#f8514920]' : ''}`}
            placeholder={
              isComplete
                ? "Interview complete"
                : isListening
                ? "Listening to your answer..."
                : "Type your answer here... (Press Enter to send)"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading || isComplete}
            rows={1}
            style={{ height: "auto" }}
          />

          {voiceModeEnabled ? (
            <button
              type="button"
              className={`absolute right-14 top-2.5 p-2 rounded-lg transition-all ${
                isListening
                  ? "bg-[#f8514920] text-[#f85149] hover:bg-[#f85149] hover:text-black shadow-[0_0_12px_rgba(248,81,73,0.3)] animate-pulse"
                  : "bg-[#2cbe4e20] text-[#2cbe4e] hover:bg-[#2cbe4e] hover:text-black"
               }`}
               onClick={isListening ? stopListening : startListening}
               disabled={isLoading || isComplete || !SpeechRecognition}
               title={!SpeechRecognition ? "Browser not supported" : isListening ? "Stop listening" : "Start speaking"}
            >
              <MicIcon className="size-5" />
            </button>
          ) : null}

          <button
            type="submit"
            className={`absolute right-3 top-2.5 p-2 rounded-lg transition-all ${
              input.trim() && !isLoading && !isListening
                ? "bg-[#2cbe4e] text-black hover:bg-[#1a7f37] hover:scale-105"
                : "bg-transparent text-[#484f58] cursor-not-allowed"
            }`}
             disabled={!input.trim() || isLoading || isComplete || isListening}
          >
            <SendIcon className="size-5" />
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-[11px] text-[#484f58]">
            Format code with markdown: <code className="bg-[#0d1117] px-1 py-0.5 rounded text-[#7d8590]">```javascript code ```</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIChatInterface;
