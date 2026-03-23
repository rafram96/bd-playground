"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   SQL Syntax Highlighter (shared across the app)
   ───────────────────────────────────────────────────────────────────────────── */
type TokenType = "keyword" | "fn" | "string" | "number" | "comment" | "op" | "plain";

const KW = new Set(
  "SELECT FROM WHERE JOIN ON GROUP ORDER HAVING LIMIT AS AND OR NOT IN LIKE IS NULL LEFT RIGHT INNER OUTER FULL DISTINCT CREATE DROP INDEX TABLE BEGIN COMMIT ROLLBACK WITH UNION SET VALUES INTO INSERT UPDATE DELETE EXPLAIN ANALYZE CASE WHEN THEN ELSE END ASC DESC PARTITION OVER EXISTS USING CROSS BY IF FORMAT SHOW".split(" ")
);
const FN = new Set(
  "SUM COUNT AVG MIN MAX RANK DENSE_RANK ROW_NUMBER LEAD LAG ROUND COALESCE CAST NULLIF LENGTH LOWER UPPER TRIM TO_CHAR NOW DATE_TRUNC EXTRACT ARRAY_TO_STRING GENERATE_SUBSCRIPTS FORMAT_TYPE PG_GET_INDEXDEF".split(" ")
);
const TC: Record<TokenType, string> = {
  keyword: "#ff7b72",
  fn: "#d2a8ff",
  string: "#a5d6ff",
  number: "#79c0ff",
  comment: "#6e7681",
  op: "#e6edf3",
  plain: "#c9d1d9",
};

function tokenize(sql: string): { type: TokenType; text: string }[] {
  const out: { type: TokenType; text: string }[] = [];
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const text = end === -1 ? sql.slice(i) : sql.slice(i, end);
      out.push({ type: "comment", text });
      i = end === -1 ? sql.length : end;
    } else if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length && sql[j] !== "'") j++;
      out.push({ type: "string", text: sql.slice(i, j + 1) });
      i = j + 1;
    } else if (/[0-9]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      out.push({ type: "number", text: sql.slice(i, j) });
      i = j;
    } else if (/[a-zA-Z_]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) j++;
      const w = sql.slice(i, j);
      const u = w.toUpperCase();
      out.push({ type: KW.has(u) ? "keyword" : FN.has(u) ? "fn" : "plain", text: w });
      i = j;
    } else if (/[><=!*+\-/,;()[\]{}.]/.test(sql[i])) {
      out.push({ type: "op", text: sql[i] });
      i++;
    } else {
      out.push({ type: "plain", text: sql[i] });
      i++;
    }
  }
  return out;
}

export function SqlCode({ sql, label }: { sql: string; label?: string }) {
  return (
    <div style={{ margin: "12px 0" }}>
      {label && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </div>
      )}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "14px 18px",
          fontFamily: "var(--font-code)",
          fontSize: 13,
          lineHeight: 1.75,
          overflowX: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {tokenize(sql).map((t, i) => (
          <span key={i} style={{ color: TC[t.type] }}>
            {t.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Typography
   ───────────────────────────────────────────────────────────────────────────── */
export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      style={{
        fontSize: 22,
        fontWeight: 700,
        color: "var(--text-primary)",
        margin: "36px 0 14px",
        paddingBottom: 8,
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-ui)",
        scrollMarginTop: 28,
      }}
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-primary)",
        margin: "24px 0 10px",
        fontFamily: "var(--font-ui)",
      }}
    >
      {children}
    </h3>
  );
}

export function H4({ children }: { children: React.ReactNode }) {
  return (
    <h4
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-secondary)",
        margin: "18px 0 8px",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontFamily: "var(--font-ui)",
      }}
    >
      {children}
    </h4>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 14,
        color: "var(--text-secondary)",
        lineHeight: 1.75,
        margin: "10px 0",
        fontFamily: "var(--font-ui)",
      }}
    >
      {children}
    </p>
  );
}

export function Bold({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{children}</strong>;
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "var(--font-code)",
        fontSize: 12,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "1px 6px",
        color: "#a5d6ff",
      }}
    >
      {children}
    </code>
  );
}

export function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: "12px 0",
        padding: "10px 16px",
        background: "var(--bg-elevated)",
        borderLeft: "3px solid var(--accent)",
        borderRadius: "0 6px 6px 0",
        fontFamily: "var(--font-code)",
        fontSize: 13,
        color: "#a78bfa",
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

export function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "52px 0" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Lists
   ───────────────────────────────────────────────────────────────────────────── */
