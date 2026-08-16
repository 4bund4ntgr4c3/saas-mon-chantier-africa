/**
 * Analyse de phrases dictées en français décrivant des éléments de chantier
 * (matériaux, besoins, lignes de devis) — ex. « 10 sacs de ciment à 4500 francs »,
 * « vingt barres de fer 12 à 3800 fcfa et 500 agglos à 280 l'unité ».
 * Fonctions pures (testées dans spoken-item.test.ts), dans l'esprit d'ocr-receipt.ts.
 */

export interface SpokenItem {
  designation: string | null;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
}

/* ------------------------------------------------------------------ */
/* Nombres en lettres → chiffres                                       */
/* ------------------------------------------------------------------ */

const SMALL_NUMBERS: Record<string, number> = {
  zero: 0,
  un: 1,
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
  neuf: 9,
  dix: 10,
  onze: 11,
  douze: 12,
  treize: 13,
  quatorze: 14,
  quinze: 15,
  seize: 16,
  vingt: 20,
  trente: 30,
  quarante: 40,
  cinquante: 50,
  soixante: 60,
};

const BIG_SCALES: Record<string, number> = {
  cent: 100,
  cents: 100,
  mille: 1000,
  milles: 1000,
  million: 1_000_000,
  millions: 1_000_000,
  milliard: 1_000_000_000,
  milliards: 1_000_000_000,
};

const isNumberWord = (token: string) => token in SMALL_NUMBERS || token in BIG_SCALES;

/** Analyse une suite de mots-nombres : « quatre mille cinq cents » → 4500. */
function numberRunToNumber(tokens: string[]): number | null {
  let total = 0;
  let current = 0;
  let seen = false;

  for (const token of tokens) {
    if (token === "et") continue; // « vingt et un »
    const small = SMALL_NUMBERS[token];
    if (small !== undefined) {
      // « quatre-vingt » = 80 (et non 4 puis 20)
      if (token === "vingt" && current === 4) current = 80;
      else current += small;
      seen = true;
    } else {
      const scale = BIG_SCALES[token];
      if (scale === undefined) return null;
      if (scale >= 1000) {
        total += (current || 1) * scale;
        current = 0;
      } else {
        current = (current || 1) * scale; // cent
      }
      seen = true;
    }
  }
  return seen ? total + current : null;
}

/** Normalise : minuscules, sans accents/apostrophes, traits d'union en espaces. */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/["'’-]/g, " ")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remplace chaque suite de mots-nombres par sa valeur en chiffres :
 * « dix sacs de ciment » → « 10 sacs de ciment ».
 */
export function collapseNumberWords(text: string): string {
  const tokens = normalizeText(text).split(" ");
  const out: string[] = [];
  let run: string[] = [];

  const flush = () => {
    if (run.length === 0) return;
    const value = numberRunToNumber(run);
    out.push(value === null ? run.join(" ") : String(value));
    run = [];
  };

  for (const token of tokens) {
    if (isNumberWord(token)) {
      run.push(token);
    } else if (token === "et" && run.length > 0) {
      // « et » au milieu d'un nombre (« vingt et un ») ; sinon séparateur d'items
      run.push(token);
    } else {
      flush();
      out.push(token);
    }
  }
  flush();
  return out.join(" ");
}

/**
 * Convertit une dictée destinée à un champ nombre :
 * « quatre mille cinq cents » → « 4500 », « 4500 » → « 4500 ».
 */
export function normalizeSpokenNumber(value: string): string {
  const collapsed = collapseNumberWords(value);
  const match = collapsed.match(/\d+(?:\.\d+)?/);
  if (match) return match[0];
  return normalizeText(value).replace(/[^0-9.]/g, "");
}

/* ------------------------------------------------------------------ */
/* Extraction des items                                                */
/* ------------------------------------------------------------------ */

const LEADING_FILLER =
  /^(?:(?:euh+|hein|hum)\s+)*(?:(?:j ai besoin de|il me faut|il nous faut|il faut|je veux|acheter|achete|commander|ajouter|ajoute|enregistrer)\s+)?/;

const NUMBER_PATTERN = "\\d+(?:\\.\\d+)?";
const CURRENCY = "(?:francs?|fcfa|cfa|f)";

const PRICE_PATTERNS: RegExp[] = [
  // « à 4500 », « à prix unitaire de 4500 francs »
  new RegExp(
    `\\ba\\s+(?:prix\\s+unitaire\\s+)?(?:de\\s+)?(${NUMBER_PATTERN})(?:\\s*${CURRENCY})?\\b`,
  ),
  // « prix unitaire 4500 », « le prix unitaire est de 4500 »
  new RegExp(`prix\\s+unitaire\\s+(?:de\\s+|est\\s+de\\s+)?(${NUMBER_PATTERN})`),
  // « 4500 francs », « 4500 fcfa »
  new RegExp(`(${NUMBER_PATTERN})\\s*${CURRENCY}\\b`),
  // « 280 l'unité », « 280 par unité »
  new RegExp(`(${NUMBER_PATTERN})\\s*(?:(?:l|par)\\s+)?unite\\b`),
];

const UNIT_PATTERNS: { re: RegExp; unit: string }[] = [
  { re: /^metres?\s+carres?\b/, unit: "m²" },
  { re: /^metres?\s+cubes?\b/, unit: "m³" },
  { re: /^m2\b/, unit: "m²" },
  { re: /^m3\b/, unit: "m³" },
  { re: /^metres?\b/, unit: "m" },
  { re: /^kilogrammes?|^kilos?|^kgs?\b/, unit: "kg" },
  { re: /^litres?\b/, unit: "L" },
  { re: /^sacs?\b/, unit: "sac" },
  { re: /^sachets?\b/, unit: "sachet" },
  { re: /^barres?\b/, unit: "barre" },
  { re: /^tonnes?\b/, unit: "tonne" },
  { re: /^cartons?\b/, unit: "carton" },
  { re: /^pots?\b/, unit: "pot" },
  { re: /^rouleaux?\b/, unit: "rouleau" },
  { re: /^feuilles?\b/, unit: "feuille" },
  { re: /^plaques?\b/, unit: "plaque" },
  { re: /^bouteilles?\b/, unit: "bouteille" },
  { re: /^voyages?\b/, unit: "voyage" },
  { re: /^palettes?\b/, unit: "palette" },
];

const DESIGNATION_EDGE_WORDS = new Set([
  "de",
  "des",
  "du",
  "d",
  "la",
  "le",
  "les",
  "a",
  "au",
  "aux",
  "et",
  "l",
  "unite",
  "piece",
  "francs",
  "franc",
  "fcfa",
  "cfa",
  "environ",
  "presque",
]);

/**
 * Découpe en segments : séparateurs « et », « puis », « ensuite », virgules…
 * (points décimaux type « 42.5 » préservés ; nouveau segment seulement si une
 * quantité suit le séparateur, sinon c'est une suite de désignation)
 */
function splitSegments(normalized: string): string[] {
  const parts = normalized.split(
    /[,;]|(?<!\d)\.(?!\d)|\b(?:et|puis|ensuite|egalement|de plus|virgule)\b/,
  );
  const segments: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (segments.length > 0 && !/^\d/.test(trimmed)) {
      segments[segments.length - 1] = `${segments[segments.length - 1]} ${trimmed}`;
      continue;
    }
    segments.push(trimmed);
  }
  return segments;
}

