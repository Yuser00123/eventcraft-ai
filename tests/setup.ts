import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount every rendered component between tests so DOM state never leaks.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
