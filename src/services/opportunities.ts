import { PROGRAMS } from "@/data/programs";
import type { Program, ProgramCategory, UserProfile } from "@/lib/types";
import { personaToGroups } from "@/stores/profile";

export type OpportunityQuery = {
  q?: string;
  category?: ProgramCategory | null;
  state?: string;
  targetGroup?: string;
  sort?: "relevance" | "alpha" | "newest";
};

/** Pure synchronous reads, ready to swap for fetch() later. */
export async function listAllOpportunities(): Promise<Program[]> {
  return PROGRAMS;
}

export async function getOpportunityById(id: string): Promise<Program | null> {
  return PROGRAMS.find((p) => p.id === id) ?? null;
}

export async function searchOpportunities(query: OpportunityQuery = {}): Promise<Program[]> {
  const q = (query.q ?? "").trim().toLowerCase();
  let list = PROGRAMS.slice();

  if (query.category) list = list.filter((p) => p.category === query.category);
  if (query.targetGroup) list = list.filter((p) => p.targetGroups.includes(query.targetGroup!));
  if (query.state) {
    list = list.filter((p) => p.states.length === 0 || p.states.includes(query.state!));
  }

  if (q) {
    list = list.filter((p) => {
      const haystack =
        `${p.title} ${p.ministry} ${p.description} ${p.benefits} ${p.tags.join(" ")} ${p.targetGroups.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  if (query.sort === "alpha") list.sort((a, b) => a.title.localeCompare(b.title));

  return list;
}

/** Score each program against a user's profile and return ranked matches. */
export async function findEligiblePrograms(profile: UserProfile, limit = 24): Promise<Program[]> {
  const groups = new Set(personaToGroups(profile.persona));
  const isStudent = groups.has("student");
  const isFarmer = groups.has("farmer");
  const isWoman = groups.has("woman");
  const isStartup = groups.has("startup");
  const isMsme = groups.has("msme");
  const isYouth = groups.has("youth");
  const isRural = groups.has("rural");
  const isSenior = groups.has("senior");

  const incomeBracket = (profile.income ?? "").toLowerCase();
  const lowIncome =
    incomeBracket.includes("below ₹1l") ||
    incomeBracket.includes("₹1l – ₹3l") ||
    incomeBracket.includes("₹3l – ₹6l");

  const ranked = PROGRAMS.map((p) => {
    let score = 0;
    for (const g of p.targetGroups) if (groups.has(g)) score += 6;

    if (isStudent && p.category === "scholarship") score += 8;
    if (isFarmer && p.category === "farmer") score += 8;
    if (isStartup && (p.category === "startup" || p.category === "employment")) score += 6;
    if (isMsme && (p.category === "startup" || p.category === "employment")) score += 5;
    if (isWoman && (p.category === "women" || p.category === "startup")) score += 5;
    if (isYouth && (p.category === "skill" || p.category === "employment")) score += 4;
    if (isSenior && (p.category === "insurance" || p.category === "healthcare")) score += 5;
    if (
      isRural &&
      (p.category === "employment" || p.category === "housing" || p.category === "welfare")
    )
      score += 3;

    if (profile.state && p.states.includes(profile.state)) score += 2;
    if (lowIncome && /(income|ews|bpl|poor|secc)/i.test(p.description)) score += 3;
    if (p.targetGroups.length === 0) score += 1;

    return { p, score };
  });

  ranked.sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title));
  return ranked.slice(0, limit).map((r) => r.p);
}
