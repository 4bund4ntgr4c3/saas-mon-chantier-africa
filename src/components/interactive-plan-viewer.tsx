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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Eye, MapPin, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export interface PlanPin {
  id: string;
  xPercent: number;
  yPercent: number;
  number: number;
  title: string;
  category: "maconnerie" | "electricite" | "plomberie" | "peinture" | "finition" | "autre";
  status: "open" | "resolved";
  comment?: string;
}

interface InteractivePlanViewerProps {
  planTitle?: string;
  planImageUrl?: string;
}

export function InteractivePlanViewerDialog({
  planTitle = "Plan d'Architecte — Rez-de-Chaussée (RDC)",
  planImageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80",
}: InteractivePlanViewerProps) {
  const [open, setOpen] = useState(false);
  const [pins, setPins] = useState<PlanPin[]>([
    {
      id: "p1",
      xPercent: 32,
      yPercent: 45,
      number: 1,
      title: "Prise murale salon manquante",
      category: "electricite",
      status: "open",
      comment: "Emplacement TV non alimenté.",
    },
    {
      id: "p2",
      xPercent: 68,
      yPercent: 30,
      number: 2,
      title: "Écoulement évier cuisine",
      category: "plomberie",
      status: "resolved",
      comment: "Pente vérifiée et corrigée.",
    },
    {
      id: "p3",
      xPercent: 55,
      yPercent: 70,
      number: 3,
      title: "Fissure enduit terrasse",
      category: "maconnerie",
      status: "open",
      comment: "À reprendre avant peinture.",
    },
  ]);

  const [activePin, setActivePin] = useState<PlanPin | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const planContainerRef = useRef<HTMLDivElement>(null);

  const handlePlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMode || !planContainerRef.current) return;

    const rect = planContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const nextNumber = pins.length + 1;
    const newPin: PlanPin = {
      id: `pin_${Date.now()}`,
      xPercent: Number(x.toFixed(1)),
      yPercent: Number(y.toFixed(1)),
      number: nextNumber,
      title: newTitle.trim() || `Réserve #${nextNumber}`,
      category: "maconnerie",
      status: "open",
    };

    setPins((prev) => [...prev, newPin]);
    setActivePin(newPin);
    setIsAddingMode(false);
    setNewTitle("");
    toast.success(`Pastille #${nextNumber} positionnée sur le plan !`);
  };

  const togglePinStatus = (id: string) => {
    setPins((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "open" ? "resolved" : "open" } : p,
      ),
    );
    if (activePin?.id === id) {
      setActivePin((prev) =>
        prev ? { ...prev, status: prev.status === "open" ? "resolved" : "open" } : null,
      );
    }
    toast.success("Statut de la réserve mis à jour");
  };

  const removePin = (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
    if (activePin?.id === id) setActivePin(null);
    toast.info("Pastille supprimée du plan");
  };

  const openCount = pins.filter((p) => p.status === "open").length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-primary/30">
          <MapPin className="h-4 w-4 text-primary" />
          Plan interactif & Pins
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                {planTitle}
              </DialogTitle>
              <DialogDescription>
                Cliquez sur le plan pour poser des pastilles de réserves ou inspecter les points
                existants.
              </DialogDescription>
            </div>
            <Badge variant={openCount > 0 ? "destructive" : "default"} className="text-xs">
              {openCount} réserve(s) ouverte(s)
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isAddingMode ? "destructive" : "default"}
                className="h-8 text-xs gap-1.5"
                onClick={() => setIsAddingMode(!isAddingMode)}
              >
                {isAddingMode ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {isAddingMode ? "Annuler le placement" : "Poser une pastille sur le plan"}
              </Button>
              {isAddingMode && (
                <Input
                  placeholder="Intitulé de la réserve..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-8 text-xs w-48"
                  autoFocus
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {isAddingMode
                ? "👉 Cliquez à l'endroit exact sur le plan"
                : `${pins.length} pastille(s) positionnée(s)`}
            </span>
          </div>

          {/* PLAN VIEWPORT */}
          <div
            ref={planContainerRef}
            onClick={handlePlanClick}
            className={`relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-inner select-none ${
              isAddingMode ? "cursor-crosshair ring-2 ring-primary" : "cursor-default"
            }`}
            style={{ minHeight: "360px" }}
          >
            <img
              src={planImageUrl}
              alt="Plan interactif"
              className="w-full h-auto object-cover opacity-90 block"
            />

            {/* PINS */}
            {pins.map((pin) => (
              <button
                key={pin.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePin(pin);
                }}
                style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-xs font-black shadow-lg flex items-center justify-center border-2 border-white transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  pin.status === "resolved"
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white animate-bounce"
                }`}
                title={pin.title}
              >
                {pin.number}
              </button>
            ))}
          </div>

          {/* ACTIVE PIN DETAILS */}
          {activePin && (
            <Card className="border-primary/40 bg-slate-50 dark:bg-slate-900">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={activePin.status === "resolved" ? "default" : "destructive"}>
                      Pastille #{activePin.number} ·{" "}
                      {activePin.status === "resolved" ? "Résolu" : "À traiter"}
                    </Badge>
                    <h4 className="font-bold text-sm">{activePin.title}</h4>
                  </div>
                  {activePin.comment && (
                    <p className="text-xs text-muted-foreground mt-1">Note : {activePin.comment}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => togglePinStatus(activePin.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {activePin.status === "open" ? "Marquer comme résolu" : "Rouvrir la réserve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => removePin(activePin.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
