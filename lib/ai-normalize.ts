import {
  eventPlanSchema,
  ideasReplySchema,
  type BudgetCategory,
  type ChecklistTask,
  type EventBrief,
  type EventPlan,
  type Idea,
  type IdeaCategory,
  type Milestone,
  type Priority,
} from "@/lib/schemas";
import { resolveDueDate } from "@/lib/timeline";
import { buildDemoPlan } from "@/lib/demo-plan";

/**
 * Defensive normalization between raw Gemini output and the strict Zod
 * contract. Models occasionally vary enum casing, omit ids, stringify
 * numbers or return objects where strings are expected — instead of
 * discarding the whole generation, we coerce and repair section by section,
 * then run the repaired object through the schema as a final guarantee.
 */

const PRIORITIES: readonly Priority[] = ["high", "medium", "low"];
const IDEA_CATEGORIES: readonly IdeaCategory[] = ["theme", "decor", "activity", "personal"];

const IDEA_CATEGORY_SYNONYMS: Record<string, IdeaCategory> = {
  entertainment: "activity",
  game: "activity",
  games: "activity",
  food: "activity",
  catering: "activity",
  music: "activity",
  venue: "theme",
  styling: "decor",
  floral: "decor",
  flowers: "decor",
  invitation: "personal",
  invitations: "personal",
  gift: "personal",
  gifts: "personal",
  keepsake: "personal",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNonNegativeNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(/[^0-9.-]/g, ""))
        : Number.NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.round(parsed));
}

