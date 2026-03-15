import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { KeyRoundIcon, Loader2Icon, ArrowRightIcon, AlertCircleIcon } from "lucide-react";
import axiosInstance from "../lib/axios";

/**
 * JoinPage — accessible page where candidates enter a join code.
 * Route: /join or /join?code=ABC123 (auto-fills from link).
 */
function JoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [joinCode, setJoinCode] = useState(searchParams.get("code") || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Restore code saved before auth redirect
  useEffect(() => {
    if (!joinCode) {
      const savedCode = localStorage.getItem("talentiq_pending_join_code");
      if (savedCode) {
        setJoinCode(savedCode.toUpperCase());
        localStorage.removeItem("talentiq_pending_join_code");
      }
    }
  }, []);

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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#030712" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl border"
        style={{ backgroundColor: "#111827", borderColor: "#1F2937" }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#052e16" }}
          >
            <KeyRoundIcon className="size-8" style={{ color: "#22C55E" }} />
          </div>
        </div>

        {/* Header */}
        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: "#F9FAFB" }}
        >
          Join Interview Session
        </h1>
        <p
          className="text-sm text-center mb-8"
          style={{ color: "#9CA3AF" }}
        >
          Enter the 6-character code provided by your interviewer
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="Enter session code"
              className="w-full text-center text-2xl font-mono font-bold tracking-[0.3em] py-4 px-4 rounded-xl outline-none border transition-colors focus:border-green-500"
              style={{
                backgroundColor: "#1F2937",
                borderColor: error ? "#EF4444" : "#374151",
                color: "#F9FAFB",
              }}
              autoFocus
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
              style={{ backgroundColor: "#450a0a", color: "#FCA5A5" }}
            >
              <AlertCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !joinCode.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#22C55E",
              color: "#FFFFFF",
            }}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="size-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Join Session
                <ArrowRightIcon className="size-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-xs text-center mt-6"
          style={{ color: "#6B7280" }}
        >
          Codes are case-insensitive and expire when the session ends
        </p>
      </div>
    </div>
  );
}

export default JoinPage;
