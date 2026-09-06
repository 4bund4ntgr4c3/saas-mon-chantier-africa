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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Globe, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { BuildingType, evaluateSoilAndFoundations, SoilType } from "@/lib/soil-foundations";

export function SoilFoundationsDialog() {
  const [open, setOpen] = useState(false);
  const [soilType, setSoilType] = useState<SoilType>("sable_littoral");
  const [buildingType, setBuildingType] = useState<BuildingType>("r_plus_1");

  const advice = evaluateSoilAndFoundations(soilType, buildingType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <Layers className="h-4 w-4 text-emerald-600" />
          Sols & Fondations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Layers className="h-5 w-5 text-emerald-600" />
              Diagnostic Géotechnique & Choix des Fondations
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Structure
            </Badge>
          </div>
          <DialogDescription>
            Évaluez la portance du terrain selon les caractéristiques du sous-sol béninois et
            choisissez le système de fondation adapté.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SÉLECTEURS SOL & BÂTIMENT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Nature géologique du sol</Label>
              <Select value={soilType} onValueChange={(v) => setSoilType(v as SoilType)}>
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sable_littoral" className="text-xs">
                    Sable littoral (Cotonou, Sèmè, Ouidah)
                  </SelectItem>
                  <SelectItem value="argile_marecageuse" className="text-xs">
                    Argile molle / Zone inondable
                  </SelectItem>
                  <SelectItem value="terre_de_barre" className="text-xs">
                    Terre de barre (Calavi, Allada, Bohicon)
                  </SelectItem>
                  <SelectItem value="cuirasse_rocheuse" className="text-xs">
                    Cuirasse / Roche (Dassa, Parakou)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px]">Gabarit du bâtiment projeté</Label>
              <Select
                value={buildingType}
                onValueChange={(v) => setBuildingType(v as BuildingType)}
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rdc" className="text-xs">
                    Rez-de-chaussée (RDC)
                  </SelectItem>
                  <SelectItem value="r_plus_1" className="text-xs">
                    Maison à étage R+1
                  </SelectItem>
                  <SelectItem value="r_plus_2" className="text-xs">
                    Immeuble R+2
                  </SelectItem>
                  <SelectItem value="r_plus_3_et_plus" className="text-xs">
                    Immeuble R+3 et plus
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RÉSULTATS PORTANCE & RECOMMANDATIONS */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg border bg-muted/40 text-center">
              <span className="text-[10px] text-muted-foreground">
                Capacité portante admissible
              </span>
              <p className="text-xl font-black text-foreground mt-0.5">
                {advice.admissibleBearingCapacityBars} bars
              </p>
              <span className="text-[9px] text-muted-foreground">
                ({advice.admissibleBearingCapacityBars * 100} kPa)
              </span>
            </div>
            <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-center">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">
                Béton recommandé
              </span>
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {advice.recommendedConcreteGrade}
              </p>
            </div>
          </div>

          <Card className="border border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="p-3.5 space-y-2">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Fondation recommandée :
              </span>
              <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                {advice.recommendedFoundation}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1 border-t">
                <strong>Comportement hydrique & nappe :</strong> {advice.waterTableRisk}
              </p>
            </CardContent>
          </Card>

          {/* CONSEILS D'INGÉNIERIE */}
          <div className="space-y-1.5 p-3 rounded-lg border bg-card">
            <span className="font-bold text-xs text-foreground">
              Recommandations de mise en œuvre :
            </span>
            <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
              {advice.engineeringAdvice.map((adv, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{adv}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
