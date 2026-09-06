import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { FeatureGate } from "@/components/feature-gate";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { RebarInspectionDialog } from "@/components/rebar-inspection-dialog";
import { LightningGroundingDialog } from "@/components/lightning-grounding-dialog";
import { FireSafetyDialog } from "@/components/fire-safety-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentProject } from "@/context/project-context";
import { useAuditLogs } from "@/lib/data";
import { fcfa } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Journal d'audit — BâtiBénin" },
      {
        name: "description",
        content:
          "Traçabilité des actions sensibles de votre chantier : changements de budget, suppressions et mises à jour de paiements.",
      },
      { property: "og:title", content: "Journal d'audit — BâtiBénin" },
      {
        property: "og:description",
        content: "Qui a modifié quoi, quand : historique complet des actions sensibles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <FeatureGate feature="audit">
      <AuditPage />
    </FeatureGate>
  ),
});

const ACTION_LABEL: Record<string, string> = {
  creation: "Création",
  modification: "Modification",
  suppression: "Suppression",
};

const ENTITY_LABEL: Record<string, string> = {
  budget: "Budget",
  paiement: "Paiement",
  depense: "Dépense",
  devis: "Devis",
  journal: "Journal de chantier",
  projet: "Projet",
  fournisseur: "Fournisseur",
  entreprise: "Entreprise",
};

function dateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditPage() {
  const { project, projectId } = useCurrentProject();
  const { data: logs = [], isPending } = useAuditLogs(projectId);
  const [entity, setEntity] = useState<string>("all");
  const [action, setAction] = useState<string>("all");

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          (entity === "all" || l.entity === entity) && (action === "all" || l.action === action),
      ),
    [logs, entity, action],
  );

  if (!project) return <EmptyProjectNotice />;

  return (
    <>
      <PageHeader
        title="Journal d'audit"
        subtitle={`${filtered.length} action(s) sensible(s) tracée(s) sur ce chantier`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FireSafetyDialog />
            <LightningGroundingDialog />
            <RebarInspectionDialog />
            <Select value={entity} onValueChange={setEntity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modules</SelectItem>
                {Object.entries(ENTITY_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {Object.entries(ACTION_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <p className="mb-5 flex items-start gap-2 rounded-md border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        Chaque changement de budget, chaque paiement créé, modifié ou supprimé et chaque suppression
        d'élément est enregistré automatiquement. Ce journal est en lecture seule et ne peut pas
        être effacé.
      </p>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Élément</th>
              <th className="px-4 py-3 text-right">Avant</th>
              <th className="px-4 py-3 text-right">Après</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isPending ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Chargement…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Aucune action sensible enregistrée pour l'instant.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-secondary/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {dateTime(l.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={l.action === "suppression" ? "destructive" : "outline"}>
                      {ACTION_LABEL[l.action] ?? l.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ENTITY_LABEL[l.entity] ?? l.entity}
                  </td>
                  <td className="px-4 py-3">{l.label ?? "—"}</td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-muted-foreground">
                    {l.amount_before === null ? "—" : fcfa(Number(l.amount_before))}
                  </td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right">
                    {l.amount_after === null ? "—" : fcfa(Number(l.amount_after))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
