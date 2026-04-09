import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { LockIcon, Loader2Icon, ArrowRightIcon, AlertCircleIcon } from "lucide-react";
import axiosInstance from "../lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";

function JoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [joinCode, setJoinCode] = useState(searchParams.get("code") || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!joinCode) {
      const savedCode = localStorage.getItem("talentiq_pending_join_code");
      if (savedCode) {
        setJoinCode(savedCode.toUpperCase());
        localStorage.removeItem("talentiq_pending_join_code");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = joinCode.trim();
    if (!trimmed) {
      setError("Please enter a session code");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axiosInstance.post("/sessions/join", {
        joinCode: trimmed,
      });
      navigate(`/session/${data.sessionId}?code=${trimmed}`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] flex flex-col px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-dark max-w-md w-full mx-auto mt-24 p-8 flex flex-col relative"
      >
        <div className="flex justify-center">
          <LockIcon className="text-[#000000] size-12 mb-6" />
        </div>

        <h1 className="font-bold text-xl text-[var(--dark-text)] text-center mb-1">
          Join Interview Session
        </h1>
        <p className="text-[var(--dark-text-secondary)] text-sm text-center mb-6">
          Enter the 6-character code provided by your interviewer
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            maxLength={6}
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="CODE"
            className="input-dark w-full py-4 text-center text-2xl font-mono tracking-[0.3em] uppercase rounded-xl"
            autoFocus
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="flex items-center justify-center gap-2 text-[#f85149] text-sm">
                  <AlertCircleIcon className="size-4 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading || !joinCode.trim()}
            className="btn-green w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              <>Join Session <ArrowRightIcon className="size-4" /></>
            )}
          </button>
        </form>

        <Link to="/" className="text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] text-sm text-center mt-6 transition-colors">
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

export default JoinPage;
