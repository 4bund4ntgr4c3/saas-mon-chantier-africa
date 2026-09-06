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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import {
  calculateGroundingResistance,
  GroundingCalculationInputs,
  GroundingGroundType,
} from "@/lib/lightning-grounding";

export function LightningGroundingDialog() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<GroundingCalculationInputs>({
    groundType: "terre_de_barre",
    hasFoundationLoop: true,
    foundationLoopLengthMeters: 40,
    copperRodsCount: 2,
  });

  const res = calculateGroundingResistance(inputs);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-yellow-600/40 text-yellow-700 hover:border-yellow-600 font-medium"
        >
          <Zap className="h-4 w-4 text-yellow-600" />
          Prise de Terre & Foudre
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Zap className="h-5 w-5 text-yellow-600" />
              Dimensionnement Prise de Terre & Protection Foudre
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-yellow-600" />
              Électricité
            </Badge>
          </div>
          <DialogDescription>
            Calculez la résistance de terre théorique (en Ohms) selon la géologie du terrain et
            dimensionnez les parafoudres.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* PARAMÈTRES ÉLECTRIQUES & GÉOLOGIE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Nature du sol (Résistivité)</Label>
              <Select
                value={inputs.groundType}
                onValueChange={(v) =>
                  setInputs({ ...inputs, groundType: v as GroundingGroundType })
                }
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terre_humide" className="text-xs">
                    Terre végétale humide (~60 Ω·m)
                  </SelectItem>
                  <SelectItem value="terre_de_barre" className="text-xs">
                    Terre de barre rouge (~120 Ω·m)
                  </SelectItem>
                  <SelectItem value="sable_sec_littoral" className="text-xs">
                    Sable sec littoral (~300 Ω·m)
                  </SelectItem>
                  <SelectItem value="roche" className="text-xs">
                    Sol rocheux (~800 Ω·m)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Nombre de piquets cuivre (2m)</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={inputs.copperRodsCount}
                onChange={(e) =>
                  setInputs({ ...inputs, copperRodsCount: Number(e.target.value) || 0 })
                }
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg border bg-muted/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">
                  Boucle à fond de fouille (Câble cuivre nu 25mm²)
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Posée sous le béton de propreté sur tout le périmètre
                </p>
              </div>
              <Switch
                checked={inputs.hasFoundationLoop}
                onCheckedChange={(c) => setInputs({ ...inputs, hasFoundationLoop: c })}
              />
            </div>
            {inputs.hasFoundationLoop && (
              <div className="pt-2 border-t flex items-center justify-between">
                <Label className="text-[11px]">Périmètre de la boucle (mètres)</Label>
                <Input
                  type="number"
                  min={10}
                  value={inputs.foundationLoopLengthMeters}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      foundationLoopLengthMeters: Number(e.target.value) || 0,
                    })
                  }
                  className="h-6 w-24 text-xs text-center"
                />
              </div>
            )}
          </div>

          {/* RÉSULTAT RÉSISTANCE DE TERRE */}
          <Card
            className={`border ${res.isCompliantStrict ? "bg-emerald-500/10 border-emerald-500/30" : res.isCompliantStandard ? "bg-amber-500/10 border-amber-500/30" : "bg-rose-500/10 border-rose-500/30"}`}
          >
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Résistance de terre estimée :
                </span>
                <Badge
                  variant="outline"
                  className={
                    res.isCompliantStrict
                      ? "border-emerald-600 text-emerald-700 font-bold"
                      : "border-rose-600 text-rose-700 font-bold"
                  }
                >
                  {res.isCompliantStrict
                    ? "< 10 Ω (Optimal)"
                    : res.isCompliantStandard
                      ? "< 100 Ω (Basique)"
                      : "> 100 Ω (Non Conforme)"}
                </Badge>
              </div>
              <p className="text-2xl font-black text-foreground">
                {res.estimatedResistanceOhms} Ohms (Ω)
              </p>
              <p className="text-[11px] font-medium text-foreground/90">{res.verdict}</p>
            </CardContent>
          </Card>

          {/* RECOMMANDATION PARAFOUDRE */}
          <div className="p-2.5 rounded-lg border bg-card space-y-1.5">
            <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Protection Foudre & Surtensions :
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {res.surgeProtectorAdvice}
            </p>
            <div className="space-y-1 pt-1.5 border-t text-[11px] text-muted-foreground">
              {res.installationChecklist.map((item, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-yellow-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
