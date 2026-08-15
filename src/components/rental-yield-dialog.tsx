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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Coins, DollarSign, Percent, Sparkles, TrendingUp } from "lucide-react";
import { calculateRentalYield } from "@/lib/rental-yield";
import { fcfa } from "@/lib/format";

interface RentalYieldDialogProps {
  defaultBudget?: number;
}

export function RentalYieldDialog({ defaultBudget = 35000000 }: RentalYieldDialogProps) {
  const [open, setOpen] = useState(false);
  const [investmentCost, setInvestmentCost] = useState(defaultBudget);
  const [monthlyRent, setMonthlyRent] = useState(350000);

  const calc = calculateRentalYield(investmentCost, monthlyRent);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Simulateur Rentabilité Locative (ROI)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-emerald-800 dark:text-emerald-400">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Rentabilité Locative & Rendement ROI
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Diaspora & Investisseurs
            </Badge>
          </div>
          <DialogDescription>
            Simulez les revenus locatifs post-construction, le cash-flow net et la durée
            d'amortissement de votre investissement immobilier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Coût total construction + terrain (FCFA)</Label>
              <Input
                type="number"
                value={investmentCost}
                onChange={(e) => setInvestmentCost(Number(e.target.value) || 1)}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Loyer mensuel prévisionnel total (FCFA)</Label>
              <Input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          {/* INDICATEURS CLÉS */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-card p-3 rounded-lg border space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Rendement brut
              </p>
              <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                {calc.grossYieldPercent}%
              </p>
              <p className="text-[10px] text-muted-foreground">an</p>
            </div>
            <div className="bg-emerald-500/10 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/30 space-y-0.5">
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
                Rendement net
              </p>
              <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                {calc.netYieldPercent}%
              </p>
              <p className="text-[10px] text-muted-foreground">après charges & taxes</p>
            </div>
            <div className="bg-card p-3 rounded-lg border space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Amortissement
              </p>
              <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                {calc.paybackPeriodYears} ans
              </p>
              <p className="text-[10px] text-muted-foreground">Retour sur capital</p>
            </div>
          </div>

          {/* CASH-FLOW MENSUEL */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Cash-Flow net estimé dans votre poche
                  </span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {fcfa(calc.monthlyNetCashflowFcfa)} / mois
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Soit <strong>{fcfa(calc.annualNetIncomeFcfa)}</strong> de revenus nets par an.
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Revenus bruts annuels (hors vacance 5%) :</span>
                  <strong className="text-slate-800 dark:text-slate-100">
                    {fcfa(calc.annualGrossRentFcfa * 0.95)}
                  </strong>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Frais de gestion locative (10%) :</span>
                  <span>- {fcfa(calc.managementFeesFcfa)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Impôt & taxe foncière (5%) :</span>
                  <span>- {fcfa(calc.propertyTaxFcfa)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Provision entretien / travaux (5%) :</span>
                  <span>- {fcfa(calc.maintenanceProvisionFcfa)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
