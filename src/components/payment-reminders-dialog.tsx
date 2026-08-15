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
import {
  AlertCircle,
  BellRing,
  Check,
  Clock,
  Copy,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { evaluateInvoiceReminder } from "@/lib/payment-reminders";
import { fcfa, frDate } from "@/lib/format";
import { createWhatsAppLink } from "@/lib/whatsapp-templates";
import { toast } from "sonner";

interface PaymentRemindersDialogProps {
  invoices?: {
    id: string;
    title: string;
    amount: number;
    due_date?: string | null;
    status?: string | null;
  }[];
}

export function PaymentRemindersDialog({ invoices = [] }: PaymentRemindersDialogProps) {
  const [open, setOpen] = useState(false);

  // Échantillon par défaut si pas de factures fournies
  const demoInvoices =
    invoices.length > 0
      ? invoices
      : [
          {
            id: "1",
            title: "Facture Acompte Fondations",
            amount: 1500000,
            due_date: "2026-08-05",
            status: "en_attente",
          },
          {
            id: "2",
            title: "Facture Matériaux Ciment & Fer",
            amount: 850000,
            due_date: "2026-08-13",
            status: "en_attente",
          },
          {
            id: "3",
            title: "Facture Pose Toiture Bac Alu",
            amount: 2200000,
            due_date: "2026-08-25",
            status: "en_attente",
          },
        ];

  const evaluatedReminders = demoInvoices.map((inv) =>
    evaluateInvoiceReminder(
      inv.id,
      inv.title,
      "Client Maître d'Ouvrage",
      inv.amount,
      inv.due_date ?? new Date().toISOString().slice(0, 10),
    ),
  );

  const handleSendWhatsApp = (msg: string) => {
    const url = createWhatsAppLink(null, msg);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = (msg: string) => {
    navigator.clipboard.writeText(msg);
    toast.success("Message de relance copié dans le presse-papier !");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-500/40 text-amber-600 hover:border-amber-500 font-medium"
        >
          <BellRing className="h-4 w-4 text-amber-500" />
          Centre de Relances Impayés
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-400">
              <BellRing className="h-5 w-5 text-amber-500" />
              Centre de Relances & Suivi des Impayés
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-500" />
              WhatsApp & Mobile Money
            </Badge>
          </div>
          <DialogDescription>
            Automatisez le suivi des paiements en attente et relancez vos clients en 1 clic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {evaluatedReminders.map((rem) => (
              <div
                key={rem.invoiceId}
                className={`p-3 rounded-lg border space-y-2 ${
                  rem.status === "overdue"
                    ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                    : rem.status === "due_today"
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                      : "bg-card"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {rem.invoiceTitle}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Échéance : <strong>{frDate(rem.dueDate)}</strong> · Montant :{" "}
                      <strong className="text-primary">{fcfa(rem.amountDueFcfa)}</strong>
                    </p>
                  </div>

                  <div>
                    {rem.status === "overdue" && (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <AlertCircle className="h-3 w-3" /> Retard de {rem.daysDifference} jour(s)
                      </Badge>
                    )}
                    {rem.status === "due_today" && (
                      <Badge className="bg-amber-500 text-white gap-1 text-[10px]">
                        <Clock className="h-3 w-3" /> Échéance aujourd'hui
                      </Badge>
                    )}
                    {rem.status === "upcoming" && (
                      <Badge variant="secondary" className="text-[10px]">
                        À venir
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2 rounded border text-[11px] font-mono text-muted-foreground whitespace-pre-wrap">
                  {rem.suggestedMessage}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(rem.suggestedMessage)}
                    className="h-7 text-xs gap-1"
                  >
                    <Copy className="h-3 w-3" /> Copier
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSendWhatsApp(rem.suggestedMessage)}
                    className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <MessageSquare className="h-3 w-3" /> Relancer WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
