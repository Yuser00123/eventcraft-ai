# LinkedIn post (copy-paste ready)

---

🚀 Just shipped my PromptWars Virtual Challenge 5 build — **EventCraft AI**, a GenAI co-pilot for weddings, birthdays & community events.

The brief: help people organize celebrations with budgets, timelines, vendor checklists and personalized ideas.

One event brief goes in; one structured plan comes out 👇
💰 Category budgets with contingency reserves and live actual-vs-estimate tracking
📅 Milestones counted backwards from the event date into real deadlines
✅ Priority-ranked vendor checklists with owners and due dates
✨ Personalized idea cards, regenerable on demand
🤖 A grounded AI assistant that already knows your plan

Three engineering choices I'm proud of:

1️⃣ Schema-constrained Gemini output, validated a second time with Zod — the UI can never break on free-text model responses. One Zod module is the single source of truth for forms, APIs, model output and TypeScript types.

2️⃣ Graceful degradation: no API key or a model timeout? A deterministic planning engine still returns a complete, honestly-labelled plan — the app never dead-ends.

3️⃣ Security by subtraction — no database, no auth, data stays in the browser; the Gemini key lives only in server route handlers behind rate limiting and strict security headers.

34 tests passing, full accessibility pass (ARIA tablist, live regions, reduced-motion, jest-axe), and a warm editorial UI built with Next.js, TypeScript and Tailwind CSS.

Biggest lesson: reliable AI products aren't built on clever prompts alone — they're built on contracts.

#PromptWars #BuildWithAI #GoogleGemini #NextJS #TypeScript #VibeCoding #GenerativeAI #AIApps
