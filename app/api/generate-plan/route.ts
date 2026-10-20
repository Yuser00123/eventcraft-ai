import { NextResponse } from "next/server";
import { eventBriefSchema } from "@/lib/schemas";
import { RateLimiter, clientKey } from "@/lib/rate-limit";
import { generatePlan } from "@/lib/services";

/** One full plan generation is an expensive call — throttle generously. */
const limiter = new RateLimiter(8, 60_000);

// Give large structured generations headroom on serverless infrastructure.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  if (!limiter.allow(clientKey(request.headers))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = eventBriefSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event details.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const plan = await generatePlan(parsed.data);
  return NextResponse.json({ plan }, { status: 200 });
}
