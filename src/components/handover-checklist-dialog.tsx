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
import { AlertCircle, CheckCircle2, FileCheck2, KeyRound, Sparkles, XCircle } from "lucide-react";
import {
  getDefaultHandoverChecklist,
  evaluateHandoverStatus,
  InspectionCheckItem,
} from "@/lib/handover-checklist";
import { toast } from "sonner";

interface HandoverChecklistDialogProps {
  projectName?: string;
}

export function HandoverChecklistDialog({
  projectName = "Villa Calavi",
}: HandoverChecklistDialogProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InspectionCheckItem[]>(getDefaultHandoverChecklist);

  const status = evaluateHandoverStatus(items);

  const toggleInspect = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isInspected: !i.isInspected } : i)));
  };

  const toggleDefect = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, hasDefect: !i.hasDefect, isInspected: true } : i)),
    );
    toast.info("État du point de contrôle modifié.");
  };

  const handleGeneratePV = () => {
    toast.success("Procès-Verbal de Réception de Chantier généré avec succès !");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-orange-600/40 text-orange-700 hover:border-orange-600 font-medium"
        >
          <KeyRound className="h-4 w-4 text-orange-600" />
          Réception & Remise des Clés
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <KeyRound className="h-5 w-5 text-orange-600" />
              Guide de Réception & Remise des Clés — {projectName}
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-orange-600" />
              État des Lieux
            </Badge>
          </div>
          <DialogDescription>
            Inspectez minutieusement chaque pièce avec votre artisan ou conducteur de travaux avant
            la signature du PV de réception.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* STATUT GLOBAL */}
          <Card
            className={`border ${status.isReadyForHandover ? "bg-emerald-500/10 border-emerald-500/30" : "bg-orange-500/10 border-orange-500/30"}`}
          >
            <CardContent className="p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground">
                  Progression de la visite de réception
                </span>
                <p className="text-base font-black text-foreground mt-0.5">{status.statusLabel}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {status.inspectedCount}/{status.totalCount} points contrôlés ·{" "}
                  {status.defectsCount} défaut(s) signalé(s)
                </p>
              </div>
              {status.isReadyForHandover ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-8 w-8 text-orange-600 shrink-0" />
              )}
            </CardContent>
          </Card>

          {/* LISTE DES POINTS D'INSPECTION */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex flex-wrap items-center justify-between p-2.5 rounded-lg border transition-all ${
                  item.hasDefect
                    ? "bg-rose-500/10 border-rose-500/30"
                    : item.isInspected
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-card border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.isInspected}
                    onChange={() => toggleInspect(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span
                    className={`text-xs ${item.hasDefect ? "font-bold text-rose-700 dark:text-rose-400" : "text-foreground"}`}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={item.hasDefect ? "destructive" : "ghost"}
                    onClick={() => toggleDefect(item.id)}
                    className="h-6 text-[10px] px-2"
                  >
                    {item.hasDefect ? "Réserve signalée ⚠️" : "Signaler une réserve"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button
              size="sm"
              onClick={handleGeneratePV}
              className="gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              Générer le Procès-Verbal de Réception
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
