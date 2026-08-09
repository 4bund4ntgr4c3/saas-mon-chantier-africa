import { useState } from "react";
import { CheckCircle2, Smartphone, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useConfirmMobileMoney, useInitiateMobileMoney, type PaymentProvider } from "@/lib/data";
import { fcfa, labelOf, PAYMENT_PROVIDERS } from "@/lib/format";

/** Dialogue de paiement mobile money (sandbox MTN MoMo / Moov Money / passerelles). */
export function MobileMoneyDialog({
  projectId,
  orderId,
  amount,
  beneficiary,
  open,
  onOpenChange,
}: {
  projectId?: string | null;
  orderId?: string | null;
  amount: number;
  beneficiary?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const initiate = useInitiateMobileMoney();
  const confirm = useConfirmMobileMoney();
  const [step, setStep] = useState<"form" | "confirming" | "done" | "failed">("form");
  const [provider, setProvider] = useState<PaymentProvider>("mtn_momo");
  const [phone, setPhone] = useState("");
  const [amt, setAmt] = useState(amount);
  const [txnId, setTxnId] = useState<string | null>(null);

  const reset = () => {
    setStep("form");
    setPhone("");
    setProvider("mtn_momo");
    setAmt(amount);
    setTxnId(null);
  };

  function close(openState: boolean) {
    if (!openState) {
      reset();
    }
    onOpenChange(openState);
  }

  async function start() {
    if (!/^\+?[0-9 ]{8,16}$/.test(phone.trim()) || amt <= 0) return;
    const id = await initiate.mutateAsync({
      ...(projectId ? { project_id: projectId } : {}),
      ...(orderId ? { order_id: orderId } : {}),
      amount: amt,
      provider,
      phone: phone.trim(),
    });
    setTxnId(id ?? null);
    setStep("confirming");
  }

  async function confirmNow() {
    if (!txnId) {
      setStep("failed");
      return;
    }
    await confirm.mutateAsync({
      transactionId: txnId,
      ...(orderId ? { order_id: orderId } : {}),
      ...(projectId ? { project_id: projectId } : {}),
      provider,
      amount: amt,
      phone: phone.trim(),
    });
    setStep("done");
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Smartphone className="size-5 text-primary" /> Paiement mobile money
          </DialogTitle>
          <DialogDescription>
            {beneficiary ? `${beneficiary} · ` : ""}
            Sandbox de démonstration — {labelOf(PAYMENT_PROVIDERS, provider)}.
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mm-amount">Montant (FCFA)</Label>
              <Input
                id="mm-amount"
                inputMode="numeric"
                value={amt || ""}
                onChange={(e) => setAmt(Number(e.target.value.replace(/\D/g, "")) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mm-provider">Opérateur / passerelle</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as PaymentProvider)}>
                <SelectTrigger id="mm-provider">
                  <SelectValue placeholder="Choisir un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mm-phone">Numéro mobile money</Label>
              <Input
                id="mm-phone"
                inputMode="tel"
                placeholder="+229 97 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === "confirming" && (
          <div className="grid gap-3">
            <p className="rounded-md bg-secondary/50 px-3 py-3 text-sm text-foreground/85">
              Une demande de paiement de{" "}
              <strong className="num">{amt.toLocaleString("fr-FR")} FCFA</strong> a été envoyée au{" "}
              {labelOf(PAYMENT_PROVIDERS, provider)}. Validez sur votre téléphone avec votre code
              PIN.
            </p>
            <p className="text-xs text-muted-foreground">
              Simulez l'approbation du paiement pour poursuivre la démonstration.
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="grid place-items-center gap-2 py-2 text-center">
            <CheckCircle2 className="size-10 text-success" />
            <p className="text-sm font-semibold">Paiement confirmé !</p>
            <p className="text-xs text-muted-foreground">
              La transaction a été enregistrée et le statut de la commande mis à jour.
            </p>
          </div>
        )}

        {step === "failed" && (
          <div className="grid place-items-center gap-2 py-2 text-center">
            <XCircle className="size-10 text-destructive" />
            <p className="text-sm font-semibold">Paiement échoué</p>
            <p className="text-xs text-muted-foreground">
              La passerelle n'a pas validé la transaction. Vérifiez le numéro et réessayez.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "form" && (
            <Button onClick={start} disabled={!phone.trim() || initiate.isPending}>
              Initier le paiement
            </Button>
          )}
          {step === "confirming" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("failed")}>
                Échouer
              </Button>
              <Button onClick={confirmNow} disabled={confirm.isPending}>
                Confirmer
              </Button>
            </div>
          )}
          {step === "done" && <Button onClick={() => close(false)}>Fermer</Button>}
          {step === "failed" && <Button onClick={() => setStep("form")}>Réessayer</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
