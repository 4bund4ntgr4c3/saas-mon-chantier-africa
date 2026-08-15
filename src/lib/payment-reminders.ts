/**
 * Module de calcul et génération de relances automatisées pour factures et acomptes impayés.
 */

import { fcfa } from "./format";

export type ReminderStatus = "upcoming" | "due_today" | "overdue";

export interface InvoiceReminder {
  invoiceId: string;
  invoiceTitle: string;
  clientName: string;
  clientPhone?: string | null;
  amountDueFcfa: number;
  dueDate: string;
  daysDifference: number; // >0 si retard, <0 si avant échéance, 0 si aujourd'hui
  status: ReminderStatus;
  suggestedMessage: string;
}

export function evaluateInvoiceReminder(
  invoiceId: string,
  invoiceTitle: string,
  clientName: string,
  amountDue: number,
  dueDateStr: string,
  todayStr: string = new Date().toISOString().slice(0, 10),
  momoNumber: string = "+229 97 00 00 00",
  clientPhone?: string | null,
): InvoiceReminder {
  const due = new Date(dueDateStr);
  const today = new Date(todayStr);
  const diffTime = today.getTime() - due.getTime();
  const daysDifference = Math.round(diffTime / (1000 * 3600 * 24));

  let status: ReminderStatus = "upcoming";
  if (daysDifference === 0) {
    status = "due_today";
  } else if (daysDifference > 0) {
    status = "overdue";
  }

  let suggestedMessage = "";
  if (status === "upcoming") {
    suggestedMessage = `Bonjour ${clientName},\n\nRappel amical : la facture *${invoiceTitle}* d'un montant de *${fcfa(amountDue)}* arrive à échéance le *${dueDateStr}*.\n\nPaiement Mobile Money disponible au *${momoNumber}*.\nMerci pour votre confiance.`;
  } else if (status === "due_today") {
    suggestedMessage = `Bonjour ${clientName},\n\nVotre facture *${invoiceTitle}* d'un montant de *${fcfa(amountDue)}* arrive à échéance aujourd'hui.\n\nMerci de bien vouloir effectuer le règlement par Mobile Money au *${momoNumber}*.\nBâtiBénin — Suivi de chantier.`;
  } else {
    suggestedMessage = `⚠️ *RELANCE DE PAIEMENT — RETARD DE ${daysDifference} JOUR(S)*\n\nBonjour ${clientName},\n\nSauf erreur de notre part, la facture *${invoiceTitle}* (${fcfa(amountDue)}) échue le *${dueDateStr}* est toujours en attente de règlement.\n\nMerci de régulariser par Mobile Money au *${momoNumber}* afin de maintenir le planning du chantier.`;
  }

  return {
    invoiceId,
    invoiceTitle,
    clientName,
    clientPhone: clientPhone ?? null,
    amountDueFcfa: amountDue,
    dueDate: dueDateStr,
    daysDifference,
    status,
    suggestedMessage,
  };
}
