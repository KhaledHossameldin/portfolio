"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

// Theme is external state: it lives on <html data-theme> (set pre-paint by the
// inline script in layout) and is mirrored to localStorage. useSyncExternalStore
// reads it without a setState-in-effect, and stays correct across tabs.
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem("kp-theme", t);
  } catch {
    /* storage unavailable — ignore */
  }
  listeners.forEach((cb) => cb());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setTheme = useCallback((t: Theme) => applyTheme(t), []);
  return { theme, setTheme };
}

// Kept as a no-op wrapper so pages can compose a stable provider boundary.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
