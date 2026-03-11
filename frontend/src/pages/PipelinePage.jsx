import { KanbanIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import CandidatePipeline from "../components/CandidatePipeline";

// Example data — in production this would come from an API
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
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-full mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <KanbanIcon className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Candidate Pipeline</h1>
            <p className="text-base-content/60">
              Drag candidates between stages to track their progress
            </p>
          </div>
        </div>

        <CandidatePipeline candidates={MOCK_CANDIDATES} />
      </div>
    </div>
  );
}

export default PipelinePage;
