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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck2, FileText, Plus, QrCode, ShieldCheck, Trash2 } from "lucide-react";
import {
  calculateEmecefInvoice,
  EmecefInvoiceData,
  EmecefInvoiceItem,
  EmecefInvoiceType,
  TaxGroup,
  AibRate,
} from "@/lib/emecef";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

export function EmecefInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("FAC-2026-0042");
  const [invoiceType, setInvoiceType] = useState<EmecefInvoiceType>("FV");
  const [ifuSeller, setIfuSeller] = useState("3201912345678");
  const [sellerName, setSellerName] = useState("ENTREPRISE BTP & FILS");
  const [buyerName, setBuyerName] = useState("MAÎTRE D'OUVRAGE PARTICULIER");
  const [ifuBuyer, setIfuBuyer] = useState("");
  const [nimMachine, setNimMachine] = useState("MCF-BJ-00918");
  const [aibRate, setAibRate] = useState<number>(0.01);

  const [items, setItems] = useState<EmecefInvoiceItem[]>([
    {
      id: "1",
      name: "Coulage radier & fondations béton",
      quantity: 1,
      unitPriceHt: 2500000,
      taxGroup: "B",
    },
    { id: "2", name: "Livraison ciment CPJ 42.5", quantity: 100, unitPriceHt: 4800, taxGroup: "B" },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("50000");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemTax, setNewItemTax] = useState<TaxGroup>("B");

  const invoiceData: EmecefInvoiceData = {
    invoiceNumber,
    invoiceType,
    ifuSeller,
    sellerName,
    ifuBuyer: ifuBuyer.trim() || null,
    buyerName,
    nimMachine,
    items,
    aibRate: aibRate as AibRate,
    date: new Date().toISOString().slice(0, 10),
  };

  const calc = calculateEmecefInvoice(invoiceData);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || Number(newItemPrice) <= 0) return;

    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        name: newItemName.trim(),
        quantity: Number(newItemQty) || 1,
        unitPriceHt: Number(newItemPrice) || 0,
        taxGroup: newItemTax,
      },
    ]);

    setNewItemName("");
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-blue-600/40 text-blue-600 hover:border-blue-600 font-medium"
        >
          <FileCheck2 className="h-4 w-4 text-blue-600" />
          Facture Normalisée e-MECeF (DGI)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-blue-700 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Éditeur de Facture Normalisée e-MECeF Bénin
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <QrCode className="h-3 w-3 text-blue-600" />
              Certifié DGI
            </Badge>
          </div>
          <DialogDescription>
            Conformité fiscale obligatoire selon le Code Général des Impôts du Bénin (TVA 18%, AIB &
            code sécurité).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* EN-TÊTE FISCALE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <Label className="text-[11px]">N° Facture</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px]">Type</Label>
              <Select
                value={invoiceType}
                onValueChange={(v) => setInvoiceType(v as EmecefInvoiceType)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FV">FV — Vente</SelectItem>
                  <SelectItem value="FA">FA — Avoir</SelectItem>
                  <SelectItem value="EV">EV — Acompte / Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">IFU Émetteur</Label>
              <Input
                value={ifuSeller}
                onChange={(e) => setIfuSeller(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px]">NIM Machine</Label>
              <Input
                value={nimMachine}
                onChange={(e) => setNimMachine(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Nom du client</Label>
              <Input
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px]">IFU Client (facultatif)</Label>
              <Input
                value={ifuBuyer}
                onChange={(e) => setIfuBuyer(e.target.value)}
                placeholder="Pour entreprises"
                className="h-7 text-xs"
              />
            </div>
          </div>

          {/* LIGNES D'ARTICLES */}
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Articles facturés
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.quantity} x {fcfa(item.unitPriceHt)} · Groupe {item.taxGroup} (TVA{" "}
                      {item.taxGroup === "B" ? "18%" : "0%"})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{fcfa(item.quantity * item.unitPriceHt)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AJOUTER LIGNE */}
          <form onSubmit={handleAddItem} className="flex flex-wrap items-end gap-2 border-t pt-2">
            <div className="flex-1 min-w-[120px]">
              <Label className="text-[11px]">Désignation</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Prestation / Matériau"
                className="h-7 text-xs"
              />
            </div>
            <div className="w-16">
              <Label className="text-[11px]">Qté</Label>
              <Input
                type="number"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div className="w-24">
              <Label className="text-[11px]">Prix HT</Label>
              <Input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div className="w-20">
              <Label className="text-[11px]">TVA</Label>
              <Select value={newItemTax} onValueChange={(v) => setNewItemTax(v as TaxGroup)}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">B (18%)</SelectItem>
                  <SelectItem value="A">A (0%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="sm" className="h-7 text-xs gap-1">
              <Plus className="h-3 w-3" /> Ajouter
            </Button>
          </form>

          {/* RÉCAPITULATIF FISCAL & CODE MECeF */}
          <Card className="bg-gradient-to-br from-blue-500/10 via-background to-blue-500/5 border-blue-500/30">
            <CardContent className="p-3 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Total HT</p>
                  <p className="font-bold text-sm">{fcfa(calc.totalHt)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">TVA (18%)</p>
                  <p className="font-bold text-sm text-blue-600">{fcfa(calc.totalTva)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">AIB (1%)</p>
                  <p className="font-bold text-sm text-amber-600">{fcfa(calc.totalAib)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded border border-blue-500">
                  <p className="text-muted-foreground text-[10px]">Net à payer</p>
                  <p className="font-black text-sm text-blue-700 dark:text-blue-400">
                    {fcfa(calc.netToPay)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Signature e-MECeF :{" "}
                  </span>
                  <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600">
                    {calc.securityCodeMceF}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] gap-1"
                  onClick={() => {
                    window.open(calc.qrCodeUrl, "_blank");
                    toast.success("Vérification DGI simulée avec succès !");
                  }}
                >
                  <QrCode className="h-3 w-3" /> Vérifier QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
