import Link from "next/link";
import { Blob, Sparkle } from "@/components/Sparkles";
import { FadeIn } from "@/components/Motion";
import { Logo } from "@/components/Logo";

const PREVIEW_ROWS = [
  { dot: "#F25D2E", label: "Budget breakdown", value: "8 categories" },
  { dot: "#F2558E", label: "Timeline milestones", value: "dated & sorted" },
  { dot: "#FFD492", label: "Vendor checklist", value: "priority-ranked" },
  { dot: "#2E8B5C", label: "Personalized ideas", value: "tailored to you" },
];

export function Hero() {
  return (
    <header className="relative overflow-hidden rounded-b-[2.25rem] bg-night px-6 pb-24 pt-7 text-cream">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 520px at 78% -10%, #F25D2E 0%, #C73A17 42%, #3A1A10 78%, #1C110C 100%)",
        }}
        aria-hidden="true"
      />
      <Blob className="animate-float absolute -left-10 top-24 h-44 w-44 opacity-50" color="#F2558E" />
      <Sparkle className="absolute right-[12%] top-28 h-8 w-8" color="#FFD492" />

      <nav
        className="relative z-10 mx-auto mb-14 flex max-w-6xl items-center justify-between"
        aria-label="Primary"
      >
        <Link href="/" aria-label="EventCraft AI home">
          <Logo variant="light" />
        </Link>
        <Link
          href="#features"
          className="rounded-full border border-[#FFE4D3]/30 px-5 py-2 text-sm font-bold text-[#FFE4D3] transition-colors hover:bg-white/10"
        >
          Explore features
        </Link>
      </nav>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-2 font-script text-2xl text-[#FFB59A]">celebrations, sorted</p>
          <FadeIn>
            <h1 className="text-[clamp(2.6rem,6vw,4.4rem)] font-extrabold">
              Plan weddings, birthdays &amp;{" "}
              <span className="text-[#FFB59A]">community events</span> with an AI co-pilot
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 max-w-xl text-base text-[#FFD9C7] md:text-lg">
              Share your event details and get a complete budget, dated timeline, vendor
              checklist and personalized ideas — generated in seconds, tracked in one place.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/planner"
                className="inline-flex items-center gap-2 rounded-full bg-coral-600 px-6 py-3.5 text-sm font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Create my event
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/planner?sample=1"
                className="inline-flex items-center rounded-full border-2 border-[#FFE4D3]/40 px-6 py-3.5 text-sm font-bold text-[#FFE4D3] transition-transform hover:-translate-y-0.5"
              >
                Try a sample event
              </Link>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.25}>
          <div className="rounded-3xl border border-[#FFE4D3]/20 bg-white/[0.08] p-6 backdrop-blur">
            <p className="mb-2 font-display text-lg font-bold">Your AI master plan</p>
            {PREVIEW_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-dashed border-[#FFE4D3]/25 py-3 text-sm last:border-0"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: row.dot }}
                    aria-hidden="true"
                  />
                  {row.label}
                </span>
                <strong className="text-[#FFD9C7]">{row.value}</strong>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </header>
  );
}
