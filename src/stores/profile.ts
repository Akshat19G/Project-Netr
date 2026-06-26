import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserProfile } from "@/lib/types";

type ProfileState = {
  profile: UserProfile;
  hasProfile: boolean;
  setProfile: (next: UserProfile) => void;
  patch: (next: Partial<UserProfile>) => void;
  clear: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: {},
      hasProfile: false,
      setProfile: (next) => set({ profile: { ...next, updatedAt: Date.now() }, hasProfile: true }),
      patch: (next) => set({ profile: { ...get().profile, ...next, updatedAt: Date.now() }, hasProfile: true }),
      clear: () => set({ profile: {}, hasProfile: false }),
    }),
    { name: "netr.profile.v1", storage: createJSONStorage(() => localStorage) },
  ),
);

export function profileSummary(p: UserProfile): string {
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

/** Map onboarding persona -> targetGroup tags used by the catalogue. */
export function personaToGroups(persona?: string): string[] {
  if (!persona) return [];
  const map: Record<string, string[]> = {
    student: ["student", "youth"],
    farmer: ["farmer", "rural"],
    "job-seeker": ["youth"],
    "woman-entrepreneur": ["woman", "msme", "startup"],
    "startup-founder": ["startup", "youth"],
    "small-business": ["msme"],
    senior: ["senior", "family"],
    other: [],
  };
  return map[persona] ?? [];
}