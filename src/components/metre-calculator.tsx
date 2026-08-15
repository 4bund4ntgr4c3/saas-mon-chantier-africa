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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Hammer, HardHat, Home, PackageCheck } from "lucide-react";
import { calculateConcrete, calculateMasonry, calculateRoofing } from "@/lib/metre";
import { toast } from "sonner";

interface MetreCalculatorProps {
  onApplyRequirements?: (summary: string) => void;
}

export function MetreCalculatorDialog({ onApplyRequirements }: MetreCalculatorProps) {
  const [open, setOpen] = useState(false);

  // Concrete state
  const [concreteLength, setConcreteLength] = useState(10);
  const [concreteWidth, setConcreteWidth] = useState(5);
  const [concreteThickness, setConcreteThickness] = useState(0.15);
  const [dosage, setDosage] = useState(350);

  // Masonry state
  const [wallLength, setWallLength] = useState(12);
  const [wallHeight, setWallHeight] = useState(3);
  const [openingsArea, setOpeningsArea] = useState(4);
  const [blockType, setBlockType] = useState<10 | 15 | 20>(15);

  // Roofing state
  const [roofLength, setRoofLength] = useState(12);
  const [roofWidth, setRoofWidth] = useState(8);
  const [pitch, setPitch] = useState(20);
  const [sheetLength, setSheetLength] = useState(3);

  const concreteResult = calculateConcrete(
    concreteLength,
    concreteWidth,
    concreteThickness,
    dosage,
  );
  const masonryResult = calculateMasonry(wallLength, wallHeight, openingsArea, blockType);
  const roofingResult = calculateRoofing(roofLength, roofWidth, pitch, sheetLength);

  const handleApply = (summaryText: string) => {
    if (onApplyRequirements) {
      onApplyRequirements(summaryText);
    }
    toast.success("Besoins calculés ajoutés avec succès !");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary">
          <Calculator className="h-4 w-4 text-primary" />
          Calculateur de métré BTP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <HardHat className="h-5 w-5 text-amber-600" />
            Calculateur de métré & cubage de matériaux
          </DialogTitle>
          <DialogDescription>
            Estimez instantanément vos besoins en sacs de ciment, sable, gravier, agglos et
            ferraillage pour le Bénin.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="beton" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="beton" className="gap-1.5 text-xs sm:text-sm">
              <HardHat className="h-4 w-4" /> Béton armé
            </TabsTrigger>
            <TabsTrigger value="maconnerie" className="gap-1.5 text-xs sm:text-sm">
              <Hammer className="h-4 w-4" /> Maçonnerie
            </TabsTrigger>
            <TabsTrigger value="toiture" className="gap-1.5 text-xs sm:text-sm">
              <Home className="h-4 w-4" /> Toiture & Tôles
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BÉTON ARMÉ */}
          <TabsContent value="beton" className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="c-len">Longueur (m)</Label>
                <Input
                  id="c-len"
                  type="number"
                  step="0.1"
                  value={concreteLength}
                  onChange={(e) => setConcreteLength(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="c-wid">Largeur (m)</Label>
                <Input
                  id="c-wid"
                  type="number"
                  step="0.1"
                  value={concreteWidth}
                  onChange={(e) => setConcreteWidth(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="c-thk">Épaisseur (m)</Label>
                <Input
                  id="c-thk"
                  type="number"
                  step="0.01"
                  value={concreteThickness}
                  onChange={(e) => setConcreteThickness(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Dosage ciment :
              </Label>
              <Button
                type="button"
                size="sm"
                variant={dosage === 350 ? "default" : "outline"}
                onClick={() => setDosage(350)}
                className="h-7 text-xs"
              >
                350 kg/m³ (Standard)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={dosage === 400 ? "default" : "outline"}
                onClick={() => setDosage(400)}
                className="h-7 text-xs"
              >
                400 kg/m³ (Ouvrage lourd)
              </Button>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-900/60 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-semibold text-sm">Volume total de béton</span>
                  <span className="text-lg font-bold text-primary">
                    {concreteResult.volumeM3} m³
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Ciment (50kg)</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {concreteResult.cementBags50kg} sacs
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Sable</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {concreteResult.sandTonnes} t
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Gravier concassé</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {concreteResult.gravelTonnes} t
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Aciers HA (12m)</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      ~{concreteResult.steelBars12mCount} barres
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full gap-2"
              onClick={() =>
                handleApply(
                  `Béton ${concreteResult.volumeM3}m³ : ${concreteResult.cementBags50kg} sacs ciment, ${concreteResult.sandTonnes}t sable, ${concreteResult.gravelTonnes}t gravier, ~${concreteResult.steelBars12mCount} barres fer`,
                )
              }
            >
              <PackageCheck className="h-4 w-4" /> Utiliser ces quantités
            </Button>
          </TabsContent>

          {/* TAB 2: MAÇONNERIE */}
          <TabsContent value="maconnerie" className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="w-len">Longueur mur (m)</Label>
                <Input
                  id="w-len"
                  type="number"
                  step="0.5"
                  value={wallLength}
                  onChange={(e) => setWallLength(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="w-ht">Hauteur (m)</Label>
                <Input
                  id="w-ht"
                  type="number"
                  step="0.1"
                  value={wallHeight}
                  onChange={(e) => setWallHeight(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="w-op">Ouvertures (m²)</Label>
                <Input
                  id="w-op"
                  type="number"
                  step="0.5"
                  value={openingsArea}
                  onChange={(e) => setOpeningsArea(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Type d'agglos :
              </Label>
              <Button
                type="button"
                size="sm"
                variant={blockType === 15 ? "default" : "outline"}
                onClick={() => setBlockType(15)}
                className="h-7 text-xs"
              >
                Agglos de 15 (Standard)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={blockType === 20 ? "default" : "outline"}
                onClick={() => setBlockType(20)}
                className="h-7 text-xs"
              >
                Agglos de 20 (Porteur)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={blockType === 10 ? "default" : "outline"}
                onClick={() => setBlockType(10)}
                className="h-7 text-xs"
              >
                Agglos de 10 (Cloison)
              </Button>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-900/60 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-semibold text-sm">Surface nette de mur</span>
                  <span className="text-lg font-bold text-primary">
                    {masonryResult.wallAreaM2} m²
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Agglos (+5% casse)</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {masonryResult.blocksCount} pcs
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Ciment mortier (50kg)</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {masonryResult.cementBags50kg} sacs
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Sable de pose</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {masonryResult.sandTonnes} t
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full gap-2"
              onClick={() =>
                handleApply(
                  `Mur ${masonryResult.wallAreaM2}m² : ${masonryResult.blocksCount} agglos de ${blockType}, ${masonryResult.cementBags50kg} sacs ciment, ${masonryResult.sandTonnes}t sable`,
                )
              }
            >
              <PackageCheck className="h-4 w-4" /> Utiliser ces quantités
            </Button>
          </TabsContent>

          {/* TAB 3: TOITURE */}
          <TabsContent value="toiture" className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="r-len">Longueur sol (m)</Label>
                <Input
                  id="r-len"
                  type="number"
                  step="0.5"
                  value={roofLength}
                  onChange={(e) => setRoofLength(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="r-wid">Largeur sol (m)</Label>
                <Input
                  id="r-wid"
                  type="number"
                  step="0.5"
                  value={roofWidth}
                  onChange={(e) => setRoofWidth(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="r-pit">Pente (°)</Label>
                <Input
                  id="r-pit"
                  type="number"
                  step="1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Longueur tôle :
              </Label>
              {[3, 4, 6].map((l) => (
                <Button
                  key={l}
                  type="button"
                  size="sm"
                  variant={sheetLength === l ? "default" : "outline"}
                  onClick={() => setSheetLength(l)}
                  className="h-7 text-xs"
                >
                  {l} mètres
                </Button>
              ))}
            </div>

            <Card className="bg-slate-50 dark:bg-slate-900/60 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-semibold text-sm">Surface développée toiture</span>
                  <span className="text-lg font-bold text-primary">
                    {roofingResult.surfaceM2} m²
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Tôles bacs ({sheetLength}m)</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {roofingResult.corrugatedSheetsCount} tôles
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Pointes toiture</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {roofingResult.roofingNailsKg} kg
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border shadow-sm">
                    <p className="text-muted-foreground">Faîtières (2m)</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {roofingResult.ridgeCapsCount} pcs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full gap-2"
              onClick={() =>
                handleApply(
                  `Toiture ${roofingResult.surfaceM2}m² : ${roofingResult.corrugatedSheetsCount} tôles de ${sheetLength}m, ${roofingResult.roofingNailsKg}kg pointes, ${roofingResult.ridgeCapsCount} faîtières`,
                )
              }
            >
              <PackageCheck className="h-4 w-4" /> Utiliser ces quantités
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
