import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, BellRing, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { createSiteNotification } from "@/lib/push-notifications";
import { toast } from "sonner";

interface PushNotificationsToggleProps {
  projectName?: string;
}

export function PushNotificationsToggle({
  projectName = "Mon Chantier",
}: PushNotificationsToggleProps) {
  const [permission, setPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.info("Les notifications Push ne sont pas supportées par votre navigateur.");
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted") {
        toast.success("Notifications push PWA activées pour ce chantier !");
        const notif = createSiteNotification("sechage_dalle", projectName);
        new Notification(notif.title, {
          body: notif.body,
          icon: "/favicon.ico",
        });
      } else {
        toast.info("Autorisation de notification refusée.");
      }
    } catch {
      toast.error("Erreur lors de l'activation des notifications.");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnablePush}
      className={`gap-1.5 text-xs font-medium ${
        permission === "granted"
          ? "border-emerald-500/40 text-emerald-700 hover:border-emerald-500"
          : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
      }`}
    >
      {permission === "granted" ? (
        <>
          <BellRing className="h-3.5 w-3.5 text-emerald-600" /> Push Activées
        </>
      ) : (
        <>
          <Bell className="h-3.5 w-3.5 text-primary" /> Activer Push PWA
        </>
      )}
    </Button>
  );
}
