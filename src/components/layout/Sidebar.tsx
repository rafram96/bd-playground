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

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Navigation tree
   ───────────────────────────────────────────────────────────────────────────── */
const TREE: { standalone?: NavItem; group?: NavGroup }[] = [
  {
    standalone: {
      id: "playground",
      label: "SQL Playground",
      icon: <Terminal size={14} />,
      status: "done",
    },
  },
  {
    group: {
      id: "modulo1",
      label: "Módulo I · Arquitectura y Almacenamiento",
      items: [
        { id: "s1", label: "Sem 1 · Arquitectura DBMS",      icon: <Server size={14} />,    status: "done" },
        { id: "s2", label: "Sem 2 · Almacenamiento Físico",  icon: <HardDrive size={14} />, status: "planned" },
        { id: "s3-bptree",  label: "Sem 3 · B+Tree",         icon: <GitBranch size={14} />, status: "planned" },
        { id: "s3-hash",    label: "Sem 3 · Hash Index",     icon: <Hash size={14} />,      status: "planned" },
        { id: "s3-adv",     label: "Sem 3 · GIN / GiST / BRIN", icon: <Layers size={14} />, status: "planned" },
        { id: "s4", label: "Sem 4 · External Algorithms",   icon: <Cpu size={14} />,       status: "planned" },
        { id: "s5", label: "Sem 5 · Concurrencia",          icon: <Lock size={14} />,      status: "planned" },
      ],
    },
  },
  {
    group: {
      id: "modulo2",
      label: "Módulo II · Motores Especializados",
      items: [
        { id: "s6",  label: "Sem 6 · BD Espaciales",        icon: <Map size={14} />,        status: "planned" },
        { id: "s7",  label: "Sem 7 · Full-Text Search",     icon: <FileSearch size={14} />, status: "planned" },
        { id: "s8",  label: "Sem 8 · NoSQL",                icon: <Leaf size={14} />,       status: "planned" },
        { id: "s9",  label: "Sem 9 · OLAP / DW",            icon: <BarChart2 size={14} />,  status: "planned" },
      ],
    },
  },
  {
    group: {
      id: "modulo3",
      label: "Módulo III · BD Distribuidas",
      items: [
        { id: "s10", label: "Sem 10 · Fragmentación",       icon: <Scissors size={14} />,   status: "planned" },
        { id: "s11", label: "Sem 11-16 · BD Distribuidas",  icon: <Globe size={14} />,      status: "planned" },
      ],
    },
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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    modulo2: true,
    modulo3: true,
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
        {TREE.map((entry, i) => {
          if (entry.standalone) {
            const item = entry.standalone;
            return (
              <NavRow
                key={item.id}
                item={item}
                active={active === item.id}
                onClick={() => onSelect(item.id)}
              />
            );
          }

          if (entry.group) {
            const g = entry.group;
            const isCollapsed = collapsed[g.id] ?? false;
            return (
              <div key={g.id} style={{ marginTop: i === 0 ? 0 : 6 }}>
                <button
                  onClick={() => toggle(g.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 8px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    fontFamily: "var(--font-ui)",
                    textAlign: "left",
                  }}
                >
                  {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                  <span style={{ flex: 1 }}>{g.label}</span>
                </button>
                {!isCollapsed &&
                  g.items.map((item) => (
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
          }

          return null;
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
        padding: `6px ${indent ? "10px" : "8px"} 6px ${indent ? "18px" : "8px"}`,
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
