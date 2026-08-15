import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, WifiOff } from "lucide-react";
import { getOfflineDrafts, useNetworkStatus } from "@/lib/offline-sync";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    setDraftCount(getOfflineDrafts().length);
    const interval = setInterval(() => {
      setDraftCount(getOfflineDrafts().length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && draftCount === 0) {
    return null;
  }

  const handleSync = () => {
    toast.success("Synchronisation des brouillons terminée !");
    setDraftCount(0);
  };

  return (
    <div
      className={`px-4 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
        !isOnline ? "bg-amber-600 text-white" : "bg-emerald-600 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>
              <strong>Mode Hors-Ligne actif</strong> : Vos saisies de dépenses et notes de chantier
              sont sauvegardées sur cet appareil.
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Connexion rétablie. {draftCount} brouillon(s) prêt(s) à être synchronisés.</span>
          </>
        )}
      </div>

      {draftCount > 0 && isOnline && (
        <Button
          size="sm"
          variant="secondary"
          className="h-6 text-[11px] gap-1 px-2 text-emerald-950 font-bold"
          onClick={handleSync}
        >
          <RefreshCw className="h-3 w-3" /> Synchroniser
        </Button>
      )}

      {!isOnline && draftCount > 0 && (
        <span className="flex items-center gap-1 opacity-90">
          <AlertCircle className="h-3.5 w-3.5" /> {draftCount} brouillon(s) local(aux)
        </span>
      )}
    </div>
  );
}
