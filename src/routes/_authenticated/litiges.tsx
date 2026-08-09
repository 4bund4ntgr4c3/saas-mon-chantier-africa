import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Gavel, Paperclip, Plus, RefreshCcw, ShieldAlert, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { RecordDialog, orNull, toNumber, type Field, type Values } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccess } from "@/lib/roles";
import {
  disputeRef,
  useDecideDispute,
  useDeleteRow,
  useDisputeEvidences,
  useDisputes,
  useMyDisputes,
  useRefunds,
  useSaveRow,
  type Dispute,
} from "@/lib/data";
import {
  DISPUTE_DECISIONS,
  DISPUTE_STATUSES,
  DISPUTE_TYPES,
  fcfa,
  frDate,
  labelOf,
  REFUND_METHODS,
  REFUND_STATUSES,
} from "@/lib/format";

export const Route = createFileRoute("/_authenticated/litiges")({
  head: () => ({
    meta: [
      { title: "Litiges & médiation — BâtiBénin" },
      {
        name: "description",
        content:
          "Ouvrez un litige sur une commande, une prestation ou un paiement, déposez vos preuves et suivez la médiation et le remboursement.",
      },
      { property: "og:title", content: "Litiges & médiation — BâtiBénin" },
      {
        property: "og:description",
        content: "Suivi des litiges et remboursements en toute transparence.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="marketplace">
      <LitigesPage />
    </FeatureGate>
  ),
});

const DISPUTE_FIELDS: Field[] = [
  {
    name: "related_type",
    label: "Type de litige",
    type: "select",
    options: [...DISPUTE_TYPES],
    required: true,
  },
  { name: "subject", label: "Objet du litige", required: true, full: true },
  { name: "description", label: "Description / faits", type: "textarea", full: true },
  { name: "amount", label: "Montant litigieux (FCFA)", type: "number" },
];

const EVIDENCE_FIELDS: Field[] = [
  { name: "note", label: "Preuve (description)", type: "textarea", full: true },
];

const REFUND_FIELDS: Field[] = [
  { name: "amount", label: "Montant (FCFA)", type: "number", required: true },
  {
    name: "method",
    label: "Mode de remboursement",
    type: "select",
    options: [...REFUND_METHODS],
  },
  { name: "reference", label: "Référence opération" },
];

const DECISION_FIELDS: Field[] = [
  {
    name: "decision",
    label: "Décision",
    type: "select",
    options: [...DISPUTE_DECISIONS],
    required: true,
  },
  { name: "decision_note", label: "Motif de la décision", type: "textarea", full: true },
];

type Handlers = {
  saveDispute: ReturnType<typeof useSaveRow>;
  removeDispute: ReturnType<typeof useDeleteRow>;
  addEvidence: ReturnType<typeof useSaveRow>;
  removeEvidence: ReturnType<typeof useDeleteRow>;
  saveRefund: ReturnType<typeof useSaveRow>;
  decide: ReturnType<typeof useSaveRow>;
};

function useHandlers(): Handlers {
  return {
    saveDispute: useSaveRow("disputes", "Litige ouvert"),
    removeDispute: useDeleteRow("disputes"),
    addEvidence: useSaveRow("dispute_evidences", "Preuve ajoutée"),
    removeEvidence: useDeleteRow("dispute_evidences"),
    saveRefund: useSaveRow("refunds", "Remboursement enregistré"),
    decide: useDecideDispute(),
  };
}

function LitigesPage() {
  const { canEdit } = useAccess("marketplace");
  const { data: myDisputes = [] } = useMyDisputes();
  const { data: allDisputes = [] } = useDisputes();
  const h = useHandlers();
  const [tab, setTab] = useState<string>("mes");
  const [ref, setRef] = useState("");

  const openCount = useMemo(
    () => allDisputes.filter((d) => d.status === "ouverte" || d.status === "en_examen").length,
    [allDisputes],
  );

  const filteredAll = useMemo(() => {
    const needle = ref.trim().toLowerCase();
    if (!needle) return allDisputes;
    return allDisputes.filter((d) =>
      [d.ref, d.subject, d.related_type]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(needle)),
    );
  }, [allDisputes, ref]);

  function toPayload(v: Values) {
    const g = (k: string) => v[k] ?? "";
    return {
      ref: disputeRef(),
      subject: g("subject").trim(),
      related_type: orNull(g("related_type")),
      description: orNull(g("description")),
      amount: toNumber(g("amount")) ?? undefined,
      status: "ouverte",
    };
  }

  return (
    <>
      <PageHeader
        title="Litiges & médiation"
        subtitle={`${myDisputes.length} litige(s) ouvert(s) par vous · ${openCount} en cours de médiation`}
        action={
          canEdit ? (
            <RecordDialog
              title="Ouvrir un litige"
              description="Décrivez le problème rencontré : la médiation est gratuite et transparente."
              fields={DISPUTE_FIELDS}
              initial={{ related_type: "commande" }}
              submitLabel="Ouvrir le litige"
              trigger={
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" /> Ouvrir un litige
                </Button>
              }
              onSubmit={(v) => h.saveDispute.mutateAsync({ values: toPayload(v) })}
            />
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList>
          <TabsTrigger value="mes">Mes litiges ({myDisputes.length})</TabsTrigger>
          <TabsTrigger value="tous">Tous les litiges ({allDisputes.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "tous" && (
        <div className="panel mb-5 flex flex-wrap items-center gap-3 p-3">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Rechercher (référence, objet…)"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm sm:w-72"
          />
        </div>
      )}

      <ListDisputes disputes={tab === "mes" ? myDisputes : filteredAll} canEdit={canEdit} h={h} />
    </>
  );
}

function ListDisputes({
  disputes,
  canEdit,
  h,
}: {
  disputes: Dispute[];
  canEdit: boolean;
  h: Handlers;
}) {
  if (disputes.length === 0) {
    return (
      <div className="panel grid place-items-center px-6 py-16 text-center">
        <ShieldAlert className="mb-3 size-8 text-primary" />
        <h2 className="font-display text-lg font-semibold">Aucun litige</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Ouvrez un litige pour résoudre un problème de commande, de prestation ou de paiement grâce
          à la médiation de la plateforme.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {disputes.map((d) => (
        <DisputeCard key={d.id} dispute={d} canEdit={canEdit} h={h} />
      ))}
    </ul>
  );
}

function DisputeCard({ dispute, canEdit, h }: { dispute: Dispute; canEdit: boolean; h: Handlers }) {
  const { data: evidences = [] } = useDisputeEvidences(dispute.id);
  const { data: refunds = [] } = useRefunds(dispute.id);
  const decided = dispute.status === "decide" || dispute.status === "cloture";

  return (
    <li className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-display text-sm font-semibold">
            <span className="text-xs text-muted-foreground">{dispute.ref}</span>
            {dispute.subject}
            {dispute.related_type && (
              <Badge variant="outline">{labelOf(DISPUTE_TYPES, dispute.related_type)}</Badge>
            )}
            <Badge
              className={
                dispute.status === "decide" || dispute.status === "cloture"
                  ? "bg-success text-success-foreground"
                  : undefined
              }
            >
              {labelOf(DISPUTE_STATUSES, dispute.status)}
            </Badge>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ouvert le {frDate(dispute.created_at)}
            {dispute.amount != null && ` · montant litigieux ${fcfa(Number(dispute.amount))}`}
          </p>
        </div>
        {canEdit && (
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-destructive"
            onClick={() => {
              if (confirm("Supprimer ce litige ?")) h.removeDispute.mutate(dispute.id);
            }}
            title="Supprimer"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>

      {dispute.description && (
        <p className="mt-2 text-sm text-muted-foreground">{dispute.description}</p>
      )}

      {dispute.decision && (
        <div className="mt-3 rounded-md border border-border bg-secondary/30 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-medium">
            <Gavel className="size-4 text-primary" /> Décision de médiation
          </p>
          <p className="mt-1">{labelOf(DISPUTE_DECISIONS, dispute.decision)}</p>
          {dispute.decision_note && (
            <p className="mt-1 text-xs text-muted-foreground">{dispute.decision_note}</p>
          )}
          {dispute.decided_at && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Rendu le {frDate(dispute.decided_at)}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <EvidencePanel
          evidences={evidences}
          canEdit={canEdit}
          onAdd={(v) =>
            h.addEvidence.mutateAsync({
              values: { dispute_id: dispute.id, note: orNull(v["note"] ?? "") },
            })
          }
          onRemove={(e) => {
            if (confirm("Supprimer cette preuve ?")) h.removeEvidence.mutate(e.id);
          }}
        />
        <RefundsPanel
          refunds={refunds}
          canEdit={canEdit}
          onAdd={(v) =>
            h.saveRefund.mutateAsync({
              values: {
                dispute_id: dispute.id,
                amount: toNumber(v["amount"] ?? "") ?? 0,
                method: v["method"] ?? "mobile_money",
                reference: orNull(v["reference"] ?? ""),
              },
            })
          }
          defaultAmount={dispute.amount != null ? String(dispute.amount) : ""}
        />
      </div>

      {canEdit && !decided && (
        <div className="mt-3 border-t border-border pt-3">
          <RecordDialog
            title={`Décision de médiation — ${dispute.ref}`}
            description="La décision sera visible par toutes les parties."
            fields={DECISION_FIELDS}
            initial={{ decision: "partiel" }}
            submitLabel="Rendre la décision"
            trigger={
              <Button size="sm" variant="default">
                <Gavel className="mr-1.5 size-4" /> Rendre une décision
              </Button>
            }
            onSubmit={(v) =>
              h.decide.mutateAsync({
                id: dispute.id,
                values: {
                  status: "decide",
                  decision: v["decision"] ?? "partiel",
                  decision_note: orNull(v["decision_note"] ?? ""),
                },
              })
            }
          />
        </div>
      )}
    </li>
  );
}

function EvidencePanel({
  evidences,
  canEdit,
  onAdd,
  onRemove,
}: {
  evidences: { id: string; note: string | null; file_path: string | null }[];
  canEdit: boolean;
  onAdd: (v: Values) => Promise<void>;
  onRemove: (e: { id: string }) => void;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Paperclip className="size-3.5" /> Preuves ({evidences.length})
      </p>
      {evidences.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune preuve déposée.</p>
      ) : (
        <ul className="space-y-1.5">
          {evidences.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-2 rounded-md bg-secondary/30 p-2 text-sm"
            >
              <span>
                {e.note || "Pièce jointe"}
                {e.file_path && (
                  <span className="block text-[10px] text-muted-foreground">{e.file_path}</span>
                )}
              </span>
              {canEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6 shrink-0 text-destructive"
                  onClick={() => onRemove(e)}
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canEdit && (
        <RecordDialog
          title="Ajouter une preuve"
          fields={EVIDENCE_FIELDS}
          submitLabel="Déposer"
          trigger={
            <Button size="sm" variant="secondary" className="mt-2">
              <Plus className="size-4" /> Déposer une preuve
            </Button>
          }
          onSubmit={onAdd}
        />
      )}
    </div>
  );
}

function RefundsPanel({
  refunds,
  canEdit,
  onAdd,
  defaultAmount,
}: {
  refunds: { id: string; amount: number; method: string; status: string }[];
  canEdit: boolean;
  onAdd: (v: Values) => Promise<void>;
  defaultAmount: string;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <RefreshCcw className="size-3.5" /> Remboursements ({refunds.length})
      </p>
      {refunds.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun remboursement émis.</p>
      ) : (
        <ul className="space-y-1.5">
          {refunds.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-md bg-secondary/30 p-2 text-sm"
            >
              <span>
                <span className="num font-medium text-primary">{fcfa(Number(r.amount))}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {labelOf(REFUND_METHODS, r.method)}
                </span>
              </span>
              <Badge variant="outline">{labelOf(REFUND_STATUSES, r.status)}</Badge>
            </li>
          ))}
        </ul>
      )}
      {canEdit && (
        <RecordDialog
          title="Émettre un remboursement"
          fields={REFUND_FIELDS}
          initial={{ amount: defaultAmount, method: "mobile_money" }}
          submitLabel="Enregistrer"
          trigger={
            <Button size="sm" variant="secondary" className="mt-2">
              <Plus className="size-4" /> Émettre un remboursement
            </Button>
          }
          onSubmit={onAdd}
        />
      )}
    </div>
  );
}
