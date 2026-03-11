import { useState } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UserIcon, StarIcon, CalendarIcon } from "lucide-react";

const PIPELINE_STAGES = [
  { id: "applied", label: "Applied", color: "bg-info/10 border-info/30" },
  { id: "screened", label: "Screened", color: "bg-warning/10 border-warning/30" },
  { id: "technical", label: "Technical", color: "bg-primary/10 border-primary/30" },
  { id: "system-design", label: "System Design", color: "bg-secondary/10 border-secondary/30" },
  { id: "offer", label: "Offer", color: "bg-accent/10 border-accent/30" },
  { id: "hired", label: "Hired", color: "bg-success/10 border-success/30" },
];

function CandidateCard({ candidate }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: candidate.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const avgScore = candidate.score ? candidate.score.toFixed(1) : "N/A";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-base-100 rounded-lg p-3 border border-base-300 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="avatar placeholder">
          <div className="bg-primary/10 text-primary rounded-full w-8">
            <UserIcon className="size-4" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{candidate.name}</p>
          <p className="text-xs text-base-content/50 truncate">{candidate.email}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-base-content/60">
        <div className="flex items-center gap-1">
          <StarIcon className="size-3 fill-warning text-warning" />
          <span>{avgScore}</span>
        </div>
        {candidate.lastInterviewDate && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-3" />
            <span>{new Date(candidate.lastInterviewDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CandidatePipeline({ candidates = [] }) {
  const [pipelineData, setPipelineData] = useState(() => {
    const grouped = {};
    PIPELINE_STAGES.forEach((stage) => {
      grouped[stage.id] = candidates.filter((c) => c.stage === stage.id);
    });
    return grouped;
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    // Find source and destination stages
    let sourceStage = null;
    let destStage = over.id;

    for (const [stage, cards] of Object.entries(pipelineData)) {
      if (cards.find((c) => c.id === active.id)) {
        sourceStage = stage;
        break;
      }
    }

    // If dropped on a stage column
    if (PIPELINE_STAGES.find((s) => s.id === destStage) && sourceStage !== destStage) {
      const candidate = pipelineData[sourceStage].find((c) => c.id === active.id);
      if (candidate) {
        setPipelineData({
          ...pipelineData,
          [sourceStage]: pipelineData[sourceStage].filter((c) => c.id !== active.id),
          [destStage]: [...pipelineData[destStage], { ...candidate, stage: destStage }],
        });
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-64 rounded-xl border p-3 ${stage.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">{stage.label}</h3>
              <span className="badge badge-sm">{pipelineData[stage.id]?.length || 0}</span>
            </div>
            <SortableContext
              id={stage.id}
              items={pipelineData[stage.id]?.map((c) => c.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 min-h-[100px]">
                {pipelineData[stage.id]?.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}

export default CandidatePipeline;
