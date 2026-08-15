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
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Camera, Sparkles } from "lucide-react";

interface BeforeAfterSliderDialogProps {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
}

export function BeforeAfterSliderDialog({
  beforeImageUrl = "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1000&auto=format&fit=crop&q=80",
  afterImageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80",
  beforeLabel = "Terrain nu / Fondations",
  afterLabel = "Gros œuvre achevé",
  title = "Évolution visuelle du chantier",
}: BeforeAfterSliderDialogProps) {
  const [open, setOpen] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    handleMove(touch.clientX, e.currentTarget.getBoundingClientRect());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-primary/30">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          Comparateur Avant / Après
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Camera className="h-5 w-5 text-primary" />
              {title}
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Glissez le curseur
            </Badge>
          </div>
          <DialogDescription>
            Faites glisser la barre centrale de gauche à droite pour visualiser la transformation de
            votre construction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* SLIDER CONTAINER */}
          <div
            onMouseDown={() => (isDragging.current = true)}
            onMouseUp={() => (isDragging.current = false)}
            onMouseLeave={() => (isDragging.current = false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md select-none cursor-ew-resize border border-slate-200 dark:border-slate-800"
          >
            {/* AFTER IMAGE (Background) */}
            <img
              src={afterImageUrl}
              alt="Après"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded backdrop-blur">
              {afterLabel}
            </div>

            {/* BEFORE IMAGE (Clipped overlay) */}
            <div
              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              <img
                src={beforeImageUrl}
                alt="Avant"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded backdrop-blur">
                {beforeLabel}
              </div>
            </div>

            {/* SLIDER HANDLE */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl flex items-center justify-center pointer-events-none"
            >
              <div className="h-8 w-8 rounded-full bg-white text-slate-900 shadow-xl border-2 border-primary flex items-center justify-center">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
            <span>
              👈 <strong>{beforeLabel}</strong>
            </span>
            <span>
              <strong>{afterLabel}</strong> 👉
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
