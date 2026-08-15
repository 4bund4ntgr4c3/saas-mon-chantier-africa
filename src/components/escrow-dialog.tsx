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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, DollarSign, Lock, ShieldCheck, Upload } from "lucide-react";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

export interface EscrowMilestone {
  id: string;
  title: string;
  percentage: number;
  amount: number;
  status: "locked" | "in_progress" | "released";
  photoProofUrl?: string;
}

interface EscrowDialogProps {
  contractTitle?: string;
  contractorName?: string;
  totalAmount?: number;
}

export function EscrowDialog({
  contractTitle = "Gros œuvre & Maçonnerie",
  contractorName = "Entreprise BTP Excellence",
  totalAmount = 2500000,
}: EscrowDialogProps) {
  const [open, setOpen] = useState(false);
  const [milestones, setMilestones] = useState<EscrowMilestone[]>([
    {
      id: "m1",
      title: "Jalon 1 : Fondations & Coulage semelles",
      percentage: 30,
      amount: Math.round(totalAmount * 0.3),
      status: "released",
      photoProofUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200",
    },
    {
      id: "m2",
      title: "Jalon 2 : Élévation des murs & Dalle haute",
      percentage: 40,
      amount: Math.round(totalAmount * 0.4),
      status: "in_progress",
    },
    {
      id: "m3",
      title: "Jalon 3 : Finitions & Réception des travaux",
      percentage: 30,
      amount: Math.round(totalAmount * 0.3),
      status: "locked",
    },
  ]);

  const handleRelease = (id: string) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, status: "released" } : m)));
    toast.success("Fonds débloqués avec succès vers l'artisan via Mobile Money !");
  };

  const releasedTotal = milestones
    .filter((m) => m.status === "released")
    .reduce((sum, m) => sum + m.amount, 0);

  const lockedTotal = totalAmount - releasedTotal;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:border-emerald-600"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Séquestre BTP (Escrow)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Séquestre d'acompte & Paiements par jalons
          </DialogTitle>
          <DialogDescription>
            Vos fonds sont conservés en sécurité sur un compte séquestre et débloqués au fur et à
            mesure de l'avancement validé par photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50">
              <CardContent className="p-3">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Déjà débloqué
                </span>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {fcfa(releasedTotal)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground font-medium">
                  Fonds sous séquestre
                </span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {fcfa(lockedTotal)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-xs text-muted-foreground">
            Contrat : <strong className="text-foreground">{contractTitle}</strong> avec{" "}
            <strong className="text-foreground">{contractorName}</strong>
          </div>

          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <Card
                key={m.id}
                className={`border transition-all ${
                  m.status === "released"
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300"
                    : m.status === "in_progress"
                      ? "border-amber-400 bg-amber-50/20"
                      : "opacity-80"
                }`}
              >
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm">{m.title}</span>
                    </div>
                    <Badge
                      variant={
                        m.status === "released"
                          ? "default"
                          : m.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[11px]"
                    >
                      {m.status === "released"
                        ? "✓ Fonds débloqués"
                        : m.status === "in_progress"
                          ? "⏳ En cours d'exécution"
                          : "🔒 Bloqué"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">
                      Montant ({m.percentage}%) : <strong>{fcfa(m.amount)}</strong>
                    </span>

                    {m.status === "in_progress" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => toast.info("Preuve photo ajoutée")}
                        >
                          <Upload className="h-3.5 w-3.5" /> Preuve photo
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleRelease(m.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Libérer l'acompte
                        </Button>
                      </div>
                    )}

                    {m.status === "released" && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Payé à l'artisan
                      </span>
                    )}

                    {m.status === "locked" && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5" /> Jalon précédent requis
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full text-xs gap-1.5"
            onClick={() => toast.info("Recharge de séquestre Mobile Money initiée")}
          >
            <DollarSign className="h-4 w-4 text-emerald-600" /> Approvisionner le compte séquestre
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
