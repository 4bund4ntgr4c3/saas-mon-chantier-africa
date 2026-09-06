/**
 * Module de gestion des appels de fonds et flux de trésorerie VEFA pour promoteurs et maîtres d'ouvrage.
 */

export interface FundCallMilestone {
  id: string;
  stageName: string;
  percentage: number;
  amountFcfa: number;
  isUnlocked: boolean;
  isPaid: boolean;
}

export function generateVefaFundSchedule(totalPriceFcfa: number): FundCallMilestone[] {
  const price = Math.max(0, totalPriceFcfa);

  return [
    {
      id: "call-1",
      stageName: "1. Réservation / Dépôt de garantie",
      percentage: 5,
      amountFcfa: Math.round(price * 0.05),
      isUnlocked: true,
      isPaid: true,
    },
    {
      id: "call-2",
      stageName: "2. Achèvement des fondations & semelles",
      percentage: 15,
      amountFcfa: Math.round(price * 0.15),
      isUnlocked: true,
      isPaid: false,
    },
    {
      id: "call-3",
      stageName: "3. Coulage de la dalle & gros-œuvre RDC",
      percentage: 25,
      amountFcfa: Math.round(price * 0.25),
      isUnlocked: false,
      isPaid: false,
    },
    {
      id: "call-4",
      stageName: "4. Mise hors d'eau & toiture",
      percentage: 20,
      amountFcfa: Math.round(price * 0.2),
      isUnlocked: false,
      isPaid: false,
    },
    {
      id: "call-5",
      stageName: "5. Cloisonnements & enduits intérieurs",
      percentage: 15,
      amountFcfa: Math.round(price * 0.15),
      isUnlocked: false,
      isPaid: false,
    },
    {
      id: "call-6",
      stageName: "6. Finitions, carrelage & sanitaires",
      percentage: 10,
      amountFcfa: Math.round(price * 0.1),
      isUnlocked: false,
      isPaid: false,
    },
    {
      id: "call-7",
      stageName: "7. Réception finale & remise des clés",
      percentage: 10,
      amountFcfa: Math.round(price * 0.1),
      isUnlocked: false,
      isPaid: false,
    },
  ];
}
