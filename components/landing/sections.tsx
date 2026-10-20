import Link from "next/link";
import { Card, SectionLabel } from "@/components/ui/primitives";
import { FadeIn, Stagger, StaggerItem } from "@/components/Motion";
import { Sparkle } from "@/components/Sparkles";
import { EVENT_TYPE_OPTIONS } from "@/lib/event-themes";

const FEATURES = [
  {
    emoji: "💰",
    title: "Smart budgets",
    body: "Category-wise estimates with min/expected/max ranges, contingency reserve and live actual-vs-estimated tracking.",
    tint: "coral" as const,
  },
  {
    emoji: "📅",
    title: "Dated timelines",
    body: "Every milestone is counted backwards from your event date and converted to a real calendar deadline.",
    tint: "pink" as const,
  },
  {
    emoji: "✅",
    title: "Vendor checklists",
    body: "Priority-ranked tasks with owners and due dates, grouped by vendor and tracked with live progress.",
    tint: "amber" as const,
  },
  {
    emoji: "✨",
    title: "Personalized ideas",
    body: "Themes, decor and activities generated from your style tags, guest count and special requirements.",
    tint: "green" as const,
  },
  {
    emoji: "🤖",
    title: "Planning assistant",
    body: "Chat with an AI that already knows your plan — ask trade-off questions without re-explaining context.",
    tint: "dark" as const,
  },
  {
    emoji: "🔒",
    title: "Private by design",
    body: "Your plan lives in your browser. No accounts, no database — only the AI requests you explicitly trigger.",
    tint: "white" as const,
  },
];

const STEPS = [
  {
    number: "01",
    title: "Describe your event",
    body: "Pick a type, date, guest count, budget and style — under a minute, or load the sample event instantly.",
  },
  {
    number: "02",
    title: "Generate the master plan",
    body: "Gemini produces a structured budget, timeline, checklist and idea set in one grounded generation.",
  },
  {
    number: "03",
    title: "Track and adapt",
    body: "Log spends, tick off vendors, regenerate ideas and export a PDF — everything stays in sync.",
  },
];

const FAQS = [
  {
    q: "Do I need an account or login?",
    a: "No. EventCraft AI stores your plan locally in your browser. There is no sign-up and no personal database.",
  },
  {
    q: "Which events is it built for?",
    a: "Weddings, birthday celebrations and community events — each gets tailored categories, milestones and ideas.",
  },
  {
    q: "Are the AI figures real quotes?",
    a: "No. Budget figures are planning ranges estimated from your budget, guest count and location tier — always confirm final prices with vendors.",
  },
  {
    q: "Can I keep an offline copy?",
    a: "Yes. Export the whole plan as a JSON backup or print a clean PDF summary straight from the dashboard.",
  },
];

export function EventTypesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <SectionLabel>One assistant, three celebrations</SectionLabel>
        <h2 className="mb-8 text-3xl font-extrabold md:text-4xl">Built for the events you actually plan</h2>
      </FadeIn>
      <Stagger className="grid gap-5 md:grid-cols-3">
        {EVENT_TYPE_OPTIONS.map((option) => (
          <StaggerItem key={option.value}>
            <Card tint="white" className="h-full hover:-translate-y-1">
              <span
                className="mb-4 grid h-14 w-14 place-items-center rounded-2xl text-2xl"
                style={{ backgroundColor: option.tint }}
                aria-hidden="true"
              >
                {option.emoji}
              </span>
              <h3 className="mb-1.5 text-xl font-bold">{option.label}</h3>
              <p className="text-sm text-muted">{option.tagline}</p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <SectionLabel>Everything in one dashboard</SectionLabel>
        <h2 className="mb-8 text-3xl font-extrabold md:text-4xl">
          The five things every celebration needs
        </h2>
      </FadeIn>
      <Stagger className="grid gap-5 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <StaggerItem key={feature.title}>
            <Card tint={feature.tint} className="h-full hover:-translate-y-1">
              <span className="mb-3 inline-grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-soft" aria-hidden="true">
                {feature.emoji}
              </span>
              <h3 className="mb-1.5 text-xl font-bold">{feature.title}</h3>
              <p className={feature.tint === "dark" ? "text-sm text-[#FFD9C7]" : "text-sm text-muted"}>
                {feature.body}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mb-8 text-3xl font-extrabold md:text-4xl">From idea to run-of-show in three steps</h2>
      </FadeIn>
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <FadeIn key={step.number} delay={index * 0.1}>
            <Card tint={index === 1 ? "coral" : "white"} className="h-full">
              <span className="font-display text-4xl font-extrabold text-coral-500">{step.number}</span>
              <h3 className="mb-1.5 mt-3 text-xl font-bold">{step.title}</h3>
              <p className="text-sm text-muted">{step.body}</p>
            </Card>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <FadeIn>
        <SectionLabel>Questions</SectionLabel>
        <h2 className="mb-8 text-3xl font-extrabold md:text-4xl">Good to know</h2>
      </FadeIn>
      <div className="grid gap-4">
        {FAQS.map((faq) => (
          <FadeIn key={faq.q}>
            <details className="group rounded-3xl bg-white p-6 shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                {faq.q}
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-coral-100 text-coral-600 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted">{faq.a}</p>
            </details>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Card tint="coral" className="relative overflow-hidden px-8 py-14 text-center md:px-16">
        <Sparkle className="absolute right-10 top-8 h-10 w-10" color="#F2558E" />
        <Sparkle className="absolute bottom-8 left-10 h-7 w-7" color="#F25D2E" />
        <h2 className="text-3xl font-extrabold md:text-4xl">Let&apos;s build something worth celebrating</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted md:text-base">
          Your first AI-generated plan is one form away. No credit card, no login, no clutter.
        </p>
        <Link
          href="/planner"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-coral-600 px-7 py-3.5 text-sm font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5"
        >
          Start planning free <span aria-hidden="true">→</span>
        </Link>
      </Card>
    </section>
  );
}
