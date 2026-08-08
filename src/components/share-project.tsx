import { useState } from "react";
import { Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreateShareLink, useRevokeShareLink } from "@/lib/data";
import type { Project } from "@/lib/data";

/** Partage lecture seule d'un chantier via un lien public /partage/:token. */
export function ShareProjectButton({ project }: { project: Project }) {
  const createShare = useCreateShareLink();
  const revokeShare = useRevokeShareLink();
  const [busy, setBusy] = useState(false);

  const url = project.share_token
    ? `${window.location.origin}/partage/${project.share_token}`
    : null;

  async function copyLink() {
    if (!project.share_token) return;
    await navigator.clipboard.writeText(url ?? "");
    toast.success("Lien copié — partagez-le avec vos clients");
  }

  async function share() {
    setBusy(true);
    try {
      const token = await createShare.mutateAsync(project.id);
      await navigator.clipboard.writeText(`${window.location.origin}/partage/${token}`);
      toast.success("Lien de partage créé et copié");
    } catch {
      // toasts gérés par le hook
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    setBusy(true);
    try {
      await revokeShare.mutateAsync(project.id);
    } finally {
      setBusy(false);
    }
  }

  if (url) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={copyLink} disabled={busy}>
          <Copy className="mr-1.5 size-4" /> Copier le lien
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={revoke}
          disabled={busy}
          title="Rendre le lien inactif"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={share} disabled={busy}>
      <Share2 className="mr-1.5 size-4" /> Partager
    </Button>
  );
}
