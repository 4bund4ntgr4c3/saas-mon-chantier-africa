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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Cylinder, Droplet, Gauge, Sparkles, Waves } from "lucide-react";
import { calculateWaterBoosterAndHmt, WaterBoosterInputs } from "@/lib/water-booster";

export function WaterBoosterDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<WaterBoosterInputs>({
    buildingHeightMeters: 6,
    bathroomsCount: 3,
    kitchensCount: 1,
    pipeLengthMeters: 40,
    pipeType: "multicouche_pehd",
  });

  const res = calculateWaterBoosterAndHmt(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-blue-600/40 text-blue-700 hover:border-blue-600 font-medium"
        >
          <Droplet className="h-4 w-4 text-blue-600" />
          Surpresseur & HMT SONEB
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Droplet className="h-5 w-5 text-blue-600" />
              Dimensionnement Surpresseur & Pression d'Eau (HMT)
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Plomberie
            </Badge>
          </div>
          <DialogDescription>
            Calculez la Hauteur Manométrique Totale (HMT), la puissance de la pompe et la taille du
            ballon à vessie pour garantir un jet puissant aux étages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* PARAMÈTRES RÉSEAU */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Hauteur du bâtiment (m)</Label>
              <Input
                type="number"
                step={0.5}
                value={inputs.buildingHeightMeters}
                onChange={(e) =>
                  setInputs({ ...inputs, buildingHeightMeters: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Salles de bain / d'eau</Label>
              <Input
                type="number"
                min={1}
                value={inputs.bathroomsCount}
                onChange={(e) =>
                  setInputs({ ...inputs, bathroomsCount: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Cuisines</Label>
              <Input
                type="number"
                min={1}
                value={inputs.kitchensCount}
                onChange={(e) =>
                  setInputs({ ...inputs, kitchensCount: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Longueur canalisation totale (m)</Label>
              <Input
                type="number"
                value={inputs.pipeLengthMeters}
                onChange={(e) =>
                  setInputs({ ...inputs, pipeLengthMeters: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Type de tuyauterie</Label>
              <Select
                value={inputs.pipeType}
                onValueChange={(v) =>
                  setInputs({ ...inputs, pipeType: v as WaterBoosterInputs["pipeType"] })
                }
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multicouche_pehd" className="text-xs">
                    Multicouche / PEHD (Faibles pertes)
                  </SelectItem>
                  <SelectItem value="pvc_pression" className="text-xs">
                    PVC Pression PN16
                  </SelectItem>
                  <SelectItem value="galva_ancien" className="text-xs">
                    Acier galvanisé / Ancien réseau
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RÉSULTAT HYDRAULIQUE */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg border bg-blue-500/10 border-blue-500/30">
              <span className="text-[10px] text-blue-800 dark:text-blue-300 font-semibold">
                Hauteur Manométrique (HMT)
              </span>
              <p className="text-xl font-black text-blue-700 dark:text-blue-300 mt-0.5">
                {res.totalDynamicHeadHmtBars} bar
              </p>
              <span className="text-[9px] text-muted-foreground">
                {res.totalDynamicHeadHmtMce} mCE
              </span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Débit de pointe simultané</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.peakFlowRateM3h} m³/h
              </p>
              <span className="text-[9px] text-muted-foreground">{res.peakFlowRateLmin} L/min</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Ballon à vessie conseillé</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.recommendedBladderTankVolumeLiters} Litres
              </p>
              <span className="text-[9px] text-muted-foreground">
                Pompe {res.recommendedPumpPowerHp} CV
              </span>
            </div>
          </div>

          {/* RECOMMANDATIONS DE PLOMBERIE */}
          <div className="space-y-1.5 p-3 rounded-lg border bg-card">
            <span className="font-bold text-xs text-foreground">
              Règles d'installation du groupe surpresseur :
            </span>
            <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
              {res.recommendations.map((rec, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
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
