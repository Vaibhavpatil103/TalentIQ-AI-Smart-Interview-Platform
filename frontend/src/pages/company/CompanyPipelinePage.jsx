import { useState } from "react";
import { motion } from "framer-motion";
import {
  KanbanIcon,
  PlusIcon,
  UserCircleIcon,
  CalendarIcon,
} from "lucide-react";
import CompanyNavbar from "../../components/CompanyNavbar";

// ── Stages ─────────────────────────────────────────────────────
const STAGES = [
  { key: "applied",      label: "Applied",       topColor: "#57606a",  bgColor: "transparent" },
  { key: "screened",     label: "Screened",      topColor: "#0969da",  bgColor: "transparent" },
  { key: "technical",    label: "Technical",     topColor: "#8250df",  bgColor: "transparent" },
  { key: "system-design",label: "System Design", topColor: "#bf8700",  bgColor: "transparent" },
  { key: "offer",        label: "Offer",         topColor: "#1a7f37",  bgColor: "transparent" },
  { key: "hired",        label: "Hired",         topColor: "#0969da",  bgColor: "#f6fbff" },
];

// ── Mock data ───────────────────────────────────────────────────
const MOCK_CANDIDATES = [
  { id: "1", name: "Alice Johnson",  email: "alice@example.com",  stage: "applied",       score: 4.2, lastInterviewDate: "2026-03-10" },
  { id: "2", name: "Bob Smith",      email: "bob@example.com",    stage: "technical",     score: 3.8, lastInterviewDate: "2026-03-09" },
  { id: "3", name: "Carol Davis",    email: "carol@example.com",  stage: "screened",      score: 4.5, lastInterviewDate: "2026-03-08" },
  { id: "4", name: "Dan Wilson",     email: "dan@example.com",    stage: "system-design", score: 4.0, lastInterviewDate: "2026-03-07" },
  { id: "5", name: "Eve Brown",      email: "eve@example.com",    stage: "offer",         score: 4.8, lastInterviewDate: "2026-03-06" },
  { id: "6", name: "Frank Lee",      email: "frank@example.com",  stage: "applied",       score: 3.5, lastInterviewDate: "2026-03-05" },
  { id: "7", name: "Grace Kim",      email: "grace@example.com",  stage: "hired",         score: 4.9, lastInterviewDate: "2026-03-04" },
];

// ── Stage badge colours ─────────────────────────────────────────
const STAGE_BADGE = {
  applied:       "bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]",
  screened:      "bg-[#ddf4ff] text-[#0969da] border-[#54aeff]",
  technical:     "bg-[#fbefff] text-[#8250df] border-[#d2a8ff]",
  "system-design":"bg-[#fff8c5] text-[#9a6700] border-[#e3b341]",
  offer:         "bg-[#dafbe1] text-[#1a7f37] border-[#56d364]",
  hired:         "bg-[#ddf4ff] text-[#0969da] border-[#54aeff]",
};

// ── Candidate Card ──────────────────────────────────────────────
function CandidateCard({ candidate }) {
  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      transition={{ duration: 0.1 }}
      className="bg-white border border-[#d0d7de] rounded-xl p-3 cursor-grab
        hover:border-[#0969da] hover:shadow-sm transition-all select-none"
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-full bg-[#f6f8fa] border border-[#d0d7de]
          flex items-center justify-center flex-shrink-0">
          <UserCircleIcon className="size-6 text-[#57606a]" />
        </div>
        <span className="text-xs font-semibold" style={{ color: "#d29922" }}>
          ★ {candidate.score.toFixed(1)}
        </span>
      </div>

      {/* Name + Email */}
      <p className="font-semibold text-sm text-[#1c2128] mt-2 leading-tight">
        {candidate.name}
      </p>
      <p className="text-xs text-[#57606a] truncate mt-0.5">
        {candidate.email}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f6f8fa]">
        <span className="text-[10px] text-[#8c959f] flex items-center gap-1">
          <CalendarIcon className="size-3 inline" />
          {candidate.lastInterviewDate}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
            STAGE_BADGE[candidate.stage] || STAGE_BADGE.applied
          }`}
        >
          {candidate.stage}
        </span>
      </div>
    </motion.div>
  );
}

// ── Kanban Column ───────────────────────────────────────────────
function Column({ stage, candidates, onDrop, onDragOver }) {
  return (
    <div
      className="w-64 flex-shrink-0 flex flex-col min-h-[500px] rounded-xl
        bg-white border border-[#d0d7de]"
      style={{ borderTop: `2px solid ${stage.topColor}`, backgroundColor: stage.bgColor || "#ffffff" }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.key)}
    >
      {/* Column header */}
      <div className="px-4 py-3 border-b border-[#f6f8fa] flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#57606a]">
          {stage.label}
        </span>
        <span className="bg-[#f6f8fa] text-[#57606a] text-xs px-2 py-0.5 rounded-full
          border border-[#d0d7de] font-medium min-w-[20px] text-center">
          {candidates.length}
        </span>
      </div>

      {/* Cards area */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {candidates.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2
            border-dashed border-[#d0d7de] rounded-lg m-1 p-4">
            <p className="text-xs text-[#8c959f] text-center">Drop candidates here</p>
          </div>
        ) : (
          candidates.map((c) => (
            <div
              key={c.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("candidateId", c.id)}
            >
              <CandidateCard candidate={c} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────
function CompanyPipelinePage() {
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);

  const handleDrop = (e, targetStage) => {
    const candidateId = e.dataTransfer.getData("candidateId");
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: targetStage } : c))
    );
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <CompanyNavbar />

      {/* Header */}
      <div className="bg-white border-b border-[#d0d7de] py-6 px-6">
        <div className="max-w-full flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1c2128] flex items-center gap-2">
              <KanbanIcon className="size-5 text-[#0969da]" />
              Candidate Pipeline
            </h1>
            <p className="text-sm text-[#57606a] mt-0.5">
              Drag candidates between stages to track their progress
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#0969da] hover:bg-[#0550ae]
            text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
            <PlusIcon className="size-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Board */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-4 p-6 overflow-x-auto"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        {STAGES.map((stage) => (
          <Column
            key={stage.key}
            stage={stage}
            candidates={candidates.filter((c) => c.stage === stage.key)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default CompanyPipelinePage;
