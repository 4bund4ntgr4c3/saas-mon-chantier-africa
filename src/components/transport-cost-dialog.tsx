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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, MapPin, Navigation, Sparkles, Truck, Users } from "lucide-react";
import { calculateTransportCost, TRUCK_OPTIONS, TruckType } from "@/lib/transport-cost";
import { fcfa } from "@/lib/format";

export function TransportCostDialog() {
  const [open, setOpen] = useState(false);
  const [truckType, setTruckType] = useState<TruckType>("benne_6_roues");
  const [distanceKm, setDistanceKm] = useState(15);
  const [rotations, setRotations] = useState(2);
  const [includeLabor, setIncludeLabor] = useState(true);

  const calc = calculateTransportCost(truckType, distanceKm, rotations, includeLabor);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-blue-500/40 text-blue-600 hover:border-blue-500 font-medium"
        >
          <Truck className="h-4 w-4 text-blue-600" />
          Simulateur Transport Matériaux
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-blue-800 dark:text-blue-400">
              <Truck className="h-5 w-5 text-blue-600" />
              Calculateur de Coût de Transport & Livraison
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-blue-500" />
              Bennes & Plateaux
            </Badge>
          </div>
          <DialogDescription>
            Estimez le coût de livraison des agrégats (sable, gravier, ciment) depuis la carrière ou
            la quincaillerie jusqu'au chantier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Type de véhicule & capacité</Label>
              <Select value={truckType} onValueChange={(v) => setTruckType(v as TruckType)}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRUCK_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label} — {t.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px]">Distance aller simple (km)</Label>
                <Input
                  type="number"
                  min={1}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value) || 1)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px]">Nombre de rotations (voyages)</Label>
                <Input
                  type="number"
                  min={1}
                  value={rotations}
                  onChange={(e) => setRotations(Number(e.target.value) || 1)}
                  className="h-7 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold cursor-pointer">
                  Inclure la manutention / déchargement
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Équipe de déchargeurs à pied d'œuvre (5 000 FCFA / voyage)
                </p>
              </div>
              <Switch checked={includeLabor} onCheckedChange={setIncludeLabor} />
            </div>
          </div>

          {/* RÉSULTATS DU CALCUL */}
          <Card className="bg-gradient-to-br from-blue-500/10 via-background to-blue-500/5 border-blue-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Coût total logistique estimé
                  </span>
                  <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
                    {fcfa(calc.totalTransportCostFcfa)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Pour <strong>{calc.rotationsCount} voyage(s)</strong> aller-retour (~
                    {calc.distanceKm * 2 * calc.rotationsCount} km total)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Forfait prise en charge</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {fcfa(calc.baseFareFcfa)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Frais kilométriques</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {fcfa(calc.distanceCostFcfa)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Manutention</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {fcfa(calc.unloadingLaborFcfa)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
