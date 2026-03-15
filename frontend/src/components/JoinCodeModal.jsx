import { useState } from "react";
import { CopyIcon, CheckIcon, XIcon, LinkIcon } from "lucide-react";

/**
 * JoinCodeModal — shows the 6-char join code and link after session creation.
 * Interviewer can copy code or link to share with the candidate.
 */
function JoinCodeModal({ isOpen, onClose, joinCode, joinLink }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      /* fallback silently */
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      /* fallback silently */
    }
  };

  return (
    <div className="modal modal-open">
      <div
        className="relative rounded-2xl p-8 w-full max-w-md shadow-2xl border"
        style={{
          backgroundColor: "#111827",
          borderColor: "#22C55E",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-gray-700"
          style={{ color: "#9CA3AF" }}
        >
          <XIcon className="size-5" />
        </button>

        {/* Header */}
        <h3
          className="text-xl font-bold mb-2 text-center"
          style={{ color: "#22C55E" }}
        >
          Session Created!
        </h3>
        <p className="text-sm text-center mb-6" style={{ color: "#9CA3AF" }}>
          Share this code with your candidate to join
        </p>

        {/* Join Code Display */}
        <div
          className="rounded-xl p-6 mb-6 text-center border"
          style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
        >
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#6B7280" }}>
            Join Code
          </p>
          <p
            className="text-4xl font-mono font-bold tracking-[0.3em]"
            style={{ color: "#22C55E" }}
          >
            {joinCode}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyCode}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              backgroundColor: copiedCode ? "#166534" : "#22C55E",
              color: "#FFFFFF",
            }}
          >
            {copiedCode ? (
              <>
                <CheckIcon className="size-4" /> Copied!
              </>
            ) : (
              <>
                <CopyIcon className="size-4" /> Copy Code
              </>
            )}
          </button>

          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border"
            style={{
              backgroundColor: copiedLink ? "#1F2937" : "transparent",
              borderColor: "#22C55E",
              color: "#22C55E",
            }}
          >
            {copiedLink ? (
              <>
                <CheckIcon className="size-4" /> Copied!
              </>
            ) : (
              <>
                <LinkIcon className="size-4" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default JoinCodeModal;
