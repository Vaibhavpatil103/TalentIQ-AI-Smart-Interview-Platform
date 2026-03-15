import { useState } from "react";
import { CalendarIcon, Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";

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

  if (!isOpen) return null;

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
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

        <div className="space-y-8">
          {/* SCHEDULE TOGGLE */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={showSchedule}
              onChange={(e) => setShowSchedule(e.target.checked)}
            />
            <span className="flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4" />
              Schedule for later
            </span>
          </div>

          {/* SCHEDULE FIELDS */}
          {showSchedule && (
            <div className="space-y-3 bg-base-200 p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-sm">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm"
                    value={scheduleConfig.date}
                    onChange={(e) =>
                      setScheduleConfig({ ...scheduleConfig, date: e.target.value })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-sm">Time</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered input-sm"
                    value={scheduleConfig.time}
                    onChange={(e) =>
                      setScheduleConfig({ ...scheduleConfig, time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">Candidate Email (optional)</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered input-sm"
                  placeholder="candidate@example.com"
                  value={scheduleConfig.candidateEmail}
                  onChange={(e) =>
                    setScheduleConfig({ ...scheduleConfig, candidateEmail: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* ROOM SUMMARY */}
          <div className="alert alert-success">
            <Code2Icon className="size-5" />
            <div>
              <p className="font-semibold">Room Summary:</p>
              <p>
                Problem: <span className="font-medium">Select inside the room</span>
              </p>
              <p>
                Max Participants: <span className="font-medium">2 (1-on-1 session)</span>
              </p>
              {showSchedule && scheduleConfig.date && (
                <p>
                  Scheduled:{" "}
                  <span className="font-medium">
                    {scheduleConfig.date} at {scheduleConfig.time}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}

            {isCreating
              ? "Creating..."
              : showSchedule
              ? "Schedule"
              : "Create"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
export default CreateSessionModal;
