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
  Globe,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  Construction,
  BookOpen,
  Wrench,
} from "lucide-react";

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
      { id: "s2", label: "Almacenamiento Físico", icon: <HardDrive size={14} />, status: "planned" },
    ],
  },
  {
    kind: "week", id: "w3", weekLabel: "Semana 3 — Índices",
    items: [
      { id: "s3-bptree", label: "B+Tree",           icon: <GitBranch size={14} />, status: "planned" },
      { id: "s3-hash",   label: "Hash Index",        icon: <Hash size={14} />,      status: "planned" },
      { id: "s3-adv",    label: "GIN / GiST / BRIN", icon: <Layers size={14} />,    status: "planned" },
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
    kind: "week", id: "w7", weekLabel: "Semana 7",
    items: [
      { id: "s7", label: "Full-Text Search", icon: <FileSearch size={14} />, status: "planned" },
    ],
  },
  {
    kind: "week", id: "w8", weekLabel: "Semana 8 — NoSQL",
    items: [
      { id: "s8", label: "MongoDB · Cassandra · Redis", icon: <Leaf size={14} />, status: "planned" },
    ],
  },
  {
    kind: "week", id: "w9", weekLabel: "Semana 9",
    items: [
      { id: "s9", label: "OLAP / Data Warehousing", icon: <BarChart2 size={14} />, status: "planned" },
    ],
  },
  {
    kind: "week", id: "w10", weekLabel: "Semana 10",
    items: [
      { id: "s10", label: "Fragmentación", icon: <Scissors size={14} />, status: "planned" },
    ],
  },
  {
    kind: "week", id: "w11", weekLabel: "Semanas 11–16",
    items: [
      { id: "s11", label: "BD Distribuidas", icon: <Globe size={14} />, status: "planned" },
    ],
  },

  { kind: "divider", id: "div-utils" },

  {
    kind: "week", id: "utils", weekLabel: "Utilidades",
    items: [
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
    w7: true, w8: true, w9: true, w10: true, w11: true, utils: false,
  });

  function toggle(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
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
