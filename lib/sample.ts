import type { EventBrief } from "@/lib/schemas";

/**
 * One-click sample event so a judge can experience the full AI flow in
 * seconds without filling the intake form.
 */
export function sampleBrief(): EventBrief {
  const date = new Date();
  date.setDate(date.getDate() + 45);
  return {
    eventType: "wedding",
    eventTitle: "Aarav & Meera Wedding",
    eventDate: date.toISOString().slice(0, 10),
    guestCount: 150,
    budgetTotal: 1_200_000,
    currency: "INR",
    locationTier: "metro",
    styleTags: ["traditional", "elegant", "intimate"],
    dietaryNotes: "Mix of vegetarian and non-vegetarian counters, separate Jain meal.",
    specialRequirements:
      "Elderly guests need step-free access and seated dining; quiet room for infants.",
  };
}
