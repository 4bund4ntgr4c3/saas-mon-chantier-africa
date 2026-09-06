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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Lightbulb, PiggyBank, Sparkles, SunMedium, Zap } from "lucide-react";
import { estimateMonthlyUtilityBills, UtilityBillsInputs } from "@/lib/utility-bills-estimator";
import { fcfa } from "@/lib/format";

export function UtilityBillsDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<UtilityBillsInputs>({
    acUnitsCount: 2,
    hasElectricWaterHeater: true,
    hasWaterBoreholePump: false,
    hasSolarHybridKit: false,
    householdMembersCount: 4,
  });

  const bills = estimateMonthlyUtilityBills(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-yellow-600/40 text-yellow-700 hover:border-yellow-600 font-medium"
        >
          <Zap className="h-4 w-4 text-yellow-600" />
          Factures SBEE / SONEB
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Zap className="h-5 w-5 text-yellow-600" />
              Simulateur de Factures Énergétiques Post-Emménagement
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-yellow-600" />
              Économies
            </Badge>
          </div>
          <DialogDescription>
            Estimez les charges mensuelles futures de votre maison (électricité SBEE, eau SONEB,
            climatiseurs et solaire).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* OPTIONS ÉLECTRICITÉ & EAU */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Nombre de climatiseurs (splits)</Label>
              <Input
                type="number"
                min={0}
                value={inputs.acUnitsCount}
                onChange={(e) =>
                  setInputs({ ...inputs, acUnitsCount: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Nombre d'habitants</Label>
              <Input
                type="number"
                min={1}
                value={inputs.householdMembersCount}
                onChange={(e) =>
                  setInputs({ ...inputs, householdMembersCount: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="space-y-2 border-y py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">Chauffe-eau électrique</p>
                <p className="text-[10px] text-muted-foreground">
                  Consommation continue ~12 000 FCFA/mois
                </p>
              </div>
              <Switch
                checked={inputs.hasElectricWaterHeater}
                onCheckedChange={(c) => setInputs({ ...inputs, hasElectricWaterHeater: c })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Forage privé avec pompe immergée
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Supprime la dépendance totale au réseau d'eau public SONEB
                </p>
              </div>
              <Switch
                checked={inputs.hasWaterBoreholePump}
                onCheckedChange={(c) => setInputs({ ...inputs, hasWaterBoreholePump: c })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Kit Solaire Hybride (Panneaux + Batteries)
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Réduit de ~65% la facture d'électricité SBEE
                </p>
              </div>
              <Switch
                checked={inputs.hasSolarHybridKit}
                onCheckedChange={(c) => setInputs({ ...inputs, hasSolarHybridKit: c })}
              />
            </div>
          </div>

          {/* RÉSULTAT MENSUEL */}
          <Card className="bg-gradient-to-br from-yellow-500/10 via-background to-yellow-500/5 border-yellow-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-end border-b pb-2">
                <div>
                  <span className="text-[10px] text-muted-foreground">
                    Facture globale mensuelle estimée
                  </span>
                  <div className="text-2xl font-black text-yellow-700 dark:text-yellow-400">
                    {fcfa(bills.totalMonthlyFcfa)} / mois
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground">Budget annuel</span>
                  <p className="text-sm font-bold text-foreground">
                    {fcfa(bills.annualTotalFcfa)} / an
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-600" />
                  <span>
                    Électricité SBEE : <strong>{fcfa(bills.sbeeElectricityFcfa)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    Eau SONEB : <strong>{fcfa(bills.sonebWaterFcfa)}</strong>
                  </span>
                </div>
              </div>

              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1">
                  <PiggyBank className="h-3.5 w-3.5" /> Économies avec le solaire :
                </span>
                <strong className="text-xs">{fcfa(bills.solarSavingsAnnualFcfa)} / an</strong>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
