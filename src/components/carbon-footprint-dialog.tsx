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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Factory, Fuel, Leaf, Sparkles, Trees, Truck } from "lucide-react";
import { calculateCarbonFootprint } from "@/lib/carbon-footprint";

interface CarbonFootprintDialogProps {
  projectName?: string;
}

export function CarbonFootprintDialog({
  projectName = "Mon Chantier",
}: CarbonFootprintDialogProps) {
  const [open, setOpen] = useState(false);
  const [cementBags, setCementBags] = useState(400);
  const [steelTons, setSteelTons] = useState(3.5);
  const [transportKm, setTransportKm] = useState(250);
  const [dieselLiters, setDieselLiters] = useState(80);

  const footprint = calculateCarbonFootprint({
    cementBags50kg: cementBags,
    steelTons,
    transportKmTotal: transportKm,
    dieselLiters,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <Leaf className="h-4 w-4 text-emerald-600" />
          Bilan Carbone & Éco-BTP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-emerald-900 dark:text-emerald-300">
              <Leaf className="h-5 w-5 text-emerald-600" />
              Bilan Carbone Chantier & Éco-Matériaux
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Impact Climat
            </Badge>
          </div>
          <DialogDescription>
            Évaluez l'empreinte environnementale des matériaux utilisés sur{" "}
            <strong>{projectName}</strong> et découvrez les alternatives durables (BTC, Solaire).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Sacs de ciment (50 kg)</Label>
              <Input
                type="number"
                value={cementBags}
                onChange={(e) => setCementBags(Number(e.target.value) || 0)}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Acier / Fers à béton (Tonnes)</Label>
              <Input
                type="number"
                step="0.1"
                value={steelTons}
                onChange={(e) => setSteelTons(Number(e.target.value) || 0)}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Transport camions (km cumulés)</Label>
              <Input
                type="number"
                value={transportKm}
                onChange={(e) => setTransportKm(Number(e.target.value) || 0)}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Gasoil groupe / engins (Litres)</Label>
              <Input
                type="number"
                value={dieselLiters}
                onChange={(e) => setDieselLiters(Number(e.target.value) || 0)}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          {/* RÉSULTAT ÉMISSIONS */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Empreinte carbone totale estimée
                  </span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {footprint.totalEmissionsTons} tonnes CO₂e
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Équivalent à la plantation de{" "}
                    <strong>{footprint.treesEquivalentToOffset} arbres</strong> pour compenser.
                  </p>
                </div>
                <Trees className="h-8 w-8 text-emerald-600 opacity-60" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Ciment</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {footprint.cementEmissionsTons} tCO₂
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Acier</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {footprint.steelEmissionsTons} tCO₂
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Énergie & Trajets</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {Number(
                      (footprint.transportEmissionsTons + footprint.energyEmissionsTons).toFixed(2),
                    )}{" "}
                    tCO₂
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RECOMMANDATIONS ÉCO-CONSTRUCTION */}
          <div className="bg-muted/40 p-3 rounded-lg border space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" /> Potentiel d'Éco-Construction
            </span>
            <p className="text-[11px] text-muted-foreground">
              En adoptant les <strong>Briques de Terre Compressée (BTC)</strong> pour le remplissage
              et une alimentation solaire de chantier, vous économiseriez jusqu'à{" "}
              <strong>{footprint.ecoSavingsTonsWithBtc} tonnes de CO₂</strong> tout en améliorant le
              confort thermique.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
