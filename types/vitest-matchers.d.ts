import type { Assertion } from "vitest";

// Add the jest-axe matcher to Vitest's assertion interface.
declare module "vitest" {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): Assertion<T>;
  }
}
