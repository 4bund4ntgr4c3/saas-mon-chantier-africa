import { useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Pad de signature au doigt/souris (canvas). Émet une dataURL PNG (fond blanc,
 * prêt pour jsPDF) à chaque tracé, ou null après effacement.
 */
export function SignaturePad({
  value,
  onChange,
  className,
  label,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    canvasRef.current!.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#18181b";
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  // Fond blanc posé au premier rendu (image toujours exploitable en PDF).
  const initCanvas = (canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <PenLine className="size-3" />
        {label}
        {value ? " — signé" : ""}
      </span>
      <canvas
        ref={initCanvas}
        width={420}
        height={140}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="h-[110px] w-full touch-none rounded-md border border-input bg-white"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {hasInk || value ? "Signature capturée" : "Signez ici (doigt ou souris)"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-[11px]"
          onClick={clear}
        >
          <Eraser className="size-3" /> Effacer
        </Button>
      </div>
    </div>
  );
}
