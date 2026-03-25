import { useState } from "react";
import { CalendarIcon, XIcon, Loader2Icon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ScheduleModal({ isOpen, onClose, onSchedule, isScheduling }) {
  const [config, setConfig] = useState({
    date: "",
    time: "",
    candidateName: "",
    candidateEmail: "",
  });

  const handleSubmit = () => {
    if (!config.date || !config.time) return;
    const scheduledAt = new Date(`${config.date}T${config.time}`).toISOString();
    onSchedule({
      scheduledAt,
      candidateEmail: config.candidateEmail,
      candidateName: config.candidateName,
    });
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
            className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl relative z-10 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#e6edf3] flex items-center gap-2">
                <CalendarIcon className="size-5 text-[#2cbe4e]" />
                Schedule Interview
              </h3>
              <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium text-sm text-[#7d8590]">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input-dark w-full text-sm py-2"
                    value={config.date}
                    onChange={(e) => setConfig({ ...config, date: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium text-sm text-[#7d8590]">Time</span>
                  </label>
                  <input
                    type="time"
                    className="input-dark w-full text-sm py-2"
                    value={config.time}
                    onChange={(e) => setConfig({ ...config, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium text-sm text-[#7d8590]">Candidate Name (optional)</span>
                </label>
                <input
                  type="text"
                  className="input-dark w-full text-sm py-2"
                  placeholder="John Smith"
                  value={config.candidateName}
                  onChange={(e) => setConfig({ ...config, candidateName: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium text-sm text-[#7d8590]">Candidate Email (optional)</span>
                </label>
                <input
                  type="email"
                  className="input-dark w-full text-sm py-2"
                  placeholder="candidate@example.com"
                  value={config.candidateEmail}
                  onChange={(e) => setConfig({ ...config, candidateEmail: e.target.value })}
                />
                <label className="label py-1">
                  <span className="label-text-alt text-[#7d8590] text-xs">
                    They'll receive the join code + session link by email
                  </span>
                </label>
                
                <AnimatePresence>
                  {config.candidateEmail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="bg-[#2cbe4e10] border border-[#2cbe4e30] text-[#2cbe4e] text-xs rounded-lg p-3">
                        📧 Invite + join code will be sent to {config.candidateEmail}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button className="btn-ghost-dark" onClick={onClose}>Cancel</button>
              <button
                className="btn-green gap-2 flex items-center"
                onClick={handleSubmit}
                disabled={isScheduling || !config.date || !config.time}
              >
                {isScheduling ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <CalendarIcon className="size-4" />
                )}
                Schedule
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ScheduleModal;
