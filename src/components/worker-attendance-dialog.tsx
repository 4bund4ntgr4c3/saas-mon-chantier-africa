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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, HardHat, ShieldAlert, Sparkles, UserCheck, Users } from "lucide-react";
import {
  computeDailyLaborSummary,
  getDefaultTradeAttendance,
  TradeAttendanceRecord,
} from "@/lib/worker-attendance";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface WorkerAttendanceDialogProps {
  projectName?: string;
}

export function WorkerAttendanceDialog({
  projectName = "Villa Calavi",
}: WorkerAttendanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<TradeAttendanceRecord[]>(getDefaultTradeAttendance);

  const summary = computeDailyLaborSummary(records);

  const updateCount = (id: string, count: number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, workerCount: Math.max(0, count) } : r)),
    );
  };

  const toggleEpi = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, epiFullyEquipped: !r.epiFullyEquipped } : r)),
    );
  };

  const handleExportEmargement = () => {
    toast.success("Feuille d'émargement et registre de présence journalier validés !");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-600/40 text-amber-700 hover:border-amber-600 font-medium"
        >
          <HardHat className="h-4 w-4 text-amber-600" />
          Pointage & EPI Ouvriers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <HardHat className="h-5 w-5 text-amber-600" />
              Pointage Ouvriers & Conformité EPI — {projectName}
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Sécurité
            </Badge>
          </div>
          <DialogDescription>
            Enregistrez les effectifs journaliers par équipe de tâcherons et contrôlez le port
            effectif des casques et chaussures de sécurité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SYNTHÈSE JOURNÉE */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg border bg-muted/40 text-center">
              <span className="text-[10px] text-muted-foreground">Effectif présent</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {summary.totalWorkers} ouvriers
              </p>
            </div>
            <div className="p-2.5 rounded-lg border bg-amber-500/10 border-amber-500/30 text-center">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                Paie du jour estimée
              </span>
              <p className="text-base font-black text-amber-700 dark:text-amber-300 mt-0.5">
                {fcfa(summary.totalDailyPayrollFcfa)}
              </p>
            </div>
            <div
              className={`p-2.5 rounded-lg border text-center ${summary.epiComplianceRatePercent === 100 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}
            >
              <span className="text-[10px] text-muted-foreground">Conformité EPI</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {summary.epiComplianceRatePercent} %
              </p>
            </div>
          </div>

          <div className="p-2 rounded bg-muted/40 border text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{summary.safetyAlert}</span>
          </div>

          {/* LISTE DES CORPS D'ÉTAT */}
          <div className="space-y-2">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between p-2.5 rounded-lg border bg-card"
              >
                <div>
                  <h4 className="font-bold text-xs text-foreground">{r.tradeLabel}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Tarif journalier : {fcfa(r.dailyRatePerWorkerFcfa)} / ouvrier
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Effectif :</span>
                    <Input
                      type="number"
                      min={0}
                      value={r.workerCount}
                      onChange={(e) => updateCount(r.id, Number(e.target.value) || 0)}
                      className="h-6 w-16 text-xs text-center"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">EPI complet :</span>
                    <Switch checked={r.epiFullyEquipped} onCheckedChange={() => toggleEpi(r.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button
              size="sm"
              onClick={handleExportEmargement}
              className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Valider la feuille d'émargement du jour
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
