import { describe, expect, it } from "vitest";
import {
  eventBriefSchema,
  eventPlanSchema,
  type EventBrief,
  type EventType,
} from "@/lib/schemas";
import { buildDemoPlan } from "@/lib/demo-plan";

function validBrief(overrides: Partial<EventBrief> = {}): EventBrief {
  const future = new Date();
  future.setDate(future.getDate() + 30);
  return {
    eventType: "birthday",
    eventTitle: "Riya's 10th birthday",
    eventDate: future.toISOString().slice(0, 10),
    guestCount: 40,
    budgetTotal: 100_000,
    currency: "INR",
    locationTier: "city",
    styleTags: ["themed"],
    ...overrides,
  };
}

describe("event brief validation", () => {
  it("accepts a valid brief and uppercases currency", () => {
    const parsed = eventBriefSchema.parse({ ...validBrief(), currency: "inr" });
    expect(parsed.currency).toBe("INR");
  });

  it("rejects past dates", () => {
    const result = eventBriefSchema.safeParse(validBrief({ eventDate: "2020-01-01" }));
    expect(result.success).toBe(false);
  });

  it("rejects zero guests and negative budgets", () => {
    expect(eventBriefSchema.safeParse(validBrief({ guestCount: 0 })).success).toBe(false);
    expect(eventBriefSchema.safeParse(validBrief({ budgetTotal: -5 })).success).toBe(false);
  });

  it("rejects unknown event types", () => {
    const result = eventBriefSchema.safeParse(
      validBrief({ eventType: "reunion" as EventType }),
    );
    expect(result.success).toBe(false);
  });
});

describe("generated plan contract", () => {
  it("the demo plan satisfies the full plan schema", () => {
    const plan = buildDemoPlan(validBrief());
    const parsed = eventPlanSchema.safeParse(plan);
    expect(parsed.success).toBe(true);
  });

  it("provides every mandated planning artifact", () => {
    const plan = buildDemoPlan(validBrief({ eventType: "wedding" }));
    expect(plan.budget.categories.length).toBeGreaterThanOrEqual(4);
    expect(plan.timeline.length).toBeGreaterThanOrEqual(5);
    expect(plan.checklist.length).toBeGreaterThanOrEqual(8);
    expect(plan.ideas.length).toBeGreaterThanOrEqual(4);
    expect(plan.riskTips.length).toBeGreaterThanOrEqual(3);
  });

  it("tailors categories to the event type", () => {
    const wedding = buildDemoPlan(validBrief({ eventType: "wedding" }));
    const community = buildDemoPlan(validBrief({ eventType: "community" }));
    expect(wedding.budget.categories.some((c) => c.name.includes("Attire"))).toBe(true);
    expect(community.budget.categories.some((c) => c.name.includes("permits"))).toBe(true);
  });
});
