import type { ProgramCategory } from "@/lib/types";

/**
 * Maps an onboarding persona id to the ProgramCategory list that is
 * relevant for them. Everything outside this list is hidden by default,
 * but the user can opt into "Explore other categories" at any time.
 */
export const PERSONA_CATEGORIES: Record<string, ProgramCategory[]> = {
  student: ["scholarship", "skill", "employment"],
  farmer: ["farmer", "insurance", "welfare", "housing"],
  "job-seeker": ["employment", "skill", "startup"],
  "woman-entrepreneur": ["women", "startup", "employment", "skill"],
  "startup-founder": ["startup", "employment", "skill"],
  "small-business": ["startup", "employment", "insurance"],
  senior: ["healthcare", "insurance", "welfare", "housing"],
  other: [
    "scholarship",
    "startup",
    "farmer",
    "healthcare",
    "housing",
    "skill",
    "employment",
    "welfare",
    "women",
    "insurance",
  ],
};

export const ALL_CATEGORIES: ProgramCategory[] = [
  "scholarship",
  "startup",
  "farmer",
  "healthcare",
  "housing",
  "skill",
  "employment",
  "welfare",
  "women",
  "insurance",
];

export function categoriesForPersona(persona?: string): ProgramCategory[] {
  if (!persona) return ALL_CATEGORIES;
  return PERSONA_CATEGORIES[persona] ?? ALL_CATEGORIES;
}