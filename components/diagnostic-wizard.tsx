"use client"

import { useState } from "react"
import type { DiagnosticNode } from "@/lib/decision-tree"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Router,
  Wifi,
  Globe,
  Gauge,
  ArrowRight,
  CircleDot,
  Cable,
  Network,
} from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
  "Power Check": <Router className="size-4" />,
  "ISP Signal": <Globe className="size-4" />,
  "WiFi Signal": <Wifi className="size-4" />,
  "DNS & Routing": <Network className="size-4" />,
  Performance: <Gauge className="size-4" />,
  Connection: <Cable className="size-4" />,
}

interface DiagnosticWizardProps {
  node: DiagnosticNode
  stepNumber: number
  onAnswer: (optionId: string) => void
}

export function DiagnosticWizard({
  node,
  stepNumber,
  onAnswer,
}: DiagnosticWizardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(selectedOption)
      setSelectedOption("")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {stepNumber}
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          {categoryIcons[node.category] || (
            <CircleDot className="size-4" />
          )}
          {node.category}
        </Badge>
      </div>

      {/* Question Card */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">{node.question}</CardTitle>
          <CardDescription className="leading-relaxed">
            Select the option that best matches what you observe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="gap-3"
          >
            {node.options.map((option) => (
              <Label
                key={option.id}
                htmlFor={option.id}
                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all hover:border-primary/40 hover:bg-secondary/50 ${
                  selectedOption === option.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border"
                }`}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground leading-none">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </span>
                  )}
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="w-full gap-2"
            size="lg"
          >
            Continue Diagnosis
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Expert tip */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
            <Wifi className="size-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Expert Insight
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {node.expertThought}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
