"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { isOverdue, taskProgress } from "@/lib/timeline";
import { PRIORITY_LABELS } from "@/lib/event-themes";
import { formatDate } from "@/lib/format";
import type { ChecklistTask, EventPlan, Priority } from "@/lib/schemas";

interface ChecklistTabProps {
  plan: EventPlan;
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, category: string) => void;
}

const PRIORITY_TONE: Record<Priority, "red" | "coral" | "neutral"> = {
  high: "red",
  medium: "coral",
  low: "neutral",
};

type Filter = "all" | "open" | "done";

export function ChecklistTab({ plan, onToggleTask, onAddTask }: ChecklistTabProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [newTitle, setNewTitle] = useState("");

  const progress = taskProgress(plan.checklist);
  const grouped = useMemo(() => {
    const groups = new Map<string, ChecklistTask[]>();
    for (const task of plan.checklist) {
      const bucket = groups.get(task.category) ?? [];
      bucket.push(task);
      groups.set(task.category, bucket);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [plan.checklist]);

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (newTitle.trim().length < 3) return;
    onAddTask(newTitle.trim(), "Custom");
    setNewTitle("");
  }

  function visible(task: ChecklistTask): boolean {
    if (filter === "open") return !task.done;
    if (filter === "done") return task.done;
    return true;
  }

  return (
    <div className="grid gap-5">
      <Card tint="pink" className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <ProgressRing percent={progress.percent} size={92} stroke="#F2558E" label="tasks complete" />
          <div>
            <h2 className="text-xl font-bold">Vendor checklist</h2>
            <p className="text-sm text-muted">
              {progress.done} of {progress.total} tasks complete
            </p>
          </div>
        </div>
        <div className="flex gap-2" role="group" aria-label="Filter checklist tasks">
          {(["all", "open", "done"] as Filter[]).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={`rounded-full px-4 py-2 text-xs font-bold shadow-soft transition-colors ${
                filter === option ? "bg-ink text-cream" : "bg-white text-muted hover:bg-coral-100"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {grouped.map(([category, tasks]) => {
        const shown = tasks.filter(visible);
        if (shown.length === 0) return null;
        const groupProgress = taskProgress(tasks);
        return (
          <Card key={category}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">{category}</h3>
              <span className="text-xs font-bold text-muted">
                {groupProgress.done}/{groupProgress.total} done
              </span>
            </div>
            <ul className="grid gap-2">
              {shown.map((task) => {
                const overdue = isOverdue(task.dueDate, task.done);
                return (
                  <li
                    key={task.id}
                    className={`flex flex-wrap items-center gap-3 rounded-2xl border-2 border-line p-3 ${
                      task.done ? "bg-green-100/50" : "bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => onToggleTask(task.id)}
                      aria-label={`Mark task ${task.title} ${task.done ? "open" : "done"}`}
                      className="h-6 w-6 shrink-0 cursor-pointer accent-coral-600"
                    />
                    <div className="min-w-40 flex-1">
                      <p className={`text-sm font-bold ${task.done ? "text-muted line-through" : ""}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted">
                        {task.owner} · {task.dueDate ? formatDate(task.dueDate) : "No date"}
                        {overdue && <span className="ml-2 font-extrabold text-red-600">Overdue</span>}
                      </p>
                    </div>
                    <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}

      <Card tint="coral">
        <h3 className="mb-3 font-display text-lg font-bold">Add your own task</h3>
        <form onSubmit={handleAdd} className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label htmlFor="custom-task" className="sr-only">
            New checklist task
          </label>
          <input
            id="custom-task"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="e.g. Collect vendor payment receipts in one folder"
            maxLength={140}
            className="rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm focus:border-coral-500"
          />
          <Button type="submit">Add task</Button>
        </form>
      </Card>
    </div>
  );
}
