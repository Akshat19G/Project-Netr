import type { Program, ProgramCategory, UserProfile } from "@/lib/types";
import { findEligiblePrograms, searchOpportunities } from "./opportunities";

const SCHEME_CATS: ProgramCategory[] = [
  "farmer",
  "healthcare",
  "housing",
  "employment",
  "welfare",
  "insurance",
  "women",
];

export async function searchGovernmentSchemes(q = "", category?: ProgramCategory | null): Promise<Program[]> {
  if (category && SCHEME_CATS.includes(category)) return searchOpportunities({ q, category });
  const all = await searchOpportunities({ q });
  return all.filter((p) => SCHEME_CATS.includes(p.category));
}

export async function recommendSchemes(profile: UserProfile): Promise<Program[]> {
  const all = await findEligiblePrograms(profile, 40);
  return all.filter((p) => SCHEME_CATS.includes(p.category));
}

export { SCHEME_CATS };
