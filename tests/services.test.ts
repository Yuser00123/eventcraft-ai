import { beforeEach, describe, expect, it, vi } from "vitest";
import { eventBriefSchema, type EventBrief, type EventPlan } from "@/lib/schemas";
import { buildDemoPlan } from "@/lib/demo-plan";

const generateJson = vi.fn();
const generateText = vi.fn();
const isGeminiConfigured = vi.fn();

vi.mock("@/lib/gemini", () => ({
  generateJson: (args: unknown) => generateJson(args),
  generateText: (args: unknown) => generateText(args),
  isGeminiConfigured: () => isGeminiConfigured(),
  getGeminiClient: vi.fn(),
  geminiModel: () => "gemini-flash-latest",
}));

import { chatReply, generatePlan, regenerateIdeas } from "@/lib/services";

function brief(): EventBrief {
  const date = new Date();
  date.setDate(date.getDate() + 60);
  return eventBriefSchema.parse({
    eventType: "wedding",
    eventTitle: "Test wedding",
    eventDate: date.toISOString().slice(0, 10),
    guestCount: 120,
    budgetTotal: 1_000_000,
    currency: "INR",
    locationTier: "metro",
    styleTags: ["elegant"],
  });
}

/** Strip the fields the service enriches so the payload mimics raw model output. */
function rawModelPayload(plan: EventPlan) {
  return {
    summary: plan.summary,
    budget: plan.budget,
    timeline: plan.timeline.map(({ id, title, description, daysBeforeOffset, category }) => ({
      id,
      title,
      description,
      daysBeforeOffset,
      category,
    })),
    checklist: plan.checklist.map(({ id, title, category, priority, owner, daysBeforeOffset }) => ({
      id,
      title,
      category,
      priority,
      owner,
      daysBeforeOffset,
    })),
    ideas: plan.ideas,
    riskTips: plan.riskTips,
  };
}

describe("planning services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the deterministic demo plan when Gemini is unconfigured", async () => {
    isGeminiConfigured.mockReturnValue(false);
    const plan = await generatePlan(brief());
    expect(plan.source).toBe("demo");
    expect(plan.timeline[0]?.dueDate).toBeTruthy();
    expect(generateJson).not.toHaveBeenCalled();
  });

  it("validates and enriches Gemini output with calendar dates", async () => {
    isGeminiConfigured.mockReturnValue(true);
    const input = brief();
    generateJson.mockResolvedValue(rawModelPayload(buildDemoPlan(input)));

    const plan = await generatePlan(input);
    expect(plan.source).toBe("gemini");
    expect(generateJson).toHaveBeenCalledTimes(1);
    expect(plan.checklist.every((task) => Boolean(task.dueDate))).toBe(true);
    expect(plan.generatedAt).toBeTruthy();
  });

  it("falls back to demo output when the model call fails", async () => {
    isGeminiConfigured.mockReturnValue(true);
    generateJson.mockRejectedValue(new Error("model timeout"));
    const plan = await generatePlan(brief());
    expect(plan.source).toBe("demo");
  });

  it("regenerates ideas through the ideas endpoint contract", async () => {
    isGeminiConfigured.mockReturnValue(true);
    const input = brief();
    generateJson.mockResolvedValue({ ideas: buildDemoPlan(input).ideas });
    const reply = await regenerateIdeas({ brief: input, count: 6 });
    expect(reply.ideas.length).toBeGreaterThanOrEqual(3);
  });

  it("returns a validated chat reply", async () => {
    isGeminiConfigured.mockReturnValue(true);
    const input = brief();
    const plan = buildDemoPlan(input);
    generateText.mockResolvedValue("Consider trimming the live dessert counter first.");
    const reply = await chatReply({
      brief: input,
      plan,
      messages: [{ role: "user", content: "Where should I cut spend?" }],
    });
    expect(reply.reply).toContain("dessert");
  });
});
