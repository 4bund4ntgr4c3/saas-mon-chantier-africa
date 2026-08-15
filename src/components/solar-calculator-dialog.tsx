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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BatteryCharging, Plus, Sun, Trash2, Zap } from "lucide-react";
import { calculateSolarSystem, COMMON_APPLIANCES, SolarAppliance } from "@/lib/solar";
import { fcfa } from "@/lib/format";

export function SolarCalculatorDialog() {
  const [open, setOpen] = useState(false);
  const [appliances, setAppliances] = useState<SolarAppliance[]>(COMMON_APPLIANCES);
  const [customName, setCustomName] = useState("");
  const [customPower, setCustomPower] = useState("300");
  const [customHours, setCustomHours] = useState("4");

  const results = calculateSolarSystem(appliances);

  const handleToggle = (id: string, delta: number) => {
    setAppliances((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, quantity: Math.max(0, app.quantity + delta) } : app,
      ),
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newApp: SolarAppliance = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      powerWatts: Number(customPower) || 100,
      quantity: 1,
      hoursPerDay: Number(customHours) || 2,
    };

    setAppliances((prev) => [...prev, newApp]);
    setCustomName("");
  };

  const handleRemove = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-500/40 text-amber-600 hover:border-amber-500 font-medium"
        >
          <Sun className="h-4 w-4 text-amber-500" />
          Dimensionnement Solaire & Forage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Sun className="h-5 w-5 text-amber-500" />
              Calculateur Solaire & Autonomie Chantier
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Zap className="h-3 w-3 text-amber-500" />
              Photovoltaïque & Forage
            </Badge>
          </div>
          <DialogDescription>
            Dimensionnez vos panneaux solaires, batteries lithium et onduleur pour alimenter votre
            chantier ou votre maison.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* LISTE DES APPAREILS */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Équipements connectés
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {appliances.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-2 rounded-lg border bg-card text-xs"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{app.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {app.powerWatts} W · {app.hoursPerDay} h/jour ={" "}
                      {app.powerWatts * app.hoursPerDay * app.quantity} Wh/j
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded">
                      <button
                        type="button"
                        className="px-2 py-0.5 hover:bg-muted"
                        onClick={() => handleToggle(app.id, -1)}
                      >
                        -
                      </button>
                      <span className="px-2 font-bold">{app.quantity}</span>
                      <button
                        type="button"
                        className="px-2 py-0.5 hover:bg-muted"
                        onClick={() => handleToggle(app.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => handleRemove(app.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AJOUTER ÉQUIPEMENT */}
          <form onSubmit={handleAddCustom} className="flex flex-wrap items-end gap-2 border-t pt-3">
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="c-name" className="text-xs">
                Nouvel appareil
              </Label>
              <Input
                id="c-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ex: Scie circulaire"
                className="h-8 text-xs"
              />
            </div>
            <div className="w-20">
              <Label htmlFor="c-pow" className="text-xs">
                Puissance (W)
              </Label>
              <Input
                id="c-pow"
                type="number"
                value={customPower}
                onChange={(e) => setCustomPower(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="w-16">
              <Label htmlFor="c-hrs" className="text-xs">
                h / jour
              </Label>
              <Input
                id="c-hrs"
                type="number"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button type="submit" size="sm" className="h-8 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Ajouter
            </Button>
          </form>

          {/* RÉSULTAT DU DIMENSIONNEMENT */}
          <Card className="bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border-amber-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Consommation journalière estimée
                  </span>
                  <div className="text-2xl font-black text-amber-600">
                    {(results.dailyConsumptionWh / 1000).toFixed(2)} kWh / jour
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Puissance totale cumulée : <strong>{results.totalPowerWatts} W</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Budget kit solaire complet</span>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {fcfa(results.estimatedCostFcfa)}
                  </div>
                </div>
              </div>

              {/* RECOMMANDATIONS TECHNIQUES */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded border space-y-1">
                  <Sun className="h-4 w-4 mx-auto text-amber-500" />
                  <p className="text-muted-foreground text-[10px]">Panneaux 450Wc</p>
                  <p className="font-bold text-base text-slate-800 dark:text-slate-100">
                    {results.panelsCount450W} modules
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    ({results.peakSolarPowerWp} Wc total)
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-2.5 rounded border space-y-1">
                  <BatteryCharging className="h-4 w-4 mx-auto text-emerald-500" />
                  <p className="text-muted-foreground text-[10px]">Batterie Lithium</p>
                  <p className="font-bold text-base text-slate-800 dark:text-slate-100">
                    {results.batteryCapacityKWh} kWh
                  </p>
                  <p className="text-[10px] text-muted-foreground">Autonomie 24h</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-2.5 rounded border space-y-1">
                  <Zap className="h-4 w-4 mx-auto text-blue-500" />
                  <p className="text-muted-foreground text-[10px]">Onduleur Hybride</p>
                  <p className="font-bold text-base text-slate-800 dark:text-slate-100">
                    {results.inverterPowerKVA} kVA
                  </p>
                  <p className="text-[10px] text-muted-foreground">Pur sinus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
