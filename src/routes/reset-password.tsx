import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Hammer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — BâtiBénin" },
      {
        name: "description",
        content:
          "Définissez un nouveau mot de passe pour accéder à votre suivi de chantier BâtiBénin.",
      },
      { property: "og:title", content: "Nouveau mot de passe — BâtiBénin" },
      {
        property: "og:description",
        content: "Réinitialisez le mot de passe de votre compte BâtiBénin.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/tableau-de-bord" });
  }

  return (
    <div className="grid-lines relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="panel w-full max-w-md p-7">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Hammer className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold">Nouveau mot de passe</h1>
            <p className="text-xs text-muted-foreground">Choisissez un mot de passe sûr</p>
          </div>
        </div>

        {!ready ? (
          <p className="rounded-md border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Ouvrez cette page depuis le lien reçu par email pour pouvoir définir un nouveau mot de
            passe.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="p1" className="mb-1.5 block text-xs text-muted-foreground">
                Nouveau mot de passe
              </Label>
              <Input
                id="p1"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="p2" className="mb-1.5 block text-xs text-muted-foreground">
                Confirmer le mot de passe
              </Label>
              <Input
                id="p2"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Enregistrer le mot de passe
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
