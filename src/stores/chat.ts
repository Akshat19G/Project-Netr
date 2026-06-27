import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UIMessage } from "ai";

type ChatState = {
  messages: UIMessage[];
  setMessages: (m: UIMessage[]) => void;
  clear: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      setMessages: (messages) => set({ messages }),
      clear: () => set({ messages: [] }),
    }),
    { name: "netr.chat.v1", storage: createJSONStorage(() => localStorage) },
  ),
);
