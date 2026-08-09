import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Shield, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminUsers, useIsAdmin, useSetAccountType, useToggleAdmin } from "@/lib/data";
import { ACCOUNT_TYPES } from "@/lib/roles";
import { frDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/utilisateurs")({
  head: () => ({
    meta: [{ title: "Utilisateurs — Administration BâtiBénin" }],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { data: isAdmin, isPending: checkingRole } = useIsAdmin();
  const { data: users = [], isPending } = useAdminUsers();
  const setAccountType = useSetAccountType();
  const toggleAdmin = useToggleAdmin();

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      if (typeFilter !== "all" && u.account_type !== typeFilter) return false;
      if (!needle) return true;
      return [u.full_name, u.phone, u.email]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(needle));
    });
  }, [users, q, typeFilter]);

  if (checkingRole) {
    return <div className="panel p-10 text-center text-sm text-muted-foreground">Chargement…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="panel grid place-items-center px-6 py-16 text-center">
        <ShieldCheck className="mb-3 size-8 text-muted-foreground" />
        <h2 className="font-display text-lg font-semibold">Accès réservé aux administrateurs</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Votre compte n'a pas le rôle administrateur nécessaire pour consulter les utilisateurs.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Utilisateurs" subtitle={`${users.length} compte(s) enregistré(s)`} />

      <div className="panel mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom, téléphone, e-mail…"
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="Type de compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {ACCOUNT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <Users className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aucun utilisateur ne correspond.</p>
        </div>
      ) : (
        <ul className="panel divide-y divide-border">
          {filtered.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {(u.full_name ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {u.full_name ?? "Utilisateur sans nom"}
                  {u.is_admin && (
                    <Badge
                      variant="outline"
                      className="ml-2 border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    >
                      <Shield className="mr-1 size-3" /> Admin
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[u.email, u.phone].filter(Boolean).join(" · ") || "Aucun contact"}
                  {` · inscrit le ${frDate(u.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={u.account_type}
                  onValueChange={(v) => setAccountType.mutate({ userId: u.id, accountType: v })}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant={u.is_admin ? "secondary" : "outline"}
                  disabled={toggleAdmin.isPending}
                  onClick={() => toggleAdmin.mutate({ userId: u.id, makeAdmin: !u.is_admin })}
                >
                  <ShieldCheck className="mr-1.5 size-4" />
                  {u.is_admin ? "Retirer admin" : "Rendre admin"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
