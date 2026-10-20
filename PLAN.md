# EventCraft AI — PromptWars Virtual · Challenge 5 Build Plan

> **Challenge 5 — Celebration & Event Planner**
> *"Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas."*

- **Start:** 20 Oct 2026 · **Submission deadline:** 1 Nov 2026, 11:59 PM IST
- **Attempts allowed:** 3 (best score counts)
- **Stack:** Next.js + TypeScript + Tailwind · Gemini API · Vercel deploy
- **Working name:** EventCraft AI *(alternatives: Planora, CelebrateIQ, Festivo — rename is a 5-minute find-and-replace)*

---

## 1. How we win — rubric strategy (weighted by official impact)

The AI evaluator scores six axes with explicit impact levels. **Effort is allocated in proportion to weight:** the two High axes get the deepest, most visible investment; Medium axes get solid professional-grade coverage; Low axes get genuine, complete-but-focused implementations (never skipped — every axis still contributes points).

### 🔴 HIGH IMPACT — where the rank is decided

| Rubric axis | What we build to score high |
|---|---|
| **Code Quality (High)** | TypeScript **strict** mode with zero `any`; small single-purpose modules (< ~150 lines each); Zod schemas as the single source of truth shared by client, API, and tests; pure, separately testable logic (`budget.ts`, `timeline.ts`); consistent naming conventions; barrel-free explicit imports; ESLint + Prettier enforced; zero dead/commented code; no giant component files — views decomposed; every non-obvious function has a JSDoc intent comment; clean folder boundaries (`lib/` logic vs `components/` UI vs `app/` routing). |
| **Problem Statement Alignment (High)** | `docs/problem-statement.md` assigns an ID to **every clause** of the brief; README carries a requirement → component → API → test **traceability matrix**; all five mandated capabilities (budgets, timelines, vendor checklists, personalized ideas, planning assistant) are real, clickable features — none faked; all **three event types** produce visibly distinct, tailored AI output via event-specific prompt sections; a one-click sample event lets a judge verify the full flow in under a minute; the demo video follows the same requirement order as the brief. |

### 🟡 MEDIUM IMPACT — professional-grade, no shortcuts

| Rubric axis | What we build to score high |
|---|---|
| **Security (Medium)** | Gemini key server-side only (route handlers; `NEXT_PUBLIC_` never holds secrets); Zod validation on **every** API input AND on AI responses; strict security headers (CSP, HSTS, X-Frame-Options, nosniff, referrer policy); in-memory per-IP rate limiting; output encoding via React (no `dangerouslySetInnerHTML`); generic error envelopes that never leak stack traces or internals; `.env.local` gitignored with only `.env.example` committed; no user-provided HTML/URL injection paths. |
| **Efficiency (Medium)** | Server Components for the static shell; Client Components only where interaction is needed; **one** Gemini call builds the full plan (not per-section calls); plans cached in localStorage so repeat visits make zero network calls; lightweight hand-built SVG charts (no chart library weight); route-level code splitting; `next/font` optimization; no unnecessary re-renders (memoization where measured, not sprinkled); API responses trimmed to exactly what the UI needs. |

### 🟢 LOW IMPACT — real coverage, deliberately scoped (don't over-engineer)

| Rubric axis | What we build to score high |
|---|---|
| **Testing (Low)** | Vitest + React Testing Library focused where it matters: **pure logic** (budget totals/variance, date-offset math, storage round-trip), **API route validation** with a mocked Gemini client, and **one key user flow** (form → mocked plan → checklist interaction). Plus a small jest-axe a11y smoke test. Meaningful tests on critical paths, not theatrical 100% coverage. |
| **Accessibility (Low)** | The complete baseline, done once and done properly: semantic landmarks & heading order, skip link, labelled form fields, visible focus rings, ARIA live region for generation status, fully keyboard-operable tabs/checkboxes/dialogs, WCAG AA contrast, `prefers-reduced-motion`, 44px touch targets, mobile-responsive. Verified by the jest-axe test + manual keyboard pass. |

---

## 2. Feature specification (brief → build)

### 2.1 Event intake wizard
- Event type: **Wedding / Birthday / Community event** (required)
- Event date (with date-picker + "must be future" validation)
- Guest count, total budget + currency (INR default, generic — no regional naming)
- Location tier: metro / city / town (drives cost assumptions; we never ask for or display state names)
- Style tags (traditional, modern, minimalist, themed…), dietary notes, special requirements (kids, elders, accessibility needs)
- One-click sample event so judges can test the app in 2 seconds

### 2.2 AI-generated master plan (one Gemini call, structured JSON)
1. **Budget** — category-wise estimates (venue, catering, decor, photography, attire, gifts, misc.) with min/expected/max, % of total, and a contingency line
2. **Timeline** — milestones with "days-before-event" offsets converted to real calendar dates (bookings, payments, confirmations, final rehearsals)
3. **Vendor checklist** — grouped tasks per vendor category, each with priority, suggested owner, and due offset; fully checkable
4. **Personalized ideas** — theme, decor, activities, and personal touches derived from the user's inputs (not generic copy-paste)
5. **Risk tips** — event-type-specific gotchas (e.g., weather backup, deposit deadlines)

