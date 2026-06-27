import { createFileRoute } from "@tanstack/react-router";
import { Eye, Globe, Languages, Moon, Palette, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/netr/AppShell";
import { PageHeader } from "@/components/netr/PageHeader";
import { applyTheme, usePreferencesStore, type Theme } from "@/stores/preferences";
import { SUPPORTED_LANGUAGES, setLanguage, resetToBrowserLanguage, type LangCode } from "@/i18n";
import { useTranslation } from "react-i18next";
import { useProfileStore, profileSummary } from "@/stores/profile";
import { useBookmarksStore } from "@/stores/bookmarks";
import { useChatStore } from "@/stores/chat";
import { useRecentSearchesStore } from "@/stores/recent-searches";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Project Netr" },
      { name: "description", content: "Privacy, appearance, language and accessibility — all in one quiet place." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const reduceMotion = usePreferencesStore((s) => s.reduceMotion);
  const setReduceMotion = usePreferencesStore((s) => s.setReduceMotion);
  const profile = useProfileStore((s) => s.profile);
  const hasProfile = useProfileStore((s) => s.hasProfile);
  const clearProfile = useProfileStore((s) => s.clear);
  const clearBookmarks = useBookmarksStore((s) => s.clear);
  const clearChat = useChatStore((s) => s.clear);
  const clearRecent = useRecentSearchesStore((s) => s.clear);

  const onChooseTheme = (t: Theme) => { setTheme(t); applyTheme(t); };
  const onChooseLanguage = (code: LangCode) => {
    setLanguage(code);
    toast.success(t("toast.langUpdated", { native: SUPPORTED_LANGUAGES.find((l) => l.code === code)?.native ?? "" }));
  };

  const clearAll = () => {
    clearProfile();
    clearBookmarks();
    clearChat();
    clearRecent();
    toast.success(t("toast.clearedAll"));
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={<>{t("settings.titlePre")} <span className="netr-glow-text">{t("settings.titleHighlight")}</span></>}
        description={t("settings.description")}
      />

      {hasProfile && (
        <div className="netr-card mb-6 flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.yourProfile")}</p>
            <p className="mt-1 text-sm">{profileSummary(profile)}</p>
          </div>
          <button onClick={clearProfile} className="rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium hover:border-destructive/50 hover:text-destructive">
            {t("settings.resetProfile")}
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsGroup icon={Palette} title={t("settings.appearance.title")} description={t("settings.appearance.description")}>
          <div className="grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as const).map((th) => (
              <button
                key={th}
                onClick={() => onChooseTheme(th)}
                className={`rounded-2xl border px-3 py-3 text-sm font-medium ${theme === th ? "border-saffron bg-secondary" : "border-border/60 hover:border-saffron/40"}`}
              >
                {th === "dark" && <Moon className="mx-auto mb-1.5 h-4 w-4" />}
                {t(`settings.appearance.${th}`)}
              </button>
            ))}
          </div>
        </SettingsGroup>

        <SettingsGroup icon={Languages} title={t("settings.languageSection")} description={t("settings.languageDesc")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = (i18n.language || "en").slice(0, 2) === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onChooseLanguage(lang.code)}
                  lang={lang.code}
                  dir={lang.dir ?? "ltr"}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-saffron/50 ${
                    active ? "border-saffron bg-saffron/10" : "border-border/60 hover:border-saffron/40"
                  }`}
                >
                  <span aria-hidden>{lang.flag}</span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-medium">{lang.native}</span>
                    <span className="text-[10px] text-muted-foreground">{lang.english}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => { resetToBrowserLanguage(); toast.success(t("toast.resetBrowserLang")); }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {t("settings.autoDetect")}
          </button>
        </SettingsGroup>

        <SettingsGroup icon={Eye} title={t("settings.accessibility.title")} description={t("settings.accessibility.description")}>
          <Toggle label={t("settings.accessibility.reduceMotion")} sub={t("settings.accessibility.reduceMotionSub")} value={reduceMotion} onChange={setReduceMotion} />
        </SettingsGroup>

        <SettingsGroup icon={ShieldCheck} title={t("settings.privacy.title")} description={t("settings.privacy.description")}>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>· {t("settings.privacy.item1")}</li>
            <li>· {t("settings.privacy.item2")}</li>
            <li>· {t("settings.privacy.item3")}</li>
          </ul>
        </SettingsGroup>

        <SettingsGroup icon={Globe} title={t("settings.region.title")} description={t("settings.region.description")}>
          <p className="text-sm text-muted-foreground">{t("settings.region.body")}</p>
        </SettingsGroup>

        <SettingsGroup icon={Sparkles} title={t("settings.ai.title")} description={t("settings.ai.description")}>
          <p className="text-sm text-muted-foreground">{t("settings.ai.body")}</p>
        </SettingsGroup>
      </div>

      <div className="mt-10">
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-5 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15"
        >
          <Trash2 className="h-4 w-4" /> {t("settings.clearAll")}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">{t("settings.clearAllHint")}</p>
      </div>
    </AppShell>
  );
}

function SettingsGroup({ icon: Icon, title, description, children }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="netr-card p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-saffron/15 text-saffron"><Icon className="h-5 w-5" /></span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {sub && <span className="block text-xs text-muted-foreground">{sub}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-saffron" : "bg-secondary"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}