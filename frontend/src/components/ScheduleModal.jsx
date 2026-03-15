import { useState } from "react";
import { CalendarIcon, XIcon, Loader2Icon } from "lucide-react";

function ScheduleModal({ isOpen, onClose, onSchedule, isScheduling }) {
  const [config, setConfig] = useState({
    date: "",
    time: "",
    candidateName: "",
    candidateEmail: "",
  });

  if (!isOpen) return null;

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
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <CalendarIcon className="size-5 text-primary" />
            Schedule Interview
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={config.date}
              onChange={(e) => setConfig({ ...config, date: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Time</span>
            </label>
            <input
              type="time"
              className="input input-bordered"
              value={config.time}
              onChange={(e) => setConfig({ ...config, time: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Candidate Name (optional)</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="John Smith"
              value={config.candidateName}
              onChange={(e) => setConfig({ ...config, candidateName: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Candidate Email (optional)</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              placeholder="candidate@example.com"
              value={config.candidateEmail}
              onChange={(e) => setConfig({ ...config, candidateEmail: e.target.value })}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50">
                They'll receive the join code + session link by email
              </span>
            </label>
            {config.candidateEmail && (
              <div className="alert alert-info py-2 mt-2">
                <span className="text-xs">
                  📧 Invite + join code will be sent to {config.candidateEmail}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary gap-2"
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
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default ScheduleModal;
