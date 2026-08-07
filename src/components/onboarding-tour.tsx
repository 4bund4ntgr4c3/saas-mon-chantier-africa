import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FilePlus2,
  Gauge,
  Receipt,
  Sparkles,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuestMode } from "@/lib/guest-mode";

const STORAGE_KEY = "batibenin.onboarding.done";
const RESTART_EVENT = "batibenin:restart-tour";

/** Relance la visite guidée depuis n'importe où (bandeau invité, réglages…). */
export function restartTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(RESTART_EVENT));
}

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
  to?: string;
  /** Élément de la page à mettre en évidence (attribut data-tour). */
  highlight?: string;
  cta: string;
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Bienvenue sur BâtiBénin",
    description:
      "Un chantier de démonstration complet est déjà chargé : budget, factures, devis et paiements. Cette visite vous montre le circuit complet d'un franc dépensé, du tableau de bord au paiement.",
    bullets: [
      "5 étapes, moins de deux minutes",
      "Vous pouvez cliquer dans la page pendant la visite",
    ],
    cta: "Commencer la visite",
  },
  {
    icon: Gauge,
    title: "Le tableau de bord",
    description:
      "Votre chantier en un coup d'œil. Les quatre compteurs du haut résument l'essentiel et se recalculent à chaque nouvelle dépense.",
    bullets: [
      "Budget global : l'enveloppe prévue pour la construction",
      "Dépenses totales et budget restant, en FCFA",
      "Coût au m² construit, pour comparer vos chantiers",
      "Le sélecteur « Chantier » en haut change de projet",
    ],
    to: "/tableau-de-bord",
    highlight: "kpis",
    cta: "Suivant",
  },
  {
    icon: Receipt,
    title: "Les dépenses et factures",
    description:
      "Chaque sortie d'argent est une ligne de dépense rattachée à un poste de budget. La liste est filtrable par catégorie et cherchable par libellé ou numéro de facture.",
    bullets: [
      "Colonnes : date, libellé, catégorie, fournisseur, montant",
      "Le total affiché suit vos filtres en direct",
      "Les montants remontent automatiquement dans le budget",
    ],
    to: "/depenses",
    highlight: "expense-table",
    cta: "Créer une facture",
  },
  {
    icon: FilePlus2,
    title: "Enregistrer une nouvelle facture",
    description:
      "Le bouton « Ajouter une dépense » ouvre le formulaire de saisie d'une facture. Essayez-le : en mode démo, la ligne apparaît immédiatement dans la liste.",
    bullets: [
      "Libellé, montant en FCFA et date : les champs obligatoires",
      "Catégorie : le poste de budget qui sera débité",
      "Fournisseur ou entreprise : qui a été facturé",
      "Quantité et prix unitaire pour les achats de matériaux",
      "N° de facture / reçu pour retrouver la pièce justificative",
    ],
    to: "/depenses",
    highlight: "expense-new",
    cta: "Voir les paiements",
  },
  {
    icon: Wallet,
    title: "Les paiements",
    description:
      "Une facture peut être réglée en plusieurs fois. Les paiements enregistrent l'argent réellement sorti et se rattachent à une dépense, un fournisseur ou une entreprise.",
    bullets: [
      "Type : comptant, acompte, paiement partiel ou solde",
      "Moyen : espèces, MTN MoMo, Moov Money, virement, chèque",
      "Comparez le total payé au total facturé pour voir le reste à payer",
    ],
    to: "/paiements",
    highlight: "payment-new",
    cta: "Terminer la visite",
  },
];

export function OnboardingTour() {
  const navigate = useNavigate();
  const guest = useGuestMode();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
    const onRestart = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(RESTART_EVENT, onRestart);
    return () => window.removeEventListener(RESTART_EVENT, onRestart);
  }, []);

  const current = STEPS[step]!;

  // Met en évidence l'élément ciblé par l'étape en cours.
  useEffect(() => {
    if (!open || !current.highlight) return;
    let el: HTMLElement | null = null;
    const timer = window.setTimeout(() => {
      el = document.querySelector<HTMLElement>(`[data-tour="${current.highlight}"]`);
      if (!el) return;
      el.classList.add("tour-highlight");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 220);
    return () => {
      window.clearTimeout(timer);
      el?.classList.remove("tour-highlight");
      document
        .querySelectorAll<HTMLElement>(".tour-highlight")
        .forEach((n) => n.classList.remove("tour-highlight"));
    };
  }, [open, step, current.highlight]);

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }, []);

  function go(index: number) {
    const target = STEPS[index];
    if (!target) {
      finish();
      return;
    }
    if (target.to) navigate({ to: target.to });
    setStep(index);
  }

  if (!open) return null;

  const Icon = current.icon;
  const last = step === STEPS.length - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:justify-end sm:p-6">
      <div className="panel pointer-events-auto w-full max-w-md border-primary/40 p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {guest ? "Aperçu invité · " : ""}Étape {step + 1} / {STEPS.length}
            </p>
            <h2 className="font-display text-lg font-semibold leading-tight">{current.title}</h2>
          </div>
          <button
            type="button"
            aria-label="Fermer la visite"
            onClick={finish}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{current.description}</p>

        {current.bullets && (
          <ul className="mt-3 space-y-1.5">
            {current.bullets.map((b) => (
              <li key={b} className="flex gap-2 text-sm text-foreground/90">
                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={
                  i === step
                    ? "h-1.5 w-6 rounded-full bg-primary"
                    : "h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => go(step - 1)}>
                <ArrowLeft className="size-4" /> Précédent
              </Button>
            )}
            {!last && (
              <Button variant="ghost" size="sm" onClick={finish}>
                Passer
              </Button>
            )}
            <Button size="sm" onClick={() => go(step + 1)}>
              {current.cta} {last ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
