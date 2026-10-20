"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type {
  BudgetCategory,
  ChatMessage,
  ChecklistTask,
  EventBrief,
  EventPlan,
  Idea,
  Milestone,
  PlannerDocument,
} from "@/lib/schemas";
import {
  clearDocument,
  documentFromJson,
  documentToJson,
  loadDocument,
  saveDocument,
} from "@/lib/storage";
import { createId } from "@/lib/ids";
import { Logo } from "@/components/Logo";
import { EventForm } from "@/components/planner/EventForm";
import { GeneratingState } from "@/components/planner/GeneratingState";
import { Dashboard } from "@/components/planner/Dashboard";

type AppStatus = "form" | "loading" | "ready" | "error";

interface PlannerAppProps {
  prefillSample: boolean;
}

export function PlannerApp({ prefillSample }: PlannerAppProps) {
  const [doc, setDoc] = useState<PlannerDocument | null>(null);
  const [status, setStatus] = useState<AppStatus>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const saved = loadDocument();
    if (saved) {
      setDoc(saved);
      setStatus("ready");
    }
    setHydrated(true);
  }, []);

  // Persist every document change.
  useEffect(() => {
    if (doc) saveDocument(doc);
  }, [doc]);

  const generatePlan = useCallback(async (brief: EventBrief) => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Plan generation failed.");
      }
      const payload = (await response.json()) as { plan: EventPlan };
      setDoc({ brief, plan: payload.plan });
      setStatus("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  const startNewEvent = useCallback(() => {
    clearDocument();
    setDoc(null);
    setStatus("form");
  }, []);

  /** Immutable plan update helper used by every dashboard mutation. */
  const updatePlan = useCallback((mutate: (plan: EventPlan) => EventPlan) => {
    setDoc((current) => (current ? { ...current, plan: mutate(current.plan) } : current));
  }, []);

  const setActualAmount = useCallback(
    (categoryId: string, amount: number) => {
      updatePlan((plan) => ({
        ...plan,
        budget: {
          ...plan.budget,
          categories: plan.budget.categories.map((category: BudgetCategory) =>
            category.id === categoryId ? { ...category, actualAmount: amount } : category,
          ),
        },
      }));
    },
    [updatePlan],
  );

  const addCategory = useCallback(
    (name: string, estimatedAmount: number) => {
      updatePlan((plan) => ({
        ...plan,
        budget: {
          ...plan.budget,
          categories: [
            ...plan.budget.categories,
            {
              id: createId("bc"),
              name,
              estimatedAmount,
              minAmount: Math.round(estimatedAmount * 0.9),
              maxAmount: Math.round(estimatedAmount * 1.15),
              percentage: 0,
              actualAmount: 0,
              note: "Custom category added by the planner.",
            },
          ],
        },
      }));
    },
    [updatePlan],
  );

  const toggleMilestone = useCallback(
    (milestoneId: string) => {
      updatePlan((plan) => ({
        ...plan,
        timeline: plan.timeline.map((milestone: Milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, status: milestone.status === "done" ? "pending" : "done" }
            : milestone,
        ),
      }));
    },
    [updatePlan],
  );

  const toggleTask = useCallback(
    (taskId: string) => {
      updatePlan((plan) => ({
        ...plan,
        checklist: plan.checklist.map((task: ChecklistTask) =>
          task.id === taskId ? { ...task, done: !task.done } : task,
        ),
      }));
    },
    [updatePlan],
  );

  const addTask = useCallback(
    (title: string, category: string) => {
      updatePlan((plan) => ({
        ...plan,
        checklist: [
          ...plan.checklist,
          {
            id: createId("task"),
            title,
            category,
            priority: "medium",
            owner: "Planner",
            daysBeforeOffset: 7,
            done: false,
          },
        ],
      }));
    },
    [updatePlan],
  );

  const replaceIdeas = useCallback(
    (ideas: Idea[]) => {
      updatePlan((plan) => ({ ...plan, ideas }));
    },
    [updatePlan],
  );

  const exportJson = useCallback(() => {
    if (!doc) return;
    const blob = new Blob([documentToJson(doc)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `eventcraft-plan-${doc.brief.eventDate}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [doc]);

  const importJson = useCallback((file: File) => {
    file
      .text()
      .then((json) => {
        const imported = documentFromJson(json);
        setDoc(imported);
        setStatus("ready");
      })
      .catch(() => setErrorMessage("That backup file is invalid or out of date."));
  }, []);

  const sendChat = useCallback(
    async (messages: ChatMessage[]) => {
      if (!doc) throw new Error("No active plan.");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: doc.brief, plan: doc.plan, messages }),
      });
      if (!response.ok) throw new Error("Assistant unavailable.");
      return (await response.json()) as { reply: string };
    },
    [doc],
  );

  if (!hydrated) return <div className="min-h-screen" aria-busy="true" />;

  return (
    <div>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label="Back to home">
          <Logo />
        </Link>
        {status === "ready" && doc && (
          <button
            onClick={startNewEvent}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-muted shadow-soft hover:bg-coral-100"
          >
            + New event
          </button>
        )}
      </div>

      {status === "loading" && <GeneratingState />}

      {status !== "loading" && status !== "ready" && (
        <EventForm loading={false} prefillSample={prefillSample} onSubmit={generatePlan} />
      )}

      {status === "error" && (
        <div role="alert" className="mx-auto max-w-3xl px-5 pb-8">
          <div className="rounded-3xl bg-red-100 p-5 text-sm font-bold text-red-600">
            {errorMessage || "Generation failed."} Please check your connection and retry.
          </div>
        </div>
      )}

      {status === "ready" && doc && (
        <Dashboard
          document={doc}
          onSetActual={setActualAmount}
          onAddCategory={addCategory}
          onToggleMilestone={toggleMilestone}
          onToggleTask={toggleTask}
          onAddTask={addTask}
          onReplaceIdeas={replaceIdeas}
          onSendChat={sendChat}
          onExport={exportJson}
          onImport={importJson}
          onNewEvent={startNewEvent}
        />
      )}
    </div>
  );
}
