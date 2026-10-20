import { describe, expect, it } from "vitest";
import { eventBriefSchema, type EventBrief, type EventPlan } from "@/lib/schemas";
import { normalizeAiPlan, normalizeIdeasReply } from "@/lib/ai-normalize";

function brief(): EventBrief {
  return eventBriefSchema.parse({
    eventType: "wedding",
    eventTitle: "Normalizer test wedding",
    eventDate: "2030-11-10",
    guestCount: 100,
    budgetTotal: 800_000,
    currency: "INR",
    locationTier: "city",
    styleTags: ["rustic"],
  });
}

/** Deliberately messy payload mimicking real model deviations. */
function messyPayload() {
  return {
    summary: "A complete wedding plan with venues, catering and rituals for the family.",
    budget: {
      categories: [
        {
          id: "c1",
          name: "Venue",
          estimatedAmount: "150000", // stringified number
          minAmount: "140000",
          maxAmount: 170_000,
          percentage: 25,
        },
        { name: "Catering", estimatedAmount: 200_000 }, // missing id + range fields
        { id: "c3", name: "Decor", estimatedAmount: 90_000, percentage: 15 },
        { id: "c4", name: "Photography", estimatedAmount: 70_000 },
      ],
      contingencyAmount: "40000",
    },
    timeline: [
      { id: "t1", title: "Book venue", description: "Deposit", daysBeforeOffset: 90, category: "Venue" },
      { title: "Send invites", description: "Digital first", daysBeforeOffset: "45", category: "Invitations" }, // string offset, no id
      { id: "t3", title: "Trial fitting", description: "Outfits", daysBeforeOffset: 20, category: "Attire", status: "DONE" }, // wrong enum case
      { id: "t4", title: "Final headcount", description: "Confirm", daysBeforeOffset: 10, category: "Catering" },
      { id: "t5", title: "Rehearsal", description: "Run of show", daysBeforeOffset: 2, category: "Coordination" },
    ],
    checklist: [
      { id: "x1", title: "Compare venue quotes", category: "Venue", priority: "CRITICAL", owner: "Host", daysBeforeOffset: 80 }, // synonym enum
      { title: "Pay deposit", category: "Venue", priority: "high", owner: "Host", daysBeforeOffset: 75 }, // missing id
      { id: "x3", title: "Tasting session", category: "Catering", priority: "Medium", owner: "Couple", daysBeforeOffset: 60 },
      { id: "x4", title: "Book photographer", category: "Photography", priority: "low", owner: "Couple", daysBeforeOffset: 55 },
      { id: "x5", title: "Decor mock-up", category: "Decor", priority: "medium", owner: "Couple", daysBeforeOffset: 40 },
      { id: "x6", title: "Music playlist", category: "Entertainment", priority: "low", owner: "Family", daysBeforeOffset: 10 },
      { id: "x7", title: "Guest transport", category: "Logistics", priority: "medium", owner: "Volunteer", daysBeforeOffset: 7 },
      { id: "x8", title: "Emergency kit", category: "Event day", priority: "low", owner: "Volunteer", daysBeforeOffset: 1 },
    ],
    ideas: [
      { id: "i1", title: "Rustic courtyard", description: "Lanterns and wood", category: "Entertainment", tags: ["rustic"] }, // synonym → activity
      { title: "Memory wall", description: "Guest wishes", category: "personal" }, // missing id, lowercase ok
      { id: "i3", title: "Potluck dessert", description: "Family sweets", category: "food", tags: ["dessert", "interactive"] },
      { id: "i4", title: "Digital invites", description: "Three-touch sequence", category: "invitations" },
    ],
    riskTips: [
      { tip: "Get receipts for every deposit" }, // object instead of string
      { text: "Confirm weather backup two weeks ahead" },
      "Keep the contingency reserve untouched until final week.",
    ],
  };
}

