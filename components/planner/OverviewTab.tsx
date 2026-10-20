"use client";

import { Badge, Card } from "@/components/ui/primitives";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { budgetHealth, categoryVariances } from "@/lib/budget";
import { taskProgress } from "@/lib/timeline";
import { formatCompactCurrency, formatCurrency, daysUntil } from "@/lib/format";
import { EVENT_THEMES } from "@/lib/event-themes";
import type { TabProps } from "@/components/planner/types";

export function OverviewTab({ brief, plan }: TabProps) {
  const health = budgetHealth(plan.budget);
  const progress = taskProgress(plan.checklist);
  const theme = EVENT_THEMES[brief.eventType];
  const topVariances = categoryVariances(plan.budget)
    .sort((a, b) => b.usedPercent - a.usedPercent)
    .slice(0, 3);
  const upcoming = [...plan.timeline]
    .filter((milestone) => milestone.status === "pending")
    .sort((a, b) => a.daysBeforeOffset - b.daysBeforeOffset)
    .slice(0, 3);
  const countdown = daysUntil(brief.eventDate);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card tint="coral" className="flex flex-col items-center justify-center gap-3 text-center">
        <ProgressRing percent={health.usedPercent} stroke={theme.accent} label="budget used" />
        <h2 className="text-xl font-bold">Budget used</h2>
        <p className="text-sm text-muted">
          {formatCompactCurrency(health.spent, brief.currency)} of{" "}
          {formatCompactCurrency(health.estimated, brief.currency)}
        </p>
        <Badge tone={health.status === "over" ? "red" : health.status === "near" ? "coral" : "green"}>
          {health.status === "over"
            ? "Over budget"
            : health.status === "near"
              ? "Near limit"
              : "Within budget"}
        </Badge>
      </Card>

      <Card tint="pink" className="flex flex-col items-center justify-center gap-3 text-center">
        <ProgressRing percent={progress.percent} stroke="#F2558E" label="tasks complete" />
        <h2 className="text-xl font-bold">Checklist</h2>
        <p className="text-sm text-muted">
          {progress.done} of {progress.total} tasks complete
        </p>
        <Badge tone="pink">{plan.checklist.length - progress.done} still open</Badge>
      </Card>

      <Card tint="amber" className="flex flex-col justify-center">
        <p className="font-script text-2xl text-coral-600">the big day</p>
        <h2 className="text-5xl font-extrabold">{countdown >= 0 ? countdown : "—"}</h2>
        <p className="text-sm font-bold text-muted">
          {countdown >= 0 ? "days until your event" : "Event date has passed"}
        </p>
        <p className="mt-3 text-sm text-muted">{plan.summary}</p>
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="mb-4 text-xl font-bold">Categories needing attention</h2>
        <ul className="grid gap-3">
          {topVariances.map((variance) => (
            <li key={variance.category.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{variance.category.name}</p>
                <div className="mt-1 h-2.5 w-48 max-w-full overflow-hidden rounded-full bg-coral-100">
                  <div
                    className={`h-full rounded-full ${
                      variance.status === "over"
                        ? "bg-red-600"
                        : variance.status === "near"
                          ? "bg-coral-500"
                          : "bg-green-600"
                    }`}
                    style={{ width: `${Math.min(100, variance.usedPercent)}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-sm font-bold">
                {formatCurrency(variance.spent, brief.currency)} /{" "}
                {formatCurrency(variance.estimated, brief.currency)}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card tint="dark">
        <h2 className="mb-4 text-xl font-bold text-cream">Next milestones</h2>
        <ul className="grid gap-3">
          {upcoming.map((milestone) => (
            <li key={milestone.id}>
              <p className="text-sm font-bold text-cream">{milestone.title}</p>
              <p className="text-xs text-[#FFD9C7]">
                {milestone.dueDate} · {milestone.daysBeforeOffset} days before
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card tint="green" className="lg:col-span-3">
        <h2 className="mb-3 text-xl font-bold">Risk tips from your plan</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {plan.riskTips.map((tip, index) => (
            <li key={index} className="flex gap-2 text-sm font-medium">
              <span aria-hidden="true">⚠️</span>
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
