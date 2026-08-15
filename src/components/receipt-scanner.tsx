import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Receipt, Sparkles, Upload, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParsedReceipt, scanReceiptImage } from "@/lib/ocr-receipt";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

interface ReceiptScannerDialogProps {
  onApplyReceipt?: (parsed: ParsedReceipt) => void;
}

export function ReceiptScannerDialog({ onApplyReceipt }: ReceiptScannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    try {
      const result = await scanReceiptImage(file);
      setParsed(result);
      toast.success("Reçu analysé avec succès par l'IA !");
    } catch {
      toast.error("Erreur lors de l'analyse du reçu.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (parsed && onApplyReceipt) {
      onApplyReceipt(parsed);
      toast.success("Informations appliquées au formulaire de dépense !");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-primary/40 hover:border-primary"
        >
          <Camera className="h-4 w-4 text-primary" />
          Scanner un reçu / facture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Receipt className="h-5 w-5 text-primary" />
            Scanner un reçu ou bon de livraison
          </DialogTitle>
          <DialogDescription>
            Photographiez ou importez une facture de quincaillerie pour remplir automatiquement
            votre dépense.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {!previewUrl && !loading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors space-y-2"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Cliquez pour importer ou photographier</p>
              <p className="text-xs text-muted-foreground">
                Prend en charge tickets de caisse, factures et bordereaux
              </p>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm font-medium flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Extraction IA des montants et matériaux...
              </p>
            </div>
          )}

          {parsed && !loading && (
            <div className="space-y-3">
              <Card className="border-primary/30 bg-slate-50 dark:bg-slate-900">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="secondary" className="mb-1 text-[10px]">
                        Détecté par OCR
                      </Badge>
                      <h4 className="font-bold text-base">{parsed.vendorName}</h4>
                      <p className="text-xs text-muted-foreground">Date : {parsed.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Montant Total</span>
                      <p className="text-lg font-extrabold text-primary">
                        {fcfa(parsed.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {parsed.items.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t text-xs">
                      <p className="font-semibold text-muted-foreground">
                        Articles identifiés ({parsed.items.length}) :
                      </p>
                      <div className="space-y-1">
                        {parsed.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between bg-white dark:bg-slate-800 p-1.5 rounded border"
                          >
                            <span>
                              {it.quantity}x {it.designation}
                            </span>
                            <span className="font-semibold">{fcfa(it.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-1/2 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Scanner un autre
                </Button>
                <Button size="sm" className="w-1/2 gap-1.5 text-xs" onClick={handleApply}>
                  <CheckCircle2 className="h-4 w-4" /> Appliquer à la dépense
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
