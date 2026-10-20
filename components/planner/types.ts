import type {
  ChatMessage,
  EventPlan,
  EventBrief,
  Idea,
  PlannerDocument,
} from "@/lib/schemas";

/** Props shared between the dashboard shell and its tab views. */
export interface DashboardProps {
  document: PlannerDocument;
  onSetActual: (categoryId: string, amount: number) => void;
  onAddCategory: (name: string, estimatedAmount: number) => void;
  onToggleMilestone: (milestoneId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, category: string) => void;
  onReplaceIdeas: (ideas: Idea[]) => void;
  onSendChat: (messages: ChatMessage[]) => Promise<{ reply: string }>;
  onExport: () => void;
  onImport: (file: File) => void;
  onNewEvent: () => void;
}

export interface TabProps {
  brief: EventBrief;
  plan: EventPlan;
}
