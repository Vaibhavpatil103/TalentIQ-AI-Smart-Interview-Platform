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
  { id: "applied", label: "Applied" },
  { id: "screened", label: "Screened" },
  { id: "technical", label: "Technical" },
  { id: "system-design", label: "System Design" },
  { id: "offer", label: "Offer" },
  { id: "hired", label: "Hired" },
];

function CandidateCard({ candidate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  const avgScore = candidate.score ? candidate.score.toFixed(1) : "N/A";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-[#1c2128] border border-[#30363d] rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing hover:border-[#00000040] hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ${
        isDragging ? "shadow-2xl ring-2 ring-[#000000] scale-105" : "shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="size-8 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center shrink-0">
          <UserIcon className="size-4 text-[#7d8590]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-[#e6edf3] truncate">{candidate.name}</p>
          <p className="text-xs text-[#7d8590] truncate tracking-wide">{candidate.email}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-[#e6edf3] bg-[#0d1117] px-2 py-1.5 rounded-lg border border-[#30363d]/50">
        <div className="flex items-center gap-1.5">
          <StarIcon className="size-3 fill-[#d29922] text-[#d29922]" />
          <span>{avgScore}</span>
        </div>
        {candidate.lastInterviewDate && (
          <div className="flex items-center gap-1.5 text-[#7d8590]">
            <CalendarIcon className="size-3 opacity-60" />
            <span>{new Date(candidate.lastInterviewDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidatePipeline({ candidates = [] }) {
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

    let sourceStage = null;
    let destStage = over.id;

    for (const [stage, cards] of Object.entries(pipelineData)) {
      if (cards.find((c) => c.id === active.id)) {
        sourceStage = stage;
        break;
      }
    }

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
      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar flex-1 min-h-0">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-[300px] bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col h-[70vh] min-h-[500px]"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#30363d]">
              <h3 className="text-sm font-semibold text-[#e6edf3] tracking-wide uppercase">{stage.label}</h3>
              <span className="bg-[#1c2128] text-[#7d8590] text-xs font-bold px-2 py-0.5 rounded border border-[#30363d]">
                {pipelineData[stage.id]?.length || 0}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
              <SortableContext
                id={stage.id}
                items={pipelineData[stage.id]?.map((c) => c.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-[200px] h-full">
                  {pipelineData[stage.id]?.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                  {pipelineData[stage.id]?.length === 0 && (
                    <div className="h-full w-full border-2 border-dashed border-[#30363d] rounded-xl flex items-center justify-center opacity-50">
                      <p className="text-[#7d8590] text-xs font-semibold uppercase tracking-wider text-center px-4">
                        Drop candidates here
                      </p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
