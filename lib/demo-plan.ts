import type {
  BudgetCategory,
  ChecklistTask,
  EventBrief,
  EventPlan,
  Idea,
  Milestone,
} from "@/lib/schemas";

/**
 * Deterministic offline plan used when no GEMINI_API_KEY is configured
 * (or as a resilience fallback if the model call fails). Every figure is
 * derived from the user's real budget so the data remains coherent; the UI
 * always labels demo output honestly.
 */

type CategoryTemplate = { name: string; share: number; note: string };

const CATEGORY_TEMPLATES: Record<EventBrief["eventType"], CategoryTemplate[]> = {
  wedding: [
    { name: "Venue & staging", share: 0.22, note: "Ceremony + reception venue hire" },
    { name: "Catering & beverages", share: 0.24, note: "Per-plate cost × guest count" },
    { name: "Decor & florals", share: 0.14, note: "Mandap, entrance and table decor" },
    { name: "Photography & video", share: 0.1, note: "Coverage + highlight reel" },
    { name: "Attire & grooming", share: 0.09, note: "Outfits, makeup, styling" },
    { name: "Invitations & stationery", share: 0.04, note: "Digital + printed suite" },
    { name: "Music & entertainment", share: 0.06, note: "Ceremony and reception audio" },
    { name: "Gifts & favors", share: 0.05, note: "Guest favors and ritual items" },
  ],
  birthday: [
    { name: "Venue & setup", share: 0.2, note: "Party hall or outdoor space" },
    { name: "Catering & cake", share: 0.26, note: "Snacks, meals and centerpiece cake" },
    { name: "Decor & theming", share: 0.16, note: "Backdrop, balloons, table styling" },
    { name: "Entertainment & games", share: 0.14, note: "Host, activities and music" },
    { name: "Photography", share: 0.08, note: "Candid coverage" },
    { name: "Invitations", share: 0.05, note: "Digital invites and reminders" },
    { name: "Return gifts", share: 0.09, note: "Per-guest favors" },
  ],
  community: [
    { name: "Venue & permits", share: 0.24, note: "Booking, permissions and insurance" },
    { name: "Catering", share: 0.22, note: "Bulk catering for attendees" },
    { name: "Decor & signage", share: 0.1, note: "Wayfinding and stage dressing" },
    { name: "A/V & stage", share: 0.14, note: "Sound, lighting and presentation" },
    { name: "Volunteer coordination", share: 0.08, note: "Kits, badges and briefings" },
    { name: "Safety & first aid", share: 0.08, note: "Marshals, medical desk, backups" },
    { name: "Outreach & printing", share: 0.08, note: "Flyers, banners and registration" },
  ],
};

const MILESTONE_TEMPLATES: Record<EventBrief["eventType"], Array<Omit<Milestone, "id" | "dueDate">>> = {
  wedding: [
    { title: "Lock venue and pay booking deposit", description: "Confirm date, capacity and cancellation terms in writing.", daysBeforeOffset: 120, category: "Venue", status: "pending" },
    { title: "Finalize catering shortlist and tasting", description: "Compare per-plate quotes covering dietary counters.", daysBeforeOffset: 90, category: "Catering", status: "pending" },
    { title: "Book photographer and entertainment", description: "Sign contracts with deliverable and payment milestones.", daysBeforeOffset: 75, category: "Vendors", status: "pending" },
    { title: "Send invitations", description: "Digital first wave with RSVP tracking sheet.", daysBeforeOffset: 45, category: "Invitations", status: "pending" },
    { title: "Attire trials and grooming bookings", description: "Complete fittings and confirm styling slots.", daysBeforeOffset: 30, category: "Attire", status: "pending" },
    { title: "Confirm headcount and final menus", description: "Share guaranteed guest numbers with all vendors.", daysBeforeOffset: 14, category: "Catering", status: "pending" },
    { title: "Vendor briefings and rehearsal", description: "Walk through run-of-show with every vendor.", daysBeforeOffset: 3, category: "Coordination", status: "pending" },
    { title: "Event day execution", description: "Run-of-show checklist, emergency contacts on hand.", daysBeforeOffset: 0, category: "Event day", status: "pending" },
  ],
  birthday: [
    { title: "Confirm theme and venue", description: "Pick an age-appropriate theme and book the space.", daysBeforeOffset: 30, category: "Venue", status: "pending" },
    { title: "Order cake and book entertainment", description: "Lock cake design, host and activities.", daysBeforeOffset: 21, category: "Vendors", status: "pending" },
    { title: "Send invitations", description: "Digital invites with RSVP deadline.", daysBeforeOffset: 14, category: "Invitations", status: "pending" },
    { title: "Decor and favor shopping", description: "Order decor pieces and return gifts in one batch.", daysBeforeOffset: 7, category: "Shopping", status: "pending" },
    { title: "Confirm final headcount", description: "Brief caterer and venue on numbers.", daysBeforeOffset: 3, category: "Catering", status: "pending" },
    { title: "Party day setup", description: "Decorate 2 hours early; test music and games.", daysBeforeOffset: 0, category: "Event day", status: "pending" },
  ],
  community: [
    { title: "Secure permits and venue agreement", description: "File permissions, insurance and safety paperwork.", daysBeforeOffset: 60, category: "Permits", status: "pending" },
    { title: "Recruit and brief volunteers", description: "Assign roles, shifts and point-of-contact tree.", daysBeforeOffset: 30, category: "Volunteers", status: "pending" },
    { title: "Confirm catering and A/V vendors", description: "Contracts, deposits and backup contacts.", daysBeforeOffset: 21, category: "Vendors", status: "pending" },
    { title: "Outreach and registration push", description: "Publish banners, posts and sign-up forms.", daysBeforeOffset: 14, category: "Outreach", status: "pending" },
    { title: "Safety walkthrough and first-aid desk", description: "Exits, marshals, medical and weather contingencies.", daysBeforeOffset: 5, category: "Safety", status: "pending" },
    { title: "Event day command desk", description: "Check-in, issue tracking and hourly syncs.", daysBeforeOffset: 0, category: "Event day", status: "pending" },
  ],
};

