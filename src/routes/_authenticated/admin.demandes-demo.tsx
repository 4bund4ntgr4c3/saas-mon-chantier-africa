import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, Phone, ShieldAlert, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { frDate } from "@/lib/format";
import {
  useDeleteDemoRequest,
  useDemoRequests,
  useIsAdmin,
  useUpdateDemoRequest,
  type DemoRequest,
  type DemoRequestStatus,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin/demandes-demo")({
  head: () => ({
    meta: [
      { title: "Demandes de démo — Administration BâtiBénin" },
      {
        name: "description",
        content:
          "Espace administrateur pour consulter, qualifier et gérer les demandes de démonstration reçues.",
      },
      { property: "og:title", content: "Demandes de démo — Administration BâtiBénin" },
      {
        property: "og:description",
        content: "Suivi des prospects ayant demandé une démonstration de BâtiBénin.",
      },
    ],
  }),
  component: AdminDemoRequestsPage,
});

const STATUSES: { value: DemoRequestStatus; label: string }[] = [
  { value: "nouveau", label: "Nouveau" },
  { value: "contacte", label: "Contacté" },
  { value: "planifie", label: "Démo planifiée" },
  { value: "traite", label: "Traité" },
  { value: "archive", label: "Archivé" },
];

const STATUS_STYLE: Record<DemoRequestStatus, string> = {
  nouveau: "border-primary/40 bg-primary/10 text-primary",
  contacte: "border-accent/40 bg-accent/10 text-accent-foreground",
  planifie: "border-border bg-secondary text-foreground",
  traite: "border-border bg-secondary text-muted-foreground",
  archive: "border-border bg-muted text-muted-foreground",
};

function AdminDemoRequestsPage() {
  const { data: isAdmin, isPending: checkingRole } = useIsAdmin();
  const { data: requests = [], isPending } = useDemoRequests();
  const update = useUpdateDemoRequest();
  const remove = useDeleteDemoRequest();
  const [filter, setFilter] = useState<DemoRequestStatus | "tous">("tous");

  const visible = useMemo(
    () => (filter === "tous" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => map.set(r.status, (map.get(r.status) ?? 0) + 1));
    return map;
  }, [requests]);

  if (checkingRole) {
    return <div className="panel p-10 text-center text-sm text-muted-foreground">Vérification des droits…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="panel grid place-items-center px-6 py-16 text-center">
        <ShieldAlert className="mb-3 size-8 text-primary" />
        <h1 className="font-display text-lg font-semibold">Accès réservé aux administrateurs</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Votre compte n'a pas le rôle administrateur nécessaire pour consulter les demandes de
          démonstration.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Demandes de démo"
        subtitle={`${requests.length} demande(s) — ${counts.get("nouveau") ?? 0} nouvelle(s)`}
        action={
          <Select value={filter} onValueChange={(v) => setFilter(v as DemoRequestStatus | "tous")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les statuts</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label} ({counts.get(s.value) ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isPending ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">Chargement…</div>
      ) : visible.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">
          Aucune demande de démonstration pour ce filtre.
        </div>
      ) : (
        <div className="grid gap-4">
          {visible.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={(status) => update.mutate({ id: request.id, values: { status } })}
              onNotesSave={(admin_notes) => update.mutate({ id: request.id, values: { admin_notes } })}
              onDelete={() => remove.mutate(request.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function RequestCard({
  request,
  onStatusChange,
  onNotesSave,
  onDelete,
}: {
  request: DemoRequest;
  onStatusChange: (status: DemoRequestStatus) => void;
  onNotesSave: (notes: string | null) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(request.admin_notes ?? "");
  const dirty = notes !== (request.admin_notes ?? "");

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold">{request.full_name}</h2>
          <p className="text-sm text-muted-foreground">
            {request.company || "Entreprise non précisée"} · reçue le {frDate(request.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={STATUS_STYLE[request.status]}>
            {STATUSES.find((s) => s.value === request.status)?.label ?? request.status}
          </Badge>
          <Select value={request.status} onValueChange={(v) => onStatusChange(v as DemoRequestStatus)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Supprimer la demande">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
                <AlertDialogDescription>
                  La demande de {request.full_name} sera définitivement supprimée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <a className="flex items-center gap-2 text-primary hover:underline" href={`mailto:${request.email}`}>
          <Mail className="size-4" /> {request.email}
        </a>
        {request.phone && (
          <a className="flex items-center gap-2 text-primary hover:underline" href={`tel:${request.phone}`}>
            <Phone className="size-4" /> {request.phone}
          </a>
        )}
      </div>

      {request.message && (
        <p className="mt-3 rounded-md bg-secondary/60 p-3 text-sm text-muted-foreground">
          {request.message}
        </p>
      )}

      <div className="mt-4">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Notes internes
        </label>
        <Textarea
          className="mt-1"
          rows={2}
          value={notes}
          placeholder="Suivi commercial, date de rappel…"
          onChange={(e) => setNotes(e.target.value)}
        />
        {dirty && (
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => onNotesSave(notes.trim() || null)}>
              Enregistrer la note
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNotes(request.admin_notes ?? "")}>
              Annuler
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
