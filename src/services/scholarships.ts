import type { Program, UserProfile } from "@/lib/types";
import { findEligiblePrograms, searchOpportunities } from "./opportunities";

export async function searchScholarships(q = ""): Promise<Program[]> {
  return searchOpportunities({ q, category: "scholarship" });
}

export async function recommendScholarships(profile: UserProfile): Promise<Program[]> {
  const all = await findEligiblePrograms({ ...profile, persona: profile.persona ?? "student" }, 40);
  return all.filter((p) => p.category === "scholarship");
}