import {
  chatReplySchema,
  eventPlanSchema,
  ideasReplySchema,
  type ChatReply,
  type ChatRequest,
  type EventBrief,
  type EventPlan,
  type IdeasReply,
  type IdeasRequest,
} from "@/lib/schemas";
import { generateJson, generateText, isGeminiConfigured } from "@/lib/gemini";
import {
  PLAN_SYSTEM_INSTRUCTION,
  buildChatPrompt,
  buildChatSystemInstruction,
  buildIdeasPrompt,
  buildPlanPrompt,
  ideasResponseSchema,
  planResponseSchema,
} from "@/lib/prompts";
import { enrichMilestones, enrichTasks } from "@/lib/timeline";
import { buildDemoPlan } from "@/lib/demo-plan";

/**
 * Service layer — the only place API routes meet AI logic.
 * Keeping orchestration here (instead of inside route handlers) makes the
 * whole pipeline unit-testable with a mocked Gemini module.
 */

/** Log server-side without leaking details to the client. */
function logAiFailure(scope: string, error: unknown): void {
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(`[eventcraft] ${scope} failed: ${message}`);
}

/** Add real calendar dates to model output and validate the full contract. */
function validateAiPlan(raw: unknown, eventDate: string): EventPlan {
  const candidate = raw as Record<string, unknown>;
  const withDates = {
    ...candidate,
    source: "gemini" as const,
    generatedAt: new Date().toISOString(),
    timeline: enrichMilestones(
      (candidate.timeline as EventPlan["timeline"]) ?? [],
      eventDate,
    ),
    checklist: enrichTasks(
      (candidate.checklist as EventPlan["checklist"]) ?? [],
      eventDate,
    ),
  };
  return eventPlanSchema.parse(withDates);
}

/** Generate the full master plan; falls back to the deterministic demo. */
export async function generatePlan(brief: EventBrief): Promise<EventPlan> {
  if (!isGeminiConfigured()) {
    return withDemoDates(buildDemoPlan(brief), brief.eventDate);
  }
  try {
    const raw = await generateJson<unknown>({
      systemInstruction: PLAN_SYSTEM_INSTRUCTION,
      prompt: buildPlanPrompt(brief),
      responseSchema: planResponseSchema,
      temperature: 0.4,
    });
    return validateAiPlan(raw, brief.eventDate);
  } catch (error) {
    logAiFailure("generatePlan", error);
    return withDemoDates(buildDemoPlan(brief), brief.eventDate);
  }
}

function withDemoDates(plan: EventPlan, eventDate: string): EventPlan {
  return {
    ...plan,
    timeline: enrichMilestones(plan.timeline, eventDate),
    checklist: enrichTasks(plan.checklist, eventDate),
  };
}

/** Regenerate a fresh batch of personalized idea cards. */
export async function regenerateIdeas(
  request: IdeasRequest,
): Promise<IdeasReply> {
  if (!isGeminiConfigured()) {
    return { ideas: buildDemoPlan(request.brief).ideas };
  }
  try {
    const raw = await generateJson<unknown>({
      systemInstruction: PLAN_SYSTEM_INSTRUCTION,
      prompt: buildIdeasPrompt(request.brief, request.focus),
      responseSchema: ideasResponseSchema,
      temperature: 0.9,
    });
    return ideasReplySchema.parse(raw);
  } catch (error) {
    logAiFailure("regenerateIdeas", error);
    return { ideas: buildDemoPlan(request.brief).ideas };
  }
}

/** Grounded planning-assistant reply using the live plan as context. */
export async function chatReply(request: ChatRequest): Promise<ChatReply> {
  if (!isGeminiConfigured()) {
    return {
      reply:
        "The live assistant requires GEMINI_API_KEY on the server. Meanwhile, compare over-budget categories against your contingency reserve, and ask vendors for itemized quotes before cutting scope.",
    };
  }
  try {
    const reply = await generateText({
      systemInstruction: buildChatSystemInstruction(request),
      prompt: buildChatPrompt(request.messages),
      temperature: 0.5,
    });
    return chatReplySchema.parse({ reply });
  } catch (error) {
    logAiFailure("chatReply", error);
    throw new Error("ASSISTANT_UNAVAILABLE");
  }
}
