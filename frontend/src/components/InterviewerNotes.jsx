import { useState } from "react";
import { StickyNoteIcon, SaveIcon, XIcon } from "lucide-react";

function InterviewerNotes({ sessionId, onSave }) {
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave?.(notes);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost btn-sm gap-2"
        title="Open interviewer notes"
      >
        <StickyNoteIcon className="size-4" />
        Notes
      </button>
    );
  }

  return (
    <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg w-80">
      <div className="flex items-center justify-between p-3 border-b border-base-300">
        <div className="flex items-center gap-2">
          <StickyNoteIcon className="size-4 text-primary" />
          <span className="font-semibold text-sm">Private Notes</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-ghost btn-xs btn-circle"
        >
          <XIcon className="size-3" />
        </button>
      </div>
      <div className="p-3">
        <textarea
          className="textarea textarea-bordered w-full h-40 text-sm"
          placeholder="Private notes about this candidate... (only visible to you)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSave}
            className="btn btn-primary btn-sm gap-1"
          >
            <SaveIcon className="size-3" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewerNotes;
