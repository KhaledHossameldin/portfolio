"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

// Theme is external state on <html data-theme> (set pre-paint by the inline script
// in layout). Source of truth: a per-session MANUAL override in sessionStorage if
// present, otherwise the OS preference (prefers-color-scheme). With no override we
// follow OS changes live; a manual toggle wins until the tab/session closes.
const OVERRIDE_KEY = "kp-theme";
const listeners = new Set<() => void>();

let darkMql: MediaQueryList | null = null;
function getDarkMql(): MediaQueryList | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  if (!darkMql) {
    darkMql = window.matchMedia("(prefers-color-scheme: dark)");
    // Live-follow the OS — but only while the user hasn't overridden this session.
    darkMql.addEventListener("change", () => {
      if (!override()) applyTheme(osTheme());
    });
  }
  return darkMql;
}

function osTheme(): Theme {
  return getDarkMql()?.matches ? "dark" : "light";
}

function override(): Theme | null {
  try {
    const v = sessionStorage.getItem(OVERRIDE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  getDarkMql(); // ensure the OS-change listener is attached (client only)
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

// Single mutation point for data-theme (the pre-paint script sets it for first paint).
function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  listeners.forEach((cb) => cb());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Manual toggle → session-scoped override that wins over the OS until tab close.
  const setTheme = useCallback((t: Theme) => {
    try {
      sessionStorage.setItem(OVERRIDE_KEY, t);
    } catch {
      /* storage unavailable — ignore */
    }
    applyTheme(t);
  }, []);
  return { theme, setTheme };
}

// Kept as a no-op wrapper so pages can compose a stable provider boundary.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