const CHECKLIST_TEMPLATES: Record<EventBrief["eventType"], Array<Omit<ChecklistTask, "id" | "dueDate" | "done">>> = {
  wedding: [
    { title: "Compare 3 venue quotes and verify capacity", category: "Venue", priority: "high", owner: "Family lead", daysBeforeOffset: 110 },
    { title: "Pay venue booking deposit and get receipt", category: "Venue", priority: "high", owner: "Family lead", daysBeforeOffset: 105 },
    { title: "Finalize caterer after tasting session", category: "Catering", priority: "high", owner: "Couple", daysBeforeOffset: 85 },
    { title: "Confirm Jain / special meal counters", category: "Catering", priority: "medium", owner: "Family lead", daysBeforeOffset: 20 },
    { title: "Approve decor mock-up and color palette", category: "Decor", priority: "medium", owner: "Couple", daysBeforeOffset: 40 },
    { title: "Sign photographer contract with deliverables list", category: "Photography", priority: "high", owner: "Couple", daysBeforeOffset: 70 },
    { title: "Book makeup artist and trial session", category: "Attire", priority: "medium", owner: "Couple", daysBeforeOffset: 35 },
    { title: "Compile music playlist for each function", category: "Entertainment", priority: "low", owner: "Family lead", daysBeforeOffset: 10 },
    { title: "Arrange guest transport and parking plan", category: "Logistics", priority: "medium", owner: "Volunteer", daysBeforeOffset: 12 },
    { title: "Prepare step-free access for elderly guests", category: "Accessibility", priority: "high", owner: "Venue manager", daysBeforeOffset: 7 },
    { title: "Track RSVPs in a shared sheet", category: "Invitations", priority: "medium", owner: "Family lead", daysBeforeOffset: 25 },
    { title: "Pack emergency kit (pins, meds, charger)", category: "Event day", priority: "low", owner: "Volunteer", daysBeforeOffset: 1 },
  ],
  birthday: [
    { title: "Book venue with rain backup option", category: "Venue", priority: "high", owner: "Host", daysBeforeOffset: 28 },
    { title: "Order cake matching theme and allergies", category: "Catering", priority: "high", owner: "Host", daysBeforeOffset: 10 },
    { title: "Confirm entertainer arrival time and slot", category: "Entertainment", priority: "medium", owner: "Host", daysBeforeOffset: 7 },
    { title: "Assemble decor kit and backdrop pieces", category: "Decor", priority: "medium", owner: "Helper", daysBeforeOffset: 4 },
    { title: "Pack return gifts with name tags", category: "Gifts", priority: "low", owner: "Helper", daysBeforeOffset: 2 },
    { title: "Charge camera and clear storage", category: "Photography", priority: "low", owner: "Host", daysBeforeOffset: 1 },
    { title: "Prepare age-appropriate game materials", category: "Entertainment", priority: "medium", owner: "Host", daysBeforeOffset: 5 },
    { title: "Confirm final headcount with caterer", category: "Catering", priority: "high", owner: "Host", daysBeforeOffset: 3 },
  ],
  community: [
    { title: "File event permit and safety declaration", category: "Permits", priority: "high", owner: "Organizer", daysBeforeOffset: 55 },
    { title: "Publish volunteer roster with shift times", category: "Volunteers", priority: "high", owner: "Volunteer lead", daysBeforeOffset: 28 },
    { title: "Brief volunteers on escalation contacts", category: "Volunteers", priority: "medium", owner: "Volunteer lead", daysBeforeOffset: 7 },
    { title: "Test microphones, projector and backups", category: "A/V", priority: "high", owner: "A/V vendor", daysBeforeOffset: 2 },
    { title: "Print signage, badges and schedules", category: "Outreach", priority: "medium", owner: "Design lead", daysBeforeOffset: 6 },
    { title: "Set up first-aid desk and ambulance contact", category: "Safety", priority: "high", owner: "Safety marshal", daysBeforeOffset: 3 },
    { title: "Mark emergency exits and assembly point", category: "Safety", priority: "high", owner: "Safety marshal", daysBeforeOffset: 1 },
    { title: "Confirm caterer headcount and serving times", category: "Catering", priority: "medium", owner: "Organizer", daysBeforeOffset: 4 },
    { title: "Prepare registration desk and check-in list", category: "Logistics", priority: "medium", owner: "Volunteer", daysBeforeOffset: 1 },
  ],
};

