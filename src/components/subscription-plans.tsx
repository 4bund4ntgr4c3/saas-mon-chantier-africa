import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Crown, Sparkles, Store, Zap } from "lucide-react";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

export interface PlanTier {
  id: "gratuit" | "pro" | "quincaillerie_premium";
  name: string;
  pricePerMonth: number;
  badge?: string;
  features: string[];
  popular?: boolean;
  ctaLabel: string;
}

export const SUBSCRIPTION_PLANS: PlanTier[] = [
  {
    id: "gratuit",
    name: "Gratuit / Particulier",
    pricePerMonth: 0,
    features: [
      "1 chantier actif",
      "Suivi budgétaire prévu vs réel",
      "Comparateur de prix & marketplace",
      "Accès aux prestataires vérifiés",
    ],
    ctaLabel: "Formule active",
  },
  {
    id: "pro",
    name: "Pro Maître d'œuvre",
    pricePerMonth: 15000,
    popular: true,
    badge: "Recommandé Pros",
    features: [
      "Chantiers illimités",
      "Séquestre BTP & déblocage jalons",
      "Export Dossiers Banque & Diaspora PDF",
      "Calculateur de métré illimité",
      "Pointage équipe & paie journalière",
      "Plans 2D interactifs & pins",
    ],
    ctaLabel: "Passer en Pro (Mobile Money)",
  },
  {
    id: "quincaillerie_premium",
    name: "Quincaillerie Premium",
    pricePerMonth: 25000,
    badge: "Pour Vendeurs",
    features: [
      "Mise en avant sponsorisée sur la carte",
      "Badge « Vendeur Agréé BâtiBénin »",
      "Commission réduite sur les commandes (2%)",
      "Prévisions de stock IA",
      "Multi-dépôts & livraisons géolocalisées",
    ],
    ctaLabel: "Booster ma Boutique",
  },
];

export function SubscriptionPlansDialog() {
  const [open, setOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("gratuit");

  const handleSubscribe = (plan: PlanTier) => {
    if (plan.id === "gratuit") return;
    setCurrentPlan(plan.id);
    toast.success(
      `Abonnement ${plan.name} activé par Mobile Money (${fcfa(plan.pricePerMonth)}/mois) !`,
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:border-amber-500"
        >
          <Crown className="h-4 w-4 text-amber-500" />
          Forfaits & Abonnements
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Crown className="h-5 w-5 text-amber-500" />
                Forfaits & Abonnements BâtiBénin
              </DialogTitle>
              <DialogDescription>
                Débloquez les outils avancés pour accélérer la gestion de vos chantiers et booster
                vos ventes.
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="gap-1 text-xs">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Paiement Mobile Money
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 pt-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between border transition-all ${
                  plan.popular
                    ? "border-primary shadow-lg ring-1 ring-primary bg-primary/5"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-2.5 right-4 text-[10px] bg-primary text-primary-foreground font-bold">
                    {plan.badge}
                  </Badge>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-1.5">
                    {plan.id === "pro" ? (
                      <Zap className="h-4 w-4 text-primary" />
                    ) : plan.id === "quincaillerie_premium" ? (
                      <Store className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-slate-500" />
                    )}
                    <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-foreground">
                      {plan.pricePerMonth === 0 ? "Gratuit" : fcfa(plan.pricePerMonth)}
                    </span>
                    {plan.pricePerMonth > 0 && (
                      <span className="text-xs text-muted-foreground"> / mois</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : plan.popular ? "default" : "secondary"}
                    className="w-full text-xs font-semibold"
                    disabled={isCurrent}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isCurrent ? "✓ Formule active" : plan.ctaLabel}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
