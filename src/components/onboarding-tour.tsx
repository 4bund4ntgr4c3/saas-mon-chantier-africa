import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Gauge, Receipt, Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "batibenin.onboarding.done";

const STEPS = [
  {
    icon: Sparkles,
    title: "Bienvenue sur BâtiBénin",
    description:
      "Un chantier de démonstration est déjà chargé : budget, factures et paiements réels vous attendent. Suivez ce court guide pour savoir où tout se trouve.",
    to: null,
    cta: "Commencer la visite",
  },
  {
    icon: Gauge,
    title: "1. Le tableau de bord",
    description:
      "Vue d'ensemble de votre chantier : budget prévu, dépensé, restant et alertes de dépassement. Changez de chantier avec le sélecteur en haut de page.",
    to: "/tableau-de-bord",
    cta: "Voir les factures",
  },
  {
    icon: Receipt,
    title: "2. Les dépenses et factures",
    description:
      "Enregistrez chaque facture avec son fournisseur, son poste de budget et son montant en FCFA. Les totaux remontent automatiquement au budget.",
    to: "/depenses",
    cta: "Voir les paiements",
  },
  {
    icon: Wallet,
    title: "3. Les paiements",
    description:
      "Suivez ce qui a été réellement payé (Mobile Money, espèces, virement) et repérez d'un coup d'œil le solde restant dû à chaque entreprise.",
    to: "/paiements",
    cta: "Terminer",
  },
] as const;

export function OnboardingTour() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
  }, []);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  function next() {
    const upcoming = STEPS[step + 1];
    if (!upcoming) {
      finish();
      return;
    }
    if (upcoming.to) navigate({ to: upcoming.to });
    setStep(step + 1);
  }

  const current = STEPS[step]!;
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : finish())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-2 grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Icon className="size-5" />
          </span>
          <DialogTitle className="font-display text-left text-lg">{current.title}</DialogTitle>
          <DialogDescription className="text-left">{current.description}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex items-center justify-between gap-3">
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
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={finish}>
              Passer
            </Button>
            <Button size="sm" onClick={next}>
              {current.cta}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
