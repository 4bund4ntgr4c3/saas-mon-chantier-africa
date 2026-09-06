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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  CheckCircle2,
  Layers,
  Paintbrush,
  Palette,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  computeTotalFinishingBudget,
  getDefaultFinishingOptions,
  FinishingOption,
  FinishingTier,
} from "@/lib/finishings-comparator";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

export function FinishingsComparatorDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<FinishingOption[]>(getDefaultFinishingOptions);

  const totals = computeTotalFinishingBudget(options);

  const handleSelectTier = (optId: string, tier: FinishingTier) => {
    setOptions((opts) => opts.map((o) => (o.id === optId ? { ...o, selectedTier: tier } : o)));
  };

  const handleApplyToBudget = () => {
    toast.success(`Sélection de finitions enregistrée : ${fcfa(totals.totalEstimatedFcfa)}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-violet-600/40 text-violet-700 hover:border-violet-600 font-medium"
        >
          <Palette className="h-4 w-4 text-violet-600" />
          Arbitrage Finitions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Palette className="h-5 w-5 text-violet-600" />
              Comparateur & Arbitrage des Gammes de Finition
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-violet-600" />
              Choix Propriétaire
            </Badge>
          </div>
          <DialogDescription>
            Comparez le rapport qualité/prix des matériaux de second-œuvre (Éco, Standard ou Luxe)
            et ajustez vos finitions selon votre budget.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* TOTALISATEUR ESTIMÉ */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg border bg-muted/40 text-center">
              <span className="text-[10px] text-muted-foreground">Gamme Économique</span>
              <p className="font-bold text-xs text-foreground mt-0.5">
                {fcfa(totals.totalEcoFcfa)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg border bg-violet-500/10 border-violet-500/30 text-center">
              <span className="text-[10px] text-violet-800 dark:text-violet-300 font-semibold">
                Votre Sélection Actuelle
              </span>
              <p className="font-extrabold text-sm text-violet-700 dark:text-violet-300 mt-0.5">
                {fcfa(totals.totalEstimatedFcfa)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40 text-center">
              <span className="text-[10px] text-muted-foreground">Gamme Haut de Gamme / Luxe</span>
              <p className="font-bold text-xs text-foreground mt-0.5">
                {fcfa(totals.totalLuxeFcfa)}
              </p>
            </div>
          </div>

          {/* LISTE DES OPTIONS */}
          <div className="space-y-3">
            {options.map((opt) => (
              <Card key={opt.id} className="border">
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="font-bold text-xs text-foreground">{opt.categoryLabel}</span>
                    <span className="text-[11px] text-muted-foreground">
                      Quantité :{" "}
                      <strong>
                        {opt.surfaceOrQuantity} {opt.unit}
                      </strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(["eco", "standard", "luxe"] as FinishingTier[]).map((tier) => {
                      const item = opt.rates[tier];
                      const isSelected = opt.selectedTier === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => handleSelectTier(opt.id, tier)}
                          className={`p-2.5 rounded-md border text-left transition-all relative ${
                            isSelected
                              ? "bg-violet-500/10 border-violet-600 font-medium"
                              : "bg-card hover:bg-muted/40 border-border"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {tier === "eco"
                                ? "Éco"
                                : tier === "standard"
                                  ? "Standard"
                                  : "Haut de Gamme"}
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-violet-600" />}
                          </div>
                          <p className="text-xs font-semibold text-foreground mt-1 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[11px] font-bold text-violet-700 dark:text-violet-400 mt-0.5">
                            {fcfa(item.unitPriceFcfa)} /
                            {opt.unit === "portes"
                              ? "u"
                              : opt.unit === "salles de bain"
                                ? "sdb"
                                : "m²"}
                          </p>
                          <span className="text-[9px] text-muted-foreground mt-0.5 block">
                            Durabilité : ~{item.durabilityYears} ans
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button
              size="sm"
              onClick={handleApplyToBudget}
              className="gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valider mes choix de finition
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
