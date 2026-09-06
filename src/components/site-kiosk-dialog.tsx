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
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CloudSun,
  HardHat,
  Maximize2,
  ShieldAlert,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface SiteKioskDialogProps {
  projectName?: string;
}

export function SiteKioskDialog({ projectName = "Mon Chantier" }: SiteKioskDialogProps) {
  const [open, setOpen] = useState(false);

  const handleAction = (label: string) => {
    toast.success(`Action terrain « ${label} » activée !`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-600/40 text-amber-700 hover:border-amber-600 font-medium"
        >
          <Maximize2 className="h-4 w-4 text-amber-600" />
          Mode Kiosque Chantier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <HardHat className="h-5 w-5 text-amber-500" />
              Mode Kiosque Terrain — {projectName}
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Chef de Chantier
            </Badge>
          </div>
          <DialogDescription>
            Interface tactile grand format pour les interventions rapides sous le soleil sur le
            chantier.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleAction("Photo d'avancement")}
            className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-center space-y-2 group"
          >
            <div className="p-3 rounded-full bg-primary text-white shadow-md group-hover:scale-105 transition-transform">
              <Camera className="h-6 w-6" />
            </div>
            <span className="font-bold text-sm text-foreground">Prendre une photo</span>
            <span className="text-[11px] text-muted-foreground">Ajouter au journal de bord</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction("Pointage des ouvriers")}
            className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all text-center space-y-2 group"
          >
            <div className="p-3 rounded-full bg-blue-600 text-white shadow-md group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <span className="font-bold text-sm text-foreground">Pointage Ouvriers</span>
            <span className="text-[11px] text-muted-foreground">Présence & paie journalière</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction("Météo & coulage béton")}
            className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-center space-y-2 group"
          >
            <div className="p-3 rounded-full bg-amber-500 text-white shadow-md group-hover:scale-105 transition-transform">
              <CloudSun className="h-6 w-6" />
            </div>
            <span className="font-bold text-sm text-foreground">Météo Coulage</span>
            <span className="text-[11px] text-muted-foreground">Vérifier pluie & chaleur</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction("Livraison matériaux")}
            className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-center space-y-2 group"
          >
            <div className="p-3 rounded-full bg-emerald-600 text-white shadow-md group-hover:scale-105 transition-transform">
              <Truck className="h-6 w-6" />
            </div>
            <span className="font-bold text-sm text-foreground">Livraison Camion</span>
            <span className="text-[11px] text-muted-foreground">Réceptionner ciment / sable</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