### 2.3 Planner dashboard (five tabs)
- **Overview:** event summary, live day countdown, budget vs spent ring, checklist progress ring
- **Budget:** editable actual spends per category, auto variance, over-budget alerts, SVG bar chart, add/delete custom categories
- **Timeline:** chronological milestone view with statuses (pending/done), overdue highlighting
- **Checklist:** grouped vendor tasks, checkboxes, category progress, add custom tasks
- **Ideas:** AI idea cards with favorites; "Regenerate ideas" button (separate lightweight Gemini call)
- **AI Assistant:** contextual chat ("My catering quote is 20% over estimate — what should I cut?") with the user's full plan injected as context

### 2.4 Persistence & export
- All data in **localStorage** (no database, no auth → fewer attack surfaces, zero running costs)
- Export plan as JSON (backup) / Import to restore
- Print-friendly stylesheet → "Save as PDF" for a shareable plan
- Zero data leaves the browser except the explicit Gemini requests

---

## 2.5 Design language (approved visual direction)

Reference vibe: warm "Solar Pop" playful-editorial (cream + coral + pink, chunky rounded type, organic shapes) with a Folblox-style dark gradient hero on the landing page. A live style tile lives at `design/style-tile.html`.

### Color tokens (WCAG AA-checked)
| Token | Hex | Usage |
|---|---|---|
| `--cream` | `#FFF6EC` | App background |
| `--ink` | `#241711` | Body text, headings on light surfaces (15:1 contrast) |
| `--muted` | `#6E5A4E` | Secondary text |
| `--coral-600` | `#E04A1F` | Primary buttons, key accents (white text ≈ 4.6:1, AA) |
| `--coral-500` | `#F25D2E` | Large display text, fills (large-text AA) |
| `--coral-100` | `#FFE4D3` | Tinted cards, chips |
| `--pink-500` | `#F2558E` | Secondary accent, ideas tab, sparkles |
| `--pink-100` | `#FFDCE9` | Pink-tinted surfaces |
| `--amber-300` | `#FFD492` | Highlight tint, stats |
| `--green-600` | `#2E8B5C` | Success, completed items, under-budget |
| `--red-600` | `#C93A3A` | Over-budget / overdue alerts |
| `--night` | `#1C110C` | Dark hero section, gradient base |

### Typography (next/font, self-hosted → no layout shift)
- **Display:** Bricolage Grotesque (variable) — chunky editorial feel matching the references; hero at clamp(2.5rem, 6vw, 4.5rem), tight tracking
- **Body/UI:** Plus Jakarta Sans — friendly, highly legible at small sizes
- **Accent script:** Caveat, used sparingly for handwritten-style labels (the "that Shines" treatment)
- Strict type scale, max content width 72ch for reading surfaces

### Shape, depth & motion ("smooth" brief)
- Rounded-3xl cards (1.5rem), pill buttons, soft shadows `0 12px 32px -16px rgba(36,23,17,.25)`, no hard borders — tint-on-tint surfaces instead
- Decorative inline SVG: sparkles, 4-petal flowers, organic blobs (zero image weight)
- Framer Motion (`motion`) — staggered card entrances, animated tab indicators, number count-ups, animated progress rings, hover lift (`translateY(-3px)`), page-section reveals; all wrapped in `useReducedMotion()` guards; CSS `scroll-behavior: smooth`
- Micro-interaction budget: nothing over 300ms; skeleton loaders during Gemini calls instead of spinners; optimistic checkbox feedback
- Bento-style dashboard panels, sticky tab bar, bottom-sheet-style mobile navigation

### Per-feature theming
Wedding → coral/rose dominance · Birthday → pink + amber, playful · Community → coral + green, structured. Event-type theming changes accent tints and illustration motifs, not the layout (keeps the codebase single-pathed = Code Quality win).

## 3. Technical architecture

```
Browser (React Client Components)
   │  validated form payload
   ▼
Next.js Route Handlers (server only)
   ├─ /api/generate-plan   → full structured plan
   ├─ /api/ideas           → idea regeneration
   └─ /api/chat            → contextual assistant
   │  Zod validation → rate limit → prompt builder
   ▼
Google Gemini API (@google/genai, responseSchema JSON mode)
   │  typed, schema-constrained response
   ▼
React state → localStorage persistence → dashboard views
```

