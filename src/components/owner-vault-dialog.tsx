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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  FileCheck,
  Landmark,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  getDefaultOwnerVaultDocuments,
  evaluateLandSecurity,
  LandTitleDocument,
} from "@/lib/owner-vault";
import { toast } from "sonner";

interface OwnerVaultDialogProps {
  projectName?: string;
}

export function OwnerVaultDialog({ projectName = "Villa Calavi" }: OwnerVaultDialogProps) {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<LandTitleDocument[]>(getDefaultOwnerVaultDocuments);

  const evaluation = evaluateLandSecurity(documents);

  const toggleDocument = (id: string) => {
    setDocuments((docs) =>
      docs.map((d) => (d.id === id ? { ...d, isUploaded: !d.isUploaded } : d)),
    );
    toast.success("Statut du document foncier mis à jour !");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Coffre-Fort Foncier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Coffre-Fort Foncier & Titres de Propriété — {projectName}
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Patrimoine
            </Badge>
          </div>
          <DialogDescription>
            Sauvegardez et sécurisez vos actes notariés, Titre Foncier (TF) et permis de construire
            pour protéger votre investissement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* INDICE DE SÉCURITÉ */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground">
                  Sécurité Juridique de la Propriété
                </span>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {evaluation.scorePercent} % — {evaluation.securityLevel.toUpperCase()}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{evaluation.advice}</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-emerald-600/60 shrink-0" />
            </CardContent>
          </Card>

          {/* LISTE DES DOCUMENTS */}
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`flex flex-wrap items-center justify-between p-3 rounded-lg border transition-all ${
                  doc.isUploaded
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : doc.isRequired
                      ? "bg-rose-500/5 border-rose-500/20"
                      : "bg-card border-border"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-foreground">{doc.title}</h4>
                    {doc.isRequired && (
                      <Badge
                        variant="outline"
                        className="text-[9px] py-0 h-4 border-rose-400 text-rose-600"
                      >
                        Obligatoire
                      </Badge>
                    )}
                  </div>
                  {doc.documentNumber && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      Réf : {doc.documentNumber}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={doc.isUploaded ? "default" : "outline"}
                    onClick={() => toggleDocument(doc.id)}
                    className={`h-7 text-[11px] gap-1 ${
                      doc.isUploaded ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                    }`}
                  >
                    {doc.isUploaded ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    {doc.isUploaded ? "Archivé ✅" : "Téléverser"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
