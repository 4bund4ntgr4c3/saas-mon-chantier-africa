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
import { CalendarDays, CloudRain, Plus, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import {
  computeWeatherDelayExtension,
  getDefaultWeatherStoppages,
  WeatherStoppageRecord,
} from "@/lib/weather-delays";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface WeatherDelaysDialogProps {
  initialDate?: string;
}

export function WeatherDelaysDialog({ initialDate = "2026-12-31" }: WeatherDelaysDialogProps) {
  const [open, setOpen] = useState(false);
  const [stoppages, setStoppages] = useState<WeatherStoppageRecord[]>(getDefaultWeatherStoppages);
  const [contractDate, setContractDate] = useState<string>(initialDate);

  const result = computeWeatherDelayExtension(stoppages, contractDate);

  const handleAddStoppage = () => {
    const newRecord: WeatherStoppageRecord = {
      id: `st-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      reason: "forte_pluie_coulage",
      reasonLabel: "Intempérie pluvieuse (arrêt de travail ordonné)",
      lostHours: 8,
    };
    setStoppages([newRecord, ...stoppages]);
    toast.success("Journée d'intempérie ajoutée au journal !");
  };

  const handleRemove = (id: string) => {
    setStoppages(stoppages.filter((s) => s.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-cyan-600/40 text-cyan-700 hover:border-cyan-600 font-medium"
        >
          <CloudRain className="h-4 w-4 text-cyan-600" />
          Intempéries & Délais
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <CloudRain className="h-5 w-5 text-cyan-600" />
              Journal d'Arrêt pour Intempéries & Replanification
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-cyan-600" />
              Contrat
            </Badge>
          </div>
          <DialogDescription>
            Consignez les arrêts de chantier dus aux pluies diluviennes pour justifier le glissement
            de la date de livraison contractuelle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SYNTHÈSE DES DÉLAIS */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg border bg-muted/40 text-center">
              <span className="text-[10px] text-muted-foreground">Arrêts cumulés</span>
              <p className="text-base font-black text-foreground mt-0.5">
                {result.totalLostDays} jour(s)
              </p>
              <span className="text-[9px] text-muted-foreground">
                {result.totalLostHours} heures perdues
              </span>
            </div>
            <div className="p-2.5 rounded-lg border bg-cyan-500/10 border-cyan-500/30 text-center">
              <span className="text-[10px] text-cyan-800 dark:text-cyan-300 font-semibold">
                Nouvelle date livraison
              </span>
              <p className="text-base font-black text-cyan-700 dark:text-cyan-300 mt-0.5">
                {result.newDeliveryDateStr}
              </p>
              <span className="text-[9px] text-muted-foreground">Exonéré de pénalités</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-center">
              <span className="text-[10px] text-muted-foreground">Pénalités couvertes</span>
              <p className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {fcfa(result.savedPenaltiesFcfa)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-xs">
              Historique des jours d'intempéries constatés :
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddStoppage}
              className="gap-1 h-7 text-[11px]"
            >
              <Plus className="h-3 w-3" />
              Ajouter un arrêt météo
            </Button>
          </div>

          {/* LISTE DES ARRÊTS */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stoppages.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center p-2.5 rounded-lg border bg-card text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">{s.date}</span>
                    <Badge variant="outline" className="text-[9px] py-0 h-4">
                      {s.lostHours}h d'arrêt
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.reasonLabel}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(s.id)}
                  className="h-6 w-6 text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
