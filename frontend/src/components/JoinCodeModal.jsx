import { useState } from "react";
import { CopyIcon, CheckIcon, XIcon, LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function JoinCodeModal({ isOpen, onClose, joinCode, joinLink }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
            className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl relative z-10 flex flex-col items-center"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-[#7d8590] hover:text-[#e6edf3] transition-colors">
              <XIcon className="size-5" />
            </button>

            <h3 className="text-lg font-bold text-[#e6edf3] mb-1">Session Created!</h3>
            <p className="text-[#7d8590] text-sm mb-6 text-center">Share this code with your candidate to join</p>

            {/* Join Code Display */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 text-center w-full mb-6">
              <p className="text-xs uppercase tracking-widest text-[#7d8590] mb-2 font-semibold">Join Code</p>
              <p className="font-mono text-3xl font-black text-[#2cbe4e] tracking-[0.4em]">
                {joinCode}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleCopyCode}
                className="btn-outline-dark flex-1 flex items-center justify-center gap-2 relative overflow-hidden h-12"
              >
                <AnimatePresence mode="wait">
                  {copiedCode ? (
                    <motion.div
                      key="checked"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2 text-[#2cbe4e]"
                    >
                      <CheckIcon className="size-4" /> Copied!
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <CopyIcon className="size-4" /> Copy Code
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={handleCopyLink}
                className="btn-outline-dark flex-1 flex items-center justify-center gap-2 relative overflow-hidden h-12"
              >
                <AnimatePresence mode="wait">
                  {copiedLink ? (
                    <motion.div
                      key="checked-link"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2 text-[#2cbe4e]"
                    >
                      <CheckIcon className="size-4" /> Copied!
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy-link"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="size-4" /> Copy Link
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default JoinCodeModal;
