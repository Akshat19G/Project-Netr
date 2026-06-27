import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "sonner";
import { ThemeInit } from "@/components/netr/ThemeInit";
import "@/i18n";
import { hasChosenLanguage } from "@/i18n";
import i18n from "@/i18n";

function NotFoundComponent() {
  const t = (k: string, fb: string) => (i18n.isInitialized ? (i18n.t(k) as string) : fb);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">{t("errors.pageNotFoundTitle", "404")}</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("errors.pageNotFoundHeading", "Page not found")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.pageNotFoundBody", "The page you're looking for doesn't exist or has been moved.")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("errors.goHome", "Go home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const t = (k: string, fb: string) => (i18n.isInitialized ? (i18n.t(k) as string) : fb);
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("errors.didntLoad", "This page didn't load")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.somethingWrong", "Something went wrong on our end. You can try refreshing or head back home.")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("errors.tryAgain", "Try again")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("errors.goHome", "Go home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Project Netr — Every Dream Deserves an Opportunity" },
      { name: "description", content: "An AI-powered opportunity discovery platform for scholarships, grants, schemes, healthcare, jobs, and welfare programs designed for people like you." },
      { name: "author", content: "Project Netr" },
      { property: "og:title", content: "Project Netr — Every Dream Deserves an Opportunity" },
      { property: "og:description", content: "Discover scholarships, grants, government schemes, and benefits designed for people like you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    if (!hasChosenLanguage() && path !== "/language") {
      router.navigate({ to: "/language" });
    }
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInit />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

