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
import { Coins, Flame, Layers, Package, ShoppingCart, Sparkles, Tag } from "lucide-react";
import { calculateBulkDiscount } from "@/lib/bulk-purchasing";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

export function BulkPurchasingDialog() {
  const [open, setOpen] = useState(false);
  const [materialType, setMaterialType] = useState<"ciment" | "fer_a_beton" | "sable_gravier">(
    "ciment",
  );
  const [quantity, setQuantity] = useState(250);
  const [unitPrice, setUnitPrice] = useState(4500);

  const calc = calculateBulkDiscount(materialType, quantity, unitPrice);

  const handleJoinGroupOrder = () => {
    toast.success(`Demande d'achat groupé pour ${calc.quantity} unité(s) soumise à la centrale !`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-500/40 text-amber-700 hover:border-amber-500 font-medium"
        >
          <Tag className="h-4 w-4 text-amber-600" />
          Centrale d'Achats Groupés (-15%)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Package className="h-5 w-5 text-amber-600" />
              Centrale d'Achats Groupés & Remises BTP
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Tarifs Négociés
            </Badge>
          </div>
          <DialogDescription>
            Regroupez vos commandes de matériaux avec d'autres chantiers de votre zone pour obtenir
            des tarifs de gros imbattables.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div>
            <Label className="text-xs">Type de matériau</Label>
            <Select
              value={materialType}
              onValueChange={(v) => {
                const t = v as "ciment" | "fer_a_beton" | "sable_gravier";
                setMaterialType(t);
                if (t === "ciment") {
                  setQuantity(200);
                  setUnitPrice(4500);
                } else if (t === "fer_a_beton") {
                  setQuantity(3);
                  setUnitPrice(620000);
                } else {
                  setQuantity(5);
                  setUnitPrice(40000);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ciment" className="text-xs">
                  Ciment Portland (Sacs 50 kg)
                </SelectItem>
                <SelectItem value="fer_a_beton" className="text-xs">
                  Fer à béton FeE500 (Tonnes)
                </SelectItem>
                <SelectItem value="sable_gravier" className="text-xs">
                  Sable / Gravier concassé (Camions)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Quantité souhaitée</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Prix standard unitaire (FCFA)</Label>
              <Input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value) || 1)}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          {/* RÉSULTAT ÉCONOMIE */}
          <Card className="bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border-amber-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
                <div>
                  <Badge className="bg-amber-600 mb-1.5 text-[10px]">{calc.tierLabel}</Badge>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    {fcfa(calc.finalNegotiatedPriceFcfa)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Au lieu de{" "}
                    <span className="line-through">{fcfa(calc.totalStandardPriceFcfa)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Économie brute</span>
                  <p className="text-lg font-black text-emerald-600">
                    -{fcfa(calc.discountAmountFcfa)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                <span>
                  Remise appliquée : <strong>-{calc.discountRatePercent}%</strong>
                </span>
                <span>
                  Prix unitaire négocié :{" "}
                  <strong>{fcfa(Math.round(calc.finalNegotiatedPriceFcfa / calc.quantity))}</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ACTION */}
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              size="sm"
              onClick={handleJoinGroupOrder}
              className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Rejoindre la commande groupée
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
