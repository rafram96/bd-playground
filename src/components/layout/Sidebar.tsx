"use client";

import { useState } from "react";
import {
  Terminal,
  Database,
  Server,
  HardDrive,
  GitBranch,
  Hash,
  Layers,
  Cpu,
  Lock,
  Map,
  FileSearch,
  Leaf,
  BarChart2,
  Scissors,
  Binary,
  GraduationCap,
  LocateFixed,
  Sigma,
  Code2,
  Workflow,
  Share2,
  ListChecks,
  Zap,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  Construction,
  BookOpen,
  Wrench,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────────── */
export type PageId = string;
type Status = "done" | "wip" | "planned";

interface NavItem {
  id: PageId;
  label: string;
  icon?: React.ReactNode;
  status?: Status;
}

type TreeEntry =
  | { kind: "standalone"; item: NavItem }
  | { kind: "week"; id: string; weekLabel: string; items: NavItem[] }
  | { kind: "divider"; id: string };

/* ─────────────────────────────────────────────────────────────────────────────
   Navigation tree  (semana → temas)
   ───────────────────────────────────────────────────────────────────────────── */
const TREE: TreeEntry[] = [
  {
    kind: "standalone",
    item: { id: "playground", label: "SQL Playground", icon: <Terminal size={14} />, status: "done" },
  },

  {
    kind: "week", id: "w1", weekLabel: "Semana 1",
    items: [
      { id: "s1", label: "Arquitectura DBMS", icon: <Server size={14} />, status: "done" },
    ],
  },
  {
    kind: "week", id: "w2", weekLabel: "Semana 2",
    items: [
      { id: "s2", label: "Almacenamiento Físico", icon: <HardDrive size={14} />, status: "done" },
    ],
  },
  {
    kind: "week", id: "w3", weekLabel: "Semana 3 — Índices",
    items: [
      { id: "s3-bptree",   label: "B+Tree",           icon: <GitBranch size={14} />, status: "done" },
      { id: "viz-bptree",  label: "B+Tree (viz)",      icon: <Workflow size={14} />,  status: "done" },
      { id: "s3-hash",     label: "Hash Index",        icon: <Hash size={14} />,      status: "planned" },
      { id: "s3-adv",      label: "GIN / GiST / BRIN", icon: <Layers size={14} />,   status: "planned" },
    ],
  },
  {
    kind: "week", id: "w4", weekLabel: "Semana 4",
    items: [
      { id: "s4", label: "Algoritmos Externos", icon: <Cpu size={14} />, status: "planned" },
    ],
  },
  {
    kind: "week", id: "w5", weekLabel: "Semana 5",
    items: [
      { id: "s5", label: "Concurrencia", icon: <Lock size={14} />, status: "planned" },
    ],
  },
  {
    kind: "week", id: "w6", weekLabel: "Semana 6",
    items: [
      { id: "s6", label: "BD Espaciales", icon: <Map size={14} />, status: "planned" },
    ],
  },
  {
    kind: "week", id: "w8", weekLabel: "Semana 8 — Recuperación Textual",
    items: [
      { id: "s8-ir", label: "RI: BoW · TF-IDF · Índice Invertido", icon: <FileSearch size={14} />, status: "done" },
      { id: "s8-examen", label: "Esencial para el examen", icon: <GraduationCap size={14} />, status: "done" },
      { id: "s8-viz", label: "Visualizador: TF-IDF & coseno", icon: <Sigma size={14} />, status: "wip" },
    ],
  },
  {
    kind: "week", id: "w9", weekLabel: "Semana 9 — Índice Invertido Optimizado",
    items: [
      { id: "s9-ir", label: "BSBI · SPIMI · GIN/GiST · Motores", icon: <Layers size={14} />, status: "done" },
      { id: "s9-examen", label: "Esencial para el examen", icon: <GraduationCap size={14} />, status: "done" },
    ],
  },
  {
    kind: "week", id: "w10", weekLabel: "Semana 10 — BD Vectoriales",
    items: [
      { id: "s10-vec", label: "Multimedia · Embeddings · kNN/ANN", icon: <Binary size={14} />, status: "done" },
      { id: "s10-examen", label: "Esencial para el examen", icon: <GraduationCap size={14} />, status: "done" },
      { id: "s10-viz", label: "Visualizador: k-NN & distancias", icon: <LocateFixed size={14} />, status: "done" },
    ],
  },
  {
    kind: "week", id: "w11", weekLabel: "Semana 11 — Búsqueda Eficiente",
    items: [
      { id: "s11-eff", label: "Filtrar-refinar · DTW · Descriptores", icon: <Zap size={14} />, status: "done" },
      { id: "s11-examen", label: "Esencial para el examen", icon: <GraduationCap size={14} />, status: "done" },
    ],
  },
  {
    kind: "week", id: "w12", weekLabel: "Semana 12 — BD Distribuidas",
    items: [
      { id: "s12-bdd", label: "Distribuidas · Fragmentación Horizontal", icon: <Scissors size={14} />, status: "done" },
      { id: "s12-examen", label: "Esencial para el examen", icon: <GraduationCap size={14} />, status: "done" },
    ],
  },

  { kind: "divider", id: "div-otros" },

  {
    kind: "week", id: "w-otros", weekLabel: "Módulo II–III · Próximos temas",
    items: [
      { id: "s8", label: "NoSQL (MongoDB · Cassandra · Redis)", icon: <Leaf size={14} />, status: "planned" },
      { id: "s9", label: "OLAP / Data Warehousing", icon: <BarChart2 size={14} />, status: "planned" },
    ],
  },

  { kind: "divider", id: "div-utils" },

  {
    kind: "week", id: "utils", weekLabel: "Utilidades",
    items: [
      { id: "util-sintaxis", label: "Sintaxis SQL", icon: <Code2 size={14} />, status: "done" },
      { id: "util-fd", label: "Dependencias Funcionales", icon: <Share2 size={14} />, status: "done" },
      { id: "util-norm", label: "Normalización", icon: <ListChecks size={14} />, status: "done" },
      { id: "util-cheatsheet", label: "SQL Cheat Sheet", icon: <BookOpen size={14} />, status: "planned" },
      { id: "util-tools", label: "Herramientas", icon: <Wrench size={14} />, status: "planned" },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Status indicator
   ───────────────────────────────────────────────────────────────────────────── */
function StatusDot({ status }: { status?: Status }) {
  if (status === "done")
    return <CheckCircle2 size={11} color="var(--success)" style={{ flexShrink: 0 }} />;
  if (status === "wip")
    return <Construction size={11} color="var(--warning)" style={{ flexShrink: 0 }} />;
  return <Circle size={9} color="var(--text-muted)" style={{ flexShrink: 0 }} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sidebar component
   ───────────────────────────────────────────────────────────────────────────── */
interface SidebarProps {
  active: PageId;
  onSelect: (id: PageId) => void;
}

export default function Sidebar({ active, onSelect }: SidebarProps) {
  /* Semana 1 starts open; everything else collapsed */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    w2: true, w3: true, w4: true, w5: true, w6: true,
    w8: true, w9: true, w10: true, w11: true, w12: true, "w-otros": true, utils: false,
  });
  const [open, setOpen] = useState(true);

  function toggle(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (!open) {
    return (
      <aside
        style={{
          width: 48,
          flexShrink: 0,
          height: "100%",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 0",
          gap: 12,
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Database size={14} color="#fff" />
        </div>
        <button
          onClick={() => setOpen(true)}
          title="Mostrar menú"
          aria-label="Mostrar menú"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", cursor: "pointer", width: 30, height: 30, fontSize: 15, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ☰
        </button>
        <ThemeToggle />
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        height: "100%",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Database size={14} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
            DB Visualizer
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-code)", marginTop: 2, lineHeight: 1 }}>
            CS2042 · UTEC
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <ThemeToggle />
          <button
            onClick={() => setOpen(false)}
            title="Ocultar menú"
            aria-label="Ocultar menú"
            style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", cursor: "pointer", width: 26, height: 24, fontSize: 13, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
        {TREE.map((entry) => {
          /* ── Divider ── */
          if (entry.kind === "divider") {
            return (
              <div
                key={entry.id}
                style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "10px 12px",
                }}
              />
            );
          }

          /* ── Standalone (SQL Playground) ── */
          if (entry.kind === "standalone") {
            return (
              <NavRow
                key={entry.item.id}
                item={entry.item}
                active={active === entry.item.id}
                onClick={() => onSelect(entry.item.id)}
              />
            );
          }

          /* ── Week group ── */
          const w = entry;
          const isOpen = !(collapsed[w.id] ?? false);
          const weekActive = w.items.some((it) => it.id === active);

          return (
            <div key={w.id} style={{ marginTop: 2 }}>
              {/* Week header */}
              <button
                onClick={() => toggle(w.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 8px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: weekActive ? "var(--text-secondary)" : "var(--text-muted)",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontFamily: "var(--font-ui)",
                  textAlign: "left",
                }}
              >
                {isOpen
                  ? <ChevronDown size={11} style={{ flexShrink: 0 }} />
                  : <ChevronRight size={11} style={{ flexShrink: 0 }} />}
                <span style={{ flex: 1 }}>{w.weekLabel}</span>
              </button>

              {/* Items */}
              {isOpen &&
                w.items.map((item) => (
                  <NavRow
                    key={item.id}
                    item={item}
                    active={active === item.id}
                    onClick={() => onSelect(item.id)}
                    indent
                  />
                ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: "var(--font-code)",
            color: "var(--accent)",
            background: "var(--accent-glow)",
            border: "1px solid rgba(124,106,247,0.25)",
            borderRadius: 5,
            padding: "3px 8px",
            display: "inline-block",
          }}
        >
          PGlite WASM
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Nav row
   ───────────────────────────────────────────────────────────────────────────── */
function NavRow({
  item,
  active,
  onClick,
  indent = false,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: `5px ${indent ? "8px" : "8px"} 5px ${indent ? "20px" : "8px"}`,
        borderRadius: 6,
        border: "none",
        background: active ? "var(--accent-glow)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-muted)",
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        fontSize: 12.5,
        fontWeight: active ? 600 : 400,
        textAlign: "left",
        transition: "background 0.1s, color 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-elevated)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {item.icon && (
        <span style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }}>
          {item.icon}
        </span>
      )}
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.label}
      </span>
      <StatusDot status={item.status} />
    </button>
  );
}
