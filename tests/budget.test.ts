import { describe, expect, it } from "vitest";
import {
  budgetHealth,
  categoryVariances,
  rebalancePercentages,
  totalEstimated,
  totalSpent,
  withCustomCategory,
} from "@/lib/budget";
import type { Budget } from "@/lib/schemas";

function makeBudget(overrides?: Partial<Budget>): Budget {
  return {
    categories: [
      {
        id: "bc_1",
        name: "Venue",
        estimatedAmount: 100_000,
        minAmount: 90_000,
        maxAmount: 115_000,
        percentage: 50,
        actualAmount: 0,
      },
      {
        id: "bc_2",
        name: "Catering",
        estimatedAmount: 100_000,
        minAmount: 90_000,
        maxAmount: 115_000,
        percentage: 50,
        actualAmount: 0,
      },
    ],
    contingencyAmount: 20_000,
    totalEstimated: 220_000,
    ...overrides,
  };
}

describe("budget arithmetic", () => {
  it("sums actual spend across categories", () => {
    const budget = makeBudget();
    budget.categories[0]!.actualAmount = 30_000;
    budget.categories[1]!.actualAmount = 15_000;
    expect(totalSpent(budget.categories)).toBe(45_000);
  });

  it("includes contingency in the total estimate", () => {
    expect(totalEstimated(makeBudget())).toBe(220_000);
  });

  it("flags over, near and under categories", () => {
    const budget = makeBudget();
    budget.categories[0]!.actualAmount = 120_000; // over
    budget.categories[1]!.actualAmount = 90_000; // 90% -> near
    const [first, second] = categoryVariances(budget);
    expect(first?.status).toBe("over");
    expect(second?.status).toBe("near");
  });

  it("computes whole-budget health without dividing by zero", () => {
    const zero = makeBudget({
      categories: [],
      contingencyAmount: 0,
      totalEstimated: 0,
    });
    expect(budgetHealth(zero).usedPercent).toBe(0);
    expect(budgetHealth(zero).status).toBe("under");
  });

  it("rebalances percentages to 100", () => {
    const rebalanced = rebalancePercentages(makeBudget());
    const sum = rebalanced.categories.reduce((total, category) => total + category.percentage, 0);
    expect(sum).toBe(100);
  });

  it("adds a custom category with a stable id", () => {
    const withCustom = withCustomCategory(
      makeBudget(),
      { name: "Fireworks", estimatedAmount: 50_000 },
      () => "bc_custom",
    );
    expect(withCustom.categories).toHaveLength(3);
    expect(withCustom.categories[2]?.id).toBe("bc_custom");
  });
});
