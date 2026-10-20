"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { budgetHealth, categoryVariances, totalEstimated } from "@/lib/budget";
import { formatCurrency } from "@/lib/format";
import type { EventBrief, EventPlan } from "@/lib/schemas";

interface BudgetTabProps {
  brief: EventBrief;
  plan: EventPlan;
  onSetActual: (categoryId: string, amount: number) => void;
  onAddCategory: (name: string, estimatedAmount: number) => void;
}

export function BudgetTab({ brief, plan, onSetActual, onAddCategory }: BudgetTabProps) {
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const health = budgetHealth(plan.budget);
  const rows = categoryVariances(plan.budget);

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    const amount = Number(newAmount);
    if (newName.trim().length < 2 || !Number.isFinite(amount) || amount <= 0) return;
    onAddCategory(newName.trim(), Math.round(amount));
    setNewName("");
    setNewAmount("");
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card tint="coral">
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Total estimated</p>
          <p className="mt-1 font-display text-2xl font-extrabold">
            {formatCurrency(totalEstimated(plan.budget), brief.currency)}
          </p>
          <p className="text-xs text-muted">
            incl. {formatCurrency(plan.budget.contingencyAmount, brief.currency)} contingency
          </p>
        </Card>
        <Card tint="pink">
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Spent so far</p>
          <p className="mt-1 font-display text-2xl font-extrabold">
            {formatCurrency(health.spent, brief.currency)}
          </p>
          <p className="text-xs text-muted">{health.usedPercent}% of estimate used</p>
        </Card>
        <Card tint={health.status === "over" ? "red" : "green"}>
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Remaining</p>
          <p className="mt-1 font-display text-2xl font-extrabold">
            {formatCurrency(health.remaining, brief.currency)}
          </p>
          <Badge tone={health.status === "over" ? "red" : health.status === "near" ? "coral" : "green"}>
            {health.status === "over" ? "Over budget" : health.status === "near" ? "Near limit" : "On track"}
          </Badge>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Category tracker</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-line text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 font-extrabold">Category</th>
                <th className="pb-3 font-extrabold">Estimate</th>
                <th className="pb-3 font-extrabold">Range</th>
                <th className="pb-3 font-extrabold">Actual spent</th>
                <th className="pb-3 font-extrabold">Usage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ category, usedPercent, status, remaining }) => (
                <tr key={category.id} className="border-b border-line/70 align-middle">
                  <td className="py-3 pr-3">
                    <p className="font-bold">{category.name}</p>
                    {category.note && <p className="text-xs text-muted">{category.note}</p>}
                  </td>
                  <td className="py-3 pr-3 font-semibold">
                    {formatCurrency(category.estimatedAmount, brief.currency)}
                    <span className="ml-1 text-xs text-muted">{category.percentage}%</span>
                  </td>
                  <td className="py-3 pr-3 text-xs text-muted">
                    {formatCurrency(category.minAmount, brief.currency)} –{" "}
                    {formatCurrency(category.maxAmount, brief.currency)}
                  </td>
                  <td className="py-3 pr-3">
                    <label htmlFor={`actual-${category.id}`} className="sr-only">
                      Actual amount for {category.name}
                    </label>
                    <input
                      id={`actual-${category.id}`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={category.actualAmount || ""}
                      placeholder="0"
                      onChange={(event) => onSetActual(category.id, Math.max(0, Number(event.target.value)))}
                      className="w-32 rounded-xl border-2 border-line bg-white px-3 py-2 text-sm font-bold focus:border-coral-500"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-24 overflow-hidden rounded-full bg-coral-100">
                        <div
                          className={`h-full rounded-full ${
                            status === "over"
                              ? "bg-red-600"
                              : status === "near"
                                ? "bg-coral-500"
                                : "bg-green-600"
                          }`}
                          style={{ width: `${Math.min(100, usedPercent)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">
                        {status === "over"
                          ? `over by ${formatCurrency(Math.abs(remaining), brief.currency)}`
                          : `${usedPercent}%`}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card tint="coral">
        <h2 className="mb-3 text-xl font-bold">Add a custom category</h2>
        <form onSubmit={handleAdd} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <label htmlFor="custom-category-name" className="sr-only">
            Custom category name
          </label>
          <input
            id="custom-category-name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="e.g. Fireworks display"
            maxLength={60}
            className="rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm focus:border-coral-500"
          />
          <label htmlFor="custom-category-amount" className="sr-only">
            Estimated amount
          </label>
          <input
            id="custom-category-amount"
            type="number"
            min={1}
            value={newAmount}
            onChange={(event) => setNewAmount(event.target.value)}
            placeholder="Estimate"
            className="rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm focus:border-coral-500"
          />
          <Button type="submit">Add category</Button>
        </form>
      </Card>
    </div>
  );
}
