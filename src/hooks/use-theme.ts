import { useEffect, useState } from "react";

const KEY = "admin-theme";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(KEY) as "light" | "dark" | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return { theme, toggle: () => setTheme(t => (t === "dark" ? "light" : "dark")) };
}
