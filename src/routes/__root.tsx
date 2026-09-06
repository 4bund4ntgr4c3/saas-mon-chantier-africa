import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { PreferencesProvider } from "../context/preferences-context";
import { NotFoundPage } from "@/components/not-found";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
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
      { title: "BâtiBénin — Suivi de chantier en FCFA" },
      {
        name: "description",
        content:
          "La plateforme de pilotage technique et financier pour les entrepreneurs d'Afrique de l'Ouest. Gérez vos budgets, fournisseurs et dépenses en FCFA.",
      },
      { name: "author", content: "BâtiBénin" },
      { property: "og:title", content: "BâtiBénin — Suivi de chantier en FCFA" },
      {
        property: "og:description",
        content:
          "La plateforme de pilotage technique et financier pour les entrepreneurs d'Afrique de l'Ouest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@batibenin" },
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
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Fira+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.svg" },
      { name: "theme-color", content: "#0f766e" },
    ],
    scripts: [
      {
        children: `(function(){try{var t=localStorage.getItem("batibenin.theme");var dark;if(t==="light"||t==="dark"){dark=t==="dark";}else{dark=!window.matchMedia("(prefers-color-scheme: light)").matches;}document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`,
      },
      {
        children: `(function(){try{if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").catch(function(){})}}catch(e){}})();`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
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

  return (
    <PreferencesProvider>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster />
      </QueryClientProvider>
    </PreferencesProvider>
  );
}
