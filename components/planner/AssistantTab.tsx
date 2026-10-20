"use client";

import { useState, type FormEvent } from "react";
import { Button, Card } from "@/components/ui/primitives";
import type { ChatMessage, EventBrief } from "@/lib/schemas";

interface AssistantTabProps {
  brief: EventBrief;
  onSendChat: (messages: ChatMessage[]) => Promise<{ reply: string }>;
}

const SUGGESTIONS = [
  "My catering quote is 20% over estimate — what should I cut first?",
  "Which tasks are most urgent with 30 days left?",
  "How should I use the contingency reserve?",
];

export function AssistantTab({ brief, onSendChat }: AssistantTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);
    setError("");
    try {
      const reply = await onSendChat(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply.reply }]);
    } catch {
      setError("The assistant is temporarily unavailable. Please retry in a moment.");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <Card tint="dark" className="flex min-h-[520px] flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-cream">AI planning assistant</h2>
        <p className="text-sm text-[#FFD9C7]">
          Grounded in {brief.eventTitle} — your budget, checklist and risk tips are already in
          context.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {messages.length === 0 && (
          <div className="grid gap-3 rounded-2xl bg-white/[0.08] p-5">
            <p className="text-sm font-semibold text-cream">Try asking:</p>
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => void send(suggestion)}
                className="rounded-full border border-[#FFE4D3]/30 px-4 py-2.5 text-left text-sm font-semibold text-[#FFD9C7] transition-colors hover:bg-white/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              message.role === "user"
                ? "ml-auto bg-coral-600 text-white"
                : "bg-white/[0.1] text-cream"
            }`}
          >
            <p className="sr-only">{message.role === "user" ? "You said" : "Assistant replied"}</p>
            {message.content}
          </div>
        ))}
        {sending && (
          <div className="max-w-[85%] rounded-2xl bg-white/[0.1] px-4 py-3 text-sm text-[#FFD9C7]">
            <span className="inline-flex gap-1" aria-label="Assistant is typing">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFD9C7]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFD9C7] [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFD9C7] [animation-delay:300ms]" />
            </span>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm font-bold text-red-300">
            {error}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <label htmlFor="chat-input" className="sr-only">
          Ask the planning assistant
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={1500}
          placeholder="Ask about trade-offs, vendors or your timeline…"
          className="rounded-2xl border-2 border-white/20 bg-white/[0.08] px-4 py-3 text-sm text-cream placeholder:text-[#FFD9C7]/60 focus:border-coral-500"
        />
        <Button type="submit" disabled={sending || !draft.trim()}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>
    </Card>
  );
}
