"use client";

export interface TabItem {
  id: string;
  label: string;
  icon: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  idBase?: string;
}

/** Accessible ARIA tablist with full keyboard support. */
export function Tabs({ tabs, activeId, onChange, idBase = "tabs" }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Planner sections"
      className="flex gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft"
      onKeyDown={(event) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const currentIndex = tabs.findIndex((tab) => tab.id === activeId);
        const nextIndex =
          event.key === "ArrowRight"
            ? (currentIndex + 1) % tabs.length
            : event.key === "ArrowLeft"
              ? (currentIndex - 1 + tabs.length) % tabs.length
              : event.key === "Home"
                ? 0
                : tabs.length - 1;
        const next = tabs[nextIndex];
        if (next) {
          onChange(next.id);
          document.getElementById(`${idBase}-tab-${next.id}`)?.focus();
        }
      }}
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`${idBase}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
              selected ? "bg-ink text-cream" : "text-muted hover:bg-coral-100"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