function extractPrice(segment: string): { price: number | null; rest: string } {
  for (const pattern of PRICE_PATTERNS) {
    const match = segment.match(pattern);
    if (match && match.index !== undefined) {
      const price = Number(match[1] ?? "");
      if (Number.isFinite(price)) {
        return {
          price,
          rest: (segment.slice(0, match.index) + " " + segment.slice(match.index + match[0].length))
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
    }
  }
  return { price: null, rest: segment };
}

function extractQuantityAndUnit(segment: string): {
  quantity: number | null;
  unit: string | null;
  rest: string;
} {
  let rest = segment;
  let quantity: number | null = null;

  const qtyMatch = rest.match(new RegExp(`^(?:environ\\s+)?(${NUMBER_PATTERN})\\s*`));
  if (qtyMatch) {
    quantity = Number(qtyMatch[1] ?? "");
    rest = rest.slice(qtyMatch[0].length);
  }

  let unit: string | null = null;
  for (const { re, unit: canonical } of UNIT_PATTERNS) {
    const unitMatch = rest.match(re);
    if (unitMatch) {
      unit = canonical;
      rest = rest.slice(unitMatch[0].length);
      break;
    }
  }

  return { quantity, unit, rest: rest.trim() };
}

function cleanDesignation(raw: string): string | null {
  const words = raw.split(" ").filter(Boolean);
  let start = 0;
  let end = words.length;
  while (start < end && DESIGNATION_EDGE_WORDS.has(words[start] ?? "")) start += 1;
  while (end > start && DESIGNATION_EDGE_WORDS.has(words[end - 1] ?? "")) end -= 1;
  const cleaned = words.slice(start, end).join(" ").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function parseSegment(segment: string): SpokenItem | null {
  const rest0 = segment.replace(LEADING_FILLER, "");

  const { price, rest: afterPrice } = extractPrice(rest0);
  const { quantity, unit, rest: afterQty } = extractQuantityAndUnit(afterPrice);
  const designation = cleanDesignation(afterQty);

  if (!designation && quantity === null && price === null) return null;
  return { designation, quantity, unit, unit_price: price };
}

/**
 * Analyse une phrase dictée et retourne les éléments reconnus.
 * « 10 sacs de ciment à 4500 francs et 20 barres de fer 12 à 3800 » → 2 items.
 */
export function parseSpokenItems(text: string): SpokenItem[] {
  if (!text.trim()) return [];
  const normalized = collapseNumberWords(text);
  return splitSegments(normalized)
    .map(parseSegment)
    .filter((item): item is SpokenItem => item !== null);
}

/** Variante mono-élément : premier élément reconnu, sinon null. */
export function parseSpokenItem(text: string): SpokenItem | null {
  return parseSpokenItems(text)[0] ?? null;
}
