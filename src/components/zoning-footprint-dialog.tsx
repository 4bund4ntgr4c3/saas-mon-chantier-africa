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
  AlertTriangle,
  Building,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { calculateZoningCompliance, ZoningFootprintInputs } from "@/lib/zoning-footprint";

export function ZoningFootprintDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<ZoningFootprintInputs>({
    plotAreaM2: 500,
    groundFloorFootprintM2: 200,
    totalFloorAreaM2: 350,
    frontSetbackMeters: 4,
    sideSetbackMeters: 2.5,
    rearSetbackMeters: 3,
  });

  const res = calculateZoningCompliance(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-indigo-600/40 text-indigo-700 hover:border-indigo-600 font-medium"
        >
          <Compass className="h-4 w-4 text-indigo-600" />
          Emprise au Sol (CES & COS)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Compass className="h-5 w-5 text-indigo-600" />
              Calculateur d'Emprise au Sol (CES) & Règles d'Urbanisme
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Urbanisme
            </Badge>
          </div>
          <DialogDescription>
            Vérifiez la conformité de votre implantation (CES, COS, marges de recul) pour
            l'instruction du permis de construire.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SURFACES DU PROJET */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Surface de la parcelle (m²)</Label>
              <Input
                type="number"
                value={inputs.plotAreaM2}
                onChange={(e) => setInputs({ ...inputs, plotAreaM2: Number(e.target.value) || 50 })}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Emprise bâtie au RDC (m²)</Label>
              <Input
                type="number"
                value={inputs.groundFloorFootprintM2}
                onChange={(e) =>
                  setInputs({ ...inputs, groundFloorFootprintM2: Number(e.target.value) || 10 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Surface plancher totale (m²)</Label>
              <Input
                type="number"
                value={inputs.totalFloorAreaM2}
                onChange={(e) =>
                  setInputs({ ...inputs, totalFloorAreaM2: Number(e.target.value) || 10 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          {/* MARGES DE RECUL */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Recul voie publique (m)</Label>
              <Input
                type="number"
                step={0.5}
                value={inputs.frontSetbackMeters}
                onChange={(e) =>
                  setInputs({ ...inputs, frontSetbackMeters: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Recul latéral voisin (m)</Label>
              <Input
                type="number"
                step={0.5}
                value={inputs.sideSetbackMeters}
                onChange={(e) =>
                  setInputs({ ...inputs, sideSetbackMeters: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Recul fond de parcelle (m)</Label>
              <Input
                type="number"
                step={0.5}
                value={inputs.rearSetbackMeters}
                onChange={(e) =>
                  setInputs({ ...inputs, rearSetbackMeters: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          {/* SYNTHÈSE DES RATIOS */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div
              className={`p-2.5 rounded-lg border ${res.isCesCompliant ? "bg-emerald-500/10 border-emerald-500/30" : "bg-destructive/10 border-destructive/30"}`}
            >
              <span className="text-[10px] text-muted-foreground font-semibold">
                Emprise au sol (CES)
              </span>
              <p
                className={`text-xl font-black mt-0.5 ${res.isCesCompliant ? "text-emerald-600" : "text-destructive"}`}
              >
                {res.cesRatioPercent} %
              </p>
              <span className="text-[9px] text-muted-foreground">
                {res.isCesCompliant ? "Conforme (≤ 60%)" : "Dépassement ⚠️"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Coefficient COS</span>
              <p className="text-xl font-black text-foreground mt-0.5">{res.cosRatio}</p>
              <span className="text-[9px] text-muted-foreground">Densité plancher</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Espace libre / Jardin</span>
              <p className="text-xl font-black text-indigo-600 mt-0.5">{res.greenSpaceAreaM2} m²</p>
              <span className="text-[9px] text-muted-foreground">Sol perméable</span>
            </div>
          </div>

          {/* NOTES DE CONFORMITÉ */}
          <div className="space-y-1.5 p-3 rounded-lg border bg-card">
            <span className="font-bold text-xs text-foreground">Diagnostic d'urbanisme :</span>
            <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
              {res.complianceNotes.map((note, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
