import {
  chatReplySchema,
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
import { normalizeAiPlan, normalizeIdeasReply } from "@/lib/ai-normalize";

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

/** Attach calendar dates to the deterministic demo plan. */
function withDemoDates(plan: EventPlan, eventDate: string): EventPlan {
  return {
    ...plan,
    timeline: enrichMilestones(plan.timeline, eventDate),
    checklist: enrichTasks(plan.checklist, eventDate),
  };
}

/**
 * One live generation attempt. The normalizer repairs messy model output
 * (enum casing, missing ids, object-shaped tips) before the strict Zod
 * contract runs, so partial deviations never waste a whole generation.
 */
async function attemptPlanGeneration(brief: EventBrief): Promise<EventPlan> {
  const raw = await generateJson<unknown>({
    systemInstruction: PLAN_SYSTEM_INSTRUCTION,
    prompt: buildPlanPrompt(brief),
    responseSchema: planResponseSchema,
    temperature: 0.4,
    maxOutputTokens: 8192,
    // Two 25s attempts stay within the 60s serverless function limit.
    timeoutMs: 25_000,
  });
  return normalizeAiPlan(raw, brief);
}

/** Generate the full master plan; retry once, then fall back to demo. */
export async function generatePlan(brief: EventBrief): Promise<EventPlan> {
  if (!isGeminiConfigured()) {
    return withDemoDates(buildDemoPlan(brief), brief.eventDate);
  }
  try {
    return await attemptPlanGeneration(brief);
  } catch (firstError) {
    logAiFailure("generatePlan (attempt 1)", firstError);
    try {
      return await attemptPlanGeneration(brief);
    } catch (secondError) {
      logAiFailure("generatePlan (attempt 2)", secondError);
      return withDemoDates(buildDemoPlan(brief), brief.eventDate);
    }
  }
}

/** Regenerate a fresh batch of personalized idea cards. */
export async function regenerateIdeas(request: IdeasRequest): Promise<IdeasReply> {
  if (!isGeminiConfigured()) {
    return { ideas: buildDemoPlan(request.brief).ideas };
  }
  try {
    const raw = await generateJson<unknown>({
      systemInstruction: PLAN_SYSTEM_INSTRUCTION,
      prompt: buildIdeasPrompt(request.brief, request.focus),
      responseSchema: ideasResponseSchema,
      temperature: 0.9,
      maxOutputTokens: 4096,
      timeoutMs: 20_000,
    });
    return normalizeIdeasReply(raw, request.brief);
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
      timeoutMs: 20_000,
    });
    return chatReplySchema.parse({ reply });
  } catch (error) {
    logAiFailure("chatReply", error);
    throw new Error("ASSISTANT_UNAVAILABLE");
  }
}