### Project structure
```
eventcraft-ai/
├── app/
│   ├── layout.tsx                  # fonts, metadata, skip link
│   ├── page.tsx                    # landing (Server Component)
│   ├── planner/page.tsx            # wizard + dashboard
│   └── api/
│       ├── generate-plan/route.ts
│       ├── ideas/route.ts
│       └── chat/route.ts
├── components/
│   ├── ui/                         # Button, Card, Tabs, ProgressRing, Badge…
│   └── planner/                    # EventForm, BudgetView, TimelineView,
│                                   # ChecklistView, IdeasView, AssistantChat…
├── lib/
│   ├── gemini.ts                   # server client factory
│   ├── schemas.ts                  # Zod input + output types (single source of truth)
│   ├── prompts.ts                  # system instructions & prompt builders
│   ├── budget.ts                   # totals, variance, percentages (pure functions)
│   ├── timeline.ts                 # day-offset → real date math (pure functions)
│   ├── storage.ts                  # typed localStorage layer
│   ├── rate-limit.ts               # server throttle
│   └── format.ts                   # currency/date formatting
├── tests/                          # Vitest unit + component + a11y + API tests
├── docs/
│   ├── problem-statement.md
│   ├── architecture.md
│   └── prompt-log.md               # the architectural prompts used (narrative evidence)
├── public/                         # inline SVG assets only (keeps repo tiny)
├── README.md                       # traceability matrix, setup, demo script
├── .env.example
├── next.config.ts                  # security headers
├── vitest.config.ts
└── tsconfig.json (strict)
```

### Why these choices
- **Next.js over plain Vite SPA:** server route handlers keep the API key hidden — a plain SPA would expose it in the browser and fail the security axis.
- **Structured JSON mode (`responseSchema`):** Gemini returns machine-typed budget/timeline/checklist objects every time, so the UI never breaks on free-text responses — reliability + efficiency.
- **No database/auth:** eliminates an entire class of security and cost issues; localStorage fully satisfies a single-user planner.
- **Custom SVG charts instead of Recharts/Chart.js:** ~0 KB dependency weight, repo stays well under 10 MB.

---

## 4. Gemini integration design

- SDK: `@google/genai` · Model: current Gemini Flash (fast + generous free tier)
- Three server-only call sites, each with: Zod-validated input → typed system instruction → JSON schema-constrained output → Zod parse of the response → graceful error envelope
- Prompt design pattern: **role + event context + explicit JSON schema + event-type-specific guidance + safety rules** (no invented vendors/prices presented as facts; estimates labeled as estimates)
- Chat endpoint sends the saved plan as context + conversation history (capped) so follow-ups are grounded, not generic
- Deterministic-ish temperature per task (low for budgets/timelines, higher for ideas)

---

## 5. 12-day delivery schedule

| Day | Date | Milestone |
|---|---|---|
| 1 | Oct 20–21 | Plan sign-off, scaffold, design tokens, Zod schemas & types |
| 2 | Oct 22 | Gemini client + `/api/generate-plan` + prompt engineering with sample payloads |
| 3 | Oct 23 | Intake wizard, loading/error/empty states, sample-event button |
| 4 | Oct 24 | Dashboard shell + **Budget view** (editable actuals, variance, chart) |
| 5 | Oct 25 | **Timeline view** + **Checklist view**, localStorage persistence |
| 6 | Oct 26 | **Ideas view** + regeneration endpoint + **AI Assistant chat** |
| 7 | Oct 27 | Export/import JSON, print/PDF styles, responsive + mobile pass |
| 8 | Oct 28 | Security hardening (headers, rate limit, sanitization) + full a11y pass |
| 9 | Oct 29 | Focused test suite (pure logic, API validation mocks, one key flow, jest-axe), lint + strict-TS check — scoped to critical paths per Low-impact weighting |
| 10 | Oct 30 | Vercel deploy with env vars, live smoke test → **submission attempt #1** |
| 11 | Oct 31 | Demo video recording, README traceability, blog + LinkedIn drafts → **attempt #2** |
| 12 | Nov 1 | Final QA buffer, fixes from review → **attempt #3 (final)** before 11:59 PM |

---

## 6. Submission deliverables checklist

- [ ] **Public GitHub repo** (< 10 MB, `.gitignore` covering node_modules/.next/env)
- [ ] **Deployed Vercel link** (live, env var set, mobile + desktop verified)
- [ ] **Demo video** (unlisted YouTube) — script provided, ~4–6 min, walks all five features
- [ ] **"Changes/updates in deployed version"** text — drafted from our day-by-day log
- [ ] **"GenAI services utilized & where"** answer — Gemini: plan generation, ideas, chat (exact endpoints listed)
- [ ] **LinkedIn post** — build-in-public draft, no location/state names
- [ ] Technical blog (hosted free, e.g., Dev.to / Hashnode) — narrative depth for Prompt Credits
- [ ] README with problem→feature→test traceability matrix

## 7. Hard rules baked into everything we produce

1. **Never mention state/city names** — in code comments, README, blog, LinkedIn, or video narration. Instant disqualification.
2. Repo stays **under 10 MB** — SVG icons only, no videos/images committed.
3. **No secrets in Git** — `.env.local` gitignored, only `.env.example` committed.
4. Real Gemini calls in the happy path; honest, user-friendly errors (no fake/mock data presented as AI output).

## 8. What I need from you (only when we reach that step)

1. A free **Gemini API key** from Google AI Studio (aistudio.google.com → "Get API key") — I'll tell you exactly when and how to add it locally; it never gets committed.
2. A **GitHub account** and a **Vercel account** (both free, login with GitHub) — I'll give exact click-path instructions on deploy day.
3. Decisions on: app name (default **EventCraft AI**) and any feature you personally want added.
