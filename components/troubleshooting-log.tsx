"use client"

import { useEffect, useRef } from "react"
import type { LogEntry } from "./troubleshooter"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  MessageSquare,
  Brain,
  CheckCircle2,
} from "lucide-react"

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

const typeConfig: Record<
  LogEntry["type"],
  {
    icon: React.ReactNode
    color: string
    label: string
    bg: string
    border: string
  }
> = {
  answer: {
    icon: <MessageSquare className="size-3.5" />,
    color: "text-primary",
    label: "Response",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  thought: {
    icon: <Brain className="size-3.5" />,
    color: "text-accent",
    label: "Analysis",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  result: {
    icon: <CheckCircle2 className="size-3.5" />,
    color: "text-success",
    label: "Resolved",
    bg: "bg-success/10",
    border: "border-success/20",
  },
}

interface TroubleshootingLogProps {
  entries: LogEntry[]
}

export function TroubleshootingLog({ entries }: TroubleshootingLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [entries.length])

  return (
    <Card className="sticky top-6 max-h-[calc(100vh-12rem)] overflow-hidden shadow-md">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
            <ClipboardList className="size-4 text-secondary-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm">Troubleshooting Log</CardTitle>
            <p className="text-xs text-muted-foreground">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="flex flex-col gap-0 p-4">
            {entries.map((entry, index) => {
              const config = typeConfig[entry.type]
              return (
                <div key={entry.id} className="relative flex gap-3">
                  {/* Timeline line */}
                  {index < entries.length - 1 && (
                    <div className="absolute left-[13px] top-7 h-[calc(100%-4px)] w-px bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color}`}
                  >
                    {config.icon}
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1 pb-5">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${config.border} ${config.color}`}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                      {entry.category}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
