import { useState } from "react";
import { CalendarIcon, Code2Icon, LoaderIcon, PlusIcon, XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function CreateSessionModal({
  isOpen,
  onClose,
  onCreateRoom,
  isCreating,
}) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    date: "",
    time: "",
    candidateEmail: "",
  });

  const handleCreate = () => {
    if (showSchedule && scheduleConfig.date && scheduleConfig.time) {
      const scheduledAt = new Date(
        `${scheduleConfig.date}T${scheduleConfig.time}`
      ).toISOString();
      onCreateRoom({ scheduledAt, candidateEmail: scheduleConfig.candidateEmail });
    } else {
      onCreateRoom();
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
            className="bg-[var(--dark-elevated)] border border-[var(--dark-border)] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl relative z-10 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[var(--dark-text)]">Create New Session</h3>
              <button onClick={onClose} className="text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)] transition-colors">
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
              {/* SCHEDULE TOGGLE */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={showSchedule}
                  onChange={(e) => setShowSchedule(e.target.checked)}
                />
                <span className="flex items-center gap-2 text-sm text-[var(--dark-text)]">
                  <CalendarIcon className="size-4 text-[var(--dark-text-secondary)]" />
                  Schedule for later
                </span>
              </div>

              {/* SCHEDULE FIELDS */}
              <AnimatePresence>
                {showSchedule && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-sm text-[var(--dark-text-secondary)]">Date</span>
                        </label>
                        <input
                          type="date"
                          className="input-dark w-full text-sm"
                          value={scheduleConfig.date}
                          onChange={(e) =>
                            setScheduleConfig({ ...scheduleConfig, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-sm text-[var(--dark-text-secondary)]">Time</span>
                        </label>
                        <input
                          type="time"
                          className="input-dark w-full text-sm"
                          value={scheduleConfig.time}
                          onChange={(e) =>
                            setScheduleConfig({ ...scheduleConfig, time: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-sm text-[var(--dark-text-secondary)]">Candidate Email (optional)</span>
                      </label>
                      <input
                        type="email"
                        className="input-dark w-full text-sm"
                        placeholder="candidate@example.com"
                        value={scheduleConfig.candidateEmail}
                        onChange={(e) =>
                          setScheduleConfig({ ...scheduleConfig, candidateEmail: e.target.value })
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ROOM SUMMARY */}
              <div className="bg-[var(--dark-accent-bg)] border border-[var(--dark-accent-border)] rounded-xl p-4 flex gap-3 text-sm">
                <Code2Icon className="size-5 text-[var(--dark-accent)] shrink-0 mt-0.5" />
                <div className="text-[var(--dark-text)] space-y-1">
                  <p className="font-semibold text-[var(--dark-accent)]">Room Summary</p>
                  <p className="text-[var(--dark-text-secondary)]">Problem: <span className="text-[var(--dark-text)]">Select inside the room</span></p>
                  <p className="text-[var(--dark-text-secondary)]">Capacity: <span className="text-[var(--dark-text)]">2 (1-on-1 session)</span></p>
                  {showSchedule && scheduleConfig.date && (
                    <p className="text-[var(--dark-text-secondary)]">
                      Scheduled: <span className="text-[var(--dark-text)]">{scheduleConfig.date} at {scheduleConfig.time}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-ghost-dark" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-green flex items-center gap-2"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <LoaderIcon className="size-4 animate-spin" />
                ) : (
                  <PlusIcon className="size-4" />
                )}
                {isCreating ? "Creating..." : showSchedule ? "Schedule" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default CreateSessionModal;
