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
  Calendar,
  CalendarClock,
  Clock,
  Hourglass,
  Layers,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { generateConstructionSchedule } from "@/lib/gantt-schedule";
import { frDate } from "@/lib/format";

interface GanttScheduleDialogProps {
  projectName: string;
}

export function GanttScheduleDialog({ projectName }: GanttScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const schedule = generateConstructionSchedule(startDate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-primary/40 text-primary hover:border-primary font-medium"
        >
          <CalendarClock className="h-4 w-4 text-primary" />
          Planning Prédictif & Gantt BTP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Calendar className="h-5 w-5 text-primary" />
              Planning Prévisionnel d'Exécution & Gantt
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Calcul Temps de Séchage 21j
            </Badge>
          </div>
          <DialogDescription>
            Chronogramme prévisionnel des étapes pour <strong>{projectName}</strong> avec prise en
            compte des délais incompressibles de durcissement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* PARAMÈTRES DU PLANNING */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/40">
            <div className="flex items-center gap-2">
              <Label htmlFor="g-start" className="text-xs font-semibold whitespace-nowrap">
                Date de démarrage des travaux :
              </Label>
              <Input
                id="g-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Durée totale : </span>
                <strong className="text-primary">
                  {schedule.totalDurationDays} jours (~{Math.round(schedule.totalDurationDays / 30)}{" "}
                  mois)
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">Livraison estimée : </span>
                <strong className="text-slate-800 dark:text-slate-100">
                  {frDate(schedule.projectEstimatedEndDate)}
                </strong>
              </div>
            </div>
          </div>

          {/* CHRONOGRAMME GANTT EN BARRES */}
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Déroulement séquentiel des phases
            </span>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {schedule.tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-lg border transition-all ${
                    task.isCuringPhase
                      ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20"
                      : "bg-card"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {task.name}
                      </span>
                      {task.isCuringPhase && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-amber-500 text-amber-600 dark:text-amber-400 gap-1 py-0"
                        >
                          <Hourglass className="h-3 w-3" /> Durcissement béton
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      {frDate(task.startDate)} → {frDate(task.endDate)} ({task.durationDays}j)
                    </div>
                  </div>

                  {/* BARRE VISUELLE GANTT */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        task.isCuringPhase
                          ? "bg-amber-500"
                          : task.category === "gros_oeuvre"
                            ? "bg-primary"
                            : task.category === "second_oeuvre"
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                      }`}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONSEIL TECHNIQUE BTP */}
          <Card className="bg-slate-50 dark:bg-slate-900 border">
            <CardContent className="p-3 flex items-start gap-2 text-[11px] text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong>Règle de l'art BTP (Eurocode / BAEL) :</strong> Le temps de séchage de 21
                jours pour le béton armé avant décoffrage complet et élévation des charges lourdes
                est indispensable pour garantir la résistance mécanique (fck &ge; 25 MPa) et éviter
                les micro-fissures structurelles.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
