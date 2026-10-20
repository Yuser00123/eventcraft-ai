# Problem Statement Deconstruction — Challenge 5

## Official brief

> **[Challenge 5] Celebration & Event Planner** — *"Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas."*

## Requirement breakdown

Every clause of the brief is assigned an ID. Each ID is implemented in code,
exercised by a test (where logic exists) and traced in the README matrix.

| ID | Brief clause | Acceptance criterion |
|---|---|---|
| **PS-01** | GenAI-powered planning assistant | A working AI pipeline (Google Gemini) generates structured plans via server endpoints, with an honest deterministic fallback so the app never dead-ends. |
| **PS-02** | Weddings, birthdays **and** community events | All three event types are selectable and produce distinct budget categories, milestones, checklist tasks, ideas and risk tips. |
| **PS-03** | Budgets | Category-wise estimates with min/expected/max ranges, a contingency reserve, percentage split, and live actual-vs-estimated tracking with over-budget alerts. |
| **PS-04** | Timelines | Milestones expressed as days-before-event offsets, resolved to real calendar dates, sortable with overdue detection. |
| **PS-05** | Vendor checklists | Categorized, priority-ranked tasks with owners and due dates; checkable, filterable, extensible with custom tasks, and progress-tracked. |
| **PS-06** | Personalized ideas | Idea cards derived from the user's style tags, guest count, dietary notes and special requirements; regenerable with an optional focus. |
| **PS-07** | Helps users *organize* | One dashboard unifies all artifacts with persistence, export/import backup, print-to-PDF and a contextual AI assistant grounded in the live plan. |
| **PS-08** | Usage of Gen AI is mandatory | Gemini is called for plan generation, idea regeneration and chat; all calls are server-side with schema-constrained JSON output. |

## Non-functional requirements (driven by the evaluation rubric)

| ID | Axis | Commitment |
|---|---|---|
| NF-01 | Code Quality (High) | Strict TypeScript, zero `any`, small modules, Zod as single source of truth |
| NF-02 | Security (Medium) | Server-only secrets, input + output validation, security headers, rate limiting |
| NF-03 | Efficiency (Medium) | Single plan-generation call, localStorage caching, hand-built SVG visuals, route splitting |
| NF-04 | Testing (Low) | 34 Vitest tests across pure logic, schemas, storage, services and accessibility |
| NF-05 | Accessibility (Low) | Semantic landmarks, ARIA tablist, labelled controls, focus states, reduced-motion support |
