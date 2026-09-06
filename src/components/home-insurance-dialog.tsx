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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ShieldCheck, Sparkles, Umbrella, Zap } from "lucide-react";
import { calculateHomeInsuranceQuote, HomeInsuranceInputs } from "@/lib/home-insurance";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface HomeInsuranceDialogProps {
  defaultPropertyValue?: number;
}

export function HomeInsuranceDialog({ defaultPropertyValue = 35000000 }: HomeInsuranceDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<HomeInsuranceInputs>({
    propertyValueFcfa: defaultPropertyValue,
    contentsValueFcfa: 8000000,
    includeFloodAndWaterDamage: true,
    includeElectricalSurgeProtection: true,
  });

  const quote = calculateHomeInsuranceQuote(inputs);

  const handleSubscribe = () => {
    toast.success(
      "Demande d'attestation d'assurance habitation transmise à l'assureur partenaire !",
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-teal-600/40 text-teal-700 hover:border-teal-600 font-medium"
        >
          <Home className="h-4 w-4 text-teal-600" />
          Assurance MRH Habitation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Home className="h-5 w-5 text-teal-600" />
              Assurance Multirisque Habitation & Protection Patrimoine
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-teal-600" />
              Sérénité
            </Badge>
          </div>
          <DialogDescription>
            Protégez votre bien contre les inondations, incendies, surtensions SBEE et engagez la
            responsabilité civile de la famille.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* VALEURS DÉCLARÉES */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Valeur du bâtiment (FCFA)</Label>
              <Input
                type="number"
                step={500000}
                value={inputs.propertyValueFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, propertyValueFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Valeur du mobilier & électroménager (FCFA)</Label>
              <Input
                type="number"
                step={500000}
                value={inputs.contentsValueFcfa}
                onChange={(e) =>
                  setInputs({ ...inputs, contentsValueFcfa: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          {/* GARANTIES COMPLÉMENTAIRES */}
          <div className="space-y-2 border-y py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Garantie Inondation & Dégâts des eaux
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Couvre les crues et remontées de nappe phréatique (Cotonou / Calavi)
                </p>
              </div>
              <Switch
                checked={inputs.includeFloodAndWaterDamage}
                onCheckedChange={(c) => setInputs({ ...inputs, includeFloodAndWaterDamage: c })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Garantie Dommages Électriques & Surtensions SBEE
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Indemnisation des climatiseurs, téléviseurs et pompes de forage foudroyés
                </p>
              </div>
              <Switch
                checked={inputs.includeElectricalSurgeProtection}
                onCheckedChange={(c) =>
                  setInputs({ ...inputs, includeElectricalSurgeProtection: c })
                }
              />
            </div>
          </div>

          {/* RÉSULTAT DU DEVIS */}
          <Card className="bg-gradient-to-br from-teal-500/10 via-background to-teal-500/5 border-teal-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-end border-b pb-2">
                <div>
                  <span className="text-[10px] text-muted-foreground">
                    Prime annuelle totale TTC
                  </span>
                  <div className="text-2xl font-black text-teal-700 dark:text-teal-400">
                    {fcfa(quote.totalAnnualPremiumFcfa)} / an
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground">Équivalent mensuel</span>
                  <p className="text-sm font-bold text-foreground">
                    {fcfa(quote.monthlyEquivalentFcfa)} / mois
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                <div>
                  Base Incendie & RC :{" "}
                  <strong className="text-foreground">{fcfa(quote.baseAnnualPremiumFcfa)}</strong>
                </div>
                <div>
                  Option Inondations :{" "}
                  <strong className="text-foreground">{fcfa(quote.floodCoverageFcfa)}</strong>
                </div>
                <div>
                  Option Surtensions :{" "}
                  <strong className="text-foreground">{fcfa(quote.electricalSurgeFcfa)}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2 border-t">
            <Button
              size="sm"
              onClick={handleSubscribe}
              className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Souscrire en ligne
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