function asOffset(value: unknown): number {
  const offset = asNonNegativeNumber(value, 0);
  return Math.min(730, offset);
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const candidate = asString(value).toLowerCase();
  if ((allowed as readonly string[]).includes(candidate)) return candidate as T;
  return fallback;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeCategory(raw: unknown, index: number): BudgetCategory {
  const item = isRecord(raw) ? raw : {};
  const estimated = asNonNegativeNumber(item.estimatedAmount, 0);
  return {
    id: asString(item.id, `bc_${index + 1}`) || `bc_${index + 1}`,
    name: asString(item.name, `Category ${index + 1}`),
    estimatedAmount: estimated,
    minAmount: asNonNegativeNumber(item.minAmount, Math.round(estimated * 0.9)),
    maxAmount: asNonNegativeNumber(item.maxAmount, Math.round(estimated * 1.15)),
    percentage: Math.min(100, Math.max(0, asNonNegativeNumber(item.percentage, 0))),
    note: asString(item.note).slice(0, 200) || undefined,
    actualAmount: asNonNegativeNumber(item.actualAmount, 0),
  };
}

function normalizeMilestone(raw: unknown, index: number, eventDate: string): Milestone {
  const item = isRecord(raw) ? raw : {};
  const offset = asOffset(item.daysBeforeOffset);
  return {
    id: asString(item.id, `ms_${index + 1}`) || `ms_${index + 1}`,
    title: asString(item.title, `Milestone ${index + 1}`).slice(0, 100),
    description: asString(item.description, "Complete this planning milestone.").slice(0, 300),
    daysBeforeOffset: offset,
    category: asString(item.category, "Planning").slice(0, 40),
    dueDate: resolveDueDate(eventDate, offset),
    status: pickEnum(item.status, ["pending", "done"] as const, "pending"),
  };
}

function normalizeTask(raw: unknown, index: number, eventDate: string): ChecklistTask {
  const item = isRecord(raw) ? raw : {};
  const offset = asOffset(item.daysBeforeOffset);
  const priorityCandidate = asString(item.priority).toLowerCase();
  const priority: Priority =
    priorityCandidate === "critical" || priorityCandidate === "urgent"
      ? "high"
      : pickEnum(item.priority, PRIORITIES, "medium");
  return {
    id: asString(item.id, `task_${index + 1}`) || `task_${index + 1}`,
    title: asString(item.title, `Task ${index + 1}`).slice(0, 140),
    category: asString(item.category, "General").slice(0, 40),
    priority,
    owner: asString(item.owner, "Planner").slice(0, 40),
    daysBeforeOffset: offset,
    dueDate: resolveDueDate(eventDate, offset),
    done: Boolean(item.done),
  };
}

export function normalizeIdea(raw: unknown, index: number): Idea {
  const item = isRecord(raw) ? raw : {};
  const rawCategory = asString(item.category).toLowerCase();
  const category: IdeaCategory =
    IDEA_CATEGORY_SYNONYMS[rawCategory] ??
    pickEnum(item.category, IDEA_CATEGORIES, "theme");
  const tags = asArray(item.tags)
    .map((tag) => asString(tag))
    .filter(Boolean)
    .slice(0, 6);
  return {
    id: asString(item.id, `idea_${index + 1}`) || `idea_${index + 1}`,
    title: asString(item.title, `Idea ${index + 1}`).slice(0, 100),
    description: asString(item.description, "A personalized touch tailored to your event.").slice(0, 400),
    category,
    tags,
  };
}

function flattenTips(value: unknown): string[] {
  return asArray(value)
    .map((entry) => {
      if (typeof entry === "string") return entry.trim();
      if (isRecord(entry)) {
        return asString(entry.tip || entry.text || entry.title || entry.description);
      }
      return "";
    })
    .filter((tip) => tip.length >= 4)
    .map((tip) => tip.slice(0, 240));
}

/** Repair arbitrary model output into a schema-valid EventPlan. */
export function normalizeAiPlan(raw: unknown, brief: EventBrief): EventPlan {
  const candidate = isRecord(raw) ? raw : {};
  const demo = buildDemoPlan(brief);
  const eventDate = brief.eventDate;

  const rawBudget = isRecord(candidate.budget) ? candidate.budget : {};
  const categories = asArray(rawBudget.categories).map(normalizeCategory).filter((c) => c.estimatedAmount > 0);
  const safeCategories = categories.length >= 4 ? categories : demo.budget.categories;

  const contingency = asNonNegativeNumber(rawBudget.contingencyAmount, demo.budget.contingencyAmount);
  const subtotal = safeCategories.reduce((sum, category) => sum + category.estimatedAmount, 0);
  const budget = {
    categories: safeCategories.map((category) => ({
      ...category,
      percentage:
        subtotal === 0
          ? category.percentage
          : Math.round((category.estimatedAmount / subtotal) * 100),
    })),
    contingencyAmount: contingency,
    totalEstimated: subtotal + contingency,
  };

  const timeline = asArray(candidate.timeline).map((entry, index) =>
    normalizeMilestone(entry, index, eventDate),
  );
  const safeTimeline = timeline.length >= 5 ? timeline : demo.timeline;

  const checklist = asArray(candidate.checklist).map((entry, index) =>
    normalizeTask(entry, index, eventDate),
  );
  const safeChecklist = checklist.length >= 8 ? checklist : demo.checklist;

  const ideas = asArray(candidate.ideas).map(normalizeIdea);
  const safeIdeas = ideas.length >= 4 ? ideas : demo.ideas;

  const riskTips = flattenTips(candidate.riskTips);
  const safeRiskTips = riskTips.length >= 3 ? riskTips : demo.riskTips;

  const repaired = {
    source: "gemini" as const,
    summary:
      asString(candidate.summary).length >= 10
        ? asString(candidate.summary).slice(0, 600)
        : `AI-generated plan for ${brief.guestCount} guests within a ${brief.currency} ${brief.budgetTotal} budget.`,
    budget,
    timeline: safeTimeline,
    checklist: safeChecklist,
    ideas: safeIdeas,
    riskTips: safeRiskTips,
    generatedAt: new Date().toISOString(),
  };

  // Final guarantee: the repaired object must still satisfy the full contract.
  return eventPlanSchema.parse(repaired);
}

/** Tolerant parse for the ideas endpoint. */
export function normalizeIdeasReply(raw: unknown, brief: EventBrief) {
  const candidate = isRecord(raw) ? raw : {};
  const ideas = asArray(candidate.ideas).map(normalizeIdea);
  const safeIdeas = ideas.length >= 3 ? ideas : buildDemoPlan(brief).ideas;
  return ideasReplySchema.parse({ ideas: safeIdeas });
}
