import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, FileText, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAllVerificationDocuments,
  useIsAdmin,
  useProfileById,
  useReviewVerificationDocument,
  type VerificationDocument,
} from "@/lib/data";
import { frDate, labelOf, VERIFICATION_DOC_TYPES } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/verifications")({
  head: () => ({
    meta: [
      { title: "Vérifications — Administration BâtiBénin" },
      {
        name: "description",
        content:
          "Validez les documents soumis par les professionnels pour renforcer la confiance sur le marketplace.",
      },
      { property: "og:title", content: "Vérifications — Administration BâtiBénin" },
      {
        property: "og:description",
        content: "Revue et validation des documents des professionnels BâtiBénin.",
      },
    ],
  }),
  component: AdminVerificationsPage,
});

const STATUS_STYLES: Record<string, string> = {
  en_attente: "border-amber-400/40 bg-amber-400/10 text-amber-600",
  approuve: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  rejete: "border-destructive/40 bg-destructive/10 text-destructive",
};

function DocumentCard({
  doc,
  onDecide,
  deciding,
}: {
  doc: VerificationDocument;
  onDecide: (approve: boolean, note: string) => void;
  deciding: boolean;
}) {
  const { data: owner } = useProfileById(doc.user_id);
  const [note, setNote] = useState(doc.admin_note ?? "");

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {labelOf(VERIFICATION_DOC_TYPES, doc.doc_type)}
            <Badge
              variant="outline"
              className={`ml-2 ${STATUS_STYLES[doc.status] ?? "border-border text-muted-foreground"}`}
            >
              {doc.status === "en_attente"
                ? "En attente"
                : doc.status === "approuve"
                  ? "Approuvé"
                  : "Rejeté"}
            </Badge>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {owner?.full_name ?? "Utilisateur inconnu"} · soumis le {frDate(doc.created_at)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{doc.note || "Sans précision"}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={1}
          placeholder="Note de modération (facultatif)"
          className="min-w-52 flex-1"
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={deciding}
          onClick={() => onDecide(false, note.trim())}
        >
          <XCircle className="mr-1 size-4" /> Rejeter
        </Button>
        <Button size="sm" disabled={deciding} onClick={() => onDecide(true, note.trim())}>
          <CheckCircle2 className="mr-1 size-4" /> Approuver
        </Button>
      </div>
    </li>
  );
}

function AdminVerificationsPage() {
  const { data: isAdmin, isPending: checkingRole } = useIsAdmin();
  const { data: docs = [], isPending } = useAllVerificationDocuments();
  const review = useReviewVerificationDocument();
  const [filter, setFilter] = useState<string>("en_attente");

  const visible = useMemo(
    () => (filter === "tous" ? docs : docs.filter((d) => d.status === filter)),
    [docs, filter],
  );
  const pending = docs.filter((d) => d.status === "en_attente").length;

  async function decide(doc: VerificationDocument, approve: boolean, note: string) {
    await review.mutateAsync({ documentId: doc.id, userId: doc.user_id, approve, note });
  }

  if (checkingRole) {
    return (
      <div className="panel p-10 text-center text-sm text-muted-foreground">
        Vérification des droits…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="panel grid place-items-center px-6 py-16 text-center">
        <ShieldCheck className="mb-3 size-8 text-muted-foreground" />
        <h2 className="font-display text-lg font-semibold">Accès réservé aux administrateurs</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Votre compte n'a pas le rôle administrateur nécessaire pour valider les documents.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Vérifications"
        subtitle={`${pending} document(s) en attente de validation`}
      />

      <div className="panel mb-5 flex flex-wrap items-center gap-3 p-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filtre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les documents</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="approuve">Approuvés</SelectItem>
            <SelectItem value="rejete">Rejetés</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          L'approbation met à jour le niveau de confiance du profil ({docs.length} au total).
        </p>
      </div>

      {isPending ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">Chargement…</div>
      ) : visible.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <FileText className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aucun document dans cette catégorie.</p>
        </div>
      ) : (
        <ul className="panel divide-y divide-border">
          {visible.map((d) => (
            <DocumentCard
              key={d.id}
              doc={d}
              deciding={review.isPending}
              onDecide={(approve, note) => {
                void decide(d, approve, note).catch(() => toast.error("Échec de la décision"));
              }}
            />
          ))}
        </ul>
      )}
    </>
  );
}
