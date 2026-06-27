import { createFileRoute } from "@tanstack/react-router";
import type { DocAnalysis } from "@/lib/types";

type Body = { name: string; type: string; category?: string; dataUrl: string };

const SYSTEM_PROMPT = `You are Netr's document analyst for Indian citizens. You are given ONE document a user uploaded to a private local vault. Your job is to read it carefully and return a structured JSON analysis that helps them understand what they have and what they can do with it.

ONLY return a single JSON object. No prose, no markdown, no code fences. Use this exact shape:

{
  "summary": "1-3 sentences in plain English describing what this document is.",
  "detected": { "name": "...", "address": "...", "dob": "...", "id_number": "...", "income": "...", "issuer": "...", "category": "..." },
  "importantDates": [{ "label": "Issued on", "date": "YYYY-MM-DD" }],
  "keyDocuments": ["Other documents this one references"],
  "recommendations": ["Concrete next steps the user should take"],
  "suggestedOpportunities": ["Real Indian government scheme/scholarship names this document might unlock"],
  "missingDocuments": ["Documents the user may still need"],
  "confidence": 0.0
}

Rules:
- Omit fields in "detected" you genuinely cannot see; never invent values.
- Use Indian English. Keep entries short.
- "confidence" is a number 0-1 reflecting how certain you are about your reading.
- If the file is unreadable or not a real document, return summary: "Could not read this document confidently." and confidence: 0.`;

function dataUrlToInlinePart(dataUrl: string, fallbackMime: string) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { inline_data: { mime_type: match[1] || fallbackMime, data: match[2] } };
}

function buildParts(body: Body) {
  const text = `Document filename: ${body.name}\nUser-suggested category: ${body.category ?? "unknown"}\nReturn the JSON now.`;
  if (body.type.startsWith("image/")) {
    const part = dataUrlToInlinePart(body.dataUrl, body.type);
    if (!part) return null;
    return [{ text }, part];
  }
  if (body.type === "application/pdf" || body.name.toLowerCase().endsWith(".pdf")) {
    const part = dataUrlToInlinePart(body.dataUrl, "application/pdf");
    if (!part) return null;
    return [{ text }, part];
  }
  try {
    const base64 = body.dataUrl.split(",")[1] ?? "";
    const decoded = atob(base64).slice(0, 16000);
    return [{ text: `${text}\n\nFile contents:\n${decoded}` }];
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/analyze-document")({
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
        if (!body?.name || !body?.dataUrl) {
          return new Response(JSON.stringify({ error: "name and dataUrl are required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const parts = buildParts(body);
        if (!parts) {
          const unsupported: DocAnalysis = {
            status: "unsupported",
            updatedAt: Date.now(),
            summary: `Automatic analysis isn't available for this file type yet (${body.type || "unknown"}). You can still preview, rename and download it.`,
            confidence: 0,
          };
          return Response.json(unsupported);
        }

        try {
          const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [{ role: "user", parts }],
                generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
              }),
            },
          );

          if (!upstream.ok) {
            const errText = await upstream.text().catch(() => "");
            return new Response(
              JSON.stringify({ error: errText || `Gemini error (${upstream.status})` }),
              { status: upstream.status, headers: { "content-type": "application/json" } },
            );
          }
          const json = (await upstream.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const raw = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
          const cleaned = raw
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();
          let parsed: Partial<DocAnalysis> = {};
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            const m = cleaned.match(/\{[\s\S]*\}/);
            if (m) {
              try {
                parsed = JSON.parse(m[0]);
              } catch {
                /* ignore */
              }
            }
          }

          const out: DocAnalysis = {
            status: "ready",
            updatedAt: Date.now(),
            raw,
            summary: parsed.summary,
            detected: parsed.detected,
            importantDates: parsed.importantDates,
            keyDocuments: parsed.keyDocuments,
            recommendations: parsed.recommendations,
            suggestedOpportunities: parsed.suggestedOpportunities,
            missingDocuments: parsed.missingDocuments,
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : undefined,
          };
          return Response.json(out);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Analyze failed";
          console.error("Netr analyze error:", err);
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
