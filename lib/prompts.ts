import { Type, type Schema } from "@google/genai";
import type { ChatRequest, EventBrief } from "@/lib/schemas";

/**
 * Prompt architecture. Every prompt follows the same pattern:
 * role + grounded event context + output contract + safety guardrails.
 */

const EVENT_GUIDANCE: Record<EventBrief["eventType"], string> = {
  wedding:
    "This is a WEDDING. Include ceremony-specific vendors (venue, catering, decor, photography, attire, invitations, music, transport), ceremony sequencing and deposit/deadline milestones typical of multi-function celebrations.",
  birthday:
    "This is a BIRTHDAY celebration. Include cake, decor, entertainment/games, invitations, return gifts and age-appropriate activities; keep milestones tight and party-day focused.",
  community:
    "This is a COMMUNITY EVENT. Include permits, venue logistics, volunteer coordination, safety/first-aid, outreach, signage and A/V; emphasize coordination tasks and compliance steps.",
};

function briefContext(brief: EventBrief): string {
  return [
    `Event type: ${brief.eventType}`,
    `Title: ${brief.eventTitle}`,
    `Event date: ${brief.eventDate} (offsets are counted backwards from this date)`,
    `Guest count: ${brief.guestCount}`,
    `Total budget: ${brief.currency} ${brief.budgetTotal}`,
    `Location tier: ${brief.locationTier} (use tier-appropriate, generic price ranges — never invent named vendors or venues)`,
    `Style tags: ${brief.styleTags.join(", ") || "none provided"}`,
    brief.dietaryNotes ? `Dietary notes: ${brief.dietaryNotes}` : "",
    brief.specialRequirements
      ? `Special requirements: ${brief.specialRequirements}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const PLAN_SYSTEM_INSTRUCTION = [
  "You are EventCraft AI, a senior event planning strategist.",
  "You produce precise, practical event plans as JSON matching the exact schema provided.",
  "All money values are integers in the user's currency. Estimates must be realistic for the guest count, budget and location tier.",
  "Budget category percentages must reflect the estimated amounts. Keep the sum of category estimates plus the contingency reserve within the total budget.",
  "Offsets are whole days before the event: 0 means event day, 30 means 30 days before.",
  "Never invent real vendor/venue brand names. Never mention geographic regions, states or cities. Label estimates as planning ranges, not quotes.",
  "Ideas must be personalized to the style tags, guest count and requirements — generic filler is rejected.",
].join(" ");

export function buildPlanPrompt(brief: EventBrief): string {
  return `${EVENT_GUIDANCE[brief.eventType]}\n\nEvent details:\n${briefContext(
    brief,
  )}\n\nReturn the complete plan object now.`;
}

export const planResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    budget: {
      type: Type.OBJECT,
      properties: {
        categories: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              estimatedAmount: { type: Type.INTEGER },
              minAmount: { type: Type.INTEGER },
              maxAmount: { type: Type.INTEGER },
              percentage: { type: Type.NUMBER },
              note: { type: Type.STRING },
            },
            required: [
              "id",
              "name",
              "estimatedAmount",
              "minAmount",
              "maxAmount",
              "percentage",
            ],
          },
        },
        contingencyAmount: { type: Type.INTEGER },
        totalEstimated: { type: Type.INTEGER },
      },
      required: ["categories", "contingencyAmount", "totalEstimated"],
    },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          daysBeforeOffset: { type: Type.INTEGER },
          category: { type: Type.STRING },
        },
        required: ["id", "title", "description", "daysBeforeOffset", "category"],
      },
    },
    checklist: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
          owner: { type: Type.STRING },
          daysBeforeOffset: { type: Type.INTEGER },
        },
        required: [
          "id",
          "title",
          "category",
          "priority",
          "owner",
          "daysBeforeOffset",
        ],
      },
    },
    ideas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: ["theme", "decor", "activity", "personal"],
          },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["id", "title", "description", "category", "tags"],
      },
    },
    riskTips: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["summary", "budget", "timeline", "checklist", "ideas", "riskTips"],
};

export function buildIdeasPrompt(brief: EventBrief, focus?: string): string {
  return [
    EVENT_GUIDANCE[brief.eventType],
    `Event details:\n${briefContext(brief)}`,
    focus ? `Extra focus requested: ${focus}` : "",
    "Return fresh, personalized idea cards distinct from any previous batch.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const ideasResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ideas: planResponseSchema.properties!.ideas!,
  },
  required: ["ideas"],
};

export function buildChatSystemInstruction({
  brief,
  plan,
}: Pick<ChatRequest, "brief" | "plan">): string {
  const categorySummary = plan.budget.categories
    .map(
      (category) =>
        `- ${category.name}: estimated ${brief.currency} ${category.estimatedAmount}, spent ${brief.currency} ${category.actualAmount}`,
    )
    .join("\n");
  return [
    "You are EventCraft AI's planning assistant, embedded inside the user's live plan.",
    "Answer only using the plan context below and general event-planning best practice.",
    "Be concise (under 150 words), practical and specific. Never invent vendor names or quote unverified prices.",
    "Do not make the final decision for the user — present trade-offs and options.",
    `\nEvent: ${brief.eventTitle} (${brief.eventType}), ${brief.guestCount} guests, date ${brief.eventDate}, budget ${brief.currency} ${brief.budgetTotal}.`,
    `\nBudget status:\n${categorySummary}`,
    `\nOpen risk tips:\n${plan.riskTips.map((tip) => `- ${tip}`).join("\n")}`,
  ].join("\n");
}

export function buildChatPrompt(messages: ChatRequest["messages"]): string {
  return messages
    .map((message) =>
      message.role === "user" ? `User: ${message.content}` : `Assistant: ${message.content}`,
    )
    .join("\n");
}
