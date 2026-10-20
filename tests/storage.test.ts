import { describe, expect, it } from "vitest";
import {
  clearDocument,
  documentFromJson,
  documentToJson,
  loadDocument,
  saveDocument,
} from "@/lib/storage";
import { eventBriefSchema, type PlannerDocument } from "@/lib/schemas";
import { buildDemoPlan } from "@/lib/demo-plan";

function makeDocument(): PlannerDocument {
  const brief = eventBriefSchema.parse({
    eventType: "community",
    eventTitle: "Neighborhood sports day",
    eventDate: "2030-01-15",
    guestCount: 200,
    budgetTotal: 250_000,
    currency: "INR",
    locationTier: "town",
    styleTags: ["eco-friendly"],
  });
  return { brief, plan: buildDemoPlan(brief) };
}

describe("localStorage document persistence", () => {
  it("round-trips a valid document", () => {
    const document = makeDocument();
    saveDocument(document);
    expect(loadDocument()).toEqual(document);
  });

  it("returns null instead of throwing on corrupt data", () => {
    window.localStorage.setItem("eventcraft.document.v1", "{not-json");
    expect(loadDocument()).toBeNull();
  });

  it("clears the stored document", () => {
    saveDocument(makeDocument());
    clearDocument();
    expect(loadDocument()).toBeNull();
  });

  it("exports and re-imports identical JSON", () => {
    const document = makeDocument();
    const json = documentToJson(document);
    expect(documentFromJson(json)).toEqual(document);
  });
});
