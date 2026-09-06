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
  BarChart3,
  CheckCircle2,
  DollarSign,
  LineChart,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  calculateDeveloperFeasibility,
  DeveloperFeasibilityInputs,
} from "@/lib/developer-feasibility";
import { fcfa } from "@/lib/format";

interface DeveloperFeasibilityDialogProps {
  defaultBudget?: number;
}

export function DeveloperFeasibilityDialog({
  defaultBudget = 50000000,
}: DeveloperFeasibilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<DeveloperFeasibilityInputs>({
    landCostFcfa: 20000000,
    studiesAndPermitsFcfa: 4500000,
    constructionCostFcfa: defaultBudget,
    contingencyPercent: 5,
    commercializationCostFcfa: 3000000,
    totalSalesRevenueFcfa: Math.round(defaultBudget * 1.8),
    durationMonths: 18,
  });

  const result = calculateDeveloperFeasibility(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-600/40 text-amber-700 hover:border-amber-600 font-medium"
        >
          <LineChart className="h-4 w-4 text-amber-600" />
          Bilan Financier Promoteur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <BarChart3 className="h-5 w-5 text-amber-600" />
              Étude de Faisabilité & Bilan Financier de l'Opération
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Promoteur / MOA
            </Badge>
          </div>
          <DialogDescription>
            Évaluez la rentabilité nette de votre projet, la marge dégagée et le seuil de
            rentabilité avant de lancer les travaux.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* PARAMÈTRES ENTRÉES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <Label className="text-[11px]">Achat du terrain (FCFA)</Label>
              <Input
                type="number"
                value={inputs.landCostFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, landCostFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Études & Permis (FCFA)</Label>
              <Input
                type="number"
                value={inputs.studiesAndPermitsFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, studiesAndPermitsFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Travaux BTP (FCFA)</Label>
              <Input
                type="number"
                value={inputs.constructionCostFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, constructionCostFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Imprévus / Aléas (%)</Label>
              <Input
                type="number"
                value={inputs.contingencyPercent}
                onChange={(e) =>
                  setInputs({ ...inputs, contingencyPercent: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Frais marketing / com. (FCFA)</Label>
              <Input
                type="number"
                value={inputs.commercializationCostFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, commercializationCostFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Ventes prévisionnelles (FCFA)</Label>
              <Input
                type="number"
                value={inputs.totalSalesRevenueFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, totalSalesRevenueFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1 font-bold text-amber-700 dark:text-amber-400"
              />
            </div>
          </div>

          {/* BILAN DE L'OPÉRATION */}
          <Card className="bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border-amber-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <span className="text-[11px] text-muted-foreground">Marge Nette Promoteur</span>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    {fcfa(result.grossMarginFcfa)}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[11px] text-muted-foreground">Taux de marge nette</span>
                  <Badge
                    variant={result.isFinanciallyViable ? "default" : "destructive"}
                    className="gap-1 mt-1 text-xs"
                  >
                    {result.isFinanciallyViable ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {result.netMarginPercent} % (ROI {result.returnOnInvestmentPercent} %)
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Prix de revient total :</span>
                  <span className="font-semibold text-foreground">
                    {fcfa(result.totalExpenditureFcfa)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Seuil de rentabilité (Point Mort) :</span>
                  <span className="font-semibold text-foreground">
                    {fcfa(result.breakEvenSalesRevenueFcfa)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chiffre d'affaires estimé :</span>
                  <span className="font-bold text-primary">
                    {fcfa(inputs.totalSalesRevenueFcfa)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut de viabilité :</span>
                  <span
                    className={`font-bold ${result.isFinanciallyViable ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {result.isFinanciallyViable
                      ? "Projet hautement viable ✅"
                      : "Marge insuffisante (< 12%) ⚠️"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
