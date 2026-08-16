import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DetailField = {
  label: string;
  value: ReactNode;
  /** Étale le champ sur toute la largeur (ex. notes, adresses). */
  full?: boolean;
};

/**
 * Pop-up de détail générique : titre + badge + grille de champs libellé/valeur.
 * Utilisé par les listes cliquables (paiements, matériaux, documents…).
 */
export function EntityDetailDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  badge,
  fields,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  fields: DetailField[];
  /** Contenu libre supplémentaire (listes liées, barres de progression…). */
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 font-display">
            {title}
            {badge != null && <Badge variant="outline">{badge}</Badge>}
          </DialogTitle>
          {subtitle != null && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        {fields.length > 0 && (
          <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {fields.map((f) => (
              <div key={f.label} className={f.full ? "col-span-2 sm:col-span-3" : undefined}>
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {children}

        {footer && <div className="flex flex-wrap gap-2 border-t border-border pt-4">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}

/** Ouvre le détail sauf si le clic a ciblé un contrôle interactif interne. */
export function openDetailUnlessInteractive(e: React.MouseEvent, open: () => void) {
  if ((e.target as HTMLElement).closest("button, a, input, select, textarea, [role=button]"))
    return;
  open();
}
