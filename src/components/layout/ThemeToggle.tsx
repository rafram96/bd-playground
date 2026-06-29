"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Theme toggle — alterna entre tema oscuro (por defecto) y claro.
   El tema se aplica como atributo data-theme en <html> y se persiste en
   localStorage. Un script en el <head> (layout.tsx) lo aplica antes del primer
   render para evitar el parpadeo (FOUC).
   ───────────────────────────────────────────────────────────────────────────── */
type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    setTheme(current);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage no disponible: el tema sigue funcionando en la sesión */
    }
  }

  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: 6,
        color: "var(--text-secondary)",
        cursor: "pointer",
        width: 26,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {isDark ? <Sun size={13} /> : <Moon size={13} />}
    </button>
  );
}
