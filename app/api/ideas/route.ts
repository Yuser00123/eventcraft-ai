import { NextResponse } from "next/server";
import { ideasRequestSchema } from "@/lib/schemas";
import { RateLimiter, clientKey } from "@/lib/rate-limit";
import { regenerateIdeas } from "@/lib/services";

const limiter = new RateLimiter(12, 60_000);

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

  const parsed = ideasRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid idea request.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const reply = await regenerateIdeas(parsed.data);
  return NextResponse.json(reply, { status: 200 });
}
