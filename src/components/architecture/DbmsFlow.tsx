"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   SQL Syntax Highlighter
   ───────────────────────────────────────────────────────────────────────────── */
type TokenType = "keyword" | "fn" | "string" | "number" | "comment" | "op" | "plain";

const KW = new Set(
  "SELECT FROM WHERE JOIN ON GROUP ORDER HAVING LIMIT AS AND OR NOT IN LIKE IS NULL LEFT RIGHT INNER OUTER FULL DISTINCT CREATE DROP INDEX TABLE BEGIN COMMIT ROLLBACK WITH UNION SET VALUES INTO INSERT UPDATE DELETE EXPLAIN ANALYZE CASE WHEN THEN ELSE END ASC DESC PARTITION OVER EXISTS USING CROSS BY IF FORMAT SHOW".split(
    " "
  )
);
const FN = new Set(
  "SUM COUNT AVG MIN MAX RANK DENSE_RANK ROW_NUMBER LEAD LAG ROUND COALESCE CAST NULLIF LENGTH LOWER UPPER TRIM TO_CHAR NOW DATE_TRUNC EXTRACT ARRAY_TO_STRING GENERATE_SUBSCRIPTS FORMAT_TYPE PG_GET_INDEXDEF".split(
    " "
  )
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

interface Tok { type: TokenType; text: string }

function tokenize(sql: string): Tok[] {
  const out: Tok[] = [];
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

function SqlCode({ sql, compact }: { sql: string; compact?: boolean }) {
  const tokens = tokenize(sql);
  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid #30363d",
        borderRadius: 8,
        padding: compact ? "10px 14px" : "14px 18px",
        fontFamily: "var(--font-code)",
        fontSize: compact ? 11 : 12.5,
        lineHeight: 1.75,
        overflowX: "auto",
        whiteSpace: "pre-wrap",
      }}
    >
      {tokens.map((t, i) => (
        <span key={i} style={{ color: TC[t.type] }}>
          {t.text}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared visual primitives
   ───────────────────────────────────────────────────────────────────────────── */
function SectionBox({ title, color, children }: { title: string; color?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "7px 16px",
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
          fontWeight: 600,
          color: color ?? "var(--text-secondary)",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </div>
  );
}

function BulletList({ items, color }: { items: string[]; color?: string }) {
  return (
    <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 13, color: color ?? "var(--text-secondary)", marginBottom: 6, lineHeight: 1.6 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        background: bg,
        border: `1px solid ${color}`,
        color,
        fontSize: 11,
        fontFamily: "var(--font-code)",
        fontWeight: 600,
        margin: "2px",
      }}
    >
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component type + sidebar data
   ───────────────────────────────────────────────────────────────────────────── */
type ComponentId = "sql" | "parser" | "optimizer" | "executor" | "buffer" | "file" | "txmanager" | "disk";

const SIDEBAR: { id: ComponentId; label: string; sub: string; color: string; bg: string; parallel?: boolean }[] = [
  { id: "sql",       label: "SQL Query",   sub: "entrada del usuario",       color: "#a78bfa", bg: "#1e1b4b" },
  { id: "parser",    label: "Parser",      sub: "análisis sintáctico",        color: "#4ade80", bg: "#052e16" },
  { id: "optimizer", label: "Optimizer",   sub: "plan de ejecución óptimo",   color: "#fbbf24", bg: "#1c1207" },
  { id: "executor",  label: "Executor",    sub: "evaluación nodo a nodo",     color: "#fb923c", bg: "#1c0f05" },
  { id: "buffer",    label: "Buffer Mgr",  sub: "caché de páginas en RAM",    color: "#38bdf8", bg: "#0c1a26" },
  { id: "file",      label: "File Mgr",    sub: "organización física en disco",color: "#c084fc", bg: "#1a0a2e" },
  { id: "disk",      label: "Disco",       sub: "almacenamiento físico",      color: "#94a3b8", bg: "#0f172a" },
  { id: "txmanager", label: "TX Manager",  sub: "ACID · Lock · WAL · Recovery",color: "#f472b6", bg: "#1f0717", parallel: true },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Detail Panels — one per component
   ───────────────────────────────────────────────────────────────────────────── */

const BASIC_QUERIES = [
  {
    id: "select",
    label: "SELECT básico",
    desc: "Repaso BD I — filtro y proyección",
    sql: `SELECT emp_id, first_name, last_name, salary
FROM employees
WHERE salary > 75000
ORDER BY salary DESC
LIMIT 10;`,
  },
  {
    id: "join",
    label: "INNER JOIN",
    desc: "Combinar empleados con departamentos",
    sql: `SELECT
  e.first_name || ' ' || e.last_name AS empleado,
  d.dept_name                         AS departamento,
  e.salary
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY e.salary DESC;`,
  },
  {
    id: "group",
    label: "GROUP BY + HAVING",
    desc: "Agregación por departamento",
    sql: `SELECT
  d.dept_name,
  COUNT(e.emp_id)        AS headcount,
  ROUND(AVG(e.salary),2) AS avg_salary,
  MAX(e.salary)          AS max_salary
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
GROUP BY d.dept_name
HAVING COUNT(e.emp_id) > 5
ORDER BY avg_salary DESC;`,
  },
  {
    id: "subquery",
    label: "Subconsulta",
    desc: "Empleados sobre el promedio global",
    sql: `SELECT
  first_name || ' ' || last_name AS empleado,
  salary,
  ROUND(salary - (SELECT AVG(salary) FROM employees), 2) AS diff_vs_promedio
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;`,
  },
  {
    id: "selfJoin",
    label: "Self-JOIN (jerarquía)",
    desc: "Empleado → su manager",
    sql: `SELECT
  e.first_name || ' ' || e.last_name AS empleado,
  m.first_name || ' ' || m.last_name AS manager,
  e.salary
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.emp_id
ORDER BY manager NULLS FIRST;`,
  },
  {
    id: "window",
    label: "Window Function — RANK()",
    desc: "Nuevo en BD II — ranking por depto",
    sql: `SELECT
  d.dept_name,
  e.first_name || ' ' || e.last_name AS empleado,
  e.salary,
  RANK() OVER (
    PARTITION BY e.dept_id
    ORDER BY e.salary DESC
  ) AS rank_en_depto
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY d.dept_name, rank_en_depto;`,
  },
];

function SqlQueryPanel() {
  const [activeQuery, setActiveQuery] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Consultas Básicas — repaso BD I */}
      <SectionBox title="Consultas Básicas — Repaso BD I" color="#a78bfa">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {BASIC_QUERIES.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setActiveQuery(i)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${activeQuery === i ? "#a78bfa" : "var(--border)"}`,
                background: activeQuery === i ? "#1e1b4b" : "var(--bg-elevated)",
                color: activeQuery === i ? "#a78bfa" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: activeQuery === i ? 600 : 400,
                cursor: "pointer",
                fontFamily: "var(--font-ui)",
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
          {BASIC_QUERIES[activeQuery].desc}
          {BASIC_QUERIES[activeQuery].id === "window" && (
            <span style={{ marginLeft: 8, padding: "1px 6px", borderRadius: 4, background: "#1e1b4b", border: "1px solid #a78bfa", color: "#a78bfa", fontSize: 10 }}>
              NUEVO EN BD II
            </span>
          )}
        </div>
        <SqlCode sql={BASIC_QUERIES[activeQuery].sql} />
      </SectionBox>

      {/* Ejemplo motivador del curso */}
      <SectionBox title="Ejemplo de la clase — Semana 01" color="#a78bfa">
        <SqlCode sql={`SELECT e.name, d.dept_name, SUM(e.salary) AS suma
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE e.hire_date > '2020-01-01'
GROUP BY e.name, d.dept_name`} />
      </SectionBox>

      <SectionBox title="¿Qué hace el DBMS con esto?">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Entiende qué se pide", color: "#7c3aed", bg: "#1e1b4b" },
            { label: "Decide cómo buscarlo", color: "#1d4ed8", bg: "#0c1a26" },
            { label: "Lo busca y lo retorna", color: "#065f46", bg: "#052e16" },
          ].map((c) => (
            <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}`, borderRadius: 8, padding: "12px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
              {c.label}
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Principio clave (Silberschatz)">
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          La separación entre <strong style={{ color: "#a78bfa" }}>declaración</strong> y{" "}
          <strong style={{ color: "#fb923c" }}>ejecución física</strong> es uno de los principios clave de los DBMS. El usuario dice QUÉ quiere, el DBMS decide CÓMO obtenerlo.
        </p>
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["¿Usar un índice?", "¿Escaneo completo?", "¿Cómo acceder al disco?", "¿Cómo usar la memoria?"].map((q) => (
            <span key={q} style={{ padding: "4px 10px", borderRadius: 6, background: "var(--bg-elevated)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>{q}</span>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

function ParserPanel() {
  const tokenTypes = [
    { type: "KEYWORD",    example: "SELECT, FROM, WHERE, JOIN, GROUP BY",   color: TC.keyword, bg: "#1a0505" },
    { type: "IDENTIFIER", example: "employees, e.name, dept_id, salary",     color: TC.plain,   bg: "#0d1117" },
    { type: "LITERAL",    example: "'2020-01-01', 50000, TRUE, NULL",         color: TC.string,  bg: "#051520" },
    { type: "OPERATOR",   example: "> < = != AND OR NOT LIKE",               color: TC.op,      bg: "#111" },
    { type: "DELIMITER",  example: "( ) , ; .",                              color: "#e2e8f0",  bg: "#0d1117" },
  ];

  const sampleTokens: { text: string; color: string }[] = [
    { text: "SELECT", color: TC.keyword },
    { text: " ", color: TC.plain },
    { text: "e.name", color: TC.plain },
    { text: ", ", color: TC.op },
    { text: "d.dept_name", color: TC.plain },
    { text: ", ", color: TC.op },
    { text: "SUM", color: TC.fn },
    { text: "(", color: TC.op },
    { text: "e.salary", color: TC.plain },
    { text: ")", color: TC.op },
    { text: " FROM ", color: TC.keyword },
    { text: "employees", color: TC.plain },
    { text: " e ", color: TC.plain },
    { text: "JOIN", color: TC.keyword },
    { text: " departments ", color: TC.plain },
    { text: "d", color: TC.plain },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionBox title="Fase 1 — Análisis Léxico: Tipos de Token" color={TC.keyword}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tokenTypes.map((t) => (
            <div key={t.type} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ minWidth: 90, padding: "3px 8px", borderRadius: 4, background: t.bg, border: `1px solid ${t.color}`, color: t.color, fontSize: 11, fontFamily: "var(--font-code)", fontWeight: 700, textAlign: "center" }}>
                {t.type}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>{t.example}</span>
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Fase 1 — Tokenizando nuestra query">
        <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--font-code)", fontSize: 12.5, lineHeight: 2.2, flexWrap: "wrap", display: "flex" }}>
          {sampleTokens.map((t, i) => (
            <span key={i} style={{ color: t.color }}>{t.text}</span>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Fase 2 — AST: Operadores de Álgebra Relacional" color="#4ade80">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { op: "σ (sigma)", desc: "Selección — filtra filas", ex: "σ_{salary>50000}(Employees)" },
            { op: "π (pi)", desc: "Proyección — selecciona columnas", ex: "π_{name, dept}(Emp)" },
            { op: "⋈ (join)", desc: "Combina tablas por condición", ex: "Emp ⋈_{dept_id=id} Dept" },
            { op: "ρ (rho)", desc: "Renombrado de relaciones", ex: "ρ_{e}(employees)" },
            { op: "γ (gamma)", desc: "GROUP BY + agregación", ex: "γ_{dept, SUM(sal)}(Emp)" },
            { op: "∪ ∩ −", desc: "Unión, intersección, diferencia", ex: "A ∪ B, A ∩ B, A − B" },
          ].map((r) => (
            <div key={r.op} style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-code)" }}>{r.op}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{r.desc}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", marginTop: 4 }}>{r.ex}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Fase 3 — Verificación Semántica" color="#4ade80">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { ok: true,  label: "Existencia de tablas",    desc: "¿Existe 'employees' en el schema actual?" },
            { ok: true,  label: "Existencia de columnas",  desc: "¿Existen 'e.name', 'e.salary', 'd.dept_name'?" },
            { ok: false, label: "Ambigüedad de nombres",   desc: "Si dos tablas tienen 'id', ¿a cuál se refiere sin prefijo?" },
            { ok: true,  label: "Compatibilidad de tipos", desc: "¿Puede compararse hire_date DATE con '2020-01-01' string?" },
            { ok: true,  label: "Funciones de agregación", desc: "¿SUM() se usa con columna numérica? ¿GROUP BY incluye todo?" },
            { ok: true,  label: "Alias y resolución",      desc: "'e' y 'd' se resuelven a las tablas declaradas en FROM." },
          ].map((c) => (
            <div key={c.label} style={{ background: c.ok ? "#051a0f" : "#1a0505", border: `1px solid ${c.ok ? "#166534" : "#7f1d1d"}`, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{c.ok ? "✓" : "!"}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: c.ok ? "#4ade80" : "#f87171" }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "8px 12px", background: "#0d1117", borderRadius: 6, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>
          Fuente de verdad: <span style={{ color: TC.fn }}>pg_class</span>, <span style={{ color: TC.fn }}>pg_attribute</span>, <span style={{ color: TC.fn }}>pg_type</span>
        </div>
      </SectionBox>
    </div>
  );
}

function OptimizerPanel() {
  const steps = [
    { n: 1, label: "Reescritura Lógica",   color: "#6366f1", desc: "Aplica reglas de equivalencia: push-down de predicados, aplana vistas, elimina subconsultas redundantes." },
    { n: 2, label: "Enumeración de Planes", color: "#8b5cf6", desc: "Genera combinaciones de join orders y algoritmos (Nested Loop, Hash Join, Merge Join). Espacio factorial." },
    { n: 3, label: "Estimación de Costo",  color: "#a855f7", desc: "Para cada plan, estima costo de I/O y CPU usando estadísticas del catálogo: cardinalidad, histogramas, n_distinct." },
    { n: 4, label: "Selección del Plan",   color: "#d946ef", desc: "Elige el plan de menor costo estimado → Plan de Ejecución Físico (árbol de operadores concretos)." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionBox title="Pipeline interno del Optimizer" color="#fbbf24">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s.n}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {s.n}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ marginLeft: 15, borderLeft: "2px dashed #374151", height: 16, marginTop: 4, marginBottom: 4 }} />
              )}
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Plan físico resultante — nuestra query" color="#fbbf24">
        <SqlCode sql={`EXPLAIN (ANALYZE, FORMAT TEXT)
SELECT e.name, d.dept_name, SUM(e.salary) AS suma
FROM employees e JOIN departments d ON e.dept_id = d.id
WHERE e.hire_date > '2020-01-01'
GROUP BY e.name, d.dept_name;

-- Resultado típico:
-- HashAggregate  (GROUP BY e.name, d.dept_name)
--   -> Hash Join  (e.dept_id = d.id)
--        -> Seq Scan on departments d
--        -> Index Scan on employees e
--             Index: idx_hire_date
--             Filter: hire_date > '2020-01-01'
--
-- cost=0.00..845.32  rows=1240  width=64`} />
      </SectionBox>

      <SectionBox title="Optimización Sintáctica — Push-Down de predicados">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>ANTES</div>
            <div style={{ background: "#0d1117", borderRadius: 8, padding: "10px", fontFamily: "var(--font-code)", fontSize: 12, color: TC.plain, lineHeight: 1.8 }}>
              <div style={{ color: TC.keyword }}>σ</div>
              <div style={{ paddingLeft: 12 }}>⋈</div>
              <div style={{ paddingLeft: 24 }}>R</div>
              <div style={{ paddingLeft: 24 }}>S</div>
            </div>
          </div>
          <div style={{ fontSize: 20, color: "var(--text-muted)" }}>→</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>DESPUÉS (optimizado)</div>
            <div style={{ background: "#0d1117", borderRadius: 8, padding: "10px", fontFamily: "var(--font-code)", fontSize: 12, color: TC.plain, lineHeight: 1.8 }}>
              <div style={{ color: "#fbbf24" }}>σ_cond3</div>
              <div style={{ paddingLeft: 12 }}>⋈</div>
              <div style={{ paddingLeft: 24, color: "#fbbf24" }}>σ_cond1</div>
              <div style={{ paddingLeft: 36 }}>R</div>
              <div style={{ paddingLeft: 24, color: "#fbbf24" }}>σ_cond2</div>
              <div style={{ paddingLeft: 36 }}>S</div>
            </div>
          </div>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
          Empujar predicados reduce filas temprano → menos I/O en las operaciones superiores.
        </p>
      </SectionBox>
    </div>
  );
}

function ExecutorPanel() {
  const accessNodes = [
    { name: "Seq Scan",    color: "#38bdf8", desc: "Lee TODAS las páginas del heap. Óptimo para selectividad > 10-20%." },
    { name: "Index Scan",  color: "#4ade80", desc: "Navega el índice → fetch en heap. Para selectividad < 5-10% de filas." },
    { name: "Bitmap Scan", color: "#a78bfa", desc: "Combina múltiples índices. Reduce acceso aleatorio a disco." },
  ];
  const joinNodes = [
    { name: "Nested Loop", color: "#fb923c", desc: "O(n×m). Bueno para tablas pequeñas o cuando hay índice en el lado interno." },
    { name: "Hash Join",   color: "#fbbf24", desc: "Construye hash table del lado pequeño, escanea el grande. No requiere orden." },
    { name: "Merge Join",  color: "#f472b6", desc: "Requiere ambos lados ordenados por la clave de join. Muy eficiente si ya hay índice." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionBox title="Modelo Volcano / Iterator" color="#fb923c">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SqlCode compact sql={`-- Cada nodo implementa 3 funciones:
open()  → inicializa el nodo
next()  → retorna una tupla
close() → libera recursos

-- El nodo raíz llama next() al hijo,
-- que llama next() a su hijo, etc.
-- → Pull-based / lazy evaluation`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Árbol de ejecución:</div>
            {[
              { pad: 0,  text: "HashAggregate", color: "#a78bfa" },
              { pad: 16, text: "→ Hash Join",    color: "#fbbf24" },
              { pad: 32, text: "→ Seq Scan departments", color: "#38bdf8" },
              { pad: 32, text: "→ Index Scan employees", color: "#4ade80" },
            ].map((r) => (
              <div key={r.text} style={{ paddingLeft: r.pad, fontFamily: "var(--font-code)", fontSize: 12, color: r.color }}>
                {r.text}
              </div>
            ))}
          </div>
        </div>
      </SectionBox>

      <SectionBox title="Nodos de Acceso" color="#fb923c">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {accessNodes.map((n) => (
            <div key={n.name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Chip label={n.name} color={n.color} bg={n.color + "15"} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 3 }}>{n.desc}</span>
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Nodos de Join" color="#fbbf24">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {joinNodes.map((n) => (
            <div key={n.name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Chip label={n.name} color={n.color} bg={n.color + "15"} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 3 }}>{n.desc}</span>
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Seq Scan vs Index Scan — ¿cuándo usar cada uno?">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            {
              name: "Sequential Scan", color: "#38bdf8", bg: "#0c1a26",
              pros: ["Eficiente para tablas pequeñas", "Sin overhead de índice", "Óptimo si selectividad > 10-20%", "No requiere acceso aleatorio a disco"],
              cons: ["Muy lento en tablas grandes con filtros selectivos", "Lee TODAS las páginas, ignore el filtro"],
              when: "Tablas pequeñas · queries sin filtros · selectividad alta (muchas filas)",
            },
            {
              name: "Index Scan", color: "#4ade80", bg: "#052e16",
              pros: ["Rápido para alta selectividad (pocas filas)", "Evita leer páginas irrelevantes", "Útil para ORDER BY con índice ordenado"],
              cons: ["Acceso aleatorio a disco (costoso en HDD)", "Overhead del índice en INSERT/UPDATE/DELETE"],
              when: "Selectividad < 5-10% · columnas en WHERE con índice · ORDER BY con índice",
            },
          ].map((s) => (
            <div key={s.name} style={{ background: s.bg, border: `1px solid ${s.color}40`, borderRadius: 8, padding: "12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 4 }}>✓ Ventajas</div>
              {s.pros.map((p) => <div key={p} style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 3 }}>• {p}</div>)}
              <div style={{ fontSize: 11, color: "#f87171", marginTop: 8, marginBottom: 4 }}>✗ Limitaciones</div>
              {s.cons.map((c) => <div key={c} style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 3 }}>• {c}</div>)}
              <div style={{ marginTop: 10, padding: "6px 8px", background: "#0d1117", borderRadius: 6, fontSize: 11, color: "var(--text-muted)" }}>
                Usar cuando: {s.when}
              </div>
            </div>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

function BufferPanel() {
  const policies = [
    { name: "LRU",   color: "#fb923c", desc: "Least Recently Used. Expulsa la página menos usada recientemente. Default en muchos DBMS." },
    { name: "Clock", color: "#fbbf24", desc: "Clock / Second Chance. Aproximación eficiente de LRU con puntero circular y bit de referencia." },
    { name: "LRU-K", color: "#4ade80", desc: "LRU de K referencias. Considera las últimas K referencias. PostgreSQL usa una variante." },
    { name: "MRU",   color: "#38bdf8", desc: "Most Recently Used. Óptimo para sequential scans completos donde la página no se reutilizará." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionBox title="Buffer Pool — caché de páginas en RAM" color="#38bdf8">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Page Table (mapeo lógico→físico)</div>
            <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "10px", fontFamily: "var(--font-code)", fontSize: 11 }}>
              {[
                { pid: "page_1", frame: "frame 0", pin: 2, dirty: false },
                { pid: "page_3", frame: "frame 1", pin: 0, dirty: true },
                { pid: "page_2", frame: "frame 2", pin: 1, dirty: false },
                { pid: "—",     frame: "frame 3", pin: 0, dirty: false },
              ].map((r) => (
                <div key={r.frame} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <span style={{ color: r.pid === "—" ? "#374151" : "#a78bfa", minWidth: 52 }}>{r.pid}</span>
                  <span style={{ color: "var(--text-muted)" }}>→</span>
                  <span style={{ color: "#38bdf8", minWidth: 52 }}>{r.frame}</span>
                  <span style={{ color: "#6e7681" }}>pin:{r.pin}</span>
                  {r.dirty && <span style={{ color: "#f87171", fontSize: 10, padding: "1px 4px", background: "#1a0505", borderRadius: 3 }}>dirty</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#38bdf8" }}>Buffer Pool</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Frames de tamaño fijo (8 KB en PostgreSQL). El DBMS lo controla directamente, sin delegar al OS.</div>
            </div>
            <div style={{ background: "#1a0505", borderRadius: 8, padding: "10px 12px", border: "1px solid #7f1d1d" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#f87171" }}>Dirty Pages</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Modificadas en RAM pero NO escritas a disco. Antes de flushear → el WAL ya debe estar en disco.</div>
            </div>
            <div style={{ background: "#051a0f", borderRadius: 8, padding: "10px 12px", border: "1px solid #166534" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#4ade80" }}>Pin Count &gt; 0</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>El frame NO puede ser reemplazado. El Executor hace unpin al terminar.</div>
            </div>
          </div>
        </div>
      </SectionBox>

      <SectionBox title="Políticas de Reemplazo" color="#38bdf8">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {policies.map((p) => (
            <div key={p.name} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ minWidth: 56, padding: "4px 0", textAlign: "center", borderRadius: 6, background: p.color + "20", border: `1px solid ${p.color}`, color: p.color, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-code)" }}>
                {p.name}
              </div>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 4, lineHeight: 1.5 }}>{p.desc}</span>
            </div>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

function FilePanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionBox title="Jerarquía de Almacenamiento" color="#c084fc">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { label: "Buffer Manager",         color: "#a855f7", bg: "#3b0764" },
            { label: "Heap Files / Segmentos", color: "#9333ea", bg: "#2e1065" },
            { label: "Páginas (Pages/Blocks)", color: "#7c3aed", bg: "#1e1b4b" },
            { label: "Registros (Tuples)",     color: "#6d28d9", bg: "#1a1030" },
            { label: "Almacenamiento Físico",  color: "#ef4444", bg: "#1a0505" },
          ].map((l) => (
            <div key={l.label} style={{ padding: "10px 16px", background: l.bg, border: `1px solid ${l.color}50`, borderRadius: 6, fontSize: 13, fontWeight: 600, color: l.color, textAlign: "center" }}>
              {l.label}
            </div>
          ))}
        </div>
      </SectionBox>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SectionBox title="Estructura de una Página" color="#c084fc">
          <div style={{ display: "flex", flexDirection: "column", gap: 3, fontFamily: "var(--font-code)", fontSize: 12 }}>
            {[
              { label: "Header (24 bytes)", color: "#c084fc", bg: "#1a0a2e" },
              { label: "ItemId Array",      color: "#a78bfa", bg: "#1e1b4b" },
              { label: "Espacio Libre",     color: "#4ade80", bg: "#052e16" },
              { label: "Tupla N",           color: "#fb923c", bg: "#1c0f05" },
              { label: "Tupla 2",           color: "#fb923c", bg: "#1c0f05" },
              { label: "Tupla 1",           color: "#fb923c", bg: "#1c0f05" },
            ].map((r) => (
              <div key={r.label} style={{ padding: "6px 10px", background: r.bg, border: `1px solid ${r.color}40`, borderRadius: 4, color: r.color }}>
                {r.label}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
            <strong style={{ color: "#f87171" }}>RID = (page_id, slot_number)</strong> — identificador físico único de cada tupla.
          </div>
        </SectionBox>

        <SectionBox title="Heap File y Operaciones" color="#c084fc">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { op: "INSERT", color: "#4ade80",  desc: "Agrega al final (append). No reordena." },
              { op: "DELETE", color: "#f87171",  desc: "Marca tupla como inválida (MVCC). No borra físicamente." },
              { op: "UPDATE", color: "#fbbf24",  desc: "DELETE + INSERT en PostgreSQL (MVCC). Genera tupla nueva." },
              { op: "VACUUM", color: "#a78bfa",  desc: "Limpia tuplas muertas y devuelve espacio al heap." },
            ].map((o) => (
              <div key={o.op} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ minWidth: 52, padding: "2px 6px", background: o.color + "15", border: `1px solid ${o.color}`, borderRadius: 4, color: o.color, fontSize: 11, fontFamily: "var(--font-code)", fontWeight: 700, textAlign: "center" }}>
                  {o.op}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 2 }}>{o.desc}</span>
              </div>
            ))}
          </div>
        </SectionBox>
      </div>
    </div>
  );
}

function TxManagerPanel() {
  const acid = [
    { letter: "A", name: "Atomicity",   color: "#3b82f6", bg: "#0c1a26", desc: "Todo o nada. Si falla cualquier parte, se deshacen TODOS los cambios. Nunca queda en estado parcial." },
    { letter: "C", name: "Consistency", color: "#10b981", bg: "#051a0f", desc: "La BD pasa de un estado válido a otro estado válido. Las restricciones (PK, FK, CHECK) siempre se mantienen." },
    { letter: "I", name: "Isolation",   color: "#f59e0b", bg: "#1c1207", desc: "Transacciones concurrentes no se ven entre sí (según nivel configurado: READ COMMITTED, SERIALIZABLE, etc.)." },
    { letter: "D", name: "Durability",  color: "#ef4444", bg: "#1a0505", desc: "Un COMMIT confirmado sobrevive a cualquier fallo del sistema. El WAL lo garantiza." },
  ];

  const walFlow = [
    { n: 1, label: "BEGIN Transaction",         color: "#3b82f6" },
    { n: 2, label: "Modificar página en RAM",    color: "#10b981" },
    { n: 3, label: "Escribir WAL record",         color: "#f59e0b" },
    { n: 4, label: "COMMIT (fsync WAL)",          color: "#f472b6" },
    { n: 5, label: "bgwriter flushea a disco",    color: "#6b7280" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionBox title="ACID — Propiedades de las Transacciones" color="#f472b6">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {acid.map((a) => (
            <div key={a.letter} style={{ background: a.bg, border: `1px solid ${a.color}50`, borderRadius: 8, padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {a.letter}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: a.color }}>{a.name}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Write-Ahead Log (WAL) — Flujo" color="#f472b6">
        <div style={{ padding: "10px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, fontSize: 12, color: "#fbbf24", marginBottom: 12, lineHeight: 1.6 }}>
          PRINCIPIO WAL: Todo cambio debe registrarse en el log <strong>ANTES</strong> de que la página modificada se escriba en disco.
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {walFlow.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ padding: "8px 10px", background: s.color + "20", border: `1px solid ${s.color}`, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 700, marginBottom: 2 }}>{s.n}</div>
                <div style={{ fontSize: 11, color: "#e2e8f0", maxWidth: 80 }}>{s.label}</div>
              </div>
              {i < walFlow.length - 1 && <div style={{ color: "var(--text-muted)", fontSize: 16 }}>→</div>}
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Subcomponentes del Transaction Manager" color="#f472b6">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            {
              name: "Lock Manager", color: "#f472b6",
              items: ["Locks compartidos (S) y exclusivos (X)", "Detecta deadlocks: wait-for graph", "Protocolo 2PL: crecimiento → lock → decrecimiento"],
            },
            {
              name: "Log Manager (WAL)", color: "#f472b6",
              items: ["Escribe cada cambio en log ANTES de disco", "Force-the-Log: fsync en cada COMMIT", "Garantiza Durability y permite Recovery"],
            },
            {
              name: "Recovery Manager", color: "#f472b6",
              items: ["REDO: re-aplica tx confirmadas no escritas", "UNDO: revierte tx incompletas al crash", "Checkpoint: limita cuánto log releer"],
            },
          ].map((c) => (
            <div key={c.name} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 8 }}>{c.name}</div>
              {c.items.map((item) => <div key={item} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 5, lineHeight: 1.5 }}>• {item}</div>)}
            </div>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

function DiskPanel() {
  const latencies = [
    { label: "CPU Register", value: "< 1 ns",   pct: 1,   color: "#4ade80" },
    { label: "L1 Cache",     value: "~1 ns",    pct: 2,   color: "#86efac" },
    { label: "L2/L3 Cache",  value: "~10 ns",   pct: 5,   color: "#fbbf24" },
    { label: "RAM (Buffer)", value: "~100 ns",  pct: 12,  color: "#fb923c" },
    { label: "SSD NVMe",     value: "~100 µs",  pct: 40,  color: "#f97316" },
    { label: "SSD SATA",     value: "~500 µs",  pct: 65,  color: "#ef4444" },
    { label: "HDD (7200rpm)",value: "~10 ms",   pct: 100, color: "#dc2626" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionBox title="Latencia — Por qué el I/O importa tanto" color="#94a3b8">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {latencies.map((l) => (
            <div key={l.label} style={{ display: "grid", gridTemplateColumns: "130px 1fr 70px", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.label}</span>
              <div style={{ background: "#1f2937", borderRadius: 4, height: 18, overflow: "hidden" }}>
                <div style={{ width: `${l.pct}%`, height: "100%", background: l.color, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 11, color: l.color, fontFamily: "var(--font-code)", textAlign: "right" }}>{l.value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "8px 12px", background: "#1a0505", border: "1px solid #7f1d1d", borderRadius: 8, fontSize: 12, color: "#fca5a5", lineHeight: 1.6 }}>
          <strong>1 acceso a HDD = 10,000,000 instrucciones de CPU.</strong><br />
          El Buffer Manager existe precisamente para evitar este costo.
        </div>
      </SectionBox>

      <SectionBox title="Qué vive en disco (Database)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { name: "raw data",  color: "#94a3b8", desc: "Heap files con las tuplas. Organizados en páginas de 8KB." },
            { name: "indices",   color: "#a78bfa", desc: "Estructuras B+Tree, Hash, GiST, GIN apuntando a RIDs." },
            { name: "catalog",   color: "#38bdf8", desc: "pg_class, pg_attribute, pg_statistic, pg_index, etc." },
          ].map((d) => (
            <div key={d.name} style={{ background: "var(--bg-elevated)", border: `1px solid ${d.color}40`, borderRadius: 8, padding: "12px" }}>
              <div style={{ fontFamily: "var(--font-code)", fontSize: 13, fontWeight: 700, color: d.color, marginBottom: 6 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox title="Organización de Archivos — Tipos">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Sequential FO", "Heap FO", "Hash FO", "ISAM", "B+ Tree FO", "Cluster FO"].map((fo) => (
            <Chip key={fo} label={fo} color="#94a3b8" bg="#1e293b" />
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Full Flow (recapitulación)
   ───────────────────────────────────────────────────────────────────────────── */
const FULL_FLOW = [
  { step: 1, id: "parser"    as ComponentId, label: "PARSER",     color: "#4ade80", desc: "Tokeniza el SQL → construye el AST → verifica 'employees', 'departments', 'e.name', 'hire_date' en pg_catalog." },
  { step: 2, id: "optimizer" as ComponentId, label: "OPTIMIZER",  color: "#fbbf24", desc: "Genera planes candidatos → estima costos con pg_statistic → elige: Index Scan en employees + Hash Join + Hash Aggregate." },
  { step: 3, id: "executor"  as ComponentId, label: "EXECUTOR",   color: "#fb923c", desc: "Recorre el plan de arriba abajo. Llama next() en cada nodo. Para leer datos, llama al Buffer Manager." },
  { step: 4, id: "buffer"    as ComponentId, label: "BUFFER MGR", color: "#38bdf8", desc: "¿Está la página en RAM? → cache hit, retorna inmediatamente. No está? → pide al File Manager que la cargue desde disco." },
  { step: 5, id: "file"      as ComponentId, label: "FILE MGR",   color: "#c084fc", desc: "Traduce page_id → offset en archivo del SO. Lee 8 KB del disco. El Buffer Manager guarda la página en un frame libre." },
  { step: 6, id: "txmanager" as ComponentId, label: "TX MANAGER", color: "#f472b6", desc: "Durante todo el proceso: gestiona locks de lectura (S-locks), registra operaciones en WAL, libera locks al COMMIT." },
  { step: 7, id: "disk"      as ComponentId, label: "DISCO",      color: "#94a3b8", desc: "Fuente última de los datos. Los 8KB de la página viajan: Disco → File Mgr → Buffer Pool → Executor → Aplicación." },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Componente principal
   ───────────────────────────────────────────────────────────────────────────── */
export default function DbmsFlow() {
  const [selected, setSelected] = useState<ComponentId>("parser");
  const [view, setView] = useState<"pipeline" | "fullflow">("pipeline");

  const comp = SIDEBAR.find((c) => c.id === selected)!;

  const PANELS: Record<ComponentId, React.ReactNode> = {
    sql:       <SqlQueryPanel />,
    parser:    <ParserPanel />,
    optimizer: <OptimizerPanel />,
    executor:  <ExecutorPanel />,
    buffer:    <BufferPanel />,
    file:      <FilePanel />,
    txmanager: <TxManagerPanel />,
    disk:      <DiskPanel />,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}>
      {/* Header */}
      <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", flexShrink: 0, display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Arquitectura Interna de un DBMS</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Semana 01 · Módulo I — ¿Cómo transforma una SQL en operaciones físicas sobre disco?</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {(["pipeline", "fullflow"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "4px 14px", borderRadius: 6, border: "1px solid var(--border)", background: view === v ? "var(--accent)" : "var(--bg-elevated)", color: view === v ? "#fff" : "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-ui)" }}>
              {v === "pipeline" ? "Pipeline Interactivo" : "Flujo Completo"}
            </button>
          ))}
        </div>
      </div>

      {view === "pipeline" ? (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <div style={{ width: 210, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--bg-surface)", display: "flex", flexDirection: "column", padding: "16px 12px", gap: 0, overflowY: "auto" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Haz clic en un componente</div>
            {SIDEBAR.filter((c) => !c.parallel).map((c, i, arr) => (
              <div key={c.id}>
                <button onClick={() => setSelected(c.id)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: selected === c.id ? `2px solid ${c.color}` : "2px solid transparent", background: selected === c.id ? c.bg : "var(--bg-elevated)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0, boxShadow: selected === c.id ? `0 0 8px ${c.color}` : "none" }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selected === c.id ? c.color : "var(--text-primary)" }}>{c.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{c.sub}</div>
                  </div>
                </button>
                {i < arr.length - 1 && <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "3px 0" }}>↓</div>}
              </div>
            ))}
            <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Paralelo a todo el flujo</div>
              {SIDEBAR.filter((c) => c.parallel).map((c) => (
                <button key={c.id} onClick={() => setSelected(c.id)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: selected === c.id ? `2px solid ${c.color}` : "2px dashed var(--border)", background: selected === c.id ? c.bg : "var(--bg-elevated)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0, boxShadow: selected === c.id ? `0 0 8px ${c.color}` : "none" }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selected === c.id ? c.color : "var(--text-primary)" }}>{c.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{c.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {/* Component header */}
              <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: comp.bg, border: `2px solid ${comp.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: comp.color, boxShadow: `0 0 10px ${comp.color}` }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: comp.color, margin: 0 }}>{comp.label}</h2>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{comp.sub}</div>
                </div>
              </div>
              {PANELS[selected]}
            </div>
          </div>
        </div>
      ) : (
        /* Full Flow View */
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>El Flujo Completo — Recapitulando</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Siguiendo la query de ejemplo de principio a fin. Clic en un paso para ver su detalle.</p>
            </div>
            <SqlCode sql={`SELECT e.name, d.dept_name, SUM(e.salary) AS suma
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE e.hire_date > '2020-01-01'
GROUP BY e.name, d.dept_name`} />
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {FULL_FLOW.map((s) => (
                <button key={s.step} onClick={() => { setSelected(s.id); setView("pipeline"); }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = s.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div style={{ minWidth: 100, padding: "4px 10px", borderRadius: 6, background: s.color + "22", border: `1px solid ${s.color}`, fontSize: 11, fontWeight: 700, color: s.color, fontFamily: "var(--font-code)", textAlign: "center" }}>
                    {s.step} {s.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
