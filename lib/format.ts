/**
 * Display formatting helpers built on the Intl API — no heavy dependencies.
 */

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Format an amount with its currency code, e.g. 125000 INR -> "₹1,25,000". */
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Short money label for tight chart labels, e.g. "₹1.3L". */
export function formatCompactCurrency(amount: number, currency = "INR"): string {
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${compactCurrencyFormatter.format(amount)}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Format an ISO date (YYYY-MM-DD) or full ISO timestamp as a human date. */
export function formatDate(iso: string): string {
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

/** Whole days from today until the given ISO date (negative if past). */
export function daysUntil(isoDate: string): number {
  const target = new Date(`${isoDate}T00:00:00`).getTime();
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  return Math.round((target - todayMidnight) / 86_400_000);
}