describe("normalizeAiPlan", () => {
  it("repairs a messy payload into a fully schema-valid gemini plan", () => {
    const plan: EventPlan = normalizeAiPlan(messyPayload(), brief());

    expect(plan.source).toBe("gemini");
    expect(plan.budget.categories).toHaveLength(4);
    expect(plan.budget.categories[0]?.estimatedAmount).toBe(150_000);
    expect(plan.budget.categories[1]?.id).toBeTruthy(); // synthesized id
    expect(plan.budget.totalEstimated).toBeGreaterThan(0);

    expect(plan.timeline).toHaveLength(5);
    expect(plan.timeline[0]?.dueDate).toBeTruthy(); // dates resolved from offsets
    expect(plan.timeline[2]?.status).toBe("done"); // uppercase enum repaired
    expect(plan.timeline[1]?.id).toBeTruthy();

    expect(plan.checklist[0]?.priority).toBe("high"); // CRITICAL synonym mapped
    expect(plan.checklist.every((task) => Boolean(task.dueDate))).toBe(true);

    expect(plan.ideas[0]?.category).toBe("activity"); // Entertainment synonym
    expect(plan.ideas[2]?.category).toBe("activity"); // food synonym
    expect(plan.ideas[3]?.category).toBe("personal"); // invitations synonym
    expect(plan.ideas.every((idea) => idea.id.length > 0)).toBe(true);

    expect(plan.riskTips).toHaveLength(3);
    expect(plan.riskTips[0]).toBe("Get receipts for every deposit");
  });

  it("backfills only the missing sections while keeping live ones, with dates attached", () => {
    const plan = normalizeAiPlan(
      {
        summary: "Short but valid summary text here.",
        budget: {
          categories: [
            { id: "b1", name: "Venue", estimatedAmount: 100_000 },
            { id: "b2", name: "Food", estimatedAmount: 120_000 },
            { id: "b3", name: "Decor", estimatedAmount: 50_000 },
            { id: "b4", name: "Music", estimatedAmount: 30_000 },
          ],
          contingencyAmount: 20_000,
        },
        ideas: [
          { id: "i1", title: "Lantern aisle", description: "Warm lighting", category: "decor", tags: [] },
          { id: "i2", title: "Photo corner", description: "Polaroid wall", category: "theme", tags: [] },
          { id: "i3", title: "Dance-off", description: "Guest activity", category: "activity", tags: [] },
          { id: "i4", title: "Handwritten notes", description: "Personal touch", category: "personal", tags: [] },
        ],
        timeline: [], // backfilled
        checklist: [], // backfilled
        riskTips: [], // backfilled
      },
      brief(),
    );
    expect(plan.source).toBe("gemini");
    expect(plan.budget.categories[0]?.name).toBe("Venue"); // live section kept
    expect(plan.ideas[0]?.title).toBe("Lantern aisle");
    expect(plan.timeline.length).toBeGreaterThanOrEqual(5); // backfilled
    expect(plan.checklist.length).toBeGreaterThanOrEqual(8);
    expect(plan.riskTips.length).toBeGreaterThanOrEqual(3);
    expect(plan.timeline.every((m) => Boolean(m.dueDate))).toBe(true); // dated backfill
    expect(plan.checklist.every((t) => Boolean(t.dueDate))).toBe(true);
  });

  it("throws when the model contributes no usable section so callers can retry/fallback", () => {
    expect(() => normalizeAiPlan(null, brief())).toThrow();
    expect(() => normalizeAiPlan("nope", brief())).toThrow();
    expect(() =>
      normalizeAiPlan(
        { summary: "Short but valid summary text here.", budget: {}, timeline: [], checklist: [], ideas: [], riskTips: [] },
        brief(),
      ),
    ).toThrow();
  });

  it("unwraps plans nested inside an envelope key", () => {
    const inner = messyPayload();
    const plan = normalizeAiPlan({ plan: inner }, brief());
    expect(plan.source).toBe("gemini");
    expect(plan.budget.categories).toHaveLength(4);
    expect(plan.checklist[0]?.priority).toBe("high");
  });

  it("clamps dangerous offsets and drops negative-number categories", () => {
    const plan = normalizeAiPlan(
      {
        summary: "Valid summary text with enough characters to pass the minimum length rule.",
        budget: {
          categories: [
            { id: "a", name: "Venue", estimatedAmount: -50 }, // filtered out
            { id: "b", name: "Catering", estimatedAmount: 100_000 },
            { id: "c", name: "Decor", estimatedAmount: 60_000 },
            { id: "d", name: "Photo", estimatedAmount: 40_000 },
            { id: "e", name: "Music", estimatedAmount: 20_000 },
          ],
        },
        timeline: [
          { id: "m0", title: "M0", description: "d", daysBeforeOffset: 9999, category: "c" },
          { id: "m1", title: "M1", description: "d", daysBeforeOffset: 60, category: "c" },
          { id: "m2", title: "M2", description: "d", daysBeforeOffset: 40, category: "c" },
          { id: "m3", title: "M3", description: "d", daysBeforeOffset: 20, category: "c" },
          { id: "m4", title: "M4", description: "d", daysBeforeOffset: 0, category: "c" },
        ],
        checklist: [],
        ideas: [],
        riskTips: [],
      },
      brief(),
    );
    expect(plan.budget.categories).toHaveLength(4); // negative entry removed, minimum still met
    expect(plan.budget.categories.every((c) => c.estimatedAmount >= 0)).toBe(true);
    expect(plan.timeline.every((m) => m.daysBeforeOffset <= 730)).toBe(true);
  });
});

describe("normalizeIdeasReply", () => {
  it("repairs and validates idea batches", () => {
    const reply = normalizeIdeasReply(
      { ideas: [{ title: "Surprise flash mob", description: "Guests join in", category: "weird-new-category" }] },
      brief(),
    );
    expect(reply.ideas[0]?.category).toBe("theme"); // unknown enum → fallback
    expect(reply.ideas.length).toBeGreaterThanOrEqual(3); // backfilled to minimum
  });
});
