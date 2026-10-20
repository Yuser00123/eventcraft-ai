import { GoogleGenAI, type Schema } from "@google/genai";

/**
 * Server-only Gemini client. The API key is read from server environment
 * variables and is never exposed to the browser bundle.
 */

let cachedClient: GoogleGenAI | null = null;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export function geminiModel(): string {
  return process.env.GEMINI_MODEL ?? "gemini-flash-latest";
}

interface JsonCallArgs {
  systemInstruction: string;
  prompt: string;
  responseSchema: Schema;
  temperature: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

/** Call Gemini in constrained JSON mode and parse the typed payload. */
export async function generateJson<T>({
  systemInstruction,
  prompt,
  responseSchema,
  temperature,
  maxOutputTokens,
  timeoutMs,
}: JsonCallArgs): Promise<T> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: geminiModel(),
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature,
      maxOutputTokens,
      abortSignal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
      systemInstruction,
    },
  });
  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return parseModelJson(text) as T;
}

/** Tolerant JSON parse: strip accidental markdown fences some models emit. */
function parseModelJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

interface TextCallArgs {
  systemInstruction: string;
  prompt: string;
  temperature?: number;
  timeoutMs?: number;
}

/** Free-text call used by the planning assistant chat. */
export async function generateText({
  systemInstruction,
  prompt,
  temperature = 0.5,
  timeoutMs,
}: TextCallArgs): Promise<string> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: geminiModel(),
    contents: prompt,
    config: {
      temperature,
      abortSignal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
      systemInstruction,
    },
  });
  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}
