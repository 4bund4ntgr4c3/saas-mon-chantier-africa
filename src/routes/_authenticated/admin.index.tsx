import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Building2,
  Handshake,
  HardHat,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAdminStats, useIsAdmin } from "@/lib/data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [{ title: "Administration — BâtiBénin" }],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { data: isAdmin, isPending: checkingRole } = useIsAdmin();
  const { data: stats } = useAdminStats();

  if (checkingRole) {
    return <div className="panel p-10 text-center text-sm text-muted-foreground">Chargement…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="panel grid place-items-center px-6 py-16 text-center">
        <ShieldCheck className="mb-3 size-8 text-muted-foreground" />
        <h2 className="font-display text-lg font-semibold">Accès réservé aux administrateurs</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Votre compte n'a pas le rôle administrateur nécessaire pour accéder au back-office.
        </p>
      </div>
    );
  }

  const cards = [
    { label: "Utilisateurs", value: stats?.users ?? 0, icon: Users, to: "/admin/utilisateurs" },
    { label: "Chantiers", value: stats?.projects ?? 0, icon: HardHat, to: "/admin/demandes-demo" },
    { label: "Boutiques", value: stats?.stores ?? 0, icon: Building2, to: "/admin/demandes-demo" },
    { label: "Commandes", value: stats?.orders ?? 0, icon: Receipt, to: "/admin/demandes-demo" },
    {
      label: "Prestataires",
      value: stats?.providers ?? 0,
      icon: Handshake,
      to: "/admin/demandes-demo",
    },
    {
      label: "Réserves",
      value: stats?.reserves ?? 0,
      icon: AlertTriangle,
      to: "/admin/demandes-demo",
    },
  ];

  return (
    <>
      <PageHeader title="Administration" subtitle="Vue d'ensemble de la plateforme BâtiBénin" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="panel group p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <c.icon className="size-5 text-primary/70" />
            </div>
            <p className="num mt-2 text-2xl font-semibold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-display text-base font-semibold">Comptes utilisateurs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez les comptes, modifiez le type de compte ou accordez le rôle administrateur.
          </p>
          <Button asChild className="mt-4">
            <Link to="/admin/utilisateurs">Gérer les utilisateurs</Link>
          </Button>
        </div>
        <div className="panel p-5">
          <h2 className="font-display text-base font-semibold">Demandes de démonstration</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Qualifiez et suivez les prospects ayant demandé une démo de la plateforme.
          </p>
          <Button asChild className="mt-4" variant="secondary">
            <Link to="/admin/demandes-demo">Ouvrir les demandes</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
