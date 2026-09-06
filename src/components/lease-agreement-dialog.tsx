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
import { Copy, FileDown, FileSignature, FileText, Sparkles } from "lucide-react";
import { generateBeninLeaseContractText, LeaseAgreementInputs } from "@/lib/lease-agreement";
import { toast } from "sonner";

export function LeaseAgreementDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<LeaseAgreementInputs>({
    lessorName: "M. Sylvain KANLINSOU",
    tenantName: "Mme Nadège DOSSOU",
    propertyAddress: "Cocotiers, Haie Vive, Cotonou",
    propertyType: "Appartement F4 Meublé",
    monthlyRentFcfa: 250000,
    securityDepositMonths: 3,
    advanceRentMonths: 3,
    leaseStartDate: new Date().toISOString().slice(0, 10),
  });

  const contractText = generateBeninLeaseContractText(inputs);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(contractText);
    toast.success("Texte du contrat de bail copié dans le presse-papier !");
  };

  const handleDownload = () => {
    const blob = new Blob([contractText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bail_Habitation_${inputs.tenantName.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier du bail téléchargé !");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-600/40 text-amber-700 hover:border-amber-600 font-medium"
        >
          <FileSignature className="h-4 w-4 text-amber-600" />
          Bail Loi 2017-15
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <FileSignature className="h-5 w-5 text-amber-600" />
              Contrat de Bail d'Habitation (Loi n° 2017-15 Bénin)
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Légal
            </Badge>
          </div>
          <DialogDescription>
            Générez un contrat de bail résidentiel 100% conforme à la législation béninoise (plafond
            de 3 mois de caution).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* CHAMPS DU FORMULAIRE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Nom du Bailleur (Propriétaire)</Label>
              <Input
                value={inputs.lessorName}
                onChange={(e) => setInputs({ ...inputs, lessorName: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Nom du Preneur (Locataire)</Label>
              <Input
                value={inputs.tenantName}
                onChange={(e) => setInputs({ ...inputs, tenantName: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Désignation du bien (Type)</Label>
              <Input
                value={inputs.propertyType}
                onChange={(e) => setInputs({ ...inputs, propertyType: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Adresse / Localisation</Label>
              <Input
                value={inputs.propertyAddress}
                onChange={(e) => setInputs({ ...inputs, propertyAddress: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Loyer mensuel (FCFA)</Label>
              <Input
                type="number"
                step={5000}
                value={inputs.monthlyRentFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, monthlyRentFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Caution (Mois, Max 3)</Label>
              <Input
                type="number"
                min={1}
                max={3}
                value={inputs.securityDepositMonths}
                onChange={(e) =>
                  setInputs({ ...inputs, securityDepositMonths: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Avance loyer (Mois, Max 3)</Label>
              <Input
                type="number"
                min={1}
                max={3}
                value={inputs.advanceRentMonths}
                onChange={(e) =>
                  setInputs({ ...inputs, advanceRentMonths: Number(e.target.value) || 1 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          {/* APERÇU DU CONTRAT */}
          <Card className="bg-muted/40 border">
            <CardContent className="p-3">
              <pre className="text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto text-foreground/90 leading-relaxed">
                {contractText}
              </pre>
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
              className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              <FileDown className="h-3.5 w-3.5" />
              Télécharger le bail (.txt)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
