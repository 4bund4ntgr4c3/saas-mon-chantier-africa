import { Link } from "@tanstack/react-router";
import { ArrowLeft, Hammer } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Hammer className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">BâtiBénin</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-24 text-center">
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Erreur 404
        </div>
        <h1 className="mt-3 font-display text-8xl font-semibold tracking-tight">
          4<span className="text-primary">0</span>4
        </h1>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Chantier introuvable
        </h2>
        <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
          La page que vous cherchez n'existe pas, a été déplacée ou l'adresse est incorrecte.
          Vérifiez le lien ou revenez à l'accueil.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="size-4" /> Retour à l'accueil
          </Link>
          <Link
            to="/changelog"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Nouveautés
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Se connecter
          </Link>
        </div>
      </main>
    </div>
  );
}
