import { useRef, useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eraser, FileCheck, PenTool, ShieldCheck, Sparkles } from "lucide-react";
import { createSignatureMetadata, SignatureMetadata } from "@/lib/signature";
import { frDate } from "@/lib/format";
import { toast } from "sonner";

interface SignaturePadDialogProps {
  documentTitle?: string;
  defaultSignerName?: string;
  onSigned?: (metadata: SignatureMetadata) => void;
}

export function SignaturePadDialog({
  documentTitle = "Devis / PV de Réception",
  defaultSignerName = "Client / Maître d'Ouvrage",
  onSigned,
}: SignaturePadDialogProps) {
  const [open, setOpen] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [signerRole, setSignerRole] = useState<"client" | "artisan" | "architecte" | "controleur">(
    "client",
  );
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }, 100);
    return () => clearTimeout(timer);
  }, [open]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0]!.clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0]!.clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0]!.clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0]!.clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmSignature = () => {
    if (!hasDrawn) {
      toast.error("Veuillez apposer votre signature sur le cadre avant de valider.");
      return;
    }
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL("image/png") : null;
    const metadata = createSignatureMetadata(signerName, signerRole, documentTitle, dataUrl);

    if (onSigned) {
      onSigned(metadata);
    }

    toast.success(`Document signé électroniquement et horodaté (${metadata.hash}) !`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-600/40 text-emerald-700 hover:border-emerald-600 font-medium"
        >
          <PenTool className="h-4 w-4 text-emerald-600" />
          Signer sur écran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <PenTool className="h-5 w-5 text-emerald-600" />
              Signature Électronique Tactile
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Horodaté
            </Badge>
          </div>
          <DialogDescription>
            Apposez votre signature au doigt ou au stylet pour valider{" "}
            <strong>{documentTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Nom complet du signataire</Label>
              <Input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Qualité / Rôle</Label>
              <Select
                value={signerRole}
                onValueChange={(v) =>
                  setSignerRole(v as "client" | "artisan" | "architecte" | "controleur")
                }
              >
                <SelectTrigger className="h-7 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client / Maître d'Ouvrage</SelectItem>
                  <SelectItem value="artisan">Artisan / Entrepreneur</SelectItem>
                  <SelectItem value="architecte">Architecte / Maître d'Œuvre</SelectItem>
                  <SelectItem value="controleur">Bureau de Contrôle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ZONE DE DESSIN CANVAS */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>Signez dans le cadre ci-dessous :</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2 text-[10px] gap-1 text-destructive"
              >
                <Eraser className="h-3 w-3" /> Effacer
              </Button>
            </div>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center touch-none">
              <canvas
                ref={canvasRef}
                width={380}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair w-full h-40 bg-transparent"
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Mention légale : « Lu et approuvé, bon pour accord valant signature contractuelle »
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              size="sm"
              onClick={handleConfirmSignature}
              className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valider la signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
