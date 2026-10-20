# Hack2Skill submission form — ready-to-paste answers

## Describe the changes/updates made in the deployed version

> Initial deployment (v1.0.0): full EventCraft AI application with the event intake wizard, Gemini-powered master plan generation (budget, dated timeline, vendor checklist, personalized ideas and risk tips), the six-tab planner dashboard with actual-vs-estimate budget tracking, milestone and task completion, idea regeneration with optional focus, a grounded AI planning assistant, localStorage persistence, JSON export/import backup and print-to-PDF. Security hardening includes server-only API keys, Zod validation on all inputs and model outputs, strict security headers (CSP, HSTS, X-Frame-Options, nosniff) and rate-limited endpoints. The release also ships 34 passing Vitest tests, a jest-axe accessibility check, responsive mobile/desktop layouts and an accessible ARIA tablist with reduced-motion support. A deterministic demo engine keeps every feature fully functional when no GEMINI_API_KEY is configured.

## Mention the Gen AI services utilized in the submission, and where did you utilize it?

> Google Gemini (via the @google/genai SDK, model alias gemini-flash-latest) is used in three server-side flows:
> 1. POST /api/generate-plan — one schema-constrained JSON call that produces the complete plan: category budgets with min/expected/max ranges and contingency, offset-based timeline milestones, prioritized vendor checklist, personalized idea cards and event-type risk tips (temperature 0.4).
> 2. POST /api/ideas — regenerates fresh personalized idea cards with an optional user-specified focus (temperature 0.9 for creative divergence).
> 3. POST /api/chat — the planning assistant; the user's live budget status and risk tips are injected into the system instruction so replies are grounded in the actual plan (temperature 0.5).
> All calls use responseMimeType application/json with an explicit responseSchema for the structured endpoints, and every response is re-validated with Zod on the server. The key is stored in a server environment variable and is never exposed to the browser. When the key is absent or a call fails, a deterministic demo planning engine takes over and its output is labelled as demo data.

## Demo video checklist (4–6 minutes, unlisted YouTube)

- [ ] Landing page → "Try a sample event" (form pre-fills)
- [ ] Generate AI plan → show loading state and structured result
- [ ] Overview tab: countdown, rings, risk tips
- [ ] Budget tab: enter actuals, trigger over-budget state, add custom category
- [ ] Timeline tab: complete a milestone, show dated offsets
- [ ] Checklist tab: filters, tick a task, add a custom task
- [ ] Ideas tab: regenerate with a focus, favorite a card
- [ ] Assistant tab: ask the over-budget catering question
- [ ] Export JSON + Print/PDF
- [ ] Mention the three Gemini endpoints and the honest demo fallback
- [ ] Do NOT mention any state, city or region name anywhere in narration or slides

## Reminder: hard rules

- No state/city names in the repo, video, post or screenshots.
- GitHub repo must be public and under 10 MB.
- Video: unlisted YouTube or shared Drive link.
- Max three submission attempts — best score counts.
