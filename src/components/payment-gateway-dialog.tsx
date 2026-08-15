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
import {
  CheckCircle2,
  CreditCard,
  Key,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Webhook,
} from "lucide-react";
import { GatewayProvider, processPaymentWebhook, WebhookEventPayload } from "@/lib/payment-gateway";
import { toast } from "sonner";

export function PaymentGatewayDialog() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<GatewayProvider>("fedapay");
  const [publicKey, setPublicKey] = useState("pk_live_feda_sample_key_992");
  const [secretKey, setSecretKey] = useState("sk_live_feda_secret_***");
  const [testAmount, setTestAmount] = useState(150000);
  const [testRef, setTestRef] = useState("INV-DEMO-2026");
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleSimulateWebhook = () => {
    const payload: WebhookEventPayload = {
      event: "transaction.approved",
      provider,
      transactionId: `trx_${Math.random().toString(36).slice(2, 9)}`,
      reference: testRef,
      amountFcfa: testAmount,
      customerPhone: "+229 97 00 00 00",
      timestamp: new Date().toISOString(),
    };

    const res = processPaymentWebhook(payload);
    setLastResult(res.message);
    toast.success("Webhook de paiement reçu et traité instantanément !");
  };

  const handleSaveApiKeys = () => {
    toast.success(`Clés API marchandes ${provider.toUpperCase()} enregistrées avec succès !`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <CreditCard className="h-4 w-4 text-emerald-600" />
          Passerelles Mobile Money & Webhooks
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Passerelles FedaPay / Kkiapay & Webhooks Live
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Direct UEMOA
            </Badge>
          </div>
          <DialogDescription>
            Connectez vos comptes marchands FedaPay ou Kkiapay pour automatiser l'encaissement et la
            validation des factures en temps réel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div>
            <Label className="text-xs">Fournisseur de passerelle</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as GatewayProvider)}>
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fedapay" className="text-xs">
                  FedaPay Bénin (MTN MoMo, Moov, Visa, Mastercard)
                </SelectItem>
                <SelectItem value="kkiapay" className="text-xs">
                  Kkiapay (MTN, Moov, Orange, Cartes bancaires)
                </SelectItem>
                <SelectItem value="mtn_momo_direct" className="text-xs">
                  MTN MoMo API Direct OpenAPI
                </SelectItem>
                <SelectItem value="moov_money_direct" className="text-xs">
                  Moov Money API Direct B2B
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Clé publique (Public API Key)</Label>
              <Input
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Clé secrète (Secret API Key)</Label>
              <Input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSaveApiKeys}
              className="h-7 text-xs gap-1"
            >
              <Key className="h-3 w-3" /> Enregistrer les clés
            </Button>
          </div>

          {/* SIMULATEUR DE WEBHOOK LIVE */}
          <Card className="bg-slate-50 dark:bg-slate-900 border">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                <Webhook className="h-3.5 w-3.5 text-primary" /> Testeur de Webhook d'Encaissement
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Réf. Facture / Commande</Label>
                  <Input
                    value={testRef}
                    onChange={(e) => setTestRef(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Montant encaissé (FCFA)</Label>
                  <Input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Number(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={handleSimulateWebhook}
                  className="h-7 text-xs gap-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <RefreshCw className="h-3 w-3" /> Simuler la réception du paiement
                </Button>
              </div>

              {lastResult && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{lastResult}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
