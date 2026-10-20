# I built an AI event-planning co-pilot in two weeks — here's how (PromptWars Challenge 5 build log)

*This is a build-in-public technical walkthrough of EventCraft AI, my submission for PromptWars Virtual Challenge 5 — Celebration & Event Planner.*

## The problem

Planning a wedding, birthday or community event means juggling four moving parts at once: money, deadlines, vendors and creative decisions. Most people start with a blank notebook and a handful of scattered chats. The challenge asked for a GenAI-powered assistant that turns a short event brief into budgets, timelines, vendor checklists and personalized ideas.

## The core idea: one brief in, one structured plan out

Instead of a chatbot that returns paragraphs, I wanted the AI to output a **machine-typed plan object** that an interactive dashboard can render and update. The user fills a one-minute brief — event type, date, guest count, budget, location tier, style tags, dietary and special requirements — and gets back:

- a budget with per-category estimates, min/expected/max ranges and a contingency reserve;
- a timeline where every milestone is an offset ("30 days before") converted to a real calendar date;
- a vendor checklist with priorities, owners and due dates;
- personalized idea cards grounded in the user's actual style tags;
- event-type-specific risk tips.

## The most important engineering decision: structured JSON, not free text

Early on I stopped asking the model to "reply with JSON" and instead passed an explicit `responseSchema` with `responseMimeType: "application/json"`, then validated the response a second time with Zod. The prompt now focuses purely on domain behavior — realistic ranges, event-type tailoring, safety guardrails — while the schema guarantees shape. The UI can never break because the model phrased something differently.

Zod became the **single source of truth** across the whole app: form validation, API request validation, model-output validation and TypeScript types all derive from one schema file. There is no duplicate interface that can drift.

## Three endpoints, one prompt pattern

Every Gemini call follows the same five blocks: role, grounded context, output contract, event-type guidance and guardrails. I tuned temperature per job — 0.4 for stable budgets, 0.9 for creative ideas, 0.5 for chat. The chat assistant gets the user's live budget status and risk tips injected into its system instruction, so it answers grounded questions without the user re-explaining anything.

## Designing for failure, not just the happy path

A demo can't depend on network luck. If no API key is configured — or a model call times out — the service layer falls back to a deterministic planning engine that builds a fully coherent plan from the same brief, clearly labelled as demo output. Invalid payloads get a 422 with field-level errors, abuse is throttled with a sliding-window limiter, corrupt local storage is ignored safely, and chat failures return a generic message that never leaks internals.

## Privacy and security by subtraction

The biggest security win was deciding what *not* to build. There is no database and no authentication: the entire plan lives in the browser's local storage, exportable as a JSON backup or printable as a PDF. That removes an entire class of vulnerabilities. The Gemini key stays server-side in Next.js route handlers, responses are encoded by React (no raw HTML injection), and every response ships a strict CSP, HSTS, frame and MIME-type headers.

## Building the "smooth" front-end

The visual direction is a warm, editorial celebration palette — cream, coral and pink with chunky display type, rounded bento cards and soft shadows. All motion respects `prefers-reduced-motion`, and I deliberately replaced scroll-triggered opacity animations with CSS keyframes that always end in a visible state, so content is never hidden from crawlers, print stylesheets or headless renderers. Progress rings and bars are hand-built inline SVG — no chart library, keeping the planner route around 170 kB first-load JS.

## Accessibility as a feature, not a patch

Semantic landmarks, a skip link, labelled controls with inline `role="alert"` errors, a fully keyboard-operable ARIA tablist, ARIA live regions for generation status, visible focus rings, AA-checked contrast and 44px touch targets. An automated `jest-axe` test guards the component library against regressions.

## What I'd do next

- Shareable read-only plan links for collaborative planning with family.
- Multi-currency conversion and vendor quote uploads.
- Calendar export (.ics) for timeline milestones.

## Takeaway

The biggest lesson was that prompt engineering alone doesn't ship reliable AI products — **contracts do**. Constraining model output with schemas, validating everything twice, and designing deterministic fallbacks made the generative parts feel as dependable as ordinary software.

*Built with Next.js, TypeScript, Tailwind CSS, Google Gemini and Vitest.*
