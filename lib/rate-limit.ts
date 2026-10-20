/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * The deployment is serverless, so state is best-effort per instance — this
 * blunts casual abuse without adding a Redis dependency or leaking data.
 */

interface Hit {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly hits = new Map<string, Hit>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** Register a hit; returns true when the caller is still allowed through. */
  allow(key: string): boolean {
    const now = Date.now();
    const existing = this.hits.get(key);

    if (!existing || existing.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (existing.count >= this.limit) return false;
    existing.count += 1;
    return true;
  }

  /** Test-only helper to reset between unit tests. */
  clear(): void {
    this.hits.clear();
  }
}

/** Derive a stable client key from request headers without storing IPs. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip ?? headers.get("x-real-ip") ?? "unknown";
}
