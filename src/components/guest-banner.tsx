import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exitGuestMode } from "@/lib/guest-mode";

export function GuestBanner() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function leave() {
    await qc.cancelQueries();
    exitGuestMode();
    qc.clear();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/30 bg-primary/10 px-4 py-2 text-sm md:px-8">
      <p className="flex items-center gap-2 text-foreground">
        <Eye className="size-4 text-primary" />
        <span>
          <strong className="font-medium">Aperçu invité</strong> — données d'exemple, rien n'est
          enregistré.
        </span>
      </p>
      <Button size="sm" onClick={leave}>
        Créer un compte
      </Button>
    </div>
  );
}
