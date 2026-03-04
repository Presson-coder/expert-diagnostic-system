"use client"

import type { HistoryStep } from "./troubleshooter"
import type { DiagnosticNode } from "@/lib/decision-tree"
import { diagnosticNodes } from "@/lib/decision-tree"
import {
  ChevronRight,
  CheckCircle2,
  CircleDot,
  Target,
} from "lucide-react"

interface DecisionBreadcrumbProps {
  history: HistoryStep[]
  currentNode: DiagnosticNode | undefined
  isComplete: boolean
}

export function DecisionBreadcrumb({
  history,
  currentNode,
  isComplete,
}: DecisionBreadcrumbProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
      {history.map((step, index) => {
        const node = diagnosticNodes[step.nodeId]
        return (
          <div key={step.nodeId + index} className="flex shrink-0 items-center gap-1">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              <CheckCircle2 className="size-3 text-primary" />
              <span className="text-xs font-medium text-primary">
                {node?.category}
              </span>
            </div>
            <ChevronRight className="size-3 text-muted-foreground" />
          </div>
        )
      })}

      {/* Current node */}
      {isComplete ? (
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1">
          <Target className="size-3 text-success" />
          <span className="text-xs font-medium text-success">
            Solution Found
          </span>
        </div>
      ) : currentNode ? (
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1">
          <CircleDot className="size-3 text-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">
            {currentNode.category}
          </span>
        </div>
      ) : null}
    </div>
  )
}
