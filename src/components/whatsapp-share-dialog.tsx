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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, MessageSquare, Send, Sparkles } from "lucide-react";
import {
  createWhatsAppLink,
  generateMilestoneCallTemplate,
  generateOrderTemplate,
  generateSiteFlashReportTemplate,
} from "@/lib/whatsapp-templates";
import { toast } from "sonner";

interface WhatsAppShareDialogProps {
  projectName: string;
  defaultPhone?: string | null;
}

export function WhatsAppShareDialog({ projectName, defaultPhone }: WhatsAppShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"flash" | "order" | "milestone">("flash");
  const [recipientPhone, setRecipientPhone] = useState(defaultPhone ?? "");
  const [copied, setCopied] = useState(false);

  // Form states
  const [progress, setProgress] = useState(45);
  const [workDone, setWorkDone] = useState(
    "Coulage de la dalle haute RDC terminé. Décoffrage des poteaux en cours.",
  );
  const [nextWork, setNextWork] = useState("Élévation des agglos de 15 au niveau R+1 dès lundi.");

  const [supplier, setSupplier] = useState("Quincaillerie Centrale Cotonou");
  const [deliveryAddr, setDeliveryAddr] = useState("Chantier Calavi, Zone Arconville");

  const [milestone, setMilestone] = useState("Achèvement du Gros Œuvre (Dalle)");
  const [amount, setAmount] = useState(1500000);
  const [momoNumber, setMomoNumber] = useState("+229 97 00 00 00");

  let currentMessage = "";
  if (tab === "flash") {
    currentMessage = generateSiteFlashReportTemplate({ projectName }, progress, workDone, nextWork);
  } else if (tab === "order") {
    currentMessage = generateOrderTemplate(
      { projectName },
      supplier,
      [
        { name: "Ciment CPJ 42.5 (NOCIBE/CIMBENIN)", quantity: 50, unit: "sacs 50kg" },
        { name: "Fer à béton FeE500 HA 10", quantity: 30, unit: "barres 12m" },
        { name: "Sable lagunaire propre", quantity: 1, unit: "camion 10m³" },
      ],
      deliveryAddr,
    );
  } else {
    currentMessage = generateMilestoneCallTemplate({ projectName }, milestone, amount, momoNumber);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    toast.success("Message copié dans le presse-papier");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const url = createWhatsAppLink(recipientPhone, currentMessage);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-500/40 text-emerald-600 hover:border-emerald-500 font-medium"
        >
          <MessageSquare className="h-4 w-4 text-emerald-500" />
          Partager WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-emerald-700 dark:text-emerald-400">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              Générateur de Messages WhatsApp Pro
            </DialogTitle>
          </div>
          <DialogDescription>
            Créez et envoyez des messages pré-formatés avec emojis à vos clients, quincailleries et
            artisans.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "flash" | "order" | "milestone")}>
            <TabsList className="grid grid-cols-3 w-full text-xs">
              <TabsTrigger value="flash">Rapport Flash</TabsTrigger>
              <TabsTrigger value="order">Commande Matériaux</TabsTrigger>
              <TabsTrigger value="milestone">Appel de Fonds</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* DESTINATAIRE */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="w-phone" className="text-xs">
                Numéro WhatsApp du destinataire (indicatif inclus)
              </Label>
              <Input
                id="w-phone"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Ex: +229 97000000"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* PARAMÈTRES DU TEMPLATE */}
          {tab === "flash" && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px]">Avancement (%)</Label>
                  <Input
                    type="number"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[11px]">Travaux du jour</Label>
                <Input
                  value={workDone}
                  onChange={(e) => setWorkDone(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px]">Prochaine étape</Label>
                <Input
                  value={nextWork}
                  onChange={(e) => setNextWork(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}

          {tab === "order" && (
            <div className="space-y-2 text-xs">
              <div>
                <Label className="text-[11px]">Nom de la quincaillerie</Label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px]">Lieu de livraison</Label>
                <Input
                  value={deliveryAddr}
                  onChange={(e) => setDeliveryAddr(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}

          {tab === "milestone" && (
            <div className="space-y-2 text-xs">
              <div>
                <Label className="text-[11px]">Jalon franchi</Label>
                <Input
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px]">Montant acompte (FCFA)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Compte Mobile Money</Label>
                  <Input
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* APERÇU DU MESSAGE */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              Aperçu du message WhatsApp
            </Label>
            <Textarea
              value={currentMessage}
              readOnly
              className="font-mono text-xs h-36 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 resize-none"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copié !" : "Copier le texte"}
            </Button>
            <Button
              size="sm"
              onClick={handleSendWhatsApp}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Envoyer sur WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
