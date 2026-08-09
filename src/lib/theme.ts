import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEY = "batibenin.theme";
const DARK_CLASS = "dark";

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle(DARK_CLASS, theme === "dark");
}

export function setStoredTheme(theme: Theme) {
  window.localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

/** Thème effectif : préférence stockée, sinon thème du système (suivi en direct). */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme() ?? getSystemTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (getStoredTheme()) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setTheme(getSystemTheme());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setStoredTheme(next);
    setTheme(next);
  }, [theme]);

  return { theme, toggle };
}
