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
import {
  CheckCircle2,
  Clock,
  Leaf,
  ShieldCheck,
  Sparkles,
  Sun,
  ThermometerSnowflake,
  Zap,
} from "lucide-react";
import { simulateTropicalThermalComfort, WallMaterial } from "@/lib/thermal-comfort";
import { fcfa } from "@/lib/format";

export function ThermalComfortDialog() {
  const [open, setOpen] = useState(false);
  const [material, setMaterial] = useState<WallMaterial>("btc_terre_stabilisee");
  const [hasOverhangingRoof, setHasOverhangingRoof] = useState<boolean>(true);
  const [hasSunshades, setHasSunshades] = useState<boolean>(true);
  const [annualAcBillFcfa, setAnnualAcBillFcfa] = useState<number>(360000); // 30 000 FCFA/mois

  const sim = simulateTropicalThermalComfort(
    material,
    hasOverhangingRoof,
    hasSunshades,
    annualAcBillFcfa,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-teal-600/40 text-teal-700 hover:border-teal-600 font-medium"
        >
          <ThermometerSnowflake className="h-4 w-4 text-teal-600" />
          Confort Thermique & BTC
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <ThermometerSnowflake className="h-5 w-5 text-teal-600" />
              Confort Passif Tropical & Maçonnerie BTC
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-teal-600" />
              Éco-Climatique
            </Badge>
          </div>
          <DialogDescription>
            Simulez la fraîcheur intérieure et l'économie d'électricité SBEE en choisissant des
            matériaux à fort déphasage thermique.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* OPTIONS ARCHITECTURALES */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Matériau des murs d'élévation</Label>
              <Select value={material} onValueChange={(v) => setMaterial(v as WallMaterial)}>
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btc_terre_stabilisee" className="text-xs">
                    Briques de Terre Compressée (BTC)
                  </SelectItem>
                  <SelectItem value="agglo_creux_15" className="text-xs">
                    Agglos creux ciment (15 cm)
                  </SelectItem>
                  <SelectItem value="brique_cuite_alveolaire" className="text-xs">
                    Briques de terre cuite alvéolaires
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Facture annuelle de climatisation prévue (FCFA)</Label>
              <Input
                type="number"
                step={20000}
                value={annualAcBillFcfa}
                onChange={(e) => setAnnualAcBillFcfa(Number(e.target.value) || 0)}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Débords de toiture larges (≥ 60 cm)
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Ombrage direct des façades et protection contre les pluies d'orage
                </p>
              </div>
              <Switch checked={hasOverhangingRoof} onCheckedChange={setHasOverhangingRoof} />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Brise-soleil / Claustras sur façades Est & Ouest
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Bloque le rayonnement solaire direct le matin et en fin d'après-midi
                </p>
              </div>
              <Switch checked={hasSunshades} onCheckedChange={setHasSunshades} />
            </div>
          </div>

          {/* RÉSULTAT SIMULATION */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg border bg-muted/40 text-center">
              <span className="text-[10px] text-muted-foreground">Déphasage thermique</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {sim.thermalPhaseShiftHours} heures
              </p>
              <span className="text-[9px] text-muted-foreground">Restitution fraîcheur nuit</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-teal-500/10 border-teal-500/30 text-center">
              <span className="text-[10px] text-teal-800 dark:text-teal-300 font-semibold">
                Baisse température
              </span>
              <p className="text-base font-black text-teal-700 dark:text-teal-300 mt-0.5">
                -{sim.indoorTemperatureDropCelsius} °C
              </p>
              <span className="text-[9px] text-muted-foreground">Ressenti intérieur</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-center">
              <span className="text-[10px] text-muted-foreground">Économie SBEE / An</span>
              <p className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {fcfa(sim.annualSavingsFcfa)}
              </p>
              <span className="text-[9px] text-emerald-600 font-semibold">
                (-{sim.acEnergySavingPercent} % de clim)
              </span>
            </div>
          </div>

          {/* CONSEILS CONCEPTION PASSIVE */}
          <div className="space-y-1.5 p-3 rounded-lg border bg-card">
            <span className="font-bold text-xs text-foreground">
              Principes d'architecture bioclimatique :
            </span>
            <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
              {sim.passiveDesignAdvices.map((adv, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
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
