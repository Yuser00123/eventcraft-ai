# Prompt Engineering Log

This document captures the architectural prompting behind EventCraft AI.
The application's quality depends less on a single clever sentence than on a
repeatable prompt **structure** applied consistently across three endpoints.

## The five-part prompt pattern

Every Gemini call is assembled from the same five blocks:

1. **Role** — "You are EventCraft AI, a senior event planning strategist."
2. **Grounded context** — the user's real brief (type, date, guests, budget, tier, style tags, dietary and special requirements).
3. **Output contract** — an explicit JSON `responseSchema`; the model cannot return prose where the app expects objects.
4. **Event-type guidance** — a dedicated instruction block for wedding, birthday or community events so the three flows diverge meaningfully.
5. **Guardrails** — no invented vendor names, no geographic references, estimates labelled as planning ranges, and (for chat) no deciding on the user's behalf.

## Why structured output replaced "ask nicely for JSON"

Early concept prompts asked the model to "respond with valid JSON". That is
fragile: models wrap JSON in markdown fences, add commentary, or rename keys.
The production design passes a typed `responseSchema` (`lib/prompts.ts`) and
sets `responseMimeType: "application/json"`, then validates the result with
Zod a second time. The prompt itself stays focused on **domain behavior**
(tailoring, realism, safety) while the schema guarantees **shape**.

## Temperature strategy

| Endpoint | Temperature | Reason |
|---|---|---|
| `/api/generate-plan` | 0.4 | Budgets and timelines must be stable and realistic; low variance. |
| `/api/ideas` | 0.9 | Idea generation is the one place creative divergence is valuable. |
| `/api/chat` | 0.5 | Balanced: conversational but grounded in the plan context. |

## Event-type conditioning (excerpt)

```text
Wedding   → ceremony-specific vendors, sequencing, deposit/deadline milestones
Birthday  → cake, entertainment/games, return gifts, tight party-day milestones
Community → permits, volunteer coordination, safety/first-aid, A/V and outreach
```

The same UI renders all three; the **prompt** carries the domain differences,
which keeps the codebase single-pathed while the outputs stay specialized.

## Grounded chat design

The assistant's system instruction is rebuilt per request from the live plan:
the full budget status (estimate vs. actual per category), open risk tips and
event metadata are injected before the conversation. The user therefore never
re-explains context, and the model is explicitly instructed to present
trade-offs rather than make the final decision.

## Fallback philosophy

Prompts can fail — timeouts, malformed output, quota exhaustion. Instead of
showing an error screen, the service layer falls back to a deterministic
planning engine (`lib/demo-plan.ts`) computed from the same brief, and labels
the result as demo output. The prompt architecture is designed for
**graceful degradation**, which is as much a prompt-engineering decision as
the system instruction itself.
