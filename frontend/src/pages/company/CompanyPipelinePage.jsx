import { useState } from "react";
import { motion } from "framer-motion";
import {
  KanbanIcon,
  PlusIcon,
  UserCircleIcon,
  CalendarIcon,
} from "lucide-react";
import CompanyNavbar from "../../components/CompanyNavbar";
import { PageHeader, HeaderButton, T } from "../../components/ui/CompanyUI";

// ── Stages ─────────────────────────────────────────────────────
const STAGES = [
  { key: "applied",      label: "Applied",       topColor: "#64748b",  bgColor: "transparent" },
  { key: "screened",     label: "Screened",      topColor: T.primary,  bgColor: "transparent" },
  { key: "technical",    label: "Technical",     topColor: "#7c3aed",  bgColor: "transparent" },
  { key: "system-design",label: "System Design", topColor: "#ca8a04",  bgColor: "transparent" },
  { key: "offer",        label: "Offer",         topColor: "#16a34a",  bgColor: "transparent" },
  { key: "hired",        label: "Hired",         topColor: T.primary,  bgColor: "#f0f7ff" },
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
  applied:       `bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]`,
  screened:      `bg-[#e8f0fe] text-[#0a66c2] border-[#8bb9fe]`,
  technical:     `bg-[#f3e8ff] text-[#7c3aed] border-[#c4b5fd]`,
  "system-design":"bg-[#fef9c3] text-[#ca8a04] border-[#facc15]",
  offer:         `bg-[#dcfce7] text-[#16a34a] border-[#86efac]`,
  hired:         `bg-[#e8f0fe] text-[#0a66c2] border-[#8bb9fe]`,
};

// ── Candidate Card ──────────────────────────────────────────────
function CandidateCard({ candidate }) {
  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      transition={{ duration: 0.1 }}
      className="rounded-xl p-3 cursor-grab select-none transition-all duration-200"
      style={{
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: T.bgPage, border: `1px solid ${T.border}` }}>
          <UserCircleIcon className="size-6" style={{ color: T.textMuted }} />
        </div>
        <span className="text-xs font-semibold" style={{ color: "#ca8a04" }}>
          ★ {candidate.score.toFixed(1)}
        </span>
      </div>
      <p className="font-semibold text-sm mt-2 leading-tight" style={{ color: T.textPrimary }}>
        {candidate.name}
      </p>
      <p className="text-xs truncate mt-0.5" style={{ color: T.textMuted }}>
        {candidate.email}
      </p>
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${T.borderLight}` }}>
        <span className="text-[10px] flex items-center gap-1" style={{ color: T.textDim }}>
          <CalendarIcon className="size-3 inline" />
          {candidate.lastInterviewDate}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STAGE_BADGE[candidate.stage] || STAGE_BADGE.applied}`}>
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
      className="w-64 flex-shrink-0 flex flex-col min-h-[500px] rounded-2xl"
      style={{
        backgroundColor: stage.bgColor || T.bgCard,
        border: `1px solid ${T.border}`,
        borderTop: `2px solid ${stage.topColor}`,
        boxShadow: T.shadowSm,
      }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.key)}
    >
      <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: `1px solid ${T.borderLight}` }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textMuted }}>
          {stage.label}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium min-w-[20px] text-center"
          style={{ backgroundColor: T.bgPage, color: T.textMuted, border: `1px solid ${T.border}` }}>
          {candidates.length}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        {candidates.length === 0 ? (
          <div className="flex-1 flex items-center justify-center rounded-lg m-1 p-4"
            style={{ border: `2px dashed ${T.border}` }}>
            <p className="text-xs text-center" style={{ color: T.textDim }}>Drop candidates here</p>
          </div>
        ) : (
          candidates.map((c) => (
            <div key={c.id} draggable onDragStart={(e) => e.dataTransfer.setData("candidateId", c.id)}>
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
    <div className="min-h-screen" style={{ backgroundColor: T.bgPage }}>
      <CompanyNavbar />

      <PageHeader
        eyebrow="Recruitment Pipeline"
        title="Candidate Pipeline"
        subtitle="Drag candidates between stages to track their progress"
      >
        <HeaderButton icon={PlusIcon}>
          Add Candidate
        </HeaderButton>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-4 p-6 overflow-x-auto"
        style={{ minHeight: "calc(100vh - 160px)" }}
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
