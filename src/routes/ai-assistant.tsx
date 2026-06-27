import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Copy, RefreshCw, Square, Trash2, User } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/netr/AppShell";
import { Markdown } from "@/components/netr/Markdown";
import { useChatStore } from "@/stores/chat";
import { useProfileStore } from "@/stores/profile";
import { CHAT_API, suggestFollowUps } from "@/services/ai";
import { NetrBot } from "@/components/netr/NetrBot";
import { useTranslation } from "react-i18next";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/ai-assistant")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "AI Assistant · Project Netr" },
      {
        name: "description",
        content: "Ask anything about scholarships, schemes, eligibility and next steps.",
      },
    ],
  }),
  component: AssistantPage,
});

function messageText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : p.type === "reasoning" ? "" : ""))
    .join("");
}

function AssistantPage() {
  const search = Route.useSearch();
  const profile = useProfileStore((s) => s.profile);
  const storedMessages = useChatStore((s) => s.messages);
  const setStoredMessages = useChatStore((s) => s.setMessages);
  const clearStored = useChatStore((s) => s.clear);
  const { t, i18n } = useTranslation();
  const language = (i18n.language || "en").slice(0, 2);
  const suggestedQuestions: string[] = [
    "🎓 Find scholarships for me",
    "🚀 Startup grants",
    "🌾 Farmer schemes",
    "💼 Career opportunities",
    "❤️ Healthcare benefits",
  ];

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: CHAT_API,
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { messages, profile, language, ...(body ?? {}) },
        }),
      }),
  );

  const { messages, sendMessage, status, error, stop, regenerate, setMessages } = useChat({
    transport,
    messages: storedMessages,
    onError: (err) => {
      const msg = (err as Error).message ?? "Something went wrong.";
      const friendly = /429/.test(msg)
        ? t("ai.rateLimit")
        : /402/.test(msg)
          ? t("ai.credits")
          : msg;
      toast.error(friendly);
    },
  });

  // Persist on stream completion
  useEffect(() => {
    if (status === "ready" || status === "error") setStoredMessages(messages);
  }, [messages, status, setStoredMessages]);

  // Prefill from ?q=
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (search.q && messages.length === 0) {
      seededRef.current = true;
      void sendMessage({ text: search.q });
    }
  }, [search.q, messages.length, sendMessage]);

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (status === "ready") inputRef.current?.focus();
  }, [status]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const onSubmit = (text: string) => {
    const t = text.trim();
    if (!t || isBusy) return;
    setInput("");
    void sendMessage({ text: t });
  };

  const handleNewChat = () => {
    setMessages([]);
    clearStored();
    inputRef.current?.focus();
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const [followUps, setFollowUps] = useState<string[]>([]);
  useEffect(() => {
    if (!lastAssistant || status !== "ready") {
      setFollowUps([]);
      return;
    }
    void suggestFollowUps(messageText(lastAssistant)).then(setFollowUps);
  }, [lastAssistant, status]);

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-13rem)] max-w-3xl flex-col">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <NetrBot size={48} mode={isBusy ? "thinking" : "idle"} />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Project Netr Assistant
              </h1>
              <p className="text-sm font-medium text-foreground/80">
                Your Personal Opportunity Assistant
              </p>
              <p className="text-xs text-muted-foreground">
                Ask anything about scholarships, schemes, grants, careers or government benefits.
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t("ai.newConversation")}
            </button>
          )}
        </div>

        <div className="netr-card flex-1 overflow-hidden p-1">
          <div ref={scrollRef} className="h-full overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div className="max-w-md">
                  <div className="mx-auto grid h-36 w-36 place-items-center rounded-full bg-gradient-to-b from-sky/10 via-background to-saffron/10 shadow-inner">
                    <NetrBot size={128} mode="wave" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold">
                    Hello! I'm Netr AI 👋
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    I'm here to help you discover scholarships, government schemes, grants, jobs and
                    opportunities that match your profile.
                  </p>
                  <div className="mt-6 grid gap-2 text-left">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => onSubmit(q)}
                        className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm transition-colors hover:border-saffron/50 hover:bg-secondary"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((m) => {
                  const text = messageText(m);
                  const isUser = m.role === "user";
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                    >
                      {isUser ? (
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-background">
                          <User className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky/15 to-saffron/10 ring-1 ring-border/60">
                          <NetrBot size={28} mode="idle" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] text-sm leading-relaxed ${isUser ? "rounded-2xl rounded-tr-sm bg-foreground px-4 py-3 text-background" : "rounded-2xl rounded-tl-sm border border-border/60 bg-background/80 px-4 py-3 shadow-sm"}`}
                      >
                        {isUser ? text : <Markdown>{text}</Markdown>}
                        {!isUser && status === "ready" && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(text);
                                toast.success(t("toast.copied"));
                              }}
                              className="inline-flex items-center gap-1 hover:text-foreground"
                            >
                              <Copy className="h-3 w-3" /> {t("ai.copy")}
                            </button>
                            <button
                              onClick={() => regenerate()}
                              className="inline-flex items-center gap-1 hover:text-foreground"
                            >
                              <RefreshCw className="h-3 w-3" /> {t("ai.regenerate")}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {status === "submitted" && (
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky/15 to-saffron/10 ring-1 ring-border/60">
                      <NetrBot size={28} mode="thinking" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-background/80 px-4 py-3 text-xs text-muted-foreground shadow-sm">
                      Netr is thinking…
                    </div>
                  </div>
                )}
                {error && (
                  <div className="netr-card border-destructive/50 bg-destructive/10 p-4 text-xs text-destructive">
                    {error.message}.{" "}
                    <button onClick={() => regenerate()} className="underline">
                      {t("ai.retry")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {followUps.length > 0 && status === "ready" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {followUps.map((f) => (
              <button
                key={f}
                onClick={() => onSubmit(f)}
                className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs hover:border-saffron/50 hover:text-foreground"
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(input);
          }}
          className="netr-card mt-4 flex items-end gap-2 p-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(input);
              }
            }}
            rows={1}
            placeholder={t("ai.placeholder")}
            className="max-h-40 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
          />
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background transition-transform hover:scale-105 disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
    </AppShell>
  );
}
