"use client";

import { Badge, Card } from "@/components/ui/primitives";
import { isOverdue } from "@/lib/timeline";
import { formatDate } from "@/lib/format";
import type { EventPlan, Milestone } from "@/lib/schemas";

interface TimelineTabProps {
  plan: EventPlan;
  onToggleMilestone: (milestoneId: string) => void;
}

export function TimelineTab({ plan, onToggleMilestone }: TimelineTabProps) {
  const milestones = [...plan.timeline].sort(
    (a, b) => b.daysBeforeOffset - a.daysBeforeOffset,
  );

  return (
    <Card>
      <h2 className="mb-1 text-xl font-bold">Countdown timeline</h2>
      <p className="mb-6 text-sm text-muted">
        Every milestone is dated by counting backwards from your event day. Tick one off when it
        is complete.
      </p>
      <ol className="relative grid gap-5 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-line">
        {milestones.map((milestone: Milestone) => {
          const overdue = isOverdue(milestone.dueDate, milestone.status === "done");
          const done = milestone.status === "done";
          return (
            <li key={milestone.id} className="relative pl-12">
              <input
                type="checkbox"
                checked={done}
                onChange={() => onToggleMilestone(milestone.id)}
                aria-label={`Mark ${milestone.title} ${done ? "pending" : "done"}`}
                className="absolute left-0 top-1 h-8 w-8 cursor-pointer accent-coral-600"
              />
              <div
                className={`rounded-2xl border-2 border-line p-4 ${done ? "bg-green-100/60" : "bg-white"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className={`font-display text-base font-bold ${done ? "text-muted line-through" : ""}`}>
                    {milestone.title}
                  </h3>
                  <div className="flex gap-2">
                    {overdue && <Badge tone="red">Overdue</Badge>}
                    <Badge tone="neutral">{milestone.category}</Badge>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted">{milestone.description}</p>
                <p className="mt-2 text-xs font-extrabold text-coral-600">
                  {milestone.dueDate ? formatDate(milestone.dueDate) : "Date pending"} ·{" "}
                  {milestone.daysBeforeOffset === 0
                    ? "event day"
                    : `${milestone.daysBeforeOffset} days before`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
