/**
 * Module du guide d'inspection et checklist de remise des clés pour le propriétaire.
 */

export interface InspectionCheckItem {
  id: string;
  category: "plomberie" | "electricite" | "menuiserie" | "carrelage_peinture";
  label: string;
  isInspected: boolean;
  hasDefect: boolean;
  defectNote?: string;
}

export function getDefaultHandoverChecklist(): InspectionCheckItem[] {
  return [
    {
      id: "chk-pente",
      category: "plomberie",
      label: "Pente d'évacuation des douches (absence d'eau stagnante)",
      isInspected: true,
      hasDefect: false,
    },
    {
      id: "chk-fuites",
      category: "plomberie",
      label: "Contrôle d'étanchéité sous les éviers et compteurs SONEB",
      isInspected: true,
      hasDefect: false,
    },
    {
      id: "chk-prises",
      category: "electricite",
      label: "Tension 220V et mise à la terre sur toutes les prises",
      isInspected: true,
      hasDefect: false,
    },
    {
      id: "chk-diff",
      category: "electricite",
      label: "Déclenchement instantané du disjoncteur différentiel 30mA",
      isInspected: true,
      hasDefect: false,
    },
    {
      id: "chk-cles",
      category: "menuiserie",
      label: "Jeux complets de clés (3 clés/serrure) et verrouillage fluide",
      isInspected: true,
      hasDefect: false,
    },
    {
      id: "chk-fenetres",
      category: "menuiserie",
      label: "Étanchéité des baies vitrées à la pluie et coulissement",
      isInspected: false,
      hasDefect: false,
    },
    {
      id: "chk-carrelage",
      category: "carrelage_peinture",
      label: "Planéité des carreaux et absence de son creux au choc",
      isInspected: true,
      hasDefect: false,
    },
    {
      id: "chk-peinture",
      category: "carrelage_peinture",
      label: "Uniformité de la peinture sans coulures ni cloques",
      isInspected: false,
      hasDefect: false,
    },
  ];
}

export function evaluateHandoverStatus(items: InspectionCheckItem[]): {
  inspectedCount: number;
  totalCount: number;
  defectsCount: number;
  isReadyForHandover: boolean;
  statusLabel: string;
} {
  const inspectedCount = items.filter((i) => i.isInspected).length;
  const totalCount = items.length;
  const defectsCount = items.filter((i) => i.hasDefect).length;

  const isReady = inspectedCount === totalCount && defectsCount === 0;
  const statusLabel = isReady
    ? "Chantier 100% conforme pour réception sans réserve ✅"
    : defectsCount > 0
      ? `${defectsCount} réserve(s) à lever avant remise des clés ⚠️`
      : `Inspection en cours (${inspectedCount}/${totalCount})`;

  return {
    inspectedCount,
    totalCount,
    defectsCount,
    isReadyForHandover: isReady,
    statusLabel,
  };
}
