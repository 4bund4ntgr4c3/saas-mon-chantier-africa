import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Hammer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { enterGuestMode } from "@/lib/guest-mode";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/roles";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Connexion — BâtiBénin, suivi de chantier au Bénin" },
      {
        name: "description",
        content:
          "Connectez-vous à BâtiBénin pour suivre le budget, les dépenses et les paiements de votre chantier en FCFA.",
      },
      { property: "og:title", content: "Connexion — BâtiBénin" },
      {
        property: "og:description",
        content: "Accédez à votre suivi de construction au Bénin en FCFA.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("particulier");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/tableau-de-bord" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/tableau-de-bord" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, account_type: accountType },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) setPendingConfirm(true);
  }

  async function forgotPassword() {
    if (!email) {
      toast.error("Saisissez d'abord votre email.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Lien de réinitialisation envoyé par email.");
  }

  function tryDemo() {
    enterGuestMode();
    navigate({ to: "/tableau-de-bord" });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Connexion Google impossible pour le moment.");
  }

  return (
    <div className="grid-lines flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="panel w-full max-w-md p-7">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Hammer className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold">BâtiBénin</h1>
            <p className="text-xs text-muted-foreground">Suivi de chantier en FCFA</p>
          </div>
        </div>

        {pendingConfirm ? (
          <div className="rounded-md border border-border bg-secondary/40 p-4 text-sm">
            Vérifiez votre boîte mail : un lien de confirmation vous a été envoyé à{" "}
            <span className="text-primary">{email}</span>. Cliquez dessus pour activer votre
            compte.
          </div>
        ) : (
          <Tabs defaultValue="signin">
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form className="space-y-4" onSubmit={signIn}>
                <div>
                  <Label htmlFor="email" className="mb-1.5 block text-xs text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pwd" className="mb-1.5 block text-xs text-muted-foreground">
                    Mot de passe
                  </Label>
                  <Input
                    id="pwd"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Se connecter
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-xs text-muted-foreground hover:text-primary"
                  onClick={forgotPassword}
                >
                  Mot de passe oublié ?
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={signUp}>
                <div>
                  <Label htmlFor="name" className="mb-1.5 block text-xs text-muted-foreground">
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    Je suis…
                  </Label>
                  <Select
                    value={accountType}
                    onValueChange={(v) => setAccountType(v as AccountType)}
                  >
                    <SelectTrigger>
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
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {ACCOUNT_TYPES.find((t) => t.value === accountType)?.description}
                  </p>
                </div>
                <div>
                  <Label htmlFor="email2" className="mb-1.5 block text-xs text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pwd2" className="mb-1.5 block text-xs text-muted-foreground">
                    Mot de passe
                  </Label>
                  <Input
                    id="pwd2"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="secondary" className="w-full" onClick={google}>
          Continuer avec Google
        </Button>
        <Button variant="outline" className="mt-3 w-full" onClick={tryDemo}>
          Explorer la démo sans compte
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Données d'exemple, aucune inscription requise.
        </p>
      </div>
    </div>
  );
}
