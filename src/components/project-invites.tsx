import { useState } from "react";
import { Check, HardHat, X } from "lucide-react";
import { useAcceptProjectInvite, useMyProjectInvites } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ProjectInvitesButton() {
  const { data: invites = [] } = useMyProjectInvites();
  const [open, setOpen] = useState(false);
  const count = invites.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="relative" aria-label="Invitations de chantier">
          <HardHat className="size-4" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {count}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitations de chantier</DialogTitle>
          <DialogDescription>
            Des collaborateurs vous ont invité à rejoindre leurs chantiers. Acceptez pour y accéder.
          </DialogDescription>
        </DialogHeader>
        <InvitesList />
      </DialogContent>
    </Dialog>
  );
}

function InvitesList() {
  const { data: invites = [] } = useMyProjectInvites();
  const accept = useAcceptProjectInvite();

  async function handleAccept(id: string) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await accept.mutateAsync({ id, userId: data.user.id });
  }

  if (invites.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune invitation en attente.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {invites.map((inv) => (
        <li key={inv.id} className="flex items-center gap-3 px-4 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <HardHat className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{inv.profile_full_name ?? "Chantier"}</p>
            <p className="text-xs text-muted-foreground">Rôle : éditeur</p>
          </div>
          <Button size="sm" onClick={() => handleAccept(inv.id)} disabled={accept.isPending}>
            <Check className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" aria-label="Ignorer">
            <X className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
