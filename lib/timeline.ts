import type { ChecklistTask, Milestone } from "@/lib/schemas";

/**
 * Pure date math for milestones and checklist tasks.
 * Offsets are expressed as "days before the event"; 0 means the event day.
 */

/** Resolve a day-offset against an event date into a YYYY-MM-DD due date. */
export function resolveDueDate(eventDate: string, daysBeforeOffset: number): string {
  const event = new Date(`${eventDate}T00:00:00`);
  event.setDate(event.getDate() - daysBeforeOffset);
  return event.toISOString().slice(0, 10);
}

/** Attach real calendar dates to every milestone and sort soonest-first. */
export function enrichMilestones(
  milestones: Milestone[],
  eventDate: string,
): Milestone[] {
  return milestones
    .map((milestone) => ({
      ...milestone,
      dueDate: milestone.dueDate ?? resolveDueDate(eventDate, milestone.daysBeforeOffset),
    }))
    .sort((a, b) => b.daysBeforeOffset - a.daysBeforeOffset);
}

/** Attach due dates and sort vendor tasks by priority window then offset. */
export function enrichTasks(
  tasks: ChecklistTask[],
  eventDate: string,
): ChecklistTask[] {
  return tasks
    .map((task) => ({
      ...task,
      dueDate: task.dueDate ?? resolveDueDate(eventDate, task.daysBeforeOffset),
    }))
    .sort((a, b) => b.daysBeforeOffset - a.daysBeforeOffset);
}

/** A dated item is overdue when its date is before today and it is not done. */
export function isOverdue(dueDate: string | undefined, done: boolean): boolean {
  if (!dueDate || done) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export interface TaskProgress {
  done: number;
  total: number;
  percent: number;
}

/** Completion progress for a checklist (or a filtered slice of one). */
export function taskProgress(tasks: ChecklistTask[]): TaskProgress {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
