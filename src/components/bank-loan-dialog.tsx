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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Calculator,
  Coins,
  Landmark,
  Percent,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { calculateBankLoan } from "@/lib/bank-loan";
import { fcfa } from "@/lib/format";

interface BankLoanDialogProps {
  defaultBudget?: number;
}

export function BankLoanDialog({ defaultBudget = 25000000 }: BankLoanDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(defaultBudget);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(15);

  const loan = calculateBankLoan(amount, rate, years);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <Landmark className="h-4 w-4 text-emerald-600" />
          Crédit Immobilier UEMOA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Landmark className="h-5 w-5 text-emerald-600" />
              Simulateur de Prêt Immobilier Bancaire
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Taux BCEAO / UEMOA
            </Badge>
          </div>
          <DialogDescription>
            Estimez vos mensualités de remboursement auprès des banques au Bénin (BOA, Ecobank,
            Société Générale, BGFIBank).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[11px]">Montant emprunté (FCFA)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Taux d'intérêt annuel (%)</Label>
              <Select value={String(rate)} onValueChange={(v) => setRate(Number(v))}>
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7.5" className="text-xs">
                    7.5 % (Taux préférentiel)
                  </SelectItem>
                  <SelectItem value="8.5" className="text-xs">
                    8.5 % (Moyenne marché Bénin)
                  </SelectItem>
                  <SelectItem value="10" className="text-xs">
                    10.0 % (Crédit promoteur standard)
                  </SelectItem>
                  <SelectItem value="12" className="text-xs">
                    12.0 % (Prêt personnel)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Durée de remboursement</Label>
              <Select value={String(years)} onValueChange={(v) => setYears(Number(v))}>
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5" className="text-xs">
                    5 ans (60 mois)
                  </SelectItem>
                  <SelectItem value="10" className="text-xs">
                    10 ans (120 mois)
                  </SelectItem>
                  <SelectItem value="15" className="text-xs">
                    15 ans (180 mois)
                  </SelectItem>
                  <SelectItem value="20" className="text-xs">
                    20 ans (240 mois)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RÉSULTATS SIMULATION */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-end border-b pb-3">
                <div>
                  <span className="text-[11px] text-muted-foreground">
                    Mensualité estimée (assurance incluse)
                  </span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {fcfa(loan.monthlyPaymentFcfa)} / mois
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground">
                    Revenu net min. requis (33%)
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {fcfa(loan.minimumNetIncomeRequiredFcfa)} / mois
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Coût total des intérêts :</span>
                  <span className="font-semibold">{fcfa(loan.totalInterestFcfa)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Assurance emprunteur :</span>
                  <span className="font-semibold">{fcfa(loan.monthlyInsuranceFcfa)} / mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant total remboursé :</span>
                  <span className="font-bold text-primary">{fcfa(loan.totalCostFcfa)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre d'échéances :</span>
                  <span className="font-semibold">{loan.durationYears * 12} mensualités</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
