"use client";

import { useRef, useState } from "react";
import { Badge, Button } from "@/components/ui/primitives";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { EVENT_THEMES } from "@/lib/event-themes";
import { daysUntil, formatDate } from "@/lib/format";
import type { DashboardProps } from "@/components/planner/types";
import { OverviewTab } from "@/components/planner/OverviewTab";
import { BudgetTab } from "@/components/planner/BudgetTab";
import { TimelineTab } from "@/components/planner/TimelineTab";
import { ChecklistTab } from "@/components/planner/ChecklistTab";
import { IdeasTab } from "@/components/planner/IdeasTab";
import { AssistantTab } from "@/components/planner/AssistantTab";

const TABS: TabItem[] = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "budget", label: "Budget", icon: "💰" },
  { id: "timeline", label: "Timeline", icon: "📅" },
  { id: "checklist", label: "Checklist", icon: "✅" },
  { id: "ideas", label: "Ideas", icon: "✨" },
  { id: "assistant", label: "Assistant", icon: "🤖" },
];

export function Dashboard(props: DashboardProps) {
  const { document, onExport, onImport } = props;
  const { brief, plan } = document;
  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = EVENT_THEMES[brief.eventType];
  const countdown = daysUntil(brief.eventDate);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20">
      <section className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl text-xl"
                style={{ backgroundColor: theme.tint }}
                aria-hidden="true"
              >
                {theme.emoji}
              </span>
              <Badge tone="coral">{theme.label}</Badge>
              {plan.source === "demo" && (
                <Badge tone="neutral">Demo estimates · add GEMINI_API_KEY for live AI</Badge>
              )}
            </div>
            <h1 className="text-2xl font-extrabold md:text-3xl">{brief.eventTitle}</h1>
            <p className="mt-1 text-sm text-muted">
              {formatDate(brief.eventDate)} · {brief.guestCount} guests ·{" "}
              {brief.locationTier} location tier
            </p>
          </div>
          <div className="rounded-3xl bg-coral-100 px-6 py-4 text-center">
            <p className="font-display text-3xl font-extrabold text-coral-600">
              {countdown >= 0 ? countdown : 0}
            </p>
            <p className="text-xs font-bold text-muted">
              {countdown >= 0 ? "days to go" : "event date passed"}
            </p>
          </div>
        </div>

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <Button variant="ghost" size="sm" onClick={onExport}>
            ⬇ Export JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            ⬆ Import backup
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            🖨 Print / PDF
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImport(file);
              event.target.value = "";
            }}
            aria-label="Import a plan backup JSON file"
          />
        </div>
      </section>

      <div className="no-print sticky top-3 z-20 my-6 flex justify-center">
        <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} idBase="planner" />
      </div>

      <div aria-live="polite">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`planner-panel-${tab.id}`}
            aria-labelledby={`planner-tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {activeTab === tab.id && (
              <>
                {tab.id === "overview" && <OverviewTab brief={brief} plan={plan} />}
                {tab.id === "budget" && (
                  <BudgetTab brief={brief} plan={plan} onSetActual={props.onSetActual} onAddCategory={props.onAddCategory} />
                )}
                {tab.id === "timeline" && (
                  <TimelineTab plan={plan} onToggleMilestone={props.onToggleMilestone} />
                )}
                {tab.id === "checklist" && (
                  <ChecklistTab plan={plan} onToggleTask={props.onToggleTask} onAddTask={props.onAddTask} />
                )}
                {tab.id === "ideas" && (
                  <IdeasTab brief={brief} plan={plan} onReplaceIdeas={props.onReplaceIdeas} />
                )}
                {tab.id === "assistant" && <AssistantTab brief={brief} onSendChat={props.onSendChat} />}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
