import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggle}
      suppressHydrationWarning
      aria-label={dark ? "Passer en thème clair" : "Passer en thème sombre"}
      title={dark ? "Passer en thème clair" : "Passer en thème sombre"}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
