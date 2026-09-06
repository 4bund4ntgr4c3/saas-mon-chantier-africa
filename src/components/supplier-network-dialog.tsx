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
import { Card, CardContent } from "@/components/ui/card";
import { Building, Clock, MapPin, Phone, ShieldCheck, Sparkles, Store, Truck } from "lucide-react";
import { findBestWarehouse, REGIONAL_WAREHOUSES, RegionalWarehouse } from "@/lib/supplier-network";
import { toast } from "sonner";

export function SupplierNetworkDialog() {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Cotonou");

  const activeWarehouse = findBestWarehouse(selectedCity);

  const handleContactWarehouse = (w: RegionalWarehouse) => {
    toast.success(`Appel du dépôt « ${w.name} » (${w.contactPhone})…`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-blue-600/40 text-blue-700 hover:border-blue-600 font-medium"
        >
          <Store className="h-4 w-4 text-blue-600" />
          Réseau Dépôts & Quincailleries
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Store className="h-5 w-5 text-blue-600" />
              Réseau Multi-Dépôts & Disponibilités Matériaux
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Stocks en Direct
            </Badge>
          </div>
          <DialogDescription>
            Consultez les stocks disponibles en temps réel et les délais de livraison par commune au
            Bénin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SÉLECTEUR DE VILLE */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/40 rounded-lg border">
            <span className="text-muted-foreground mr-1 text-[11px] font-semibold">
              Commune cible :
            </span>
            {REGIONAL_WAREHOUSES.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedCity(w.city)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedCity === w.city
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
              >
                {w.city}
              </button>
            ))}
          </div>

          {/* DÉPÔT ACTIF SÉLECTIONNÉ */}
          <Card className="bg-gradient-to-br from-blue-500/10 via-background to-blue-500/5 border-blue-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{activeWarehouse.name}</h3>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-blue-600" /> {activeWarehouse.zone} (
                    {activeWarehouse.city})
                  </p>
                </div>
                <Badge className="bg-blue-600 text-white text-[10px] gap-1">
                  <Clock className="h-3 w-3" /> Livraison ~{activeWarehouse.estimatedDeliveryHours}h
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border">
                  <p className="text-muted-foreground text-[10px]">Ciment en stock immédiat</p>
                  <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    {activeWarehouse.cementStockBags} sacs (50kg)
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border">
                  <p className="text-muted-foreground text-[10px]">Fer à béton disponible</p>
                  <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    {activeWarehouse.steelStockTons} tonnes
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={() => handleContactWarehouse(activeWarehouse)}
                  className="gap-1.5 text-xs bg-blue-700 hover:bg-blue-800 text-white"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Appeler le dépôt ({activeWarehouse.contactPhone})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
