"use client";

import { useMemo, useState, type FormEvent } from "react";
import { eventBriefSchema, type EventBrief, type EventType } from "@/lib/schemas";
import { EVENT_TYPE_OPTIONS, STYLE_TAG_SUGGESTIONS } from "@/lib/event-themes";
import { sampleBrief } from "@/lib/sample";
import { Button, Card } from "@/components/ui/primitives";
import { SelectField, TextArea, TextField } from "@/components/ui/fields";
import { Sparkle } from "@/components/Sparkles";

type FormErrors = Partial<Record<keyof EventBrief, string>>;

interface EventFormProps {
  loading: boolean;
  prefillSample: boolean;
  onSubmit: (brief: EventBrief) => void;
}

const EMPTY_FORM = {
  eventType: "wedding" as EventType,
  eventTitle: "",
  eventDate: "",
  guestCount: "",
  budgetTotal: "",
  currency: "INR",
  locationTier: "metro" as EventBrief["locationTier"],
  styleTags: [] as string[],
  dietaryNotes: "",
  specialRequirements: "",
};

export function EventForm({ loading, prefillSample, onSubmit }: EventFormProps) {
  const [form, setForm] = useState(() =>
    prefillSample ? { ...sampleBrief(), guestCount: String(sampleBrief().guestCount), budgetTotal: String(sampleBrief().budgetTotal) } : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleTag(tag: string) {
    setForm((current) => {
      const has = current.styleTags.includes(tag);
      const next = has
        ? current.styleTags.filter((item) => item !== tag)
        : [...current.styleTags, tag].slice(0, 6);
      return { ...current, styleTags: next };
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = eventBriefSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const nextErrors: FormErrors = {};
      for (const key of Object.keys(fieldErrors) as Array<keyof FormErrors>) {
        const message = fieldErrors[key]?.[0];
        if (message) nextErrors[key] = message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8 text-center">
        <p className="mb-2 flex items-center justify-center gap-2 font-script text-2xl text-pink-500">
          <Sparkle className="h-5 w-5" /> tell us about your celebration
        </p>
        <h1 className="text-3xl font-extrabold md:text-4xl">Create your event brief</h1>
        <p className="mt-2 text-sm text-muted">
          One minute of inputs produces a complete budget, timeline, checklist and idea set.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card className="grid gap-6">
          <fieldset>
            <legend className="mb-3 text-sm font-extrabold">1. What are you celebrating?</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {EVENT_TYPE_OPTIONS.map((option) => {
                const selected = form.eventType === option.value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => patch("eventType", option.value)}
                    aria-pressed={selected}
                    className={`rounded-3xl border-2 p-4 text-left transition-all ${
                      selected
                        ? "border-coral-500 bg-coral-100 shadow-soft"
                        : "border-line bg-white hover:border-coral-100"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">{option.emoji}</span>
                    <span className="mt-2 block font-display text-base font-bold">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Event title"
              name="eventTitle"
              placeholder="e.g. Aarav & Meera Wedding"
              value={form.eventTitle}
              onChange={(event) => patch("eventTitle", event.target.value)}
              error={errors.eventTitle}
              required
              maxLength={80}
            />
            <TextField
              label="Event date"
              name="eventDate"
              type="date"
              min={today}
              value={form.eventDate}
              onChange={(event) => patch("eventDate", event.target.value)}
              error={errors.eventDate}
              required
            />
            <TextField
              label="Guest count"
              name="guestCount"
              type="number"
              min={1}
              max={100000}
              placeholder="150"
              value={form.guestCount}
              onChange={(event) => patch("guestCount", event.target.value)}
              error={errors.guestCount}
              required
            />
            <div className="grid grid-cols-[1fr_110px] gap-3">
              <TextField
                label="Total budget"
                name="budgetTotal"
                type="number"
                min={1}
                placeholder="1200000"
                value={form.budgetTotal}
                onChange={(event) => patch("budgetTotal", event.target.value)}
                error={errors.budgetTotal}
                required
              />
              <TextField
                label="Currency"
                name="currency"
                value={form.currency}
                onChange={(event) => patch("currency", event.target.value)}
                maxLength={3}
                aria-label="Currency code"
              />
            </div>
            <SelectField
              label="Location tier"
              name="locationTier"
              value={form.locationTier}
              onChange={(event) =>
                patch("locationTier", event.target.value as EventBrief["locationTier"])
              }
              options={[
                { value: "metro", label: "Metro city" },
                { value: "city", label: "City" },
                { value: "town", label: "Town" },
              ]}
            />
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-extrabold">
              2. Style tags <span className="font-medium text-muted">(pick up to six)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {STYLE_TAG_SUGGESTIONS.map((tag) => {
                const selected = form.styleTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    aria-pressed={selected}
                    className={`rounded-full px-4 py-2 text-xs font-bold shadow-soft transition-all ${
                      selected ? "bg-coral-600 text-white" : "bg-white text-muted hover:bg-coral-100"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-5 md:grid-cols-2">
            <TextArea
              label="Dietary notes"
              name="dietaryNotes"
              rows={3}
              maxLength={300}
              placeholder="e.g. separate Jain counter, allergy list"
              value={form.dietaryNotes}
              onChange={(event) => patch("dietaryNotes", event.target.value)}
            />
            <TextArea
              label="Special requirements"
              name="specialRequirements"
              rows={3}
              maxLength={500}
              placeholder="e.g. step-free access, quiet room for infants"
              value={form.specialRequirements}
              onChange={(event) => patch("specialRequirements", event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm({ ...EMPTY_FORM })}
              disabled={loading}
            >
              Clear form
            </Button>
            <Button type="submit" disabled={loading} className="min-w-52">
              {loading ? "Generating your plan…" : "Generate AI plan"}
              {!loading && <span aria-hidden="true">✨</span>}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
