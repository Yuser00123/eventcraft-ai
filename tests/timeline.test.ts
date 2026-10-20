import { describe, expect, it } from "vitest";
import {
  enrichMilestones,
  enrichTasks,
  isOverdue,
  resolveDueDate,
  taskProgress,
} from "@/lib/timeline";
import type { ChecklistTask, Milestone } from "@/lib/schemas";

const EVENT_DATE = "2026-12-31";

describe("timeline date math", () => {
  it("resolves offsets to real calendar dates", () => {
    expect(resolveDueDate(EVENT_DATE, 0)).toBe("2026-12-31");
    expect(resolveDueDate(EVENT_DATE, 30)).toBe("2026-12-01");
    expect(resolveDueDate(EVENT_DATE, 365)).toBe("2025-12-31");
  });

  it("sorts milestones soonest-first and fills missing due dates", () => {
    const milestones: Milestone[] = [
      { id: "a", title: "Event day", description: "", daysBeforeOffset: 0, category: "Day", status: "pending" },
      { id: "b", title: "Book venue", description: "", daysBeforeOffset: 90, category: "Venue", status: "pending" },
    ];
    const enriched = enrichMilestones(milestones, EVENT_DATE);
    expect(enriched[0]?.id).toBe("b");
    expect(enriched[0]?.dueDate).toBe("2026-10-02");
  });

  it("enriches checklist tasks with due dates", () => {
    const tasks: ChecklistTask[] = [
      { id: "t1", title: "Pay deposit", category: "Venue", priority: "high", owner: "Host", daysBeforeOffset: 60, done: false },
    ];
    const [task] = enrichTasks(tasks, EVENT_DATE);
    expect(task?.dueDate).toBe("2026-11-01");
  });

  it("never marks a done item overdue", () => {
    expect(isOverdue("2020-01-01", true)).toBe(false);
    expect(isOverdue("2020-01-01", false)).toBe(true);
    expect(isOverdue(undefined, false)).toBe(false);
  });

  it("calculates task progress percentages", () => {
    const tasks = [
      { done: true },
      { done: true },
      { done: false },
      { done: false },
    ] as ChecklistTask[];
    expect(taskProgress(tasks)).toEqual({ done: 2, total: 4, percent: 50 });
    expect(taskProgress([]).percent).toBe(0);
  });
});
