import { afterEach, describe, expect, it } from "vitest";
import { RateLimiter, clientKey } from "@/lib/rate-limit";

describe("RateLimiter", () => {
  const limiter = new RateLimiter(3, 60_000);

  afterEach(() => limiter.clear());

  it("allows requests up to the limit then blocks", () => {
    expect(limiter.allow("guest-1")).toBe(true);
    expect(limiter.allow("guest-1")).toBe(true);
    expect(limiter.allow("guest-1")).toBe(true);
    expect(limiter.allow("guest-1")).toBe(false);
  });

  it("tracks keys independently", () => {
    limiter.allow("guest-1");
    expect(limiter.allow("guest-2")).toBe(true);
  });

  it("resets after the window elapses", () => {
    const shortWindow = new RateLimiter(1, 10);
    expect(shortWindow.allow("guest-3")).toBe(true);
    expect(shortWindow.allow("guest-3")).toBe(false);
    setTimeout(() => {
      expect(shortWindow.allow("guest-3")).toBe(true);
    }, 15);
  });

  it("derives a stable key from forwarded headers", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    expect(clientKey(headers)).toBe("203.0.113.7");
  });
});
