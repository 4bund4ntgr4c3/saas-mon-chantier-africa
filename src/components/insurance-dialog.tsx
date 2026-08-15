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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileCheck, HardHat, Send, ShieldCheck, Sparkles } from "lucide-react";
import { simulateConstructionInsurance } from "@/lib/insurance";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface InsuranceDialogProps {
  defaultBudget?: number;
  projectName?: string;
}

export function InsuranceDialog({
  defaultBudget = 25000000,
  projectName = "Mon Chantier",
}: InsuranceDialogProps) {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(defaultBudget);
  const [partner, setPartner] = useState("NSIA Assurances Bénin");

  const simulation = simulateConstructionInsurance(budget);

  const handleRequestQuote = () => {
    toast.success(`Demande d'attestation d'assurance transmise à ${partner} !`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Assurance Chantier & TRC
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-emerald-800 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Assurance Tous Risques Chantier & Décennale
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Partenaires Agréés
            </Badge>
          </div>
          <DialogDescription>
            Protégez votre investissement contre les sinistres, vols, effondrements et engagez la
            garantie décennale pour <strong>{projectName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-2">
            <Label htmlFor="ins-budget" className="text-xs">
              Valeur totale des travaux à assurer (FCFA)
            </Label>
            <Input
              id="ins-budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 1000000)}
              className="h-8 text-xs"
            />
          </div>

          {/* DÉCOMPOSITION DES GARANTIES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-card p-3 rounded-lg border space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <HardHat className="h-3.5 w-3.5 text-amber-500" /> TRC Chantier
              </div>
              <p className="text-[10px] text-muted-foreground">Incendie, intempéries, vol</p>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {fcfa(simulation.tousRisquesChantier)}
              </p>
            </div>

            <div className="bg-card p-3 rounded-lg border space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <FileCheck className="h-3.5 w-3.5 text-blue-500" /> RC Chantier
              </div>
              <p className="text-[10px] text-muted-foreground">Dommages aux tiers & voisins</p>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {fcfa(simulation.responsabiliteCivile)}
              </p>
            </div>

            <div className="bg-card p-3 rounded-lg border space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Décennale
              </div>
              <p className="text-[10px] text-muted-foreground">Solidité 10 ans structure</p>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {fcfa(simulation.garantieDecennale)}
              </p>
            </div>
          </div>

          {/* FORFAIT GLOBAL PACKAGÉ */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Prime unique pour toute la durée du chantier
                  </span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {fcfa(simulation.totalPackagePrimeFcfa)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Couverture maximale garantie :{" "}
                    <strong>{fcfa(simulation.recommendedCoverageFcfa)}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Assureur sélectionné</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{partner}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SÉLECTION ASSUREUR ET ACTION */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Partenaires : </span>
              {simulation.partners.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPartner(p)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    partner === p
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {p.split(" ")[0]}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleRequestQuote}
              className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Demander l'Attestation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