export function Ul({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul style={{ margin: "8px 0", paddingLeft: 22 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 4 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Ol({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ol style={{ margin: "8px 0", paddingLeft: 22 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 4 }}>
          {item}
        </li>
      ))}
    </ol>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Callouts
   ───────────────────────────────────────────────────────────────────────────── */
type CalloutVariant = "example" | "note" | "warning" | "definition" | "quote" | "lab";

const CALLOUT_STYLES: Record<CalloutVariant, { bg: string; border: string; label: string; labelColor: string }> = {
  example:    { bg: "#051a0f", border: "#166534", label: "Ejemplo",    labelColor: "#4ade80" },
  note:       { bg: "#0c1a26", border: "#1d4ed8", label: "Nota",       labelColor: "#60a5fa" },
  warning:    { bg: "#1a0f05", border: "#92400e", label: "Importante", labelColor: "#fbbf24" },
  definition: { bg: "#1a0a2e", border: "#6d28d9", label: "Definicion", labelColor: "#a78bfa" },
  quote:      { bg: "#111118", border: "rgba(255,255,255,0.1)", label: "",  labelColor: "var(--text-muted)" },
  lab:        { bg: "#0c1a26", border: "#0e7490", label: "Laboratorio",labelColor: "#22d3ee" },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}) {
  const s = CALLOUT_STYLES[variant];
  return (
    <div
      style={{
        margin: "12px 0",
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        padding: "12px 16px",
      }}
    >
      {(title || s.label) && (
        <div style={{ fontSize: 12, fontWeight: 700, color: s.labelColor, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {title ?? s.label}
        </div>
      )}
      <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Pros / Cons
   ───────────────────────────────────────────────────────────────────────────── */
export function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
      <div style={{ background: "#051a0f", border: "1px solid #166534", borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>Ventajas</div>
        {pros.map((p, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 5, display: "flex", gap: 6 }}>
            <span style={{ color: "#4ade80", flexShrink: 0 }}>+</span> {p}
          </div>
        ))}
      </div>
      <div style={{ background: "#1a0505", border: "1px solid #7f1d1d", borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>Desventajas</div>
        {cons.map((c, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 5, display: "flex", gap: 6 }}>
            <span style={{ color: "#f87171", flexShrink: 0 }}>-</span> {c}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Table
   ───────────────────────────────────────────────────────────────────────────── */
export function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={{ margin: "12px 0", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  textAlign: "left",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-surface)" }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Compare cards (Seq Scan vs Index Scan style)
   ───────────────────────────────────────────────────────────────────────────── */
export function CompareCards({
  items,
}: {
  items: { label: string; color: string; bg: string; pros: string[]; cons: string[]; when?: string }[];
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 12, margin: "12px 0" }}>
      {items.map((item) => (
        <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.color}40`, borderRadius: 10, padding: "14px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 10 }}>{item.label}</div>
          <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 4 }}>Ventajas</div>
          {item.pros.map((p, i) => <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>• {p}</div>)}
          <div style={{ fontSize: 11, color: "#f87171", marginTop: 8, marginBottom: 4 }}>Limitaciones</div>
          {item.cons.map((c, i) => <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>• {c}</div>)}
          {item.when && (
            <div style={{ marginTop: 10, padding: "6px 8px", background: "#0d1117", borderRadius: 6, fontSize: 11, color: "var(--text-muted)" }}>
              Usar cuando: {item.when}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Token type display (for Parser)
   ───────────────────────────────────────────────────────────────────────────── */
export function TokenTable() {
  const tokens = [
    { type: "KEYWORD",    ex: "SELECT, FROM, WHERE, JOIN, GROUP BY",    color: TC.keyword, bg: "#1a0505" },
    { type: "IDENTIFIER", ex: "employees, e.name, dept_id, salary",      color: TC.plain,   bg: "#0d1117" },
    { type: "LITERAL",    ex: "'2020-01-01', 50000, TRUE, NULL",          color: TC.string,  bg: "#051520" },
    { type: "OPERATOR",   ex: "> < = != AND OR NOT LIKE",                color: TC.op,      bg: "#111" },
    { type: "DELIMITER",  ex: "( ) , ; .",                               color: "#e2e8f0",  bg: "#0d1117" },
    { type: "WHITESPACE", ex: "espacios, tabs, newlines → ignorados",     color: TC.comment, bg: "#0d1117" },
  ];
  return (
    <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 6 }}>
      {tokens.map((t) => (
        <div key={t.type} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ minWidth: 88, padding: "3px 8px", borderRadius: 4, background: t.bg, border: `1px solid ${t.color}`, color: t.color, fontSize: 11, fontFamily: "var(--font-code)", fontWeight: 700, textAlign: "center" }}>
            {t.type}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>{t.ex}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Latency chart (for Disco section)
   ───────────────────────────────────────────────────────────────────────────── */
export function LatencyChart() {
  const rows = [
    { label: "CPU Register", value: "< 1 ns",    pct: 1,   color: "#4ade80" },
    { label: "L1 Cache",     value: "~1 ns",     pct: 2,   color: "#86efac" },
    { label: "L2/L3 Cache",  value: "~10 ns",    pct: 5,   color: "#fbbf24" },
    { label: "RAM (Buffer)", value: "~100 ns",   pct: 12,  color: "#fb923c" },
    { label: "SSD NVMe",     value: "~100 µs",   pct: 40,  color: "#f97316" },
    { label: "SSD SATA",     value: "~500 µs",   pct: 65,  color: "#ef4444" },
    { label: "HDD (7200rpm)",value: "~10 ms",    pct: 100, color: "#dc2626" },
  ];
  return (
    <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 7 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "grid", gridTemplateColumns: "130px 1fr 72px", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.label}</span>
          <div style={{ background: "#1f2937", borderRadius: 3, height: 16, overflow: "hidden" }}>
            <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 11, color: r.color, fontFamily: "var(--font-code)", textAlign: "right" }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ACID Cards
   ───────────────────────────────────────────────────────────────────────────── */
export function AcidCards() {
  const cards = [
    { letter: "A", name: "Atomicity",   color: "#3b82f6", bg: "#0c1a26", desc: "Todo o nada. Si falla cualquier parte, se deshacen TODOS los cambios. Nunca queda en estado parcial." },
    { letter: "C", name: "Consistency", color: "#10b981", bg: "#051a0f", desc: "La BD pasa de un estado válido a otro estado válido. Las restricciones (PK, FK, CHECK) siempre se mantienen." },
    { letter: "I", name: "Isolation",   color: "#f59e0b", bg: "#1c1207", desc: "Transacciones concurrentes no se ven entre sí (según nivel: READ COMMITTED, SERIALIZABLE, etc.)." },
    { letter: "D", name: "Durability",  color: "#ef4444", bg: "#1a0505", desc: "Un COMMIT confirmado sobrevive a cualquier fallo del sistema. El WAL lo garantiza." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "12px 0" }}>
      {cards.map((c) => (
        <div key={c.letter} style={{ background: c.bg, border: `1px solid ${c.color}50`, borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>
              {c.letter}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.name}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{c.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WAL Flow (step bar)
   ───────────────────────────────────────────────────────────────────────────── */
export function WalFlow() {
  const steps = [
    { n: 1, label: "BEGIN Transaction",      color: "#3b82f6" },
    { n: 2, label: "Modificar página en RAM", color: "#10b981" },
    { n: 3, label: "Escribir WAL record",     color: "#f59e0b" },
    { n: 4, label: "COMMIT (fsync WAL)",      color: "#f472b6" },
    { n: 5, label: "bgwriter → disco (async)",color: "#6b7280" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", margin: "12px 0" }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ padding: "8px 10px", background: s.color + "20", border: `1px solid ${s.color}`, borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: s.color, fontWeight: 700, marginBottom: 2 }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "#e2e8f0", maxWidth: 90 }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>→</div>}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Collapsible section
   ───────────────────────────────────────────────────────────────────────────── */
export function Collapse({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ margin: "8px 0", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "var(--bg-surface)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text-secondary)",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "var(--font-ui)",
          textAlign: "left",
        }}
      >
        <span style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "inline-block" }}>›</span>
        {title}
      </button>
      {open && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-base)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Pipeline flow (horizontal steps)
   ───────────────────────────────────────────────────────────────────────────── */
export function Pipeline({
  steps,
}: {
  steps: { label: string; sub?: string; color: string }[];
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", margin: "16px 0" }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              padding: "8px 14px",
              background: s.color + "18",
              border: `1px solid ${s.color}60`,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{s.sub}</div>}
          </div>
          {i < steps.length - 1 && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M10 5l3 3-3 3" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Image placeholder (for Excalidraw diagrams)
   ───────────────────────────────────────────────────────────────────────────── */
export function DiagramPlaceholder({ label, height = 200 }: { label: string; height?: number }) {
  return (
    <div
      style={{
        margin: "12px 0",
        height,
        background: "var(--bg-surface)",
        border: "2px dashed #7c3aed",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#7c3aed",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#6d28d9" }}>Diagrama Excalidraw — pendiente</div>
    </div>
  );
}
