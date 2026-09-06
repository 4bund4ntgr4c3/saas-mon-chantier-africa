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
import { CheckCircle2, Droplet, FlaskConical, Layers, ShieldCheck, Sparkles } from "lucide-react";
import {
  calculateConcreteBatchMaterials,
  CONCRETE_RECIPES,
  ConcreteClass,
} from "@/lib/concrete-mix";

export function ConcreteMixDialog() {
  const [open, setOpen] = useState(false);
  const [volumeM3, setVolumeM3] = useState<number>(6); // Ex: Volume dalle de 60m² en 10cm = 6m³
  const [concreteClass, setConcreteClass] = useState<ConcreteClass>("B25");

  const recipe = CONCRETE_RECIPES[concreteClass];
  const batch = calculateConcreteBatchMaterials(volumeM3, concreteClass);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-stone-600/40 text-stone-700 hover:border-stone-600 font-medium"
        >
          <FlaskConical className="h-4 w-4 text-stone-600" />
          Formulation Béton (B25)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <FlaskConical className="h-5 w-5 text-stone-600" />
              Calculateur de Dosage & Formulation Béton
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-stone-600" />
              Structure
            </Badge>
          </div>
          <DialogDescription>
            Déterminez avec précision les quantités de ciment, sable, gravier et eau selon la classe
            de résistance souhaitée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SÉLECTEURS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Volume de béton à couler (m³)</Label>
              <Input
                type="number"
                step={0.5}
                min={0.5}
                value={volumeM3}
                onChange={(e) => setVolumeM3(Number(e.target.value) || 1)}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Classe de résistance (MPa)</Label>
              <Select
                value={concreteClass}
                onValueChange={(val) => setConcreteClass(val as ConcreteClass)}
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONCRETE_RECIPES).map(([key, r]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {r.className} — {r.targetStrength28DaysMpa} MPa ({r.cementDosageKgPerM3}{" "}
                      kg/m³)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border text-[11px] text-muted-foreground">
            <strong>Usage type :</strong> {recipe.applicationUsage}
          </div>

          {/* RECETTE PAR SAC DE CIMENT */}
          <Card className="border">
            <CardContent className="p-3 space-y-2">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-stone-600" />
                Dosage par Sac de Ciment de 50 kg :
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-muted-foreground">Sable</span>
                  <p className="font-bold text-amber-800 dark:text-amber-300 mt-0.5">
                    {recipe.sandLitersPer50kgBag} Litres
                  </p>
                  <span className="text-[9px] text-muted-foreground">~1 brouette rase</span>
                </div>
                <div className="p-2 rounded bg-stone-500/10 border border-stone-500/20">
                  <span className="text-[10px] text-muted-foreground">Gravier</span>
                  <p className="font-bold text-stone-800 dark:text-stone-300 mt-0.5">
                    {recipe.gravelLitersPer50kgBag} Litres
                  </p>
                  <span className="text-[9px] text-muted-foreground">~1.5 brouette</span>
                </div>
                <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] text-muted-foreground">Eau propre</span>
                  <p className="font-bold text-blue-800 dark:text-blue-300 mt-0.5">
                    {recipe.waterLitersPer50kgBag} Litres
                  </p>
                  <span className="text-[9px] text-muted-foreground">~2.5 seaux</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MATÉRIAUX TOTAUX POUR LE CHANTIER */}
          <Card className="bg-gradient-to-br from-stone-500/10 via-background to-stone-500/5 border-stone-500/30">
            <CardContent className="p-4 space-y-3">
              <span className="text-[10px] text-muted-foreground">
                Total approvisionnement nécessaire (+5% pertes) :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded border bg-card">
                  <span className="text-[10px] text-muted-foreground">Ciment (50kg)</span>
                  <p className="text-base font-black text-foreground mt-0.5">
                    {batch.cementBags50kg} sacs
                  </p>
                </div>
                <div className="p-2 rounded border bg-card">
                  <span className="text-[10px] text-muted-foreground">Sable lagunaire</span>
                  <p className="text-base font-black text-foreground mt-0.5">{batch.sandM3} m³</p>
                </div>
                <div className="p-2 rounded border bg-card">
                  <span className="text-[10px] text-muted-foreground">Gravier concassé</span>
                  <p className="text-base font-black text-foreground mt-0.5">{batch.gravelM3} m³</p>
                </div>
                <div className="p-2 rounded border bg-card">
                  <span className="text-[10px] text-muted-foreground">Eau de gâchage</span>
                  <p className="text-base font-black text-foreground mt-0.5">
                    {batch.waterLiters.toLocaleString()} L
                  </p>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t text-[11px] text-muted-foreground">
                {batch.recommendations.map((rec, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
