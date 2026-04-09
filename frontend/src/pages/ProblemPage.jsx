import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";
import { useProblemById, useProblems } from "../hooks/useProblems";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: problemData, isLoading } = useProblemById(id);
  const { data: allProblemsData } = useProblems();

  const currentProblem = problemData?.problem;
  const allProblems = allProblemsData?.problems || [];

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Update code when problem loads
  useEffect(() => {
    if (currentProblem?.starterCode?.[selectedLanguage]) {
      setCode(currentProblem.starterCode[selectedLanguage]);
      setOutput(null);
    }
  }, [currentProblem, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem?.starterCode?.[newLang] || "");
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.2, y: 0.6 } });
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.8, y: 0.6 } });
  };

  const normalizeOutput = (output) => {
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    return normalizeOutput(actualOutput) == normalizeOutput(expectedOutput);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    if (result.success && currentProblem?.expectedOutput?.[selectedLanguage]) {
      const testsPassed = checkIfTestsPassed(
        result.output,
        currentProblem.expectedOutput[selectedLanguage]
      );
      if (testsPassed) {
        triggerConfetti();
        toast.success("All tests passed! Great job!");
      } else {
        toast.error("Tests failed. Check your output!");
      }
    } else if (!result.success) {
      toast.error("Code execution failed!");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[var(--dark-bg)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-pulse space-y-2 w-full max-w-md">
            <div className="h-4 bg-[var(--dark-elevated)] rounded-full w-1/3" />
            <div className="h-3 bg-[var(--dark-elevated)] rounded-full w-2/3" />
            <div className="h-3 bg-[var(--dark-elevated)] rounded-full w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--dark-bg)] flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* left panel- problem desc */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={id}
              onProblemChange={handleProblemChange}
              allProblems={allProblems}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* right panel- code editor & output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Bottom panel - Output Panel*/}
              <Panel defaultSize={30} minSize={30}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;
