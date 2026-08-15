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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calculator, Clock, FolderPlus, Sparkles, TrendingUp } from "lucide-react";
import {
  BUILDING_TYPE_OPTIONS,
  BuildingType,
  simulateConstructionCost,
  STANDING_OPTIONS,
  StandingLevel,
} from "@/lib/simulator";
import { fcfa } from "@/lib/format";
import { useSaveRow } from "@/lib/data";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function CostSimulatorDialog() {
  const [open, setOpen] = useState(false);
  const [buildingType, setBuildingType] = useState<BuildingType>("villa_basse");
  const [standing, setStanding] = useState<StandingLevel>("moyen");
  const [surface, setSurface] = useState<number>(140);
  const [projectName, setProjectName] = useState("Ma Nouvelle Villa");
  const saveProject = useSaveRow("projects", "Projet créé avec succès");
  const navigate = useNavigate();

  const simulation = simulateConstructionCost(buildingType, standing, surface);

  const handleCreateProject = async () => {
    try {
      await saveProject.mutateAsync({
        values: {
          name: projectName.trim() || `Projet ${simulation.buildingTypeLabel}`,
          budget: simulation.totalCostEstimated,
          built_area: simulation.surfaceM2,
          house_type: simulation.buildingType,
          status: "en_cours",
        },
      });
      setOpen(false);
      navigate({ to: "/projets" });
    } catch {
      toast.error("Erreur lors de la création du projet");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-primary/40 text-primary hover:border-primary font-medium"
        >
          <Calculator className="h-4 w-4 text-primary" />
          Simulateur de Coût Clé en Main
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Building2 className="h-5 w-5 text-primary" />
              Simulateur de Coût Global de Construction
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Ratios Bénin / UEMOA
            </Badge>
          </div>
          <DialogDescription>
            Estimez le budget total de votre projet selon la surface et le niveau de standing
            souhaité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="s-type" className="text-xs">
                Type d'ouvrage
              </Label>
              <Select
                value={buildingType}
                onValueChange={(v) => {
                  const type = v as BuildingType;
                  setBuildingType(type);
                  const meta = BUILDING_TYPE_OPTIONS.find((t) => t.value === type);
                  if (meta) setSurface(meta.defaultArea);
                }}
              >
                <SelectTrigger id="s-type" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUILDING_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="s-stand" className="text-xs">
                Niveau de standing
              </Label>
              <Select value={standing} onValueChange={(v) => setStanding(v as StandingLevel)}>
                <SelectTrigger id="s-stand" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STANDING_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="s-surf" className="text-xs">
                Surface développée ({buildingType === "cloture" ? "m" : "m²"})
              </Label>
              <Input
                id="s-surf"
                type="number"
                min={10}
                value={surface}
                onChange={(e) => setSurface(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* RÉSULTAT GLOBAL */}
          <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Budget estimatif tout corps d'état
                  </span>
                  <div className="text-2xl font-black text-primary">
                    {fcfa(simulation.totalCostEstimated)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Soit <strong>{fcfa(simulation.pricePerM2)}</strong> /{" "}
                    {buildingType === "cloture" ? "mètre linéaire" : "m² habitable"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" /> Durée moyenne
                  </span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                    ~{simulation.durationMonthsEstimated} mois
                  </p>
                </div>
              </div>

              {/* DÉCOMPOSITION DU BUDGET */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ventilation par corps d'état
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                    <p className="text-muted-foreground">Gros œuvre (48%)</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {fcfa(simulation.breakdown.grosOeuvre)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                    <p className="text-muted-foreground">Second œuvre (24%)</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {fcfa(simulation.breakdown.secondOeuvre)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                    <p className="text-muted-foreground">Finitions (22%)</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {fcfa(simulation.breakdown.finitions)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                    <p className="text-muted-foreground">Études & Permis (6%)</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {fcfa(simulation.breakdown.etudesEtPermis)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CRÉATION DE PROJET RAPIDE */}
          <div className="border-t pt-3 space-y-2">
            <Label htmlFor="s-pname" className="text-xs">
              Nom du projet à créer
            </Label>
            <div className="flex gap-2">
              <Input
                id="s-pname"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-9 text-xs"
                placeholder="Ex: Ma Villa Calavi"
              />
              <Button
                size="sm"
                className="gap-1.5 text-xs whitespace-nowrap"
                onClick={handleCreateProject}
              >
                <FolderPlus className="h-4 w-4" /> Créer ce projet
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
