import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";
export type Country = "bj" | "bf" | "ci" | "ml" | "ne" | "sn" | "tg" | "cg" | "cd" | "other";

export const COUNTRIES: { value: Country; label: string; currency: string }[] = [
  { value: "bj", label: "Bénin", currency: "FCFA (XOF)" },
  { value: "bf", label: "Burkina Faso", currency: "FCFA (XOF)" },
  { value: "ci", label: "Côte d'Ivoire", currency: "FCFA (XOF)" },
  { value: "ml", label: "Mali", currency: "FCFA (XOF)" },
  { value: "ne", label: "Niger", currency: "FCFA (XOF)" },
  { value: "sn", label: "Sénégal", currency: "FCFA (XOF)" },
  { value: "tg", label: "Togo", currency: "FCFA (XOF)" },
  { value: "cg", label: "Congo", currency: "FCFA (XAF)" },
  { value: "cd", label: "RD Congo", currency: "FC (CDF)" },
  { value: "other", label: "Autre", currency: "—" },
];

export const LANGS: { value: Lang; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

type Prefs = {
  lang: Lang;
  country: Country;
  setLang: (l: Lang) => void;
  setCountry: (c: Country) => void;
  currencySymbol: string;
  currencyCode: string;
};

const STORAGE_LANG = "batibenin.lang";
const STORAGE_COUNTRY = "batibenin.country";

const PrefsContext = createContext<Prefs | null>(null);

function readStored<T extends string>(key: string, fallback: T, valid: readonly T[]): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && valid.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStored(STORAGE_LANG, "fr", ["fr", "en"]));
  const [country, setCountryState] = useState<Country>(() =>
    readStored(STORAGE_COUNTRY, "bj", COUNTRIES.map((c) => c.value) as Country[]),
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG, lang);
      localStorage.setItem(STORAGE_COUNTRY, country);
    } catch {
      /* stockage indisponible */
    }
    const html = document.documentElement;
    html.lang = lang;
  }, [lang, country]);

  const value = useMemo<Prefs>(() => {
    const currency = COUNTRIES.find((c) => c.value === country)?.currency ?? "FCFA (XOF)";
    return {
      lang,
      country,
      setLang: setLangState,
      setCountry: setCountryState,
      currencySymbol: currency.startsWith("FCFA") ? "FCFA" : (currency.split(" ")[0] ?? "FCFA"),
      currencyCode: currency.includes("XAF") ? "XAF" : currency.includes("CDF") ? "CDF" : "XOF",
    };
  }, [lang, country]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}

/** Petite aide de traduction : clé FR → valeur selon la langue. */
export function t(lang: Lang, fr: string, en: string) {
  return lang === "fr" ? fr : en;
}
