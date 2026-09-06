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
  Calendar,
  CheckCircle2,
  Droplets,
  Home,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { getRecommendedMaintenanceSchedule, MaintenanceTask } from "@/lib/maintenance-log";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

export function MaintenanceLogDialog() {
  const [open, setOpen] = useState(false);
  const tasks = getRecommendedMaintenanceSchedule();

  const handlePlanTask = (t: MaintenanceTask) => {
    toast.success(`Entretien « ${t.title} » planifié pour le ${t.nextDueDate} !`);
  };

  const ICONS: Record<string, LucideIcon> = {
    toiture: Home,
    assainissement: Droplets,
    electricite: Zap,
    climatisation: Wrench,
    peinture: Sparkles,
  };

  const totalAnnualCost = tasks
    .filter((t) => t.frequencyMonths <= 12)
    .reduce((s, t) => s + t.estimatedCostFcfa * (12 / t.frequencyMonths), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-teal-600/40 text-teal-700 hover:border-teal-600 font-medium"
        >
          <Wrench className="h-4 w-4 text-teal-600" />
          Carnet d'Entretien du Bâtiment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Wrench className="h-5 w-5 text-teal-600" />
              Carnet d'Entretien Numérique & Maintenance
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-teal-600" />
              Post-Livraison
            </Badge>
          </div>
          <DialogDescription>
            Planifiez les opérations de maintenance préventive pour préserver la valeur de votre
            bâtiment et éviter les dégradations coûteuses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-teal-900 dark:text-teal-200">
                Budget de maintenance préventive recommandé
              </p>
              <p className="text-[11px] text-muted-foreground">
                Toiture, fosses, climatisation et contrôles électriques
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300">
                {fcfa(totalAnnualCost)} / an
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {tasks.map((t) => {
              const Icon = ICONS[t.category] ?? Wrench;
              return (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-md bg-teal-600/10 text-teal-600 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{t.title}</h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> Période idéale : {t.recommendedSeason} ·
                        Prochaine échéance : <strong>{t.nextDueDate}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {fcfa(t.estimatedCostFcfa)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlanTask(t)}
                      className="h-7 text-[11px] gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3 text-teal-600" /> Planifier
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
