import type { Budget, BudgetCategory } from "@/lib/schemas";

/** Pure budget arithmetic — every function here is unit tested. */

export function totalSpent(categories: BudgetCategory[]): number {
  return categories.reduce((sum, category) => sum + category.actualAmount, 0);
}

export function totalEstimated(budget: Budget): number {
  const categoriesSum = budget.categories.reduce(
    (sum, category) => sum + category.estimatedAmount,
    0,
  );
  return categoriesSum + budget.contingencyAmount;
}

export interface CategoryVariance {
  category: BudgetCategory;
  spent: number;
  estimated: number;
  remaining: number;
  usedPercent: number;
  status: "under" | "near" | "over";
}

/** Per-category actual-vs-estimate variance; "near" means >= 85% consumed. */
export function categoryVariances(budget: Budget): CategoryVariance[] {
  return budget.categories.map((category) => {
    const estimated = category.estimatedAmount;
    const spent = category.actualAmount;
    const remaining = estimated - spent;
    const usedPercent =
      estimated === 0 ? 0 : Math.round((spent / estimated) * 100);
    const status: CategoryVariance["status"] =
      spent > estimated ? "over" : usedPercent >= 85 ? "near" : "under";
    return { category, spent, estimated, remaining, usedPercent, status };
  });
}

export interface BudgetHealth {
  estimated: number;
  spent: number;
  remaining: number;
  usedPercent: number;
  status: "under" | "near" | "over";
}

/** Whole-budget health including the contingency reserve. */
export function budgetHealth(budget: Budget): BudgetHealth {
  const estimated = totalEstimated(budget);
  const spent = totalSpent(budget.categories);
  const remaining = estimated - spent;
  const usedPercent =
    estimated === 0 ? 0 : Math.round((spent / estimated) * 100);
  const status: BudgetHealth["status"] =
    spent > estimated ? "over" : usedPercent >= 85 ? "near" : "under";
  return { estimated, spent, remaining, usedPercent, status };
}

/** Add a new custom category, keeping percentages consistent. */
export function withCustomCategory(
  budget: Budget,
  input: { name: string; estimatedAmount: number },
  idFactory: () => string,
): Budget {
  const categories = [
    ...budget.categories,
    {
      id: idFactory(),
      name: input.name,
      estimatedAmount: input.estimatedAmount,
      minAmount: Math.round(input.estimatedAmount * 0.9),
      maxAmount: Math.round(input.estimatedAmount * 1.15),
      percentage: 0,
      actualAmount: 0,
      note: "Custom category added by the planner.",
    },
  ];
  return rebalancePercentages({ ...budget, categories });
}

/** Recompute category percentages so they always sum to 100. */
export function rebalancePercentages(budget: Budget): Budget {
  const subtotal = budget.categories.reduce(
    (sum, category) => sum + category.estimatedAmount,
    0,
  );
  const categories = budget.categories.map((category) => ({
    ...category,
    percentage:
      subtotal === 0
        ? 0
        : Math.round((category.estimatedAmount / subtotal) * 100),
  }));
  return { ...budget, categories, totalEstimated: totalEstimated(budget) };
}
