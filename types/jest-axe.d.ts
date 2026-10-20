// Ambient module declaration — jest-axe ships no TypeScript types.
declare module "jest-axe" {
  export function axe(container?: unknown, options?: unknown): Promise<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const toHaveNoViolations: any;
}
