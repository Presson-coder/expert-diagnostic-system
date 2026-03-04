"use client";

import { useState, useCallback, useRef } from "react";
import {
  diagnosticNodes,
  diagnosticResults,
  type DiagnosticNode,
  type DiagnosticResult,
} from "@/lib/decision-tree";
import { DiagnosticWizard } from "./diagnostic-wizard";
import { TroubleshootingLog } from "./troubleshooting-log";
import { ResultsPage } from "./results-page";
import { DecisionBreadcrumb } from "./decision-breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Wifi, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LogEntry {
  id: number;
  timestamp: Date;
  type: "answer" | "thought" | "result";
  category: string;
  content: string;
}

export interface HistoryStep {
  nodeId: string;
  selectedOptionId: string;
  selectedLabel: string;
}

const totalSteps = 7;

export function Troubleshooter() {
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => {
    const startNode = diagnosticNodes["start"];
    return [
      {
        id: 1,
        timestamp: new Date(),
        type: "thought" as const,
        category: startNode.category,
        content: startNode.expertThought,
      },
    ];
  });
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const logIdCounterRef = useRef(2);

  const currentNode: DiagnosticNode | undefined =
    diagnosticNodes[currentNodeId];

  const progressValue = result
    ? 100
    : Math.min(((history.length + 1) / totalSteps) * 100, 95);

  const addLogEntry = useCallback(
    (type: LogEntry["type"], category: string, content: string) => {
      const newId = logIdCounterRef.current++;
      setLogEntries((entries) => [
        ...entries,
        { id: newId, timestamp: new Date(), type, category, content },
      ]);
    },
    [],
  );

  const handleAnswer = useCallback(
    (optionId: string) => {
      if (!currentNode) return;

      const selectedOption = currentNode.options.find((o) => o.id === optionId);
      if (!selectedOption) return;

      // Log the answer
      addLogEntry(
        "answer",
        currentNode.category,
        `${currentNode.question} \u2192 ${selectedOption.label}`,
      );

      // Track history
      setHistory((prev) => [
        ...prev,
        {
          nodeId: currentNode.id,
          selectedOptionId: optionId,
          selectedLabel: selectedOption.label,
        },
      ]);

      const nextTarget = currentNode.next[optionId];

      if (nextTarget.startsWith("RESULT:")) {
        const resultId = nextTarget.replace("RESULT:", "");
        const diagResult = diagnosticResults[resultId];
        if (diagResult) {
          addLogEntry(
            "thought",
            "Analysis Complete",
            `Diagnosis complete. ${diagResult.matchPercentage}% confidence: ${diagResult.title}`,
          );
          addLogEntry("result", "Solution Found", diagResult.title);
          setResult(diagResult);
        }
      } else {
        const nextNode = diagnosticNodes[nextTarget];
        if (nextNode) {
          addLogEntry("thought", nextNode.category, nextNode.expertThought);
          setCurrentNodeId(nextTarget);
        }
      }
    },
    [currentNode, addLogEntry],
  );

  const handleReset = useCallback(() => {
    setCurrentNodeId("start");
    setResult(null);
    setHistory([]);
    const startNode = diagnosticNodes["start"];
    logIdCounterRef.current = 2;
    setLogEntries([
      {
        id: 1,
        timestamp: new Date(),
        type: "thought",
        category: startNode.category,
        content: startNode.expertThought,
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <Wifi className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Smart Home Network Troubleshooter
              </h1>
              <p className="text-sm text-muted-foreground">
                Expert diagnostic system
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
            <span className="hidden sm:inline">Start Over</span>
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Diagnostic Progress
            </span>
            <span className="text-xs font-medium text-primary">
              {Math.round(progressValue)}%
            </span>
          </div>
          <Progress value={progressValue} className="h-1.5" />
        </div>
      </div>

      {/* Breadcrumb */}
      {history.length > 0 && (
        <div className="border-b border-border bg-card/50 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <DecisionBreadcrumb
              history={history}
              currentNode={currentNode}
              isComplete={!!result}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Wizard or Results */}
          <div className="min-w-0 flex-1">
            {result ? (
              <ResultsPage
                result={result}
                logEntries={logEntries}
                onReset={handleReset}
              />
            ) : currentNode ? (
              <DiagnosticWizard
                node={currentNode}
                stepNumber={history.length + 1}
                onAnswer={handleAnswer}
              />
            ) : null}
          </div>

          {/* Right: Log */}
          <div className="w-full lg:w-96">
            <TroubleshootingLog entries={logEntries} />
          </div>
        </div>
      </main>
    </div>
  );
}
