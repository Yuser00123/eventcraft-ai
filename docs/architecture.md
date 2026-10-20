# Architecture — EventCraft AI

## High-level flow

```
Browser (React Client Components)
   │  validated event brief
   ▼
Next.js Route Handlers (server-only, no secret reaches the client)
   ├─ POST /api/generate-plan   full master plan in one model call
   ├─ POST /api/ideas           fresh personalized idea batch
   └─ POST /api/chat            grounded planning-assistant reply
   │
   ├─ RateLimiter (sliding window)
   ├─ Zod safeParse on every request body
   ▼
Service layer (lib/services.ts) — orchestration, testable in isolation
   ▼
Gemini layer (lib/gemini.ts) — @google/genai, JSON responseSchema mode
   │  typed, schema-constrained payload
   ▼
Zod parse of model output → date enrichment (offsets → calendar dates)
   ▼
React state → typed localStorage persistence → six dashboard views
```

## Design decisions and their rationale

### 1. Next.js Route Handlers instead of a browser-only SDK call
The Gemini key would be exposed in client JavaScript if called directly.
Route handlers keep the secret server-side, centralize validation/rate
limiting and make every AI boundary unit-testable by mocking `lib/gemini`.

### 2. Schema-constrained JSON generation
`responseSchema` forces Gemini to return machine-typed budget, timeline,
checklist and idea objects. The UI never parses free text, so a wording
change in the model cannot break rendering. Every response is then re-parsed
with Zod — trust nothing, validate twice.

### 2b. Defensive normalization before validation
`lib/ai-normalize.ts` sits between the model and the Zod contract. Real
generations deviate in predictable ways — uppercase enums, missing ids,
stringified numbers, object-shaped risk tips, markdown fences or an envelope
key wrapping the plan. Each section is coerced and repaired independently,
short sections are backfilled from the demo engine (with dates attached), and
a payload with no usable model section throws so the retry/demo path labels
the output honestly. Every model call additionally carries an
`AbortSignal.timeout` so two retries stay inside the serverless limit.

### 3. Deterministic demo/fallback engine
`lib/demo-plan.ts` builds a complete, coherent plan from the user's real
inputs when no API key is configured or when a model call fails. The UI
labels this output honestly (`source: "demo"`), so nothing is ever presented
as live AI when it is not — and the demo video never depends on network luck.

### 4. localStorage over a database
A single-user planner needs no accounts or serverside state. Keeping the
document in the browser removes an entire class of security issues (injection,
auth tokens, RLS misconfiguration), makes reads instant and offline-capable,
and lets the whole app deploy as static-first Next.js on a free tier.

### 5. Pure logic separated from rendering
`lib/budget.ts`, `lib/timeline.ts`, `lib/format.ts` contain framework-free
pure functions. All non-trivial arithmetic lives there and is unit tested;
components only render state and dispatch immutable updates.

### 6. Zero heavy UI dependencies
Charts and progress rings are hand-built inline SVG; icons are inline SVG;
fonts are self-hosted through `next/font`. The production planner route ships
~170 kB first-load JS and the repository stays comfortably under 10 MB.

## Data contract

All shared types live in `lib/schemas.ts` and are inferred from Zod schemas —
there is no hand-maintained duplicate type file that can drift:

- `EventBrief` — validated intake payload
- `EventPlan` — `{ source, summary, budget, timeline, checklist, ideas, riskTips, generatedAt }`
- `PlannerDocument` — `{ brief, plan }`, the unit persisted and exported
- `ChatRequest` / `ChatReply`, `IdeasRequest` / `IdeasReply` — endpoint contracts

## Failure handling

| Failure | Behavior |
|---|---|
| Invalid client payload | `422` with field-level Zod details; form shows inline errors |
| Rate limit exceeded | `429` with a generic retry message |
| Gemini unconfigured | Deterministic demo plan, clearly labelled |
| Gemini call fails (plan/ideas) | Logged server-side; demo fallback returned, app keeps working |
| Gemini call fails (chat) | `502` generic message; internal details never leave the server |
| Corrupt localStorage | Ignored safely; user starts fresh, no crash |
