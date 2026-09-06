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
import { ExternalLink, MessageCircle, MessageSquare, Send, Sparkles } from "lucide-react";
import { formatWhatsAppCloudMessage } from "@/lib/whatsapp-cloud";
import { toast } from "sonner";

interface WhatsAppCloudDialogProps {
  projectName?: string;
  defaultPhone?: string;
}

export function WhatsAppCloudDialog({
  projectName = "Villa Fidjrossè",
  defaultPhone = "+229 97 00 00 00",
}: WhatsAppCloudDialogProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(defaultPhone);
  const [template, setTemplate] = useState<
    "chantier_weekly_digest" | "paiement_recu" | "alerte_coulage_meteo"
  >("chantier_weekly_digest");

  const payload = formatWhatsAppCloudMessage(phone, template, {
    projectName,
    progress: "65%",
    totalSpent: "14 500 000",
    amount: "750 000",
    recipient: "Artisan Coffreur",
    reference: "PAY-2026-BTP",
  });

  const handleSend = () => {
    window.open(payload.generatedDirectUrl, "_blank");
    toast.success("Redirection vers WhatsApp avec le message pré-rempli !");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          WhatsApp Cloud API
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Diffusion WhatsApp Transactionnelle
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Meta Cloud
            </Badge>
          </div>
          <DialogDescription>
            Envoyez instantanément des alertes, résumés et avis de paiement sur les numéros WhatsApp
            de vos artisans et clients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div>
            <Label className="text-[11px]">Numéro WhatsApp du destinataire (Bénin)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-7 text-xs mt-1"
            />
          </div>

          <div>
            <Label className="text-[11px]">Modèle de message (Template)</Label>
            <Select
              value={template}
              onValueChange={(v) =>
                setTemplate(
                  v as "chantier_weekly_digest" | "paiement_recu" | "alerte_coulage_meteo",
                )
              }
            >
              <SelectTrigger className="h-7 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chantier_weekly_digest">
                  📊 Résumé hebdomadaire de chantier
                </SelectItem>
                <SelectItem value="paiement_recu">💰 Avis de versement / paiement reçu</SelectItem>
                <SelectItem value="alerte_coulage_meteo">
                  ⛈️ Alerte météo pluie pour coulage
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                Aperçu du message formaté :
              </p>
              <p className="text-xs text-foreground bg-white dark:bg-slate-900 p-2 rounded border font-mono whitespace-pre-line">
                {decodeURIComponent(payload.generatedDirectUrl.split("text=")[1] ?? "")}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              size="sm"
              onClick={handleSend}
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
