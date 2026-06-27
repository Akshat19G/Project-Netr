import type { UserProfile } from "@/lib/types";

export const CHAT_API = "/api/chat";

export type SuggestRequest = { profile: UserProfile };

/** Lightweight client-side follow-up generator — instant, deterministic. */
export async function suggestFollowUps(lastAssistantText: string): Promise<string[]> {
  if (!lastAssistantText) return [];
  const base: string[] = [];
  if (/scholarship/i.test(lastAssistantText)) base.push("How do I apply on the National Scholarship Portal?");
  if (/farmer|pm-?kisan|kcc/i.test(lastAssistantText)) base.push("What documents do farmers need for these schemes?");
  if (/startup|seed|incubator/i.test(lastAssistantText)) base.push("How do I get DPIIT recognition?");
  if (/loan|mudra|stand-up/i.test(lastAssistantText)) base.push("Which bank should I approach for this loan?");
  if (/woman|girl|sukanya|pragati/i.test(lastAssistantText)) base.push("What other women-focused programs exist?");
  if (base.length === 0) {
    base.push("Show me 3 programs I should apply to first.");
    base.push("What documents will I need overall?");
  }
  return base.slice(0, 3);
}
