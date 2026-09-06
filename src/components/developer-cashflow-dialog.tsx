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
import { CheckCircle2, CircleDashed, Coins, Landmark, Lock, Sparkles, Unlock } from "lucide-react";
import { generateVefaFundSchedule, FundCallMilestone } from "@/lib/developer-cashflow";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface DeveloperCashflowDialogProps {
  totalSalePrice?: number;
  unitName?: string;
}

export function DeveloperCashflowDialog({
  totalSalePrice = 45000000,
  unitName = "Villa Duplex F4",
}: DeveloperCashflowDialogProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(totalSalePrice);
  const [schedule, setSchedule] = useState<FundCallMilestone[]>(() =>
    generateVefaFundSchedule(totalSalePrice),
  );

  const totalCollected = schedule.filter((m) => m.isPaid).reduce((s, m) => s + m.amountFcfa, 0);
  const totalUnlocked = schedule.filter((m) => m.isUnlocked).reduce((s, m) => s + m.amountFcfa, 0);

  const toggleUnlock = (idx: number) => {
    const updated = [...schedule];
    if (updated[idx]) {
      updated[idx].isUnlocked = !updated[idx].isUnlocked;
      setSchedule(updated);
      toast.info(`Palier « ${updated[idx].stageName} » mis à jour.`);
    }
  };

  const togglePaid = (idx: number) => {
    const updated = [...schedule];
    if (updated[idx]) {
      updated[idx].isPaid = !updated[idx].isPaid;
      setSchedule(updated);
      toast.success(`Encaissement de ${fcfa(updated[idx].amountFcfa)} enregistré !`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-indigo-600/40 text-indigo-700 hover:border-indigo-600 font-medium"
        >
          <Coins className="h-4 w-4 text-indigo-600" />
          Appels de Fonds VEFA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Coins className="h-5 w-5 text-indigo-600" />
              Échéancier des Appels de Fonds — {unitName}
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              VEFA Bénin
            </Badge>
          </div>
          <DialogDescription>
            Gérez les déblocages financiers progressifs auprès des acquéreurs ou de votre banque
            selon l'avancement physique du chantier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-[11px]">Prix de vente total TTC (FCFA)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setPrice(val);
                  setSchedule(generateVefaFundSchedule(val));
                }}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-right">
              <span className="text-[10px] text-muted-foreground">Fonds encaissés :</span>
              <p className="font-extrabold text-sm text-indigo-700 dark:text-indigo-300">
                {fcfa(totalCollected)} ({Math.round((totalCollected / (price || 1)) * 100)}%)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {schedule.map((milestone, idx) => (
              <div
                key={milestone.id}
                className={`flex flex-wrap items-center justify-between p-3 rounded-lg border transition-all ${
                  milestone.isPaid
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : milestone.isUnlocked
                      ? "bg-indigo-500/5 border-indigo-500/30"
                      : "bg-muted/40 border-border opacity-75"
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    {milestone.stageName}
                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                      {milestone.percentage}%
                    </Badge>
                  </h4>
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {fcfa(milestone.amountFcfa)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={milestone.isUnlocked ? "default" : "outline"}
                    onClick={() => toggleUnlock(idx)}
                    className="h-7 text-[11px] gap-1"
                  >
                    {milestone.isUnlocked ? (
                      <Unlock className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    {milestone.isUnlocked ? "Débloqué" : "Verrouillé"}
                  </Button>
                  <Button
                    size="sm"
                    variant={milestone.isPaid ? "secondary" : "outline"}
                    disabled={!milestone.isUnlocked}
                    onClick={() => togglePaid(idx)}
                    className={`h-7 text-[11px] gap-1 ${
                      milestone.isPaid ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {milestone.isPaid ? "Encaissé" : "Marquer Encaissé"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
