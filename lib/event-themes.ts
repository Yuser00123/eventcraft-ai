import type { EventType, Priority } from "@/lib/schemas";

export interface EventTheme {
  label: string;
  tagline: string;
  accent: string;
  tint: string;
  emoji: string;
}

/**
 * Event-type theming changes accents and copy only — never the layout —
 * so wedding, birthday and community plans share one tested component tree.
 */
export const EVENT_THEMES: Record<EventType, EventTheme> = {
  wedding: {
    label: "Wedding",
    tagline: "Ceremonies, rituals and celebrations, perfectly sequenced",
    accent: "#E04A1F",
    tint: "#FFE4D3",
    emoji: "💍",
  },
  birthday: {
    label: "Birthday",
    tagline: "Joyful parties with zero last-minute scrambling",
    accent: "#F2558E",
    tint: "#FFDCE9",
    emoji: "🎂",
  },
  community: {
    label: "Community event",
    tagline: "Volunteers, permits and logistics under control",
    accent: "#2E8B5C",
    tint: "#DDF2E7",
    emoji: "🤝",
  },
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_THEMES).map(
  ([value, theme]) => ({ value: value as EventType, ...theme }),
);

export const STYLE_TAG_SUGGESTIONS = [
  "traditional",
  "modern",
  "minimalist",
  "themed",
  "rustic",
  "elegant",
  "eco-friendly",
  "kid-friendly",
  "intimate",
  "grand",
];
