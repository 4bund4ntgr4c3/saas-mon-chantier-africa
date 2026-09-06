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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, FileDown, FileSignature, FileText, Sparkles } from "lucide-react";
import {
  generateServiceOrderText,
  ServiceOrderInputs,
  ServiceOrderType,
} from "@/lib/service-orders";
import { toast } from "sonner";

interface ServiceOrdersDialogProps {
  projectName?: string;
}

export function ServiceOrdersDialog({ projectName = "Villa Calavi" }: ServiceOrdersDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<ServiceOrderInputs>({
    orderNumber: 1,
    orderType: "demarrage",
    projectName,
    clientName: "M. Sylvain KANLINSOU",
    contractorName: "Entreprise Générale BTP Sarl",
    effectiveDate: new Date().toISOString().slice(0, 10),
    descriptionOrReason: "Ordre formel de démarrage des travaux de terrassement et fondations.",
    financialImpactFcfa: 0,
    delayImpactDays: 0,
  });

  const orderText = generateServiceOrderText(inputs);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(orderText);
    toast.success("Ordre de Service copié dans le presse-papier !");
  };

  const handleDownload = () => {
    const blob = new Blob([orderText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `OS_${inputs.orderNumber}_${inputs.orderType}_${inputs.projectName.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier de l'Ordre de Service téléchargé !");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-purple-600/40 text-purple-700 hover:border-purple-600 font-medium"
        >
          <FileSignature className="h-4 w-4 text-purple-600" />
          Ordres de Service (OS)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <FileSignature className="h-5 w-5 text-purple-600" />
              Générateur d'Ordres de Service (OS) & Avenants
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-purple-600" />
              Contractuel
            </Badge>
          </div>
          <DialogDescription>
            Émettez des ordres de service juridiques et traçables (Démarrage, Arrêt, Reprise,
            Travaux Modificatifs) pour votre chantier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* FORMULAIRE DES PARAMÈTRES */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Type d'acte</Label>
              <Select
                value={inputs.orderType}
                onValueChange={(v) => setInputs({ ...inputs, orderType: v as ServiceOrderType })}
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demarrage" className="text-xs">
                    OS Démarrage
                  </SelectItem>
                  <SelectItem value="arret" className="text-xs">
                    OS Arrêt / Suspension
                  </SelectItem>
                  <SelectItem value="reprise" className="text-xs">
                    OS Reprise travaux
                  </SelectItem>
                  <SelectItem value="avenant_modificatif" className="text-xs">
                    Avenant Modificatif
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Numéro d'ordre</Label>
              <Input
                type="number"
                min={1}
                value={inputs.orderNumber}
                onChange={(e) => setInputs({ ...inputs, orderNumber: Number(e.target.value) || 1 })}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Date d'effet</Label>
              <Input
                type="date"
                value={inputs.effectiveDate}
                onChange={(e) => setInputs({ ...inputs, effectiveDate: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Maître d'Ouvrage (Client)</Label>
              <Input
                value={inputs.clientName}
                onChange={(e) => setInputs({ ...inputs, clientName: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Entreprise Titulaire</Label>
              <Input
                value={inputs.contractorName}
                onChange={(e) => setInputs({ ...inputs, contractorName: e.target.value })}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px]">Objet / Motivations & Instructions</Label>
            <Textarea
              rows={2}
              value={inputs.descriptionOrReason}
              onChange={(e) => setInputs({ ...inputs, descriptionOrReason: e.target.value })}
              className="text-xs mt-1 resize-none"
            />
          </div>

          {inputs.orderType === "avenant_modificatif" && (
            <div className="grid grid-cols-2 gap-3 p-2 rounded border bg-muted/40">
              <div>
                <Label className="text-[11px]">Incidence financière (FCFA HT)</Label>
                <Input
                  type="number"
                  step={50000}
                  value={inputs.financialImpactFcfa}
                  onChange={(e) =>
                    setInputs({ ...inputs, financialImpactFcfa: Number(e.target.value) || 0 })
                  }
                  className="h-7 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px]">Prorogation délai (Jours)</Label>
                <Input
                  type="number"
                  value={inputs.delayImpactDays}
                  onChange={(e) =>
                    setInputs({ ...inputs, delayImpactDays: Number(e.target.value) || 0 })
                  }
                  className="h-7 text-xs mt-1"
                />
              </div>
            </div>
          )}

          {/* APERÇU DE L'ORDRE DE SERVICE */}
          <Card className="bg-muted/40 border">
            <CardContent className="p-3">
              <pre className="text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto text-foreground/90 leading-relaxed">
                {orderText}
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
              className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FileDown className="h-3.5 w-3.5" />
              Télécharger l'OS (.txt)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
