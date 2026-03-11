import { BrainCircuitIcon, Loader2Icon, SparklesIcon } from "lucide-react";

function AIFeedbackCard({ aiReview }) {
  if (!aiReview) {
    return (
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body items-center text-center py-8">
          <Loader2Icon className="size-8 animate-spin text-primary mb-3" />
          <h3 className="text-lg font-semibold">AI Review in Progress...</h3>
          <p className="text-base-content/60 text-sm">
            Our AI is analyzing the submitted code. This usually takes 10-30 seconds.
          </p>
        </div>
      </div>
    );
  }

  const { scores, suggestions, completedAt } = aiReview;

  const getScoreColor = (score) => {
    if (score >= 4) return "text-success";
    if (score >= 3) return "text-warning";
    return "text-error";
  };

  const getScoreBar = (score) => {
    const percentage = (score / 5) * 100;
    const color =
      score >= 4 ? "bg-success" : score >= 3 ? "bg-warning" : "bg-error";
    return (
      <div className="w-full bg-base-300 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="card bg-gradient-to-br from-base-100 to-primary/5 shadow-lg border border-primary/20">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BrainCircuitIcon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              AI Code Review
              <SparklesIcon className="size-4 text-primary" />
            </h3>
            {completedAt && (
              <p className="text-xs text-base-content/50">
                Reviewed {new Date(completedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Scores */}
        {scores && (
          <div className="space-y-3 mb-5">
            {Object.entries(scores).map(([key, score]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className={`font-bold ${getScoreColor(score)}`}>
                    {score}/5
                  </span>
                </div>
                {getScoreBar(score)}
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions && (
          <div className="bg-base-200 rounded-lg p-4 border border-base-300">
            <h4 className="font-semibold text-sm mb-2 text-primary">💡 Suggestions</h4>
            <p className="text-sm text-base-content/80 leading-relaxed">{suggestions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFeedbackCard;
