import { Card, Skeleton } from "@/components/ui/primitives";

const STEPS = [
  "Estimating category budgets within your total…",
  "Counting milestones backwards from your event date…",
  "Ranking vendor tasks by priority and owner…",
  "Personalizing ideas to your style tags…",
];

export function GeneratingState() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16" aria-live="polite">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold">Crafting your master plan…</h1>
        <ul className="mx-auto mt-4 grid max-w-md gap-2 text-sm font-semibold text-muted">
          {STEPS.map((step) => (
            <li key={step} className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-coral-500" aria-hidden="true" />
              {step}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item}>
            <Skeleton className="mb-4 h-6 w-2/3" />
            <Skeleton className="mb-2 h-3 w-full" />
            <Skeleton className="mb-2 h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </Card>
        ))}
      </div>
    </div>
  );
}
