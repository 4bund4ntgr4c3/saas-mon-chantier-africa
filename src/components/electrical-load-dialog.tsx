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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Cpu, Gauge, Sparkles, Zap } from "lucide-react";
import { calculateElectricalLoadAndService, ElectricalLoadInputs } from "@/lib/electrical-load";

export function ElectricalLoadDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<ElectricalLoadInputs>({
    airConditionersCount: 4,
    waterHeatersCount: 2,
    electricOvenOrCooktop: true,
    waterBoosterPump: true,
    lightingAndSocketsAreaM2: 180,
    cableDistanceToPoleMeters: 25,
  });

  const res = calculateElectricalLoadAndService(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-yellow-600/40 text-yellow-700 hover:border-yellow-600 font-medium"
        >
          <Zap className="h-4 w-4 text-yellow-600" />
          Bilan Puissance SBEE
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Zap className="h-5 w-5 text-yellow-600" />
              Bilan de Puissance & Abonnement SBEE
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-yellow-600" />
              Électrique
            </Badge>
          </div>
          <DialogDescription>
            Dimensionnez le compteur SBEE idéal (Monophasé/Triphasé) et la section du câble
            d'alimentation selon vos équipements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* ÉQUIPEMENTS ÉLECTRIQUES */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Climatiseurs (Splits)</Label>
              <Input
                type="number"
                min={0}
                value={inputs.airConditionersCount}
                onChange={(e) =>
                  setInputs({ ...inputs, airConditionersCount: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Chauffe-eau électriques</Label>
              <Input
                type="number"
                min={0}
                value={inputs.waterHeatersCount}
                onChange={(e) =>
                  setInputs({ ...inputs, waterHeatersCount: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Surface éclairée (m²)</Label>
              <Input
                type="number"
                value={inputs.lightingAndSocketsAreaM2}
                onChange={(e) =>
                  setInputs({ ...inputs, lightingAndSocketsAreaM2: Number(e.target.value) || 50 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">Four ou Plaque induction</p>
                <p className="text-[10px] text-muted-foreground">
                  Appareils grande puissance (~3 kW)
                </p>
              </div>
              <Switch
                checked={inputs.electricOvenOrCooktop}
                onCheckedChange={(c) => setInputs({ ...inputs, electricOvenOrCooktop: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">Pompe de surpression d'eau</p>
                <p className="text-[10px] text-muted-foreground">
                  Moteur avec courant d'appel au démarrage
                </p>
              </div>
              <Switch
                checked={inputs.waterBoosterPump}
                onCheckedChange={(c) => setInputs({ ...inputs, waterBoosterPump: c })}
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px]">Distance du compteur au coffret général (mètres)</Label>
            <Input
              type="number"
              min={5}
              value={inputs.cableDistanceToPoleMeters}
              onChange={(e) =>
                setInputs({ ...inputs, cableDistanceToPoleMeters: Number(e.target.value) || 5 })
              }
              className="h-7 text-xs mt-1"
            />
          </div>

          {/* RÉSULTAT DU BILAN */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Puissance installée</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {(res.totalInstalledPowerWatts / 1000).toFixed(1)} kW
              </p>
              <span className="text-[9px] text-muted-foreground">
                {res.totalInstalledPowerWatts.toLocaleString("fr-FR")} W brut
              </span>
            </div>
            <div className="p-2.5 rounded-lg border bg-yellow-500/10 border-yellow-500/30">
              <span className="text-[10px] text-yellow-800 dark:text-yellow-300 font-semibold">
                Puissance foisonnée
              </span>
              <p className="text-xl font-black text-yellow-700 dark:text-yellow-300 mt-0.5">
                {res.apparentPowerKva} kVA
              </p>
              <span className="text-[9px] text-muted-foreground">Facteur simultanéité 0.75</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Câble cuivre & Chute</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.recommendedCableSectionMm2} mm²
              </p>
              <span className="text-[9px] text-emerald-600 font-medium">
                ΔU = {res.voltageDropPercent}% (&lt; 3%)
              </span>
            </div>
          </div>

          <Card className="bg-muted/30 border">
            <CardContent className="p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Abonnement SBEE Recommandé :
                </span>
                <Badge
                  variant="outline"
                  className="border-yellow-600/50 text-yellow-800 dark:text-yellow-300"
                >
                  Compteur SBEE
                </Badge>
              </div>
              <p className="text-base font-black text-foreground">{res.recommendedServiceLabel}</p>
            </CardContent>
          </Card>

          {/* PRESCRIPTIONS NF C 15-100 */}
          <div className="space-y-1.5 p-3 rounded-lg border bg-card">
            <span className="font-bold text-xs text-foreground">
              Prescriptions techniques de sécurité :
            </span>
            <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
              {res.recommendations.map((rec, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-yellow-600 shrink-0 mt-0.5" />
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
