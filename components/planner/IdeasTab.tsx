"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Badge, Button, Card } from "@/components/ui/primitives";
import type { EventBrief, EventPlan, Idea, IdeaCategory } from "@/lib/schemas";

interface IdeasTabProps {
  brief: EventBrief;
  plan: EventPlan;
  onReplaceIdeas: (ideas: Idea[]) => void;
}

const FAVORITES_KEY = "eventcraft.idea-favorites.v1";

const CATEGORY_EMOJI: Record<IdeaCategory, string> = {
  theme: "🎨",
  decor: "🪔",
  activity: "🎉",
  personal: "💌",
};

export function IdeasTab({ brief, plan, onReplaceIdeas }: IdeasTabProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw) as string[]));
    } catch {
      setFavorites(new Set());
    }
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  async function regenerate(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, focus: focus || undefined, count: 6 }),
      });
      if (!response.ok) throw new Error("regeneration failed");
      const payload = (await response.json()) as { ideas: Idea[] };
      onReplaceIdeas(payload.ideas);
    } catch {
      setError("Could not regenerate ideas right now. Your current ideas are untouched.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <Card tint="amber">
        <h2 className="text-xl font-bold">Personalized for your event</h2>
        <p className="mt-1 text-sm text-muted">
          Ideas are generated from your style tags ({brief.styleTags.join(", ") || "none"}),{" "}
          {brief.guestCount} guests and your special requirements.
        </p>
        <form onSubmit={regenerate} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <label htmlFor="idea-focus" className="sr-only">
            Focus for new ideas
          </label>
          <input
            id="idea-focus"
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
            placeholder="Optional focus, e.g. budget-friendly decor or kid-friendly activities"
            maxLength={120}
            className="rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm focus:border-coral-500"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Generating…" : "↻ Regenerate ideas"}
          </Button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm font-bold text-red-600">
            {error}
          </p>
        )}
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {plan.ideas.map((idea) => (
          <Card key={idea.id} className="flex flex-col gap-3 hover:-translate-y-1">
            <div className="flex items-start justify-between gap-3">
              <span className="text-3xl" aria-hidden="true">
                {CATEGORY_EMOJI[idea.category]}
              </span>
              <button
                onClick={() => toggleFavorite(idea.id)}
                aria-pressed={favorites.has(idea.id)}
                aria-label={favorites.has(idea.id) ? "Remove from favorites" : "Save to favorites"}
                className="grid h-10 w-10 place-items-center rounded-full bg-coral-100 text-lg transition-transform hover:scale-110"
              >
                {favorites.has(idea.id) ? "❤️" : "🤍"}
              </button>
            </div>
            <h3 className="font-display text-lg font-bold">{idea.title}</h3>
            <p className="flex-1 text-sm text-muted">{idea.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="pink">{idea.category}</Badge>
              {idea.tags.map((tag) => (
                <Badge key={tag} tone="neutral">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
