import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type BookmarkState = {
  ids: string[];
  isBookmarked: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
};

export const useBookmarksStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      ids: [],
      isBookmarked: (id) => get().ids.includes(id),
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      clear: () => set({ ids: [] }),
    }),
    { name: "netr.bookmarks.v1", storage: createJSONStorage(() => localStorage) },
  ),
);
