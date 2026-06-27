import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";
import { programCatalogForPrompt } from "@/data/programs";
import type { UserProfile } from "@/lib/types";

type UIPart = { type: string; text?: string };
type UIMessage = { id?: string; role: "user" | "assistant" | "system"; parts: UIPart[] };

function profileSummary(p?: UserProfile): string {
  if (!p) return "No profile provided yet.";
  const bits: string[] = [];
  if (p.persona) bits.push(`Persona: ${p.persona}`);
  if (p.state) bits.push(`State: ${p.state}`);
  if (p.district) bits.push(`District: ${p.district}`);
  if (p.age) bits.push(`Age group: ${p.age}`);
  if (p.education) bits.push(`Education: ${p.education}`);
  if (p.income) bits.push(`Household income: ${p.income}`);
  if (p.occupation) bits.push(`Occupation: ${p.occupation}`);
  if (p.note) bits.push(`Notes: ${p.note}`);
  return bits.join(" · ") || "No profile provided yet.";
}

type Body = { messages?: unknown; profile?: UserProfile; language?: string };

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  gu: "Gujarati",
  pa: "Punjabi",
  bn: "Bengali",
  or: "Odia",
  ur: "Urdu",
};

function buildSystemPrompt(profile?: UserProfile, language?: string) {
  const langName = language && LANGUAGE_NAMES[language] ? LANGUAGE_NAMES[language] : "English";
  return `You are the Netr Assistant — a warm, plain-spoken AI guide that helps Indian citizens discover real government opportunities (scholarships, government schemes, grants, healthcare cover, employment programs, housing support, startup and MSME support).

LANGUAGE
Respond entirely in ${langName} (language code: ${language ?? "en"}). Keep program names, official URLs and acronyms in their original form (e.g. PM-KISAN, https://...). If the user writes in a different language, still reply in ${langName} unless they explicitly ask otherwise.

USER PROFILE
${profile ? profileSummary(profile) : "No profile provided yet — ask one or two short questions to learn about them before recommending."}

RULES
- Only recommend programs from the catalogue below. Use the exact program name. Never invent schemes.
- For each program you recommend, briefly state: who it's for, the headline benefit, key eligibility, and the OFFICIAL URL exactly as listed.
- If the user qualifies for several, suggest the 3 most relevant first, then offer to expand.
- Be honest if you're unsure of someone's eligibility — ask a follow-up question instead of guessing.
- Use clear Indian English. Short paragraphs. Bullet lists are fine. Use **bold** for program names. Use markdown links like [Apply](URL).
- Never ask the user to share Aadhaar, OTPs, passwords or bank details — Netr never collects those.
- If asked about something outside government schemes/benefits, gently bring the conversation back to opportunities.

CATALOGUE
${programCatalogForPrompt()}
`;
}

function uiMessagesToGeminiContents(messages: UIMessage[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: (m.parts || [])
            .filter((p) => p.type === "text" && typeof p.text === "string")
            .map((p) => p.text as string)
            .join(""),
        },
      ],
    }))
    .filter((c) => c.parts[0].text.length > 0);
}

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              error: "Server is missing GEMINI_API_KEY. Set it in your environment variables.",
            }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        if (!Array.isArray(body.messages)) {
          return new Response(JSON.stringify({ error: "messages are required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const ai = new GoogleGenAI({ apiKey });
          const contents = uiMessagesToGeminiContents(body.messages as UIMessage[]);
          const systemInstruction = buildSystemPrompt(body.profile, body.language);

          const stream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents,
            config: { systemInstruction },
          });

          const encoder = new TextEncoder();
          const textId = crypto.randomUUID();
          const messageId = crypto.randomUUID();

          const readable = new ReadableStream<Uint8Array>({
            async start(controller) {
              try {
                controller.enqueue(encoder.encode(sse({ type: "start", messageId })));
                controller.enqueue(encoder.encode(sse({ type: "start-step" })));
                controller.enqueue(encoder.encode(sse({ type: "text-start", id: textId })));
                for await (const chunk of stream) {
                  const delta = chunk.text;
                  if (delta) {
                    controller.enqueue(
                      encoder.encode(sse({ type: "text-delta", id: textId, delta })),
                    );
                  }
                }
                controller.enqueue(encoder.encode(sse({ type: "text-end", id: textId })));
                controller.enqueue(encoder.encode(sse({ type: "finish-step" })));
                controller.enqueue(encoder.encode(sse({ type: "finish" })));
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
              } catch (err) {
                const message = err instanceof Error ? err.message : "Stream failed";
                controller.enqueue(encoder.encode(sse({ type: "error", errorText: message })));
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              "content-type": "text/event-stream",
              "cache-control": "no-cache, no-transform",
              connection: "keep-alive",
              "x-vercel-ai-ui-message-stream": "v1",
            },
          });
        } catch (err) {
          console.error("Netr chat error:", err);
          const message = err instanceof Error ? err.message : "Unknown AI error";
          const status = /429/.test(message) ? 429 : 500;
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
