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
import { Building, Fence, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { BoundaryWallInputs, calculateBoundaryWallMaterials } from "@/lib/boundary-wall";
import { fcfa } from "@/lib/format";

export function BoundaryWallDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<BoundaryWallInputs>({
    perimeterLinearMeters: 80,
    gateWidthMeters: 4,
    wallHeightMeters: 2.2,
    postSpacingMeters: 3,
    hasTopChaperonCover: true,
    hasBarbedWireSecurity: false,
  });

  const res = calculateBoundaryWallMaterials(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-600/40 text-amber-700 hover:border-amber-600 font-medium"
        >
          <Fence className="h-4 w-4 text-amber-600" />
          Mur de Clôture & Portail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Fence className="h-5 w-5 text-amber-600" />
              Calculateur Mur de Clôture & Sécurisation
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Métré
            </Badge>
          </div>
          <DialogDescription>
            Estimez les matériaux précis (agglos de 15, raidisseurs, ciment, aciers HA) et le budget
            pour clore votre parcelle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* DIMENSIONS DU MUR */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Périmètre total (mètres)</Label>
              <Input
                type="number"
                value={inputs.perimeterLinearMeters}
                onChange={(e) =>
                  setInputs({ ...inputs, perimeterLinearMeters: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Largeur portail (mètres)</Label>
              <Input
                type="number"
                value={inputs.gateWidthMeters}
                onChange={(e) =>
                  setInputs({ ...inputs, gateWidthMeters: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Hauteur du mur (mètres)</Label>
              <Input
                type="number"
                step={0.1}
                value={inputs.wallHeightMeters}
                onChange={(e) =>
                  setInputs({ ...inputs, wallHeightMeters: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Chaperons béton 2 pentes (Dessus de mur)
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Protège l'arase des infiltrations d'eau de pluie et des fissures
                </p>
              </div>
              <Switch
                checked={inputs.hasTopChaperonCover}
                onCheckedChange={(c) => setInputs({ ...inputs, hasTopChaperonCover: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Sécurisation Concertina / Barbelé rasoir
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Ligne défensive anti-intrusion sur le couronnement
                </p>
              </div>
              <Switch
                checked={inputs.hasBarbedWireSecurity}
                onCheckedChange={(c) => setInputs({ ...inputs, hasBarbedWireSecurity: c })}
              />
            </div>
          </div>

          {/* SYNTHÈSE DES MATÉRIAUX */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">Agglos de 15</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.hollowBlocks15Count} pcs
              </p>
              <span className="text-[9px] text-muted-foreground">
                {res.wallSurfaceM2} m² maçonnerie
              </span>
            </div>
            <div className="p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">Ciment (50kg)</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.cementBags50kgTotal} sacs
              </p>
              <span className="text-[9px] text-muted-foreground">Béton + Mortier + Enduit</span>
            </div>
            <div className="p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">Raidisseurs (Poteaux)</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.stiffenerPostsCount} poteaux
              </p>
              <span className="text-[9px] text-muted-foreground">Espacement tous les 3m</span>
            </div>
            <div className="p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">Aciers HA10 (12m)</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {res.rebarBarsHA10Count} barres
              </p>
              <span className="text-[9px] text-muted-foreground">
                +{res.rebarBarsHA8Count} barres HA8
              </span>
            </div>
          </div>

          {/* ESTIMATION BUDGET */}
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold uppercase tracking-wider">
                  Budget Clôture clé en main estimé :
                </span>
                <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
                  {fcfa(res.estimatedCostFcfa)}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-amber-600/50 text-amber-800 dark:text-amber-300"
              >
                {res.netWallLengthMeters} m linéaires
              </Badge>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
