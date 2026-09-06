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
import { Droplets, Gauge, ShieldCheck, Sparkles, Waves } from "lucide-react";
import {
  calculateRainwaterCapacity,
  BENIN_RAIN_ZONES,
  BeninRainZone,
  RainwaterHarvestingInputs,
} from "@/lib/rainwater-harvesting";
import { fcfa } from "@/lib/format";

export function RainwaterHarvestingDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<RainwaterHarvestingInputs>({
    roofSurfaceM2: 180,
    roofType: "bac_alu",
    zone: "cotonou_calavi",
    householdMembersCount: 5,
  });

  const res = calculateRainwaterCapacity(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-sky-600/40 text-sky-700 hover:border-sky-600 font-medium"
        >
          <Droplets className="h-4 w-4 text-sky-600" />
          Cuve & Eau de Pluie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Droplets className="h-5 w-5 text-sky-600" />
              Dimensionnement Cuve & Récupération d'Eau de Pluie
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-sky-600" />
              Autonomie
            </Badge>
          </div>
          <DialogDescription>
            Optimisez la capacité de stockage d'eau pluviale selon votre toiture pour pallier les
            pénuries SONEB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* PARAMÈTRES TOITURE ET LOCALITÉ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Surface de toiture captante (m²)</Label>
              <Input
                type="number"
                min={20}
                value={inputs.roofSurfaceM2}
                onChange={(e) =>
                  setInputs({ ...inputs, roofSurfaceM2: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Nombre d'occupants</Label>
              <Input
                type="number"
                min={1}
                value={inputs.householdMembersCount}
                onChange={(e) =>
                  setInputs({ ...inputs, householdMembersCount: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Zone géographique / Pluviométrie</Label>
              <Select
                value={inputs.zone}
                onValueChange={(z) => setInputs({ ...inputs, zone: z as BeninRainZone })}
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BENIN_RAIN_ZONES).map(([key, zone]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Revêtement de la toiture</Label>
              <Select
                value={inputs.roofType}
                onValueChange={(t) =>
                  setInputs({ ...inputs, roofType: t as RainwaterHarvestingInputs["roofType"] })
                }
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bac_alu" className="text-xs">
                    Tôle Bac Aluminium (Rendement 90%)
                  </SelectItem>
                  <SelectItem value="tuiles" className="text-xs">
                    Tuiles en terre cuite / béton (80%)
                  </SelectItem>
                  <SelectItem value="dalle_beton" className="text-xs">
                    Dalle béton terrasse (70%)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RÉSULTAT DU DIMENSIONNEMENT */}
          <Card className="bg-gradient-to-br from-sky-500/10 via-background to-sky-500/5 border-sky-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-end border-b pb-2">
                <div>
                  <span className="text-[10px] text-muted-foreground">
                    Cuve conseillée (Bâche ou Aérienne)
                  </span>
                  <div className="text-2xl font-black text-sky-700 dark:text-sky-400">
                    {res.recommendedTankSizeLiters.toLocaleString()} Litres
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground">Autonomie sans coupure</span>
                  <p className="text-sm font-bold text-foreground">
                    ~{res.autonomyDaysWithoutSoneb} jours
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  Volume capté annuel :{" "}
                  <strong>{res.annualHarvestableLiters.toLocaleString()} L / an</strong>
                </div>
                <div>
                  Économie SONEB estimée : <strong>{fcfa(res.annualSonebSavingsFcfa)} / an</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
