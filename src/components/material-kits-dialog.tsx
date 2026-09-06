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
import { Boxes, CheckCircle2, Hammer, Layers, PackagePlus, Plus, Sparkles } from "lucide-react";
import { generateMaterialKit, MaterialKitStructure } from "@/lib/material-kits-calculator";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface MaterialKitsDialogProps {
  onApplyKit?: (kit: MaterialKitStructure) => void;
}

export function MaterialKitsDialog({ onApplyKit }: MaterialKitsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"cloture" | "fosse_septique" | "dalle_pleine">(
    "cloture",
  );

  const kit = generateMaterialKit(selectedType);

  const handleApply = () => {
    if (onApplyKit) {
      onApplyKit(kit);
    }
    toast.success(
      `Kit « ${kit.title} » (${kit.items.length} matériaux) ajouté aux besoins du chantier !`,
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-purple-600/40 text-purple-700 hover:border-purple-600 font-medium"
        >
          <Boxes className="h-4 w-4 text-purple-600" />
          Kits Ouvrages Types
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Boxes className="h-5 w-5 text-purple-600" />
              Générateur de Kits Matériaux par Ouvrage
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-purple-600" />
              Chiffrage Express
            </Badge>
          </div>
          <DialogDescription>
            Générez en 1 clic la liste complète des matériaux requis pour un ouvrage type béninois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* SÉLECTEUR D'OUVRAGE */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedType("cloture")}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedType === "cloture"
                  ? "border-purple-600 bg-purple-500/10 font-bold"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="text-xs text-foreground">Clôture 150 m²</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Agglos 15 + raidisseurs
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("fosse_septique")}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedType === "fosse_septique"
                  ? "border-purple-600 bg-purple-500/10 font-bold"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="text-xs text-foreground">Fosse Septique</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Toutes eaux 6-10 pers.</div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("dalle_pleine")}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedType === "dalle_pleine"
                  ? "border-purple-600 bg-purple-500/10 font-bold"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="text-xs text-foreground">Dalle Pleine 100 m²</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Béton armé ép. 15 cm</div>
            </button>
          </div>

          {/* DÉTAIL DU KIT */}
          <Card className="bg-gradient-to-br from-purple-500/10 via-background to-purple-500/5 border-purple-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{kit.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{kit.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground">Budget estimé</span>
                  <p className="font-extrabold text-sm text-purple-700 dark:text-purple-300">
                    {fcfa(kit.totalEstimatedCostFcfa)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {kit.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1 border-b last:border-0 text-[11px]"
                  >
                    <span className="text-foreground">
                      <strong>
                        {item.quantity} {item.unit}
                      </strong>{" "}
                      · {item.name}
                    </span>
                    <span className="font-semibold text-muted-foreground">
                      {fcfa(item.totalEstimatedPriceFcfa)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="gap-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white"
                >
                  <PackagePlus className="h-3.5 w-3.5" />
                  Importer ce kit dans le chantier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
