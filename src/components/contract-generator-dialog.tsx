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
import { Download, FileSignature, FileText, PenLine, Scale, ShieldCheck } from "lucide-react";
import { ContractData, ContractType, generateContractPdf } from "@/lib/contracts";
import { documentFingerprint, formatFingerprint } from "@/lib/esign";
import { SignaturePad } from "@/components/signature-pad";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface ContractGeneratorDialogProps {
  projectName: string;
  defaultContractorName?: string;
  defaultAmount?: number;
}

export function ContractGeneratorDialog({
  projectName,
  defaultContractorName = "Artisan / Entreprise BTP",
  defaultAmount = 5000000,
}: ContractGeneratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [contractType, setContractType] = useState<ContractType>("entreprise_forfait");
  const [clientName, setClientName] = useState("Maître d'Ouvrage");
  const [contractorName, setContractorName] = useState(defaultContractorName);
  const [contractorTrade, setContractorTrade] = useState("Maçonnerie & Gros Œuvre");
  const [contractorPhone, setContractorPhone] = useState("+229 97 00 00 00");
  const [totalAmount, setTotalAmount] = useState(defaultAmount);
  const [advancePayment, setAdvancePayment] = useState(Math.round(defaultAmount * 0.3));
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [penaltyPerDay, setPenaltyPerDay] = useState(15000);
  const [generating, setGenerating] = useState(false);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [contractorSignature, setContractorSignature] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    try {
      setGenerating(true);
      const signedAt = new Date().toISOString();
      const base: ContractData = {
        contractType,
        projectName,
        projectLocation: "Cotonou / Abomey-Calavi, Bénin",
        clientName,
        contractorName,
        contractorTrade,
        contractorPhone,
        totalAmountFcfa: totalAmount,
        advancePaymentFcfa: advancePayment,
        durationWeeks,
        penaltyPerDayFcfa: penaltyPerDay,
        guaranteeRetentionRate: 0.05,
        startDate: new Date().toISOString().slice(0, 10),
      };
      const esign: ContractData["esign"] = {};
      if (clientSignature) {
        esign.client = { name: clientName, signedAt, imageDataUrl: clientSignature };
      }
      if (contractorSignature) {
        esign.contractor = {
          name: contractorName,
          signedAt,
          imageDataUrl: contractorSignature,
        };
      }
      if (esign.client || esign.contractor) {
        esign.fingerprint = formatFingerprint(await documentFingerprint(base));
      }
      const data: ContractData = esign.client || esign.contractor ? { ...base, esign } : base;

      const doc = generateContractPdf(data);
      const filename = `${contractType === "entreprise_forfait" ? "Contrat_BTP" : "PV_Reception"}_${projectName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      doc.save(filename);
      if (esign?.fingerprint) {
        toast.success("Document signé électroniquement !", {
          description: `Empreinte d'intégrité : ${esign.fingerprint} — conservez-la pour vérifier le document.`,
          duration: 10000,
          action: {
            label: "Copier",
            onClick: () => {
              void navigator.clipboard?.writeText(esign.fingerprint!);
            },
          },
        });
      } else {
        toast.success("Document PDF généré et téléchargé avec succès !");
      }
      setOpen(false);
    } catch {
      toast.error("Erreur lors de la génération du document");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-slate-700/40 text-slate-800 dark:text-slate-200 hover:border-primary font-medium"
        >
          <FileSignature className="h-4 w-4 text-emerald-600" />
          Contrat BTP & PV de Réception
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Scale className="h-5 w-5 text-emerald-600" />
              Générateur de Contrats & PV Juridiques BTP
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Anti-Litiges
            </Badge>
          </div>
          <DialogDescription>
            Générez un contrat de louage d'ouvrage ou un PV de réception prêt à signer conforme aux
            usages locaux.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* TYPE DE DOCUMENT */}
          <div>
            <Label className="text-xs">Type de document juridique</Label>
            <Select value={contractType} onValueChange={(v) => setContractType(v as ContractType)}>
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entreprise_forfait">
                  Contrat d'entreprise BTP à forfait
                </SelectItem>
                <SelectItem value="pv_reception_provisoire">
                  Procès-verbal de réception provisoire
                </SelectItem>
                <SelectItem value="pv_reception_definitive">
                  Procès-verbal de réception définitive (Levée réserves)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PARTIES PRENANTES */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Maître d'ouvrage (Client)</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px]">Nom de l'artisan / Entreprise</Label>
              <Input
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Corps d'état de l'artisan</Label>
              <Input
                value={contractorTrade}
                onChange={(e) => setContractorTrade(e.target.value)}
                placeholder="Ex: Électricité, Carrelage"
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px]">Téléphone artisan</Label>
              <Input
                value={contractorPhone}
                onChange={(e) => setContractorPhone(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>

          {/* CONDITIONS FINANCIÈRES (POUR CONTRAT) */}
          {contractType === "entreprise_forfait" && (
            <div className="space-y-2 border-t pt-3">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">
                Conditions financières & Délais
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px]">Montant forfaitaire (FCFA)</Label>
                  <Input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setTotalAmount(val);
                      setAdvancePayment(Math.round(val * 0.3));
                    }}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Acompte démarrage (30%)</Label>
                  <Input
                    type="number"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(Number(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px]">Délai d'exécution (semaines)</Label>
                  <Input
                    type="number"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value) || 1)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Pénalité par jour de retard (FCFA)</Label>
                  <Input
                    type="number"
                    value={penaltyPerDay}
                    onChange={(e) => setPenaltyPerDay(Number(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SIGNATURE ÉLECTRONIQUE (OPTIONNELLE) */}
          <div className="space-y-2 border-t pt-3">
            <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-muted-foreground">
              <PenLine className="size-3 text-emerald-600" />
              Signature électronique (optionnel)
            </span>
            <p className="text-[11px] text-muted-foreground">
              Signez ci-dessous au doigt ou à la souris : la signature, son horodatage et une
              empreinte d'intégrité sont intégrés au PDF.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SignaturePad
                label={`Maître d'ouvrage — ${clientName}`}
                value={clientSignature}
                onChange={setClientSignature}
              />
              <SignaturePad
                label={`Entrepreneur — ${contractorName}`}
                value={contractorSignature}
                onChange={setContractorSignature}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-[11px] text-muted-foreground">
              Clause de retenue de garantie (5%) incluse automatiquement.
            </span>
            <Button
              size="sm"
              onClick={handleDownloadPdf}
              disabled={generating}
              className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Download className="h-3.5 w-3.5" />
              {generating
                ? "Génération…"
                : clientSignature || contractorSignature
                  ? "Télécharger le PDF signé"
                  : "Télécharger le PDF prêt à signer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
