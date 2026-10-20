import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/schemas";
import { RateLimiter, clientKey } from "@/lib/rate-limit";
import { chatReply } from "@/lib/services";

const limiter = new RateLimiter(15, 60_000);

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

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chat request.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const reply = await chatReply(parsed.data);
    return NextResponse.json(reply, { status: 200 });
  } catch {
    // Generic message — internal error details stay on the server.
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable. Please retry." },
      { status: 502 },
    );
  }
}
