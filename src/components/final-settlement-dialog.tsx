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
import { Calendar, CheckCircle2, DollarSign, FileCheck, Lock, Sparkles } from "lucide-react";
import { calculateFinalSettlement, FinalSettlementInputs } from "@/lib/final-settlement";
import { fcfa } from "@/lib/format";

interface FinalSettlementDialogProps {
  initialBudget?: number;
}

export function FinalSettlementDialog({ initialBudget = 40000000 }: FinalSettlementDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<FinalSettlementInputs>({
    initialContractAmountFcfa: initialBudget,
    approvedAmendmentsFcfa: 2500000,
    totalPaymentsAlreadyMadeFcfa: 36000000,
    liquidatedDamagesPenaltiesFcfa: 0,
    retentionRatePercent: 5,
    provisionalAcceptanceDate: new Date().toISOString().slice(0, 10),
  });

  const res = calculateFinalSettlement(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <FileCheck className="h-4 w-4 text-emerald-600" />
          Décompte Définitif (DGD)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              Décompte Général Définitif & Retenue de Garantie (5%)
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Comptabilité BTP
            </Badge>
          </div>
          <DialogDescription>
            Clôturez les comptes du marché, déduisez les acomptes versés et fixez l'échéance de
            libération de la garantie.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* MONTANTS DU MARCHÉ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Montant initial du marché (FCFA)</Label>
              <Input
                type="number"
                step={500000}
                value={inputs.initialContractAmountFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, initialContractAmountFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Total des avenants validés (FCFA)</Label>
              <Input
                type="number"
                step={100000}
                value={inputs.approvedAmendmentsFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, approvedAmendmentsFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Acomptes déjà payés (FCFA)</Label>
              <Input
                type="number"
                step={500000}
                value={inputs.totalPaymentsAlreadyMadeFcfa}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    totalPaymentsAlreadyMadeFcfa: Number(e.target.value) || 0,
                  })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Pénalités de retard (FCFA)</Label>
              <Input
                type="number"
                step={50000}
                value={inputs.liquidatedDamagesPenaltiesFcfa}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    liquidatedDamagesPenaltiesFcfa: Number(e.target.value) || 0,
                  })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Date réception provisoire</Label>
              <Input
                type="date"
                value={inputs.provisionalAcceptanceDate}
                onChange={(e) =>
                  setInputs({ ...inputs, provisionalAcceptanceDate: e.target.value })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          {/* SYNTHÈSE DU DÉCOMPTE */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-muted/40 border">
              <CardContent className="p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Marché Total Révisé
                </span>
                <p className="text-lg font-black text-foreground">
                  {fcfa(res.finalContractTotalFcfa)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Initial : {fcfa(inputs.initialContractAmountFcfa)} + Avenants :{" "}
                  {fcfa(inputs.approvedAmendmentsFcfa)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold">
                    Retenue de Garantie (5%)
                  </span>
                  <Lock className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <p className="text-lg font-black text-amber-700 dark:text-amber-300">
                  {fcfa(res.guaranteeRetentionFcfa)}
                </p>
                <p className="text-[10px] text-amber-800 dark:text-amber-300">
                  Libérable le <strong className="font-bold">{res.guaranteeReleaseDate}</strong> (1
                  an)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SOLDE IMMÉDIAT EXIGIBLE */}
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                  Solde net à payer immédiatement :
                </span>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {fcfa(res.immediateBalancePayableFcfa)}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-600/50 text-emerald-800 dark:text-emerald-300"
              >
                {res.isFullySettled ? "Compte soldé ✅" : "Solde restant"}
              </Badge>
            </CardContent>
          </Card>

          {/* MENTIONS JURIDIQUES DGD */}
          <div className="p-3 rounded-lg border bg-card text-[11px] text-muted-foreground space-y-1">
            <span className="font-bold text-foreground">Mentions contractuelles :</span>
            <p>
              Le versement du solde immédiat vaut décharge complète pour les travaux exécutés, sous
              réserve de la bonne fin de la garantie de parfait achèvement d'un (1) an couvrant la
              restitution des 5% de retenue de garantie.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
