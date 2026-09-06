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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Building2,
  Coins,
  DollarSign,
  Hotel,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { compareRentalStrategies, RentalStrategyInputs } from "@/lib/rental-cashflow";
import { fcfa } from "@/lib/format";

interface RentalCashflowDialogProps {
  defaultBudget?: number;
}

export function RentalCashflowDialog({ defaultBudget = 40000000 }: RentalCashflowDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<RentalStrategyInputs>({
    propertyAcquisitionCostFcfa: defaultBudget,
    unfurnishedMonthlyRentFcfa: 250000,
    furnishedNightlyRateFcfa: 35000,
    furnishedOccupancyRatePercent: 60,
  });

  const comparison = compareRentalStrategies(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-indigo-600/40 text-indigo-700 hover:border-indigo-600 font-medium"
        >
          <Coins className="h-4 w-4 text-indigo-600" />
          Rentabilité Meublé vs Nu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Coins className="h-5 w-5 text-indigo-600" />
              Arbitrage Bailleur : Location Nue vs Courte Durée (Airbnb)
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Cash-Flow
            </Badge>
          </div>
          <DialogDescription>
            Simulez vos revenus locatifs nets et choisissez la meilleure stratégie de monétisation
            pour votre villa ou appartement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* PARAMÈTRES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <Label className="text-[10px]">Coût d'acquisition / Chantier</Label>
              <Input
                type="number"
                step={1000000}
                value={inputs.propertyAcquisitionCostFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, propertyAcquisitionCostFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px]">Loyer nu mensuel estimé</Label>
              <Input
                type="number"
                step={25000}
                value={inputs.unfurnishedMonthlyRentFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, unfurnishedMonthlyRentFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px]">Tarif meublé / nuitée</Label>
              <Input
                type="number"
                step={5000}
                value={inputs.furnishedNightlyRateFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, furnishedNightlyRateFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px]">Taux d'occupation meublé (%)</Label>
              <Input
                type="number"
                min={10}
                max={100}
                value={inputs.furnishedOccupancyRatePercent}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    furnishedOccupancyRatePercent: Number(e.target.value) || 0,
                  })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          {/* COMPARAISON DES DEUX STRATÉGIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* OPTION 1 : LOCATION NUE */}
            <Card
              className={`border ${comparison.recommendedStrategy === "nu" ? "border-indigo-600 bg-indigo-500/5" : ""}`}
            >
              <CardContent className="p-3.5 space-y-2">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-600" />
                    <span className="font-bold text-xs">Location Nue Classique</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    Longue Durée
                  </Badge>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Cash-Flow Net Mensuel</span>
                  <p className="text-base font-black text-foreground">
                    {fcfa(comparison.unfurnished.netMonthlyCashflowFcfa)} / mois
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-1 border-t">
                  <div>
                    Rendement net :{" "}
                    <strong className="text-foreground">
                      {comparison.unfurnished.netYieldPercent} %
                    </strong>
                  </div>
                  <div>
                    Revenu net/an :{" "}
                    <strong className="text-foreground">
                      {fcfa(comparison.unfurnished.netAnnualFcfa)}
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OPTION 2 : LOCATION MEUBLÉE */}
            <Card
              className={`border ${comparison.recommendedStrategy === "meuble" ? "border-indigo-600 bg-indigo-500/5" : ""}`}
            >
              <CardContent className="p-3.5 space-y-2">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Hotel className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-xs">Location Meublée (Airbnb)</span>
                  </div>
                  <Badge variant="default" className="text-[9px] bg-indigo-600 text-white">
                    Saisonnier
                  </Badge>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Cash-Flow Net Mensuel</span>
                  <p className="text-base font-black text-indigo-700 dark:text-indigo-400">
                    {fcfa(comparison.furnished.netMonthlyCashflowFcfa)} / mois
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-1 border-t">
                  <div>
                    Rendement net :{" "}
                    <strong className="text-foreground">
                      {comparison.furnished.netYieldPercent} %
                    </strong>
                  </div>
                  <div>
                    Revenu net/an :{" "}
                    <strong className="text-foreground">
                      {fcfa(comparison.furnished.netAnnualFcfa)}
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* VERDICT DE RECOMMANDATION */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 flex items-center justify-between text-xs font-medium">
            <span>
              Stratégie la plus rentable :{" "}
              <strong>
                {comparison.recommendedStrategy === "meuble"
                  ? "Location Meublée Saisonnnière"
                  : "Location Nue"}
              </strong>
            </span>
            <strong className="text-sm">+{fcfa(comparison.advantageFcfaAnnual)} / an</strong>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
