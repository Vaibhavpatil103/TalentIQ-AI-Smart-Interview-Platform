import {
  CheckCircle2Icon,
  XCircleIcon,
  TerminalIcon,
  CopyIcon,
  CheckIcon,
  Loader2Icon,
} from "lucide-react";
import { useState } from "react";

function OutputPanel({ output, isRunning }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = output?.output || output?.error || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const hasOutput = output?.output || output?.error;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#0D1117" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ backgroundColor: "#161B22", borderColor: "#30363D" }}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="size-4" style={{ color: "#8B949E" }} />
          <span className="text-sm font-semibold" style={{ color: "#C9D1D9" }}>
            Output
          </span>

          {/* Status badge */}
          {isRunning && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: "#1F2937", color: "#F59E0B" }}
            >
              <Loader2Icon className="size-3 animate-spin" />
              Running
            </div>
          )}
          {output && !isRunning && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: output.success ? "#052e16" : "#450a0a",
                color: output.success ? "#22C55E" : "#FCA5A5",
              }}
            >
              {output.success ? (
                <CheckCircle2Icon className="size-3" />
              ) : (
                <XCircleIcon className="size-3" />
              )}
              {output.success ? "Success" : "Error"}
            </div>
          )}
        </div>

        {/* Copy button */}
        {hasOutput && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-white/10"
            style={{ color: "#8B949E" }}
          >
            {copied ? (
              <>
                <CheckIcon className="size-3" style={{ color: "#22C55E" }} />
                <span style={{ color: "#22C55E" }}>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="size-3" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isRunning ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2Icon className="size-5 animate-spin" style={{ color: "#22C55E" }} />
            <span className="text-sm" style={{ color: "#8B949E" }}>
              Executing your code...
            </span>
          </div>
        ) : output === null ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#161B22" }}
            >
              <TerminalIcon className="size-6" style={{ color: "#30363D" }} />
            </div>
            <p className="text-sm text-center text-[var(--dark-text-tertiary)]">
              Click <strong style={{ color: "#8B949E" }}>Run Code</strong> to see the output
            </p>
          </div>
        ) : output.success ? (
          <pre
            className="text-sm font-mono whitespace-pre-wrap leading-relaxed"
            style={{ color: "#22C55E" }}
          >
            {output.output}
          </pre>
        ) : (
          <div className="space-y-3">
            {output.output && (
              <pre
                className="text-sm font-mono whitespace-pre-wrap leading-relaxed"
                style={{ color: "#C9D1D9" }}
              >
                {output.output}
              </pre>
            )}
            <pre
              className="text-sm font-mono whitespace-pre-wrap leading-relaxed"
              style={{ color: "#F85149" }}
            >
              {output.error}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
export default OutputPanel;
