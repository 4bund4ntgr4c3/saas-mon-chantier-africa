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
import { Copy, Download, FileCheck, FileSignature, FileText, Sparkles } from "lucide-react";
import { generateVefaContractText, VefaContractData } from "@/lib/vefa-contract";
import { toast } from "sonner";

interface VefaContractDialogProps {
  initialData?: Partial<VefaContractData>;
}

export function VefaContractDialog({ initialData }: VefaContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<VefaContractData>({
    developerName: initialData?.developerName ?? "BâtiBénin Promotions SARL",
    developerRccm: initialData?.developerRccm ?? "RB/COT/2026/B/9988",
    buyerName: initialData?.buyerName ?? "Mme Ayaba DOSSOU",
    buyerPhone: initialData?.buyerPhone ?? "+229 97 00 00 00",
    programName: initialData?.programName ?? "Résidence Emeraude",
    unitLabel: initialData?.unitLabel ?? "Villa Duplex B2",
    surfaceM2: initialData?.surfaceM2 ?? 140,
    priceFcfa: initialData?.priceFcfa ?? 45000000,
    depositAmountFcfa: initialData?.depositAmountFcfa ?? 2250000,
    deliveryDateEstimated: initialData?.deliveryDateEstimated ?? "31 Décembre 2026",
    city: initialData?.city ?? "Cotonou",
  });

  const contractText = generateVefaContractText(data);

  const handleCopy = () => {
    navigator.clipboard.writeText(contractText);
    toast.success("Contrat de réservation copié dans le presse-papier !");
  };

  const handleDownload = () => {
    const blob = new Blob([contractText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Contrat-VEFA-${data.buyerName.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contrat téléchargé !");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-rose-600/40 text-rose-700 hover:border-rose-600 font-medium"
        >
          <FileSignature className="h-4 w-4 text-rose-600" />
          Contrat VEFA Promoteur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <FileText className="h-5 w-5 text-rose-600" />
              Générateur de Contrat de Réservation VEFA
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-rose-600" />
              Code Foncier Bénin
            </Badge>
          </div>
          <DialogDescription>
            Générez un contrat de réservation légal pour vos ventes sur plan avec échéancier
            d'appels de fonds et garanties.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <Label className="text-[11px]">Nom du promoteur</Label>
              <Input
                value={data.developerName}
                onChange={(e) => setData({ ...data, developerName: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Nom de l'acquéreur</Label>
              <Input
                value={data.buyerName}
                onChange={(e) => setData({ ...data, buyerName: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Désignation du lot</Label>
              <Input
                value={data.unitLabel}
                onChange={(e) => setData({ ...data, unitLabel: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <Card className="bg-muted/40 border">
            <CardContent className="p-3">
              <p className="text-[11px] font-mono whitespace-pre-line text-foreground max-h-60 overflow-y-auto leading-relaxed bg-background p-3 rounded border">
                {contractText}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
              <Copy className="h-3.5 w-3.5" />
              Copier
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger le contrat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
