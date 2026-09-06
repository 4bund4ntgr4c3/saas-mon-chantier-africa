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
import { AlertTriangle, CheckCircle2, Droplets, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { SepticTankSizingInputs, sizeSepticSanitation } from "@/lib/septic-tank";

export function SepticTankDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<SepticTankSizingInputs>({
    occupantsCount: 6,
    hasGreaseTrap: true,
    soilPermeability: "sable_permeable",
    isHighWaterTable: false,
  });

  const sizing = sizeSepticSanitation(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-cyan-600/40 text-cyan-700 hover:border-cyan-600 font-medium"
        >
          <Droplets className="h-4 w-4 text-cyan-600" />
          Fosse Septique & Épandage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Droplets className="h-5 w-5 text-cyan-600" />
              Dimensionnement Fosse Septique & Assainissement
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-cyan-600" />
              Hydraulique
            </Badge>
          </div>
          <DialogDescription>
            Calculez le volume utile de votre fosse toutes eaux, le bac à graisse et le système
            d'évacuation par puits perdu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* PARAMÈTRES USAGERS & TERRAIN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Nombre d'occupants (Équivalent-Habitants)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={inputs.occupantsCount}
                onChange={(e) =>
                  setInputs({ ...inputs, occupantsCount: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Perméabilité du sol</Label>
              <Select
                value={inputs.soilPermeability}
                onValueChange={(v) =>
                  setInputs({
                    ...inputs,
                    soilPermeability: v as SepticTankSizingInputs["soilPermeability"],
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sable_permeable" className="text-xs">
                    Sable perméable (Cotonou, Plage)
                  </SelectItem>
                  <SelectItem value="terre_moyenne" className="text-xs">
                    Terre de barre moyenne (Calavi, Allada)
                  </SelectItem>
                  <SelectItem value="argile_impermeable" className="text-xs">
                    Argile imperméable / Bas-fond
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Nappe phréatique haute (&lt; 1.5m de profondeur)
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Zone côtière, bord de lac ou bas-fond inondable
                </p>
              </div>
              <Switch
                checked={inputs.isHighWaterTable}
                onCheckedChange={(c) => setInputs({ ...inputs, isHighWaterTable: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Bac dégraisseur obligatoire (Cuisine)
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Retient les huiles et graisses pour éviter le colmatage de la fosse
                </p>
              </div>
              <Switch
                checked={inputs.hasGreaseTrap}
                onCheckedChange={(c) => setInputs({ ...inputs, hasGreaseTrap: c })}
              />
            </div>
          </div>

          {/* RÉSULTAT DIMENSIONNEMENT */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg border bg-cyan-500/10 border-cyan-500/30">
              <span className="text-[10px] text-cyan-800 dark:text-cyan-300 font-semibold">
                Volume Fosse Toutes Eaux
              </span>
              <p className="text-lg font-black text-cyan-700 dark:text-cyan-300 mt-0.5">
                {sizing.septicTankVolumeM3} m³
              </p>
              <span className="text-[9px] text-muted-foreground">
                ({sizing.septicTankVolumeM3 * 1000} Litres)
              </span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Bac dégraisseur</span>
              <p className="text-lg font-black text-foreground mt-0.5">
                {sizing.greaseTrapVolumeLiters} L
              </p>
              <span className="text-[9px] text-muted-foreground">Eaux ménagères</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Puits d'infiltration</span>
              <p className="text-sm font-black text-foreground mt-1">
                Ø {sizing.soakawayDiameterM}m × Prof {sizing.soakawayDepthM}m
              </p>
              <span className="text-[9px] text-muted-foreground">
                {sizing.isSoakawayFeasible ? "Faisable ✅" : "Inadapté ⚠️"}
              </span>
            </div>
          </div>

          <Card className="border">
            <CardContent className="p-3 space-y-1.5">
              <span className="font-bold text-xs text-foreground">
                Dimensions recommandées pour la cuve fosse (Béton B25) :
              </span>
              <p className="text-[11px] text-muted-foreground">
                Longueur utile :{" "}
                <strong className="text-foreground">{sizing.septicTankDimensions.lengthM} m</strong>{" "}
                · Largeur :{" "}
                <strong className="text-foreground">{sizing.septicTankDimensions.widthM} m</strong>{" "}
                · Hauteur d'eau :{" "}
                <strong className="text-foreground">
                  {sizing.septicTankDimensions.heightWaterM} m
                </strong>
              </p>
            </CardContent>
          </Card>

          {/* RECOMMANDATIONS DE MISE EN ŒUVRE */}
          <div className="space-y-1.5 p-3 rounded-lg border bg-card">
            <span className="font-bold text-xs text-foreground">
              Règles d'hygiène et prescriptions techniques :
            </span>
            <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
              {sizing.recommendations.map((rec, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
