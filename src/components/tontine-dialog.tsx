import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake, Package, Plus, Send, Share2, Sparkles, Trophy } from "lucide-react";
import { calculateTontineStats, TontinePot } from "@/lib/tontine";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface TontineDialogProps {
  projectName?: string;
}

export function TontineDialog({ projectName = "Résidence Calavi" }: TontineDialogProps) {
  const [open, setOpen] = useState(false);
  const [pot, setPot] = useState<TontinePot>({
    id: "pot_default",
    projectId: "p1",
    title: "Coulage Dalle & Achat Fers à Béton",
    targetAmount: 800000,
    collectedAmount: 0,
    status: "active",
    contributions: [
      {
        id: "c1",
        contributorName: "Parrain Jean-Luc (Paris)",
        amount: 250000,
        date: "2026-08-10",
        message: "Force pour le chantier !",
      },
      {
        id: "c2",
        contributorName: "Famille Dossou (Cotonou)",
        amount: 150000,
        date: "2026-08-11",
        message: "Que la maison avance bien.",
      },
      {
        id: "c3",
        contributorName: "Ami de promo (Abidjan)",
        amount: 100000,
        date: "2026-08-12",
        message: "Bravo pour le projet !",
      },
    ],
  });

  const [contributorName, setContributorName] = useState("");
  const [contributionAmount, setContributionAmount] = useState("50000");
  const [contributionMsg, setContributionMsg] = useState("");

  const stats = calculateTontineStats(pot);

  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributorName.trim() || Number(contributionAmount) <= 0) return;

    const newContrib = {
      id: `c_${Date.now()}`,
      contributorName: contributorName.trim(),
      amount: Number(contributionAmount),
      date: new Date().toISOString().slice(0, 10),
      message: contributionMsg.trim() || null,
    };

    setPot((prev) => ({
      ...prev,
      contributions: [newContrib, ...prev.contributions],
    }));

    setContributorName("");
    setContributionMsg("");
    toast.success(`Contribution Mobile Money de ${fcfa(Number(contributionAmount))} enregistrée !`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:border-rose-500"
        >
          <HeartHandshake className="h-4 w-4 text-rose-500" />
          Cagnotte & Tontine ({stats.progressPercent}%)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <HeartHandshake className="h-5 w-5 text-rose-500" />
              Cagnotte & Tontine de Chantier
            </DialogTitle>
            <Badge variant="outline" className="border-rose-500/40 text-rose-600">
              {projectName}
            </Badge>
          </div>
          <DialogDescription>
            Mobilisez vos proches, amis et la diaspora pour financer une étape clé de votre
            construction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Card className="bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-rose-950/20 dark:to-orange-950/20 border-rose-200 dark:border-rose-900/40">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                    Objectif : {pot.title}
                  </span>
                  <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                    {fcfa(stats.collected)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      / {fcfa(stats.target)}
                    </span>
                  </div>
                </div>
                <Badge className="bg-rose-600 text-white font-bold text-xs">
                  {stats.progressPercent}% financé
                </Badge>
              </div>

              <Progress
                value={stats.progressPercent}
                className="h-2.5 bg-rose-100 dark:bg-rose-950"
              />

              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>{stats.contributorCount} contribution(s)</span>
                <span>
                  Reste à collecter :{" "}
                  <strong className="text-foreground">{fcfa(stats.remaining)}</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de versement */}
          <form
            onSubmit={handleAddContribution}
            className="border p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Participer à la cagnotte (Mobile Money)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="t-name" className="text-xs">
                  Nom / Donateur
                </Label>
                <Input
                  id="t-name"
                  placeholder="Ex: Tante Jeanne"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="t-amount" className="text-xs">
                  Montant (FCFA)
                </Label>
                <Input
                  id="t-amount"
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="t-msg" className="text-xs">
                Message d'encouragement
              </Label>
              <Input
                id="t-msg"
                placeholder="Ex: Bravo pour la dalle !"
                value={contributionMsg}
                onChange={(e) => setContributionMsg(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="w-full h-8 text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Send className="h-3.5 w-3.5" /> Enregistrer le don Mobile Money
            </Button>
          </form>

          {/* Liste des contributeurs */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Derniers contributeurs
            </h4>
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {pot.contributions.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.contributorName}
                    </span>
                    {c.message && (
                      <p className="text-[11px] text-muted-foreground italic">« {c.message} »</p>
                    )}
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {fcfa(c.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-1/2 text-xs gap-1.5"
              onClick={() => {
                navigator.clipboard?.writeText?.(window.location.href);
                toast.success("Lien de partage WhatsApp copié !");
              }}
            >
              <Share2 className="h-3.5 w-3.5 text-primary" /> Partager (WhatsApp)
            </Button>
            <Button
              size="sm"
              className="w-1/2 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                toast.success(
                  `Bon d'achat de ${fcfa(stats.collected)} généré pour commander les matériaux !`,
                );
                setOpen(false);
              }}
            >
              <Package className="h-3.5 w-3.5" /> Convertir en Matériaux
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