function buildCategories(brief: EventBrief): BudgetCategory[] {
  const templates = CATEGORY_TEMPLATES[brief.eventType];
  const categoryBudget = brief.budgetTotal * 0.92;
  return templates.map((template, index) => {
    const estimatedAmount = Math.round((categoryBudget * template.share) / 100) * 100;
    return {
      id: `bc_${index + 1}`,
      name: template.name,
      estimatedAmount,
      minAmount: Math.round(estimatedAmount * 0.9),
      maxAmount: Math.round(estimatedAmount * 1.15),
      percentage: Math.round(template.share * 100),
      note: template.note,
      actualAmount: 0,
    };
  });
}

function buildIdeas(brief: EventBrief): Idea[] {
  const tag = brief.styleTags[0] ?? "personalized";
  const titledTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  const base: Idea[] = [
    {
      id: "idea_1",
      title: `${titledTag} signature corner`,
      description: `A photo-worthy entrance styled around your "${tag}" preference, scaled for ${brief.guestCount} guests with a reusable backdrop and warm lighting.`,
      category: "theme",
      tags: [tag, "photo-spot"],
    },
    {
      id: "idea_2",
      title: "Memory wall with guest notes",
      description: "Guests pin handwritten wishes on themed cards; doubles as decor and a keepsake after the event.",
      category: "personal",
      tags: ["keepsake", "guests"],
    },
    {
      id: "idea_3",
      title: "Live dessert or activity counter",
      description: "An interactive station (live dessert prep, craft table or game host) matched to your guest profile and dietary notes.",
      category: "activity",
      tags: ["interactive", "crowd-favorite"],
    },
    {
      id: "idea_4",
      title: "Upcycled table decor",
      description: "Reusable fabric runners, potted plants and paper lighting that reduce waste and can be gifted or reused afterwards.",
      category: "decor",
      tags: ["eco-friendly", "reusable"],
    },
    {
      id: "idea_5",
      title: "Personalized digital invite sequence",
      description: "A three-touch sequence — save-the-date, reminder with agenda, and thank-you note — branded to your theme.",
      category: "personal",
      tags: ["digital", "communication"],
    },
    {
      id: "idea_6",
      title: "Quiet comfort zone",
      description: "A low-noise seating area with water and charging points, ideal for elderly guests, infants and anyone needing a break.",
      category: "theme",
      tags: ["comfort", "inclusive"],
    },
  ];
  return base;
}

const RISK_TIPS: Record<EventBrief["eventType"], string[]> = {
  wedding: [
    "Every vendor deposit should be receipted with a written cancellation policy.",
    "Keep 8% contingency reserve untouched until the final week of payments.",
    "Confirm weather backup for any open-air ceremony at least 14 days ahead.",
    "Share one printed run-of-show and emergency contact sheet with all vendors.",
  ],
  birthday: [
    "Collect allergy information with every RSVP, not just headcount.",
    "Confirm the entertainer's power and space needs before venue finalization.",
    "Have a quiet room available if younger guests get overwhelmed.",
    "Book the cake with a delivery slot 90 minutes before guest arrival.",
  ],
  community: [
    "Permits and safety paperwork must complete before any public announcement.",
    "Brief every volunteer on exits, first-aid location and escalation tree.",
    "Plan sound and crowd flow against venue capacity, not expected attendance.",
    "Run a vendor and marshal rehearsal at least one day before the event.",
  ],
};

/** Build the full deterministic demo plan for the supplied brief. */
export function buildDemoPlan(brief: EventBrief): EventPlan {
  const categories = buildCategories(brief);
  const contingencyAmount = Math.round(brief.budgetTotal * 0.08 / 100) * 100;
  const totalEstimated =
    categories.reduce((sum, category) => sum + category.estimatedAmount, 0) +
    contingencyAmount;

  const timeline: Milestone[] = MILESTONE_TEMPLATES[brief.eventType].map(
    (milestone, index) => ({ ...milestone, id: `ms_${index + 1}` }),
  );
  const checklist: ChecklistTask[] = CHECKLIST_TEMPLATES[brief.eventType].map(
    (task, index) => ({ ...task, id: `task_${index + 1}`, done: false }),
  );

  return {
    source: "demo",
    summary: `Demo plan for ${brief.guestCount} guests within a ${brief.currency} ${brief.budgetTotal.toLocaleString("en-IN")} budget. Add GEMINI_API_KEY to replace these deterministic estimates with live Gemini output.`,
    budget: { categories, contingencyAmount, totalEstimated },
    timeline,
    checklist,
    ideas: buildIdeas(brief),
    riskTips: RISK_TIPS[brief.eventType],
    generatedAt: new Date().toISOString(),
  };
}
