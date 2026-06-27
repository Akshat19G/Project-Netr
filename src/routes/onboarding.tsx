import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sprout } from "lucide-react";
import { personas } from "@/lib/netr-data";
import { useProfileStore } from "@/stores/profile";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding · Project Netr" },
      {
        name: "description",
        content:
          "Tell us a little about yourself so Project Netr can surface opportunities designed for you.",
      },
    ],
  }),
  component: Onboarding,
});

const TOTAL_STEPS = 6;

function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const setProfile = useProfileStore((s) => s.setProfile);

  const states = t("onboarding.states", { returnObjects: true }) as string[];
  const ageGroups = t("onboarding.ageGroups", { returnObjects: true }) as string[];
  const education = t("onboarding.education", { returnObjects: true }) as string[];
  const income = t("onboarding.income", { returnObjects: true }) as string[];

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));
  const finish = () => {
    setProfile({
      persona: data.persona,
      state: data.state,
      district: data.district,
      age: data.age,
      education: data.education,
      income: data.income,
      note: data.note,
    });
    toast.success(t("toast.profileReady"));
    navigate({ to: "/dashboard" });
  };
  const next = () => (step === TOTAL_STEPS - 1 ? finish() : setStep((s) => s + 1));
  const back = () => (step === 0 ? navigate({ to: "/" }) : setStep((s) => s - 1));
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen netr-hero-bg">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-saffron to-saffron-glow text-primary-foreground">
            <Sprout className="h-4 w-4" />
          </span>
          <span className="font-display font-bold">{t("brand.name")}</span>
        </Link>
        <span className="text-xs text-muted-foreground">
          {t("onboarding.stepCounter", { step: step + 1, total: TOTAL_STEPS })}
        </span>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-saffron to-saffron-glow"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-10 pb-24"
          >
            {step === 0 && (
              <StepLayout title={t("onboarding.s1.title")} hint={t("onboarding.s1.hint")}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {personas.map((p) => {
                    const Icon = p.icon;
                    const active = data.persona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => set("persona", p.id)}
                        className={`netr-card netr-card-hover group relative overflow-hidden p-5 text-left ${active ? "ring-2 ring-saffron" : ""}`}
                      >
                        <div
                          className={`absolute inset-0 -z-10 bg-gradient-to-br ${p.accent} opacity-60`}
                        />
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-background/80">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-4 font-semibold">{t(`personas.${p.id}.title`)}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {t(`personas.${p.id}.description`)}
                        </p>
                        {active && (
                          <Check className="absolute right-3 top-3 h-4 w-4 text-saffron" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepLayout>
            )}

            {step === 1 && (
              <StepLayout title={t("onboarding.s2.title")} hint={t("onboarding.s2.hint")}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="netr-card p-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("onboarding.s2.stateLabel")}
                    </span>
                    <select
                      value={data.state ?? ""}
                      onChange={(e) => set("state", e.target.value)}
                      className="mt-2 w-full bg-transparent text-base font-medium outline-none"
                    >
                      <option value="">{t("onboarding.s2.selectState")}</option>
                      {states.map((s) => (
                        <option key={s} className="bg-background">
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="netr-card p-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("onboarding.s2.districtLabel")}
                    </span>
                    <input
                      value={data.district ?? ""}
                      onChange={(e) => set("district", e.target.value)}
                      placeholder={t("onboarding.s2.districtPlaceholder")}
                      className="mt-2 w-full bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground/60"
                    />
                  </label>
                </div>
              </StepLayout>
            )}

            {step === 2 && (
              <ChoiceStep
                title={t("onboarding.s3.title")}
                hint={t("onboarding.s3.hint")}
                options={ageGroups}
                value={data.age}
                onChange={(v) => set("age", v)}
              />
            )}
            {step === 3 && (
              <ChoiceStep
                title={t("onboarding.s4.title")}
                hint={t("onboarding.s4.hint")}
                options={education}
                value={data.education}
                onChange={(v) => set("education", v)}
              />
            )}
            {step === 4 && (
              <ChoiceStep
                title={t("onboarding.s5.title")}
                hint={t("onboarding.s5.hint")}
                options={income}
                value={data.income}
                onChange={(v) => set("income", v)}
              />
            )}

            {step === 5 && (
              <StepLayout title={t("onboarding.s6.title")} hint={t("onboarding.s6.hint")}>
                <textarea
                  value={data.note ?? ""}
                  onChange={(e) => set("note", e.target.value)}
                  rows={6}
                  placeholder={t("onboarding.s6.placeholder")}
                  className="netr-card w-full resize-none bg-transparent p-5 text-base leading-relaxed outline-none placeholder:text-muted-foreground/60"
                />
              </StepLayout>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <button
              onClick={back}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {t("onboarding.back")}
            </button>
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              {step === TOTAL_STEPS - 1 ? t("onboarding.discover") : t("onboarding.continue")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepLayout({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {hint && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{hint}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function ChoiceStep({
  title,
  hint,
  options,
  value,
  onChange,
}: {
  title: string;
  hint?: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <StepLayout title={title} hint={hint}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={`netr-card netr-card-hover flex items-center justify-between p-4 text-left text-sm font-medium ${active ? "ring-2 ring-saffron" : ""}`}
            >
              {o}
              {active && <Check className="h-4 w-4 text-saffron" />}
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}
