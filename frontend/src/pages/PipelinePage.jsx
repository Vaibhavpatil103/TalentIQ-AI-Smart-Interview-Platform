import { KanbanIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import CandidatePipeline from "../components/CandidatePipeline";
import { motion } from "framer-motion";

const MOCK_CANDIDATES = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", stage: "applied", score: 4.2, lastInterviewDate: "2026-03-10" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", stage: "technical", score: 3.8, lastInterviewDate: "2026-03-09" },
  { id: "3", name: "Carol Davis", email: "carol@example.com", stage: "screened", score: 4.5, lastInterviewDate: "2026-03-08" },
  { id: "4", name: "Dan Wilson", email: "dan@example.com", stage: "system-design", score: 4.0, lastInterviewDate: "2026-03-07" },
  { id: "5", name: "Eve Brown", email: "eve@example.com", stage: "offer", score: 4.8, lastInterviewDate: "2026-03-06" },
  { id: "6", name: "Frank Lee", email: "frank@example.com", stage: "applied", score: 3.5, lastInterviewDate: "2026-03-05" },
];

function PipelinePage() {
  return (
    <div className="min-h-screen bg-[var(--dark-bg)] flex flex-col">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-full mx-auto px-6 py-12 flex-1 flex flex-col w-full"
      >
        <div className="flex items-center gap-4 mb-10 shrink-0">
          <div className="size-12 rounded-xl bg-[var(--dark-elevated)] border border-[var(--dark-border)] flex items-center justify-center shadow-lg">
            <KanbanIcon className="size-6 text-[#000000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--dark-text)]">Candidate Pipeline</h1>
            <p className="text-[var(--dark-text-secondary)] text-sm mt-1">
              Drag candidates between stages to track their progress
            </p>
          </div>
        </div>

        <CandidatePipeline candidates={MOCK_CANDIDATES} />
      </motion.div>
    </div>
  );
}

export default PipelinePage;
