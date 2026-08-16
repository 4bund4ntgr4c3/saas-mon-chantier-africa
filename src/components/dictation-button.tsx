import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDictation } from "@/lib/use-dictation";

/**
 * Bouton micro réutilisable : dicte du texte transmis via `onTranscript`.
 * Désactivé (grisé) quand le navigateur ne gère pas la reconnaissance vocale.
 */
export function DictationButton({
  onTranscript,
  label = "Dicter (reconnaissance vocale)",
  className,
  disabled,
}: {
  onTranscript: (transcript: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { supported, listening, toggle } = useDictation({ onTranscript });

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      title={supported ? label : "Dictée non supportée par ce navigateur"}
      aria-label={label}
      aria-pressed={listening}
      disabled={disabled || !supported}
      onClick={toggle}
    >
      {listening ? <MicOff className="size-4 text-destructive" /> : <Mic className="size-4" />}
    </Button>
  );
}
