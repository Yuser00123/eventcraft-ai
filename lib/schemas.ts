import { z } from "zod";

/**
 * Zod schemas — the single source of truth shared by the client forms,
 * the server route handlers, the Gemini response validation and the tests.
 */

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export const eventTypeSchema = z.enum(["wedding", "birthday", "community"]);
export type EventType = z.infer<typeof eventTypeSchema>;

export const locationTierSchema = z.enum(["metro", "city", "town"]);
export type LocationTier = z.infer<typeof locationTierSchema>;

export const prioritySchema = z.enum(["high", "medium", "low"]);
export type Priority = z.infer<typeof prioritySchema>;

export const ideaCategorySchema = z.enum([
  "theme",
  "decor",
  "activity",
  "personal",
]);
export type IdeaCategory = z.infer<typeof ideaCategorySchema>;

export const milestoneStatusSchema = z.enum(["pending", "done"]);
export type MilestoneStatus = z.infer<typeof milestoneStatusSchema>;

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export const eventBriefSchema = z
  .object({
    eventType: eventTypeSchema,
    eventTitle: z
      .string()
      .trim()
      .min(2, "Please give your event a title (at least 2 characters).")
      .max(80),
    eventDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker to choose a date."),
    guestCount: z.coerce
      .number({ invalid_type_error: "Guest count must be a number." })
      .int()
      .min(1, "At least one guest is required.")
      .max(100_000),
    budgetTotal: z.coerce
      .number({ invalid_type_error: "Budget must be a number." })
      .positive("Budget must be greater than zero.")
      .max(1_000_000_000),
    currency: z.string().trim().length(3).toUpperCase().default("INR"),
    locationTier: locationTierSchema,
    styleTags: z
      .array(z.string().trim().min(1).max(30))
      .max(6, "Pick at most six style tags."),
    dietaryNotes: z.string().trim().max(300).optional(),
    specialRequirements: z.string().trim().max(500).optional(),
  })
  .refine((value) => value.eventDate >= todayIsoDate(), {
    message: "Event date must be today or in the future.",
    path: ["eventDate"],
  });
export type EventBrief = z.infer<typeof eventBriefSchema>;

// ---------------------------------------------------------------------------
// Generated plan
// ---------------------------------------------------------------------------

export const budgetCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  estimatedAmount: z.number().nonnegative(),
  minAmount: z.number().nonnegative(),
  maxAmount: z.number().nonnegative(),
  percentage: z.number().min(0).max(100),
  note: z.string().max(200).optional(),
  actualAmount: z.number().nonnegative().default(0),
});
export type BudgetCategory = z.infer<typeof budgetCategorySchema>;

export const budgetSchema = z.object({
  categories: z.array(budgetCategorySchema).min(4).max(12),
  contingencyAmount: z.number().nonnegative(),
  totalEstimated: z.number().nonnegative(),
});
export type Budget = z.infer<typeof budgetSchema>;

export const milestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(300),
  daysBeforeOffset: z.number().int().min(0).max(730),
  category: z.string().min(1).max(40),
  dueDate: z.string().optional(),
  status: milestoneStatusSchema.default("pending"),
});
export type Milestone = z.infer<typeof milestoneSchema>;

export const checklistTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(140),
  category: z.string().min(1).max(40),
  priority: prioritySchema,
  owner: z.string().min(1).max(40),
  daysBeforeOffset: z.number().int().min(0).max(730),
  dueDate: z.string().optional(),
  done: z.boolean().default(false),
});
export type ChecklistTask = z.infer<typeof checklistTaskSchema>;

export const ideaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(400),
  category: ideaCategorySchema,
  tags: z.array(z.string().max(30)).max(6),
});
export type Idea = z.infer<typeof ideaSchema>;

export const planSourceSchema = z.enum(["gemini", "demo"]);
export type PlanSource = z.infer<typeof planSourceSchema>;

export const eventPlanSchema = z.object({
  source: planSourceSchema,
  summary: z.string().min(10).max(600),
  budget: budgetSchema,
  timeline: z.array(milestoneSchema).min(5).max(24),
  checklist: z.array(checklistTaskSchema).min(8).max(48),
  ideas: z.array(ideaSchema).min(4).max(10),
  riskTips: z.array(z.string().min(4).max(240)).min(3).max(8),
  generatedAt: z.string().min(1),
});
export type EventPlan = z.infer<typeof eventPlanSchema>;

/** Persisted planner document — the brief plus its editable plan. */
export const plannerDocumentSchema = z.object({
  brief: eventBriefSchema,
  plan: eventPlanSchema,
});
export type PlannerDocument = z.infer<typeof plannerDocumentSchema>;

// ---------------------------------------------------------------------------
// Assistant chat & idea regeneration
// ---------------------------------------------------------------------------

export const chatRoleSchema = z.enum(["user", "assistant"]);
export type ChatRole = z.infer<typeof chatRoleSchema>;

export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z.string().trim().min(1).max(1_500),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  brief: eventBriefSchema,
  plan: eventPlanSchema,
  messages: z.array(chatMessageSchema).min(1).max(12),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatReplySchema = z.object({ reply: z.string().min(1).max(2_000) });
export type ChatReply = z.infer<typeof chatReplySchema>;

export const ideasRequestSchema = z.object({
  brief: eventBriefSchema,
  focus: z.string().trim().max(120).optional(),
  count: z.coerce.number().int().min(3).max(8).default(6),
});
export type IdeasRequest = z.infer<typeof ideasRequestSchema>;

export const ideasReplySchema = z.object({ ideas: z.array(ideaSchema).min(3) });
export type IdeasReply = z.infer<typeof ideasReplySchema>;
