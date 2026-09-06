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
  Activity,
  AlertCircle,
  CheckCircle2,
  Eye,
  HeartHandshake,
  Home,
  Layers,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { computeOwnerProjectHealth, OwnerProjectHealth } from "@/lib/owner-dashboard";
import { fcfa } from "@/lib/format";

interface OwnerDashboardDialogProps {
  projectName?: string;
  progress?: number;
  totalBudget?: number;
  spent?: number;
}

export function OwnerDashboardDialog({
  projectName = "Villa Calavi Arconville",
  progress = 48,
  totalBudget = 38000000,
  spent = 18500000,
}: OwnerDashboardDialogProps) {
  const [open, setOpen] = useState(false);
  const health = computeOwnerProjectHealth(projectName, progress, totalBudget, spent);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-blue-600/40 text-blue-700 hover:border-blue-600 font-medium"
        >
          <Eye className="h-4 w-4 text-blue-600" />
          Vue Propriétaire / Diaspora
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Home className="h-5 w-5 text-blue-600" />
              Cockpit Exécutif Propriétaire — {projectName}
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Suivi Simplifié
            </Badge>
          </div>
          <DialogDescription>
            Une vue claire et synthétique de votre projet, conçue pour les porteurs de projet et la
            diaspora qui supervisent leur chantier à distance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SANTÉ GLOBALE & BUDGET */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3">
                <span className="text-[10px] text-muted-foreground">Indice Santé Chantier</span>
                <p className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">
                  {health.healthScorePercent} / 100
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Budget & Délais sous contrôle
                </p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-500/10 border-emerald-500/30">
              <CardContent className="p-3">
                <span className="text-[10px] text-muted-foreground">Avancement physique réel</span>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  {health.physicalProgressPercent} %
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {health.nextKeyMilestone}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3">
                <span className="text-[10px] text-muted-foreground">Trésorerie restante</span>
                <p className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">
                  {fcfa(health.budgetRemainingFcfa)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  sur {fcfa(health.budgetAllocatedFcfa)} alloués
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ACTIONS ET VALIDATIONS ATTENDUES */}
          <Card className="border">
            <CardContent className="p-3 space-y-2">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-blue-600" />
                Actions & Validations Propriétaire
              </h4>
              <div className="space-y-1">
                {health.pendingOwnerActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded bg-muted/40 text-[11px]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
