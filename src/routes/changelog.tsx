import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Hammer } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatChangelogDate, parseChangelog } from "@/lib/changelog";
import changelogSource from "../../docs/CHANGELOG.md?raw";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Nouveautés — BâtiBénin" },
      {
        name: "description",
        content:
          "Le journal des évolutions de la plateforme BâtiBénin : fonctionnalités, correctifs et améliorations.",
      },
      { property: "og:title", content: "Nouveautés — BâtiBénin" },
      { property: "og:description", content: "Toutes les évolutions de BâtiBénin." },
    ],
  }),
  component: ChangelogPage,
});

const ENTRIES = parseChangelog(changelogSource);

const CONVENTIONS: Array<[icon: string, label: string]> = [
  ["✅", "Ajouté"],
  ["🔧", "Amélioré"],
  ["🐛", "Corrigé"],
  ["🗑️", "Supprimé"],
  ["⚠️", "À noter"],
];

/** Rendu inline minimaliste du markdown du changelog : `**gras**` et `code`. */
function renderInline(text: string, keyPrefix: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

function ChangelogPage() {
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
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Retour
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-14">
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Journal des évolutions — {ENTRIES.length} versions
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Nouveautés <span className="text-primary">BâtiBénin</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-muted-foreground">
          Tous les changements depuis la première version : fonctionnalités livrées, correctifs et
          améliorations, pour toujours savoir où en est la plateforme.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {CONVENTIONS.map(([icon, label]) => (
            <li key={label} className="flex items-center gap-1.5">
              <span aria-hidden>{icon}</span>
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-12 space-y-10">
          {ENTRIES.map((entry) => (
            <article
              key={entry.version}
              className="rounded-xl border border-border bg-card p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-lg">
                  {entry.icon}
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {entry.version} — {entry.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Publié le {formatChangelogDate(entry.date)}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                {entry.sections.map((section, si) => (
                  <div key={si} className="space-y-2.5">
                    {section.heading && (
                      <h3 className="pt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {section.heading.replace(/`/g, "")}
                      </h3>
                    )}
                    <ul className="space-y-2.5">
                      {section.items.map((item, ii) => (
                        <li
                          key={ii}
                          className={`flex items-start gap-2.5 text-sm leading-relaxed${
                            item.nested ? " pl-5" : ""
                          }`}
                        >
                          {item.icon ? (
                            <span className="mt-0.5 shrink-0" aria-hidden>
                              {item.icon}
                            </span>
                          ) : (
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                          <span
                            className={item.nested ? "text-muted-foreground" : "text-foreground/85"}
                          >
                            {renderInline(item.text, `${entry.version}-${si}-${ii}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
