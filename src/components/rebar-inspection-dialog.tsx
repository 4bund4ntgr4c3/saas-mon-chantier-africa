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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { evaluateRebarCompliance, RebarInspectionInputs } from "@/lib/rebar-inspection";

export function RebarInspectionDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<RebarInspectionInputs>({
    rebarDiameterMm: 12,
    isCoastalMarineZone: true,
    measuredOverlapLengthCm: 50,
    measuredCoverThicknessCm: 5,
    spacersPerM2Count: 5,
  });

  const res = evaluateRebarCompliance(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-blue-600/40 text-blue-700 hover:border-blue-600 font-medium"
        >
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          Contrôle Ferraillage & Enrobage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Contrôle Ferraillage & Enrobage Anti-Corrosion Marine
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Normes BAEL
            </Badge>
          </div>
          <DialogDescription>
            Vérifiez la conformité des barres d'acier haute adhérence (HA) et l'épaisseur de cales
            d'enrobage avant coulage du béton.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* PARAMÈTRES FERRAILLAGE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Diamètre nominal de barre (HA)</Label>
              <Select
                value={String(inputs.rebarDiameterMm)}
                onValueChange={(v) => setInputs({ ...inputs, rebarDiameterMm: Number(v) })}
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[8, 10, 12, 14, 16, 20].map((dia) => (
                    <SelectItem key={dia} value={String(dia)} className="text-xs">
                      HA {dia} ({dia} mm)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Longueur de recouvrement mesurée (cm)</Label>
              <Input
                type="number"
                value={inputs.measuredOverlapLengthCm}
                onChange={(e) =>
                  setInputs({ ...inputs, measuredOverlapLengthCm: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Épaisseur d'enrobage mesurée (cm)</Label>
              <Input
                type="number"
                value={inputs.measuredCoverThicknessCm}
                onChange={(e) =>
                  setInputs({ ...inputs, measuredCoverThicknessCm: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Nombre de cales d'enrobage par m²</Label>
              <Input
                type="number"
                value={inputs.spacersPerM2Count}
                onChange={(e) =>
                  setInputs({ ...inputs, spacersPerM2Count: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
            <div>
              <p className="font-semibold text-foreground text-xs">
                Chantier en zone côtière / air marin
              </p>
              <p className="text-[10px] text-muted-foreground">
                Cotonou, Akpakpa, Fidjrossè, Sèmè-Kpodji, Ouidah-Plage (Exige 5 cm d'enrobage)
              </p>
            </div>
            <Switch
              checked={inputs.isCoastalMarineZone}
              onCheckedChange={(c) => setInputs({ ...inputs, isCoastalMarineZone: c })}
            />
          </div>

          {/* RÉSULTAT DU CONTRÔLE */}
          <Card
            className={`border ${res.overallCompliant ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}
          >
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                {res.overallCompliant ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                )}
                <span
                  className={`font-bold text-xs ${res.overallCompliant ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"}`}
                >
                  {res.verdict}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t text-muted-foreground">
                <div>
                  Recouvrement min requis :{" "}
                  <strong className="text-foreground">{res.requiredOverlapLengthCm} cm</strong> (
                  {res.isOverlapCompliant ? "✅ OK" : "❌ Non conforme"})
                </div>
                <div>
                  Enrobage min requis :{" "}
                  <strong className="text-foreground">{res.requiredCoverThicknessCm} cm</strong> (
                  {res.isCoverCompliant ? "✅ OK" : "❌ Non conforme"})
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
