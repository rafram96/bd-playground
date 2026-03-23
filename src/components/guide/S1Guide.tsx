"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Formula, Divider,
  Ul, Ol, Callout, ProsCons, Table, CompareCards,
  TokenTable, LatencyChart, AcidCards, WalFlow,
  Collapse, Pipeline, DiagramPlaceholder, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (used by both TOC and IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-parser",    label: "1. Parser" },
  { id: "sec-optimizer", label: "2. Query Optimizer" },
  { id: "sec-executor",  label: "3. Executor" },
  { id: "sec-buffer",    label: "4. Buffer Manager" },
  { id: "sec-file",      label: "5. File Manager" },
  { id: "sec-tx",        label: "6. Transaction Manager" },
  { id: "sec-disk",      label: "7. Latencia de Almacenamiento" },
  { id: "sec-resumen",   label: "Resumen" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents
   ───────────────────────────────────────────────────────────────────────────── */
function Toc({ active }: { active: string }) {
  return (
    <aside
      style={{
        width: 188,
        flexShrink: 0,
        borderLeft: "1px solid var(--border)",
        padding: "36px 0 36px 16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 14,
          fontFamily: "var(--font-ui)",
        }}
      >
        En esta página
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                padding: "5px 8px",
                fontSize: 12,
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 400,
                fontFamily: "var(--font-ui)",
                cursor: "pointer",
                borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                lineHeight: 1.4,
                transition: "color 0.15s, border-color 0.15s",
                borderRadius: "0 4px 4px 0",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Interactive Architecture Diagram
   ───────────────────────────────────────────────────────────────────────────── */
const ARCH_NODES = [
  { id: "sec-parser",    label: "Parser",             sub: "Lexer  ·  AST  ·  Semántico",   color: "#3b82f6" },
  { id: "sec-optimizer", label: "Query Optimizer",     sub: "Plan lógico  →  Plan físico",   color: "#8b5cf6" },
  { id: "sec-executor",  label: "Executor",            sub: "Modelo Volcano / Iterator",      color: "#10b981" },
  { id: "sec-buffer",    label: "Buffer Manager",      sub: "shared_buffers  ·  RAM",         color: "#f59e0b" },
  { id: "sec-tx",        label: "Transaction Manager", sub: "ACID  ·  WAL  ·  MVCC",         color: "#f472b6" },
  { id: "sec-file",      label: "File Manager",        sub: "Heap files  ·  páginas 8 KB",   color: "#ef4444" },
  { id: "sec-disk",      label: "Disk  /  Storage",    sub: "HDD  ·  SSD NVMe  ·  jerarquía",color: "#6b7280" },
];

function ArchBox({ id, label, sub, color }: { id: string; label: string; sub: string; color: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => scrollToSection(id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        padding: "13px 24px",
        background: hov ? color + "28" : color + "14",
        border: `2px solid ${hov ? color : color + "55"}`,
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.15s ease",
        transform: hov ? "scale(1.012)" : "scale(1)",
        boxShadow: hov ? `0 4px 20px ${color}30` : "none",
        fontFamily: "var(--font-ui)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: hov ? color : color + "cc", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{sub}</div>
      {hov && (
        <div style={{ fontSize: 10, color: color, marginTop: 5, opacity: 0.8 }}>
          ir a la sección →
        </div>
      )}
    </button>
  );
}

function ArchArrow() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: 28, flexShrink: 0 }}>
      <div style={{ width: 2, flex: 1, background: "var(--border)" }} />
      <div style={{
        width: 0, height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: "7px solid var(--border)",
      }} />
    </div>
  );
}

function ArchDiagram() {
  return (
    <div style={{
      margin: "24px 0 36px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "28px 32px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1 }}>
          Pipeline de procesamiento — haz click para ir a cada sección
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {/* SQL pill */}
        <div style={{
          padding: "7px 28px",
          background: "#1f2937",
          border: "1px solid #374151",
          borderRadius: 20,
          fontSize: 12,
          fontFamily: "var(--font-code)",
          color: "#9ca3af",
        }}>
          SQL Query String
        </div>

        <ArchArrow />
        <ArchBox {...ARCH_NODES[0]} />
        <ArchArrow />
        <ArchBox {...ARCH_NODES[1]} />
        <ArchArrow />
        <ArchBox {...ARCH_NODES[2]} />
        <ArchArrow />

        {/* Buffer Manager ↔ Transaction Manager */}
        <div style={{ display: "flex", gap: 14, width: "100%", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <ArchBox {...ARCH_NODES[3]} />
          </div>
          <div style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0, paddingBottom: 24 }}>↔</div>
          <div style={{ flex: 1 }}>
            <ArchBox {...ARCH_NODES[4]} />
          </div>
        </div>

        <ArchArrow />
        <ArchBox {...ARCH_NODES[5]} />
        <ArchArrow />
        <ArchBox {...ARCH_NODES[6]} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   S1 Guide — main page
   ───────────────────────────────────────────────────────────────────────────── */
export default function S1Guide() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-parser");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        /* Pick the topmost visible section */
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveSection(topmost.target.id);
      },
      { root, threshold: 0, rootMargin: "-8% 0px -78% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-base)" }}>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 32px 80px" }}>

          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 1 · Módulo I — Arquitectura y Almacenamiento
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Arquitectura de un DBMS
            </h1>
            <P>
              Un DBMS no ejecuta consultas SQL directamente — las procesa a través de una cadena de
              componentes especializados. Entender este pipeline es fundamental para optimizar consultas,
              diagnosticar cuellos de botella y diseñar sistemas de base de datos eficientes.
            </P>
          </div>

          {/* Interactive diagram */}
          <ArchDiagram />

          <Callout variant="note" title="Analogía">
            Piensa en el pipeline como un compilador: el <Bold>Parser</Bold> es el front-end
            (análisis léxico + sintáctico + semántico), el <Bold>Optimizer</Bold> es el middle-end
            (optimización), y el <Bold>Executor</Bold> junto con los gestores de buffer y disco
            son el back-end (ejecución + E/S).
          </Callout>

          <Divider />

          {/* ══ 1. PARSER ══ */}
          <H2 id="sec-parser">1. Parser</H2>
          <P>
            El Parser convierte una cadena SQL en una representación interna estructurada.
            Opera en tres fases secuenciales: análisis léxico, sintáctico y semántico.
          </P>

          <DiagramPlaceholder label="Diagrama: SQL string → tokens → AST → logical plan" height={160} />

          <H3>Fase 1 — Análisis Léxico (Tokenizer)</H3>
          <P>
            El lexer recorre el texto carácter por carácter y produce una secuencia de <Bold>tokens</Bold>.
            Cada token tiene un tipo y un valor.
          </P>
          <TokenTable />
          <Callout variant="example">
            <Code>SELECT name FROM employees WHERE salary &gt; 50000</Code>
            {" "}se convierte en los tokens:{" "}
            <Code>KEYWORD(SELECT)</Code> <Code>IDENT(name)</Code> <Code>KEYWORD(FROM)</Code>{" "}
            <Code>IDENT(employees)</Code> <Code>KEYWORD(WHERE)</Code> <Code>IDENT(salary)</Code>{" "}
            <Code>OP(&gt;)</Code> <Code>NUM(50000)</Code>
          </Callout>

          <H3>Fase 2 — Análisis Sintáctico (Parser)</H3>
          <P>
            Verifica que los tokens siguen la gramática SQL (BNF / EBNF) y construye un
            <Bold> Abstract Syntax Tree (AST)</Bold>. Si la consulta tiene errores de sintaxis
            (ej. <Code>SELEC *</Code> sin la T), falla aquí con un mensaje de error.
          </P>
          <Collapse title="Nodos típicos del AST">
            <Table
              headers={["Nodo", "Descripción", "Ejemplo"]}
              rows={[
                ["SelectStmt", "Raíz de un SELECT", "SELECT … FROM …"],
                ["JoinExpr", "Representa un JOIN", "employees e JOIN depts d ON e.dept_id = d.id"],
                ["WhereClause", "Predicado de filtro", "WHERE salary > 50000"],
                ["GroupByClause", "Agrupación", "GROUP BY dept_id"],
                ["FuncCall", "Llamada a función", "COUNT(*), SUM(salary)"],
              ]}
            />
          </Collapse>

          <H3>Fase 3 — Análisis Semántico</H3>
          <P>
            Valida el AST contra el <Bold>catálogo del sistema</Bold> (<Code>pg_catalog</Code>).
            Comprueba que las tablas y columnas existen, que los tipos son compatibles y que el
            usuario tiene permisos.
          </P>
          <Ul items={[
            <><Bold>Resolución de nombres:</Bold> convierte <Code>e.name</Code> en <Code>employees.name : varchar(100)</Code></>,
            <><Bold>Comprobación de tipos:</Bold> detecta <Code>salary + &#39;texto&#39;</Code> como error de tipo</>,
            <><Bold>Verificación de permisos:</Bold> consulta <Code>pg_class</Code>, <Code>pg_attribute</Code>, <Code>pg_namespace</Code></>,
          ]} />
          <SqlCode label="Consultar el catálogo manualmente" sql={`-- Ver todas las tablas y sus tamaños estimados
SELECT relname, reltuples::bigint AS est_rows, relpages
FROM   pg_class
WHERE  relkind = 'r'
ORDER  BY relpages DESC
LIMIT  20;`} />

          <Divider />

          {/* ══ 2. OPTIMIZER ══ */}
          <H2 id="sec-optimizer">2. Query Optimizer</H2>
          <P>
            El Optimizer toma el plan lógico del Parser y produce el <Bold>plan físico óptimo</Bold>
            — la estrategia concreta de acceso a datos que minimiza el costo estimado (I/Os + CPU).
            Es el componente más complejo del DBMS.
          </P>

          <Pipeline steps={[
            { label: "Plan Lógico",    sub: "AST normalizado",       color: "#6b7280" },
            { label: "Simplificación", sub: "pushdown predicados",   color: "#3b82f6" },
            { label: "Cardinalidad",   sub: "estadísticas pg_stats", color: "#8b5cf6" },
            { label: "Enumeración",    sub: "plan space search",     color: "#10b981" },
            { label: "Plan Físico",    sub: "nodos + costos",        color: "#f59e0b" },
          ]} />

          <H3>Paso 1 — Simplificación y Pushdown</H3>
          <P>
            Aplica reglas algebraicas para mover los filtros (<Code>WHERE</Code>) lo más abajo
            posible en el árbol, reduciendo el número de filas que fluyen hacia arriba.
          </P>
          <Callout variant="definition" title="Predicate Pushdown">
            Si tenemos <Code>SELECT * FROM A JOIN B ON … WHERE A.x = 5</Code>, el filtro
            <Code> A.x = 5</Code> se aplica <Bold>antes</Bold> del JOIN, reduciendo dramáticamente
            el número de filas a combinar.
          </Callout>

          <H3>Paso 2 — Estimación de Cardinalidad</H3>
          <P>
            El Optimizer consulta <Code>pg_statistic</Code> para estimar cuántas filas producirá
            cada operación. Una estimación incorrecta genera planes subóptimos.
          </P>
          <Formula>
            Selectividad de igualdad: sel = 1 / n_distinct{"\n"}
            Selectividad de rango:    sel ≈ (max - val) / (max - min){"\n"}
            Cardinalidad estimada:    rows_out = rows_in × sel
          </Formula>
          <SqlCode label="Ver estadísticas del optimizador" sql={`-- Estadísticas de columnas usadas por el optimizador
SELECT attname, n_distinct, correlation, most_common_vals
FROM   pg_stats
WHERE  tablename = 'employees'
ORDER  BY attname;`} />

          <H3>Paso 3 — Enumeración de Planes y Selección de Costo</H3>
          <P>
            Para cada operación, el Optimizer evalúa múltiples algoritmos y elige el de menor costo.
            El costo se mide en unidades de I/O de página (configurables con <Code>seq_page_cost</Code>,
            <Code>random_page_cost</Code>, etc.).
          </P>
          <Table
            headers={["Operación", "Algoritmos disponibles", "Cuándo se prefiere"]}
            rows={[
              ["Scan", "Seq Scan, Index Scan, Index Only Scan, Bitmap Scan", "Seq si selectividad alta; Index si < ~5–10 % de filas"],
              ["Join", "Nested Loop, Hash Join, Merge Join", "Hash para tablas grandes sin orden; Merge si hay orden; NL para outer pequeño"],
              ["Aggregation", "Hash Aggregate, Sort + Group", "Hash si cabe en memoria; Sort si ya ordenado"],
              ["Sort", "Quicksort en RAM, External Merge Sort", "External si excede work_mem"],
            ]}
          />

          <H3>Paso 4 — Plan Final: EXPLAIN ANALYZE</H3>
          <SqlCode label="Ver el plan de ejecución real" sql={`EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT e.name, d.name AS dept, e.salary
FROM   employees e
JOIN   departments d ON e.dept_id = d.id
WHERE  e.salary > 80000
ORDER  BY e.salary DESC;`} />

          <Callout variant="warning" title="Trampas comunes del Optimizer">
            <Ul items={[
              <><Bold>Estimaciones incorrectas</Bold> por estadísticas desactualizadas → hacer <Code>ANALYZE tabla</Code></>,
              <><Bold>Correlación de columnas</Bold> no capturada por estadísticas individuales → usar <Code>CREATE STATISTICS</Code></>,
              <><Bold>Parámetros literales vs. prepared statements</Bold>: los primeros permiten mejor estimación</>,
            ]} />
          </Callout>

          <Divider />

          {/* ══ 3. EXECUTOR ══ */}
          <H2 id="sec-executor">3. Executor — Modelo Volcano / Iterator</H2>
          <P>
            El Executor recibe el plan físico y lo ejecuta. PostgreSQL usa el
            <Bold> modelo Volcano</Bold> (también llamado Iterator): cada nodo del plan
            implementa tres operaciones — <Code>open()</Code>, <Code>next()</Code>, <Code>close()</Code>.
          </P>

          <Callout variant="definition" title="Modelo Volcano (Graefe, 1994)">
            Cada operador es un iterador. El nodo raíz llama a <Code>next()</Code> en sus
            hijos, que a su vez llaman a los suyos. Las tuplas fluyen de abajo hacia arriba
            <Bold> una a una</Bold> (o en lotes en versiones modernas — "vectorized execution").
            Esto permite composición arbitraria de operadores sin materialización intermedia.
          </Callout>

          <DiagramPlaceholder label="Diagrama: árbol de operadores Volcano (Seq Scan → Filter → Hash Join → Sort → Limit)" height={200} />

          <H3>Operadores principales</H3>
          <Table
            headers={["Operador", "Descripción", "Parámetros clave"]}
            rows={[
              ["SeqScan", "Lee todas las páginas del heap secuencialmente", "relation, filter"],
              ["IndexScan", "Navega el índice y luego va al heap (random I/O)", "index, qual, order"],
              ["IndexOnlyScan", "Sólo lee el índice si contiene todas las columnas necesarias", "index, qual"],
              ["BitmapHeapScan", "Construye bitmap de TIDs, luego lee heap en orden físico", "bitmapqual"],
              ["HashJoin", "Construye hash table del inner, sondea con outer", "hash keys, work_mem"],
              ["MergeJoin", "Merge de dos streams ordenados", "sort keys"],
              ["NestedLoop", "Para cada fila del outer, busca en el inner", "join qual"],
              ["Sort", "Ordena en memoria o external merge sort", "sort keys, work_mem"],
              ["HashAggregate", "Agrupación con hash table", "group keys, work_mem"],
              ["Limit", "Pasa sólo las primeras N tuplas", "count, offset"],
            ]}
          />

          <H3>Seq Scan vs. Index Scan</H3>
          <CompareCards items={[
            {
              label: "Sequential Scan",
              color: "#3b82f6", bg: "#0c1a26",
              pros: ["Sin overhead de índice", "Óptimo para tablas pequeñas", "Predecible en I/O"],
              cons: ["Lee TODAS las páginas aunque filtre el 99%", "No aprovecha orden"],
              when: "Selectividad alta (> ~10–20 % de filas) o tabla pequeña",
            },
            {
              label: "Index Scan",
              color: "#10b981", bg: "#051a0f",
              pros: ["Solo lee filas relevantes", "Puede devolver datos ordenados", "Ideal para alta selectividad"],
              cons: ["Random I/O al heap (costoso en HDD)", "Overhead de páginas de índice"],
              when: "Selectividad baja (< 5–10 % de filas) con índice adecuado",
            },
            {
              label: "Bitmap Heap Scan",
              color: "#f59e0b", bg: "#1c1207",
              pros: ["Combina ventajas de ambos", "Lee heap en orden físico", "Combina múltiples índices"],
              cons: ["Overhead de construir el bitmap", "Pierde orden del índice"],
              when: "Selectividad media o combinar varios índices",
            },
          ]} />

          <Divider />

          {/* ══ 4. BUFFER MANAGER ══ */}
          <H2 id="sec-buffer">4. Buffer Manager</H2>
          <P>
            El Buffer Manager mantiene un <Bold>pool de páginas en RAM</Bold> para evitar accesos
            repetidos al disco. Es el intermediario entre el Executor y el File Manager.
            En PostgreSQL, el buffer pool se configura con <Code>shared_buffers</Code> (default: 128 MB).
          </P>

          <DiagramPlaceholder label="Diagrama: Buffer Pool — page table con frame, pin count, dirty bit" height={180} />

          <H3>Estructura del Buffer Pool</H3>
          <Ul items={[
            <><Bold>Frame:</Bold> slot en RAM que puede contener una página (8 KB por defecto en PG)</>,
            <><Bold>Page Table:</Bold> mapa de <Code>{"(tablespace, relfilenode, block#)"}</Code> → frame</>,
            <><Bold>Pin Count:</Bold> contador de transacciones usando la página. Si &gt; 0, no puede ser desalojada</>,
            <><Bold>Dirty Bit:</Bold> indica si la página fue modificada y debe escribirse al disco antes de desalojar</>,
          ]} />

          <H3>Políticas de Reemplazo</H3>
          <Table
            headers={["Política", "Idea", "Usado en"]}
            rows={[
              ["LRU (Least Recently Used)", "Desaloja la página menos recientemente accedida", "General, default en muchos DBMS"],
              ["Clock / Clock-Sweep", "Aproximación a LRU con bit de uso y puntero circular", "PostgreSQL (clock sweep)"],
              ["2Q (Two-Queue)", "Separa accesos recientes de frecuentes; protege de scans grandes", "MySQL InnoDB, Oracle"],
              ["MRU (Most Recently Used)", "Desaloja la más reciente — óptimo para ciertos scans", "Scans secuenciales largos"],
            ]}
          />

          <Callout variant="warning" title="Buffer Pool Pollution">
            Un Seq Scan en una tabla grande puede llenar el buffer pool con páginas que solo se leen una vez,
            desalojando páginas calientes. PostgreSQL lo mitiga usando el
            <Bold> strategy de buffer ring</Bold> para seq scans.
          </Callout>

          <SqlCode label="Ver uso del buffer pool en PostgreSQL" sql={`-- Páginas en shared_buffers por tabla (requiere pg_buffercache)
SELECT relname, count(*) AS buffers,
       round(count(*) * 8.0 / 1024, 1) AS mb_cached
FROM   pg_buffercache b
JOIN   pg_class c ON c.relfilenode = b.relfilenode
GROUP  BY relname
ORDER  BY buffers DESC
LIMIT  15;`} />

          <Divider />

          {/* ══ 5. FILE MANAGER ══ */}
          <H2 id="sec-file">5. File Manager — Almacenamiento Físico</H2>
          <P>
            El File Manager gestiona cómo los datos se organizan en disco. PostgreSQL usa
            <Bold> heap files</Bold> — archivos de páginas de tamaño fijo (8 KB) donde las tuplas
            se almacenan sin orden particular.
          </P>

          <H3>Jerarquía de almacenamiento</H3>
          <Pipeline steps={[
            { label: "Database",   sub: "pg_database",          color: "#6b7280" },
            { label: "Tablespace", sub: "directorio en disco",  color: "#3b82f6" },
            { label: "Relation",   sub: "heap file (1 GB max)", color: "#8b5cf6" },
            { label: "Página",     sub: "8 KB block",            color: "#10b981" },
            { label: "Tupla",      sub: "row + header",          color: "#f59e0b" },
          ]} />

          <H3>Estructura de una Página (8 KB)</H3>
          <DiagramPlaceholder label="Diagrama: layout de página — PageHeader / ItemId[] / espacio libre / tuplas" height={160} />
          <Table
            headers={["Zona", "Tamaño", "Contenido"]}
            rows={[
              ["PageHeader", "24 bytes", "LSN, checksum, flags, free space pointers"],
              ["ItemId Array", "4 bytes × N", "Punteros a tuplas: (offset, length, flags)"],
              ["Free Space", "Variable", "Espacio libre entre ItemId array y tuplas"],
              ["Tuples", "Variable", "HeapTupleHeader + datos de columnas"],
              ["Special Space", "Variable (0 para heap)", "Usado por índices (enlace a siguiente página en B+Tree)"],
            ]}
          />

          <H3>Record ID (RID / TID)</H3>
          <P>
            Cada tupla se identifica con un <Bold>TID</Bold> (Tuple Identifier) que es un par
            <Code> (block number, item index)</Code>. Los índices B+Tree almacenan TIDs en sus hojas
            para apuntar de vuelta al heap.
          </P>
          <Formula>TID = (blkno: uint32, offno: uint16)  →  identifica exactamente 1 versión de tupla</Formula>

          <Callout variant="lab" title="Lab — Inspeccionar páginas con pageinspect">
            <SqlCode sql={`-- Ver items en la primera página del heap
SELECT * FROM heap_page_items(get_raw_page('employees', 0));

-- Ver el header de la página 0
SELECT * FROM page_header(get_raw_page('employees', 0));`} />
          </Callout>

          <Divider />

          {/* ══ 6. TRANSACTION MANAGER ══ */}
          <H2 id="sec-tx">6. Transaction Manager</H2>
          <P>
            El Transaction Manager garantiza que las operaciones sobre la base de datos sean
            <Bold> ACID</Bold> — incluso ante fallos del sistema, accesos concurrentes o errores
            de la aplicación.
          </P>

          <AcidCards />

          <H3>Control de Concurrencia — MVCC en PostgreSQL</H3>
          <P>
            PostgreSQL implementa <Bold>MVCC (Multi-Version Concurrency Control)</Bold> en lugar
            del locking tradicional (2PL). Cada tupla tiene metadatos de versión:
            <Code> xmin</Code> (transacción que la creó) y <Code>xmax</Code> (transacción que la borró).
          </P>
          <Table
            headers={["Mecanismo", "Reads bloquean Writes?", "Writes bloquean Reads?", "Usado en"]}
            rows={[
              ["2PL (Two-Phase Locking)", "Sí", "Sí", "InnoDB (MySQL), SQL Server"],
              ["MVCC", "No", "No", "PostgreSQL, Oracle, MySQL InnoDB (híbrido)"],
            ]}
          />

          <Callout variant="definition" title="Niveles de aislamiento SQL (ISO/IEC 9075)">
            <Table
              headers={["Nivel", "Dirty Read", "Non-repeatable Read", "Phantom Read"]}
              rows={[
                ["READ UNCOMMITTED", "Posible", "Posible", "Posible"],
                ["READ COMMITTED (default PG)", "No", "Posible", "Posible"],
                ["REPEATABLE READ", "No", "No", "Posible*"],
                ["SERIALIZABLE", "No", "No", "No"],
              ]}
            />
            <P>* En PostgreSQL, REPEATABLE READ también previene phantoms gracias a MVCC.</P>
          </Callout>

          <H3>WAL — Write-Ahead Logging</H3>
          <P>
            Antes de modificar cualquier dato en disco, PostgreSQL escribe un
            <Bold> registro WAL</Bold> (log record). Esto garantiza la durabilidad (D de ACID)
            y permite la recuperación tras un crash.
          </P>
          <WalFlow />

          <Callout variant="note" title="¿Por qué WAL garantiza durabilidad?">
            El WAL se escribe con <Code>fsync</Code> antes del COMMIT. Si el sistema falla
            después del COMMIT, el WAL contiene suficiente información para <Bold>rehacer</Bold>
            (redo) todos los cambios. Las páginas del heap pueden escribirse asincrónicamente
            después — el WAL es la fuente de verdad.
          </Callout>

          <H3>Crash Recovery — Proceso ARIES simplificado</H3>
          <Ol items={[
            <><Bold>Fase de Análisis:</Bold> recorre el WAL desde el último checkpoint; identifica qué transacciones estaban activas al momento del crash</>,
            <><Bold>Fase Redo:</Bold> repite todas las operaciones registradas en el WAL (incluso las de transacciones que fallaron) para traer las páginas al estado en que estaban al crash</>,
            <><Bold>Fase Undo:</Bold> deshace las transacciones que estaban activas (no confirmadas) al momento del crash</>,
          ]} />

          <SqlCode label="Ver WAL y checkpoints" sql={`-- Estado del WAL y último checkpoint
SELECT pg_current_wal_lsn(),
       pg_walfile_name(pg_current_wal_lsn()) AS wal_file;

-- Ver el log de checkpoints
SELECT * FROM pg_stat_bgwriter;`} />

          <Divider />

          {/* ══ 7. DISCO ══ */}
          <H2 id="sec-disk">7. Latencia de Almacenamiento</H2>
          <P>
            El rendimiento de un DBMS está dominado por la <Bold>jerarquía de memoria</Bold>.
            Minimizar I/Os de disco es el objetivo principal del Optimizer, Buffer Manager y
            algoritmos de índices.
          </P>

          <LatencyChart />

          <Callout variant="warning" title="Regla de oro del diseño de BD">
            Un acceso aleatorio a HDD (~10 ms) es <Bold>100,000×</Bold> más lento que leer de RAM (~100 ns).
            Esta brecha es la razón de existir del buffer pool, los índices, el MVCC y los algoritmos externos.
          </Callout>

          <H3>Implicaciones de diseño</H3>
          <Table
            headers={["Objetivo", "Mecanismo", "Ejemplo en PG"]}
            rows={[
              ["Reducir I/Os totales", "Índices, buffer pool grande", "shared_buffers, work_mem"],
              ["Convertir random en secuencial", "Bitmap scans, clustering", "CLUSTER, Bitmap Heap Scan"],
              ["Explotar prefetch del SO", "Seq scans", "effective_io_concurrency"],
              ["Amortizar escrituras", "WAL + checkpoints", "checkpoint_completion_target"],
              ["Comprimir datos en disco", "TOAST, columnar (pg_column_store)", "STORAGE MAIN/EXTERNAL"],
            ]}
          />

          <ProsCons
            pros={[
              "SSD NVMe elimina el acceso rotacional (~100 µs vs 10 ms)",
              "Buffer pools grandes (shared_buffers = 25% RAM) absorben la mayoría de lecturas",
              "Seq scans eficientes gracias a prefetching del SO",
            ]}
            cons={[
              "Random I/O sigue siendo costoso incluso en SSD vs RAM",
              "Disco compartido entre WAL, heap, índices y temp files",
              "VACUUM crea I/O de fondo que puede saturar el disco",
            ]}
          />

          <Divider />

          {/* ══ RESUMEN ══ */}
          <H2 id="sec-resumen">Resumen: el camino de una consulta</H2>
          <Callout variant="example" title="Ejemplo completo">
            <Ol items={[
              <>El usuario envía <Code>SELECT name FROM employees WHERE salary &gt; 80000</Code></>,
              <><Bold>Parser</Bold>: tokeniza, construye AST, verifica que <Code>employees.salary</Code> existe y es numérico</>,
              <><Bold>Optimizer</Bold>: estima que ~5 % de filas pasan el filtro → IndexScan sobre <Code>idx_salary</Code> es más barato que SeqScan</>,
              <><Bold>Executor</Bold>: llama <Code>next()</Code> en IndexScan → obtiene TIDs → busca tuplas en el heap</>,
              <><Bold>Buffer Manager</Bold>: comprueba si las páginas están en shared_buffers; si no, las lee del disco y las carga en un frame</>,
              <><Bold>File Manager</Bold>: lee bloques del heap file; devuelve páginas de 8 KB al buffer manager</>,
              <>Las tuplas fluyen hacia arriba por el árbol Volcano → se devuelven al cliente</>,
            ]} />
          </Callout>

        </div>
      </div>

      {/* ── Right TOC ── */}
      <Toc active={activeSection} />

    </div>
  );
}
