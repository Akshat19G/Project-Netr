import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type RecentState = {
  searches: string[];
  push: (q: string) => void;
  clear: () => void;
};

export const useRecentSearchesStore = create<RecentState>()(
  persist(
    (set, get) => ({
      searches: [],
      push: (q) => {
        const trimmed = q.trim();
        if (!trimmed) return;
        const next = [trimmed, ...get().searches.filter((x) => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
        set({ searches: next });
      },
      clear: () => set({ searches: [] }),
    }),
    { name: "netr.recent.v1", storage: createJSONStorage(() => localStorage) },
  ),
);
