import { plannerDocumentSchema, type PlannerDocument } from "@/lib/schemas";

/**
 * Typed localStorage persistence. All planner data stays in the browser —
 * nothing about a user's event is sent anywhere except explicit AI requests.
 */

const STORAGE_KEY = "eventcraft.document.v1";

export function loadDocument(): PlannerDocument | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return plannerDocumentSchema.parse(parsed);
  } catch {
    // Corrupt or outdated payloads must never crash the UI.
    return null;
  }
}

export function saveDocument(document: PlannerDocument): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
}

export function clearDocument(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Serialize a document for file export. */
export function documentToJson(document: PlannerDocument): string {
  return JSON.stringify(document, null, 2);
}

/** Parse and validate an imported backup file. */
export function documentFromJson(json: string): PlannerDocument {
  const parsed: unknown = JSON.parse(json);
  return plannerDocumentSchema.parse(parsed);
}
