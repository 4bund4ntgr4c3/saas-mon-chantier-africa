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
import { CheckCircle2, Recycle, Sparkles, Trash2, Truck } from "lucide-react";
import { calculateWastePlanAndDisposal, WasteManagementInputs } from "@/lib/waste-management";
import { fcfa } from "@/lib/format";

export function WasteManagementDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<WasteManagementInputs>({
    excavationVolumeM3: 50,
    demolitionVolumeM3: 15,
    onsiteBackfillNeedsM3: 35,
    truckCapacityM3: 8,
  });

  const res = calculateWastePlanAndDisposal(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-teal-600/40 text-teal-700 hover:border-teal-600 font-medium"
        >
          <Recycle className="h-4 w-4 text-teal-600" />
          Déchets & Gravats
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Recycle className="h-5 w-5 text-teal-600" />
              Gestion & Évacuation des Déchets de Chantier
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-teal-600" />
              Éco-chantier
            </Badge>
          </div>
          <DialogDescription>
            Optimisez le réemploi des terres et gravats en remblai in-situ et estimez le coût des
            rotations de camions bennes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* VOLUMES ESTIMÉS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Terre excavée / Fouilles (m³)</Label>
              <Input
                type="number"
                value={inputs.excavationVolumeM3}
                onChange={(e) =>
                  setInputs({ ...inputs, excavationVolumeM3: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Gravats / Démolition (m³)</Label>
              <Input
                type="number"
                value={inputs.demolitionVolumeM3}
                onChange={(e) =>
                  setInputs({ ...inputs, demolitionVolumeM3: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Besoin en remblai sous dallage / cour (m³)</Label>
              <Input
                type="number"
                value={inputs.onsiteBackfillNeedsM3}
                onChange={(e) =>
                  setInputs({ ...inputs, onsiteBackfillNeedsM3: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Gabarit camion benne</Label>
              <Select
                value={String(inputs.truckCapacityM3)}
                onValueChange={(v) =>
                  setInputs({ ...inputs, truckCapacityM3: Number(v) as 8 | 12 })
                }
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8" className="text-xs">
                    Camion benne 2 essieux (8 m³)
                  </SelectItem>
                  <SelectItem value="12" className="text-xs">
                    Camion benne 3 essieux (12 m³)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* BILAN MATIÈRE & ROTATIONS */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg border bg-teal-500/10 border-teal-500/30">
              <span className="text-[10px] text-teal-800 dark:text-teal-300 font-semibold">
                Réemploi In-Situ
              </span>
              <p className="text-xl font-black text-teal-700 dark:text-teal-300 mt-0.5">
                {res.reusedVolumeM3} m³
              </p>
              <span className="text-[9px] text-emerald-600 font-medium">
                +{fcfa(res.reusedSavingsFcfa)} épargnés
              </span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Volume net à évacuer</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.netVolumeToDisposeM3} m³
              </p>
              <span className="text-[9px] text-muted-foreground">
                Sur {res.totalWasteGeneratedM3} m³ générés
              </span>
            </div>
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <span className="text-[10px] text-muted-foreground">Rotations de camions</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.truckTripsCount} rotation(s)
              </p>
              <span className="text-[9px] text-muted-foreground">
                Bennes de {inputs.truckCapacityM3} m³
              </span>
            </div>
          </div>

          <Card className="border">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Budget évacuation décharge agréée :
                </span>
                <p className="text-lg font-black text-foreground mt-0.5">
                  {fcfa(res.disposalCostFcfa)}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-teal-600/50 text-teal-800 dark:text-teal-300"
              >
                {res.truckTripsCount} camions à commander
              </Badge>
            </CardContent>
          </Card>

          {/* BONNES PRATIQUES ENVIRONNEMENTALES */}
          <div className="space-y-1.5 p-3 rounded-lg border bg-card">
            <span className="font-bold text-xs text-foreground">
              Recommandations pour un chantier propre :
            </span>
            <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
              {res.wasteManagementTips.map((tip, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
