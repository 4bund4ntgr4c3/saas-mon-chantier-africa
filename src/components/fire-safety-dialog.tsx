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
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  evaluateFireSafetyEquipment,
  FireBuildingCategory,
  FireSafetyInputs,
} from "@/lib/fire-safety";
import { fcfa } from "@/lib/format";

export function FireSafetyDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<FireSafetyInputs>({
    buildingCategory: "habitation_etages",
    totalFloorAreaM2: 240,
    levelsCount: 2,
    bedroomsCount: 4,
    hasGeneratorOrSolarInverter: true,
    hasEnclosedGarage: true,
  });

  const res = evaluateFireSafetyEquipment(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-rose-600/40 text-rose-700 hover:border-rose-600 font-medium"
        >
          <Flame className="h-4 w-4 text-rose-600" />
          Sécurité Incendie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Flame className="h-5 w-5 text-rose-600" />
              Dotation Extincteurs & Sécurité Incendie
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-rose-600" />
              Protection
            </Badge>
          </div>
          <DialogDescription>
            Calculez le nombre d'extincteurs par type (Eau, CO2, Poudre) et détecteurs de fumée
            nécessaires selon les normes de sécurité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* CARACTÉRISTIQUES DU BÂTIMENT */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Surface totale (m²)</Label>
              <Input
                type="number"
                value={inputs.totalFloorAreaM2}
                onChange={(e) =>
                  setInputs({ ...inputs, totalFloorAreaM2: Number(e.target.value) || 20 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Nombre de niveaux</Label>
              <Input
                type="number"
                min={1}
                value={inputs.levelsCount}
                onChange={(e) => setInputs({ ...inputs, levelsCount: Number(e.target.value) || 1 })}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Nombre de chambres</Label>
              <Input
                type="number"
                min={0}
                value={inputs.bedroomsCount}
                onChange={(e) =>
                  setInputs({ ...inputs, bedroomsCount: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Local Groupe Électrogène ou Onduleur Solaire
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Nécessite un extincteur CO2 spécifique pour feux électriques
                </p>
              </div>
              <Switch
                checked={inputs.hasGeneratorOrSolarInverter}
                onCheckedChange={(c) => setInputs({ ...inputs, hasGeneratorOrSolarInverter: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Garage fermé pour véhicules / Stockage carburant
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Exige un extincteur à poudre polyvalente ABC (feux d'hydrocarbures)
                </p>
              </div>
              <Switch
                checked={inputs.hasEnclosedGarage}
                onCheckedChange={(c) => setInputs({ ...inputs, hasEnclosedGarage: c })}
              />
            </div>
          </div>

          {/* SYNTHÈSE EXTINCTEURS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">Eau pulvérisée (6L)</span>
              <p className="text-base font-black text-blue-600 mt-0.5">
                {res.waterExtinguishers6LCount} unité(s)
              </p>
              <span className="text-[9px] text-muted-foreground">Feux solides (bois, papier)</span>
            </div>
            <div className="p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">CO2 Gaz (2kg)</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.co2Extinguishers2kgCount} unité(s)
              </p>
              <span className="text-[9px] text-muted-foreground">Armoire TGBT / Onduleur</span>
            </div>
            <div className="p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">Poudre ABC (6kg)</span>
              <p className="text-base font-black text-amber-600 mt-0.5">
                {res.powderExtinguishers6kgCount} unité(s)
              </p>
              <span className="text-[9px] text-muted-foreground">Garage & Hydrocarbures</span>
            </div>
            <div className="p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">Détecteurs DAAF</span>
              <p className="text-base font-black text-rose-600 mt-0.5">
                {res.smokeDetectorsDaafCount} détecteurs
              </p>
              <span className="text-[9px] text-muted-foreground">Chambres + Paliers</span>
            </div>
          </div>

          <Card className="bg-rose-500/10 border-rose-500/30">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-800 dark:text-rose-300 font-semibold uppercase tracking-wider">
                  Budget équipement sécurité incendie estimé :
                </span>
                <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-0.5">
                  {fcfa(res.estimatedEquipmentCostFcfa)}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-rose-600/50 text-rose-800 dark:text-rose-300"
              >
                Conforme ERP & Résidentiel
              </Badge>
            </CardContent>
          </Card>

          {/* RÈGLES DE SÉCURITÉ */}
          <div className="space-y-1.5 p-3 rounded-lg border bg-card">
            <span className="font-bold text-xs text-foreground">
              Consignes et bonnes pratiques incendie :
            </span>
            <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
              {res.fireSafetyRules.map((rule, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
