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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  HardHat,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DEFAULT_HSE_CHECKLIST, evaluateHseAudit, HseChecklistItem } from "@/lib/safety-audit";
import { toast } from "sonner";

interface SafetyAuditDialogProps {
  projectName?: string;
}

export function SafetyAuditDialog({ projectName = "Mon Chantier" }: SafetyAuditDialogProps) {
  const [open, setOpen] = useState(false);
  const [checklist, setChecklist] = useState<HseChecklistItem[]>(DEFAULT_HSE_CHECKLIST);

  const report = evaluateHseAudit(checklist);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, compliant: !item.compliant } : item)),
    );
  };

  const handleSaveAudit = () => {
    toast.success(`Audit HSE enregistré avec succès ! Score : ${report.scorePercent}%`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-500/40 text-amber-700 hover:border-amber-500 font-medium"
        >
          <HardHat className="h-4 w-4 text-amber-500" />
          Audit Sécurité & EPI Chantier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-400">
              <HardHat className="h-5 w-5 text-amber-500" />
              Audit HSE & Contrôle de Sécurité EPI
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Zéro Accident
            </Badge>
          </div>
          <DialogDescription>
            Contrôlez les points de sécurité et équipements de protection sur{" "}
            <strong>{projectName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SCORE DE CONFORMITÉ */}
          <div
            className={`p-3 rounded-lg border flex items-center justify-between ${
              report.status === "conforme"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                : report.status === "ameliorations_requises"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                  : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {report.status === "conforme" ? (
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-amber-600" />
              )}
              <div>
                <p className="font-bold text-sm">Score de conformité : {report.scorePercent}%</p>
                <p className="text-[11px] opacity-85">
                  {report.status === "conforme"
                    ? "Toutes les consignes de sécurité sont respectées"
                    : "Points de vigilance identifiés à corriger"}
                </p>
              </div>
            </div>
            <Badge
              variant={report.status === "conforme" ? "outline" : "destructive"}
              className="text-xs uppercase"
            >
              {report.status.replace("_", " ")}
            </Badge>
          </div>

          {/* CHECKLIST */}
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Points de contrôle journaliers
            </span>
            <div className="space-y-2">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={item.compliant}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${item.compliant ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {item.label}
                    </p>
                  </div>
                  {item.compliant ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              size="sm"
              onClick={handleSaveAudit}
              className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Valider l'audit journalier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
