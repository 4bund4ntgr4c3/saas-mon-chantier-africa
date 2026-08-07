import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { accountTypeLabel, useAccess, type Feature } from "@/lib/roles";

/** Masque un module quand le type de compte n'y a pas accès. */
export function FeatureGate({
  feature,
  children,
}: {
  feature: Feature;
  children: ReactNode;
}) {
  const { canView, isLoading, type } = useAccess(feature);

  if (isLoading) return null;
  if (canView) return <>{children}</>;

  return (
    <div className="panel grid place-items-center px-6 py-16 text-center">
      <Lock className="mb-3 size-8 text-muted-foreground" />
      <h2 className="font-display text-lg font-semibold">Module non disponible</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Ce module n'est pas inclus dans les comptes « {accountTypeLabel(type)} ». Vous pouvez
        changer de type de compte dans les paramètres.
      </p>
      <Button asChild className="mt-5" variant="secondary">
        <Link to="/parametres">Ouvrir les paramètres</Link>
      </Button>
    </div>
  );
}

/** Bandeau discret pour les modules en consultation seule. */
export function ReadOnlyNotice({ feature }: { feature: Feature }) {
  const { access, type } = useAccess(feature);
  if (access !== "read") return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
      <Lock className="size-3.5" />
      Consultation seule pour les comptes « {accountTypeLabel(type)} ».
    </div>
  );
}
