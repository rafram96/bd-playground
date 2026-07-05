"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "ex-conceptos", label: "1. Conceptos clave" },
  { id: "ex-cassandra", label: "2. Cassandra: modelo" },
  { id: "ex-cql",       label: "3. Partition + Clustering (CQL)" },
  { id: "ex-redis",     label: "4. Redis: persistencia y escala" },
  { id: "ex-comandos",  label: "5. Comandos, TTL y estructuras" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Local helper */
function DefList({ items }: { items: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div style={{ margin: "10px 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(([term, def], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 12, padding: "8px 12px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, alignItems: "baseline" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}>{term}</span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{def}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents (con toggle ocultar/mostrar)
   ───────────────────────────────────────────────────────────────────────────── */
function Toc({ active }: { active: string }) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <aside style={{ width: 36, flexShrink: 0, borderLeft: "1px solid var(--border)", padding: "36px 0", display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => setOpen(true)}
          title="Mostrar índice"
          aria-label="Mostrar índice"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", cursor: "pointer", width: 30, height: 30, fontSize: 15, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ☰
        </button>
      </aside>
    );
  }

  return (
    <aside style={{ width: 230, flexShrink: 0, borderLeft: "1px solid var(--border)", padding: "36px 0 36px 16px", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--font-ui)" }}>
          En esta página
        </span>
        <button
          onClick={() => setOpen(false)}
          title="Ocultar índice"
          aria-label="Ocultar índice"
          style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", cursor: "pointer", width: 26, height: 24, fontSize: 13, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          ☰
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              style={{
                display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none",
                padding: "5px 8px", fontSize: 12, color: isActive ? "var(--accent)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 400, fontFamily: "var(--font-ui)", cursor: "pointer",
                borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`, lineHeight: 1.4,
                transition: "color 0.15s, border-color 0.15s", borderRadius: "0 4px 4px 0",
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
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
   S15 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S15Exam() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("ex-conceptos");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
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
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 32px 80px" }}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 15 · Hoja de repaso
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Esencial para el examen
            </h1>
            <P>
              Columna ancha y clave-valor, condensado: Cassandra (column family, keyspace, partition + clustering
              key, CQL) y Redis (en memoria, persistencia, escalabilidad, comandos, TTL y estructuras). Para el
              desarrollo, ve a la guía <Bold>NoSQL · Columna Ancha y Clave-Valor</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Lo más preguntado">
            (1) qué es una <Bold>Column Family</Bold> y el modelo de Cassandra, (2) diferencia{" "}
            <Bold>Partition Key vs Clustering Key</Bold>, (3) leer una <Bold>PRIMARY KEY</Bold> de CQL, (4){" "}
            <Bold>persistencia de Redis</Bold> (RDB vs AOF) y modos, (5) comandos, <Bold>TTL</Bold> y{" "}
            <Bold>estructuras</Bold> de Redis.
          </Callout>

          <Divider />

          {/* ══ 1. CONCEPTOS ══ */}
          <H2 id="ex-conceptos">1. Conceptos clave</H2>
          <DefList items={[
            ["Columna ancha", <>Modelo tipo <Bold>BigTable</Bold>: filas con muchísimas columnas, esquema flexible, distribuido.</>],
            ["Column Family", <>Agrupación de columnas con la misma clave de fila. En <Bold>Cassandra = una tabla</Bold>.</>],
            ["Keyspace", <>Contenedor de tablas en Cassandra; define la <Bold>replicación</Bold>.</>],
            ["Partition Key", <>Decide <Bold>en qué nodo</Bold> vive la fila (distribución entre nodos).</>],
            ["Clustering Key", <>Decide el <Bold>orden</Bold> de las filas <Bold>dentro</Bold> de la partición.</>],
            ["Clave-Valor", <>Diccionario clave única → valor; acceso por <Bold>coincidencia exacta</Bold>.</>],
            ["Redis", <>Clave-valor <Bold>en memoria</Bold>, latencia mínima; caché, sesiones, tiempo real.</>],
            ["TTL", <><Bold>Time To Live</Bold>: tiempo antes de que Redis borre la clave automáticamente.</>],
          ]} />

          <Divider />

          {/* ══ 2. CASSANDRA ══ */}
          <H2 id="ex-cassandra">2. Cassandra: modelo</H2>
          <Table
            headers={["Concepto", "Qué es"]}
            rows={[
              ["Columna", "par nombre / valor"],
              ["Fila", "columnas con una clave primaria"],
              ["Tabla (Column Family)", "filas organizadas por particiones"],
              ["Partición", "filas relacionadas juntas en los mismos nodos"],
              ["Keyspace / Cluster", "contenedor de tablas / contenedor de keyspaces"],
            ]}
          />
          <Callout variant="definition" title="Representación interna">
            <SqlCode sql={`Map<RowKey, SortedMap<ColumnKey, ColumnValue>>`} />
            Peer-to-peer (sin maestro): alta disponibilidad + escala horizontal agregando nodos.
          </Callout>

          <Divider />

          {/* ══ 3. CQL ══ */}
          <H2 id="ex-cql">3. Partition + Clustering Key (CQL)</H2>
          <SqlCode sql={`CREATE TABLE sensor_data (
  Sensor int, Date date, Timestamp timestamp, Speed float,
  PRIMARY KEY ((Sensor, Date), Timestamp)
) WITH CLUSTERING ORDER BY (Timestamp ASC);`} />
          <Ul items={[
            <><Code>((Sensor, Date), Timestamp)</Code>: partition key = <Code>(Sensor, Date)</Code>{" "}
              (distribución), clustering key = <Code>Timestamp</Code> (orden dentro del nodo).</>,
            <>Todas las filas de un mismo <Code>(Sensor, Date)</Code> están en el <Bold>mismo nodo</Bold> y{" "}
              <Bold>ordenadas por Timestamp</Bold> → consultas por rango eficientes.</>,
          ]} />
          <Callout variant="example" title="Fraude">
            <Code>PRIMARY KEY (id_usuario, timestamp) WITH CLUSTERING ORDER BY (timestamp DESC)</Code>: las
            transacciones de cada usuario van juntas y ordenadas de la más reciente a la más antigua.
          </Callout>

          <Divider />

          {/* ══ 4. REDIS ══ */}
          <H2 id="ex-redis">4. Redis: persistencia y escalabilidad</H2>
          <Table
            headers={["Persistencia", "Qué guarda", "Trade-off"]}
            rows={[
              ["RDB (Snapshot)", "copia puntual en intervalos", "rápido; puede perder cambios recientes"],
              ["AOF (Append Only File)", "cada escritura en un log", "muy durable; el archivo crece"],
              ["Híbrido", "carga RDB + reproduce AOF", "rendimiento + durabilidad"],
            ]}
          />
          <Callout variant="note" title="Modos">
            <Bold>Standalone</Bold> (un nodo), <Bold>Sentinel</Bold> (replicación master-slave, alta
            disponibilidad), <Bold>Cluster</Bold> (sharding, escala horizontal).
          </Callout>

          <Divider />

          {/* ══ 5. COMANDOS ══ */}
          <H2 id="ex-comandos">5. Comandos, TTL y estructuras</H2>
          <SqlCode label="CRUD + TTL (no hay UPDATE: se sobrescribe con SET)" sql={`SET clave valor      GET clave      DEL clave      EXISTS clave
SETEX clave 10 valor   # crea con TTL de 10 s
EXPIRE clave 10   TTL clave   PERSIST clave`} />
          <Table
            headers={["Estructura", "Comandos", "Para qué"]}
            rows={[
              ["String", "SET · GET · INCR", "valores, contadores, caché"],
              ["Lista", "LPUSH · RPUSH · LPOP · LRANGE", "colas / pilas"],
              ["Hash", "HSET · HGET · HGETALL", "objetos con campos"],
              ["Set", "SADD · SMEMBERS · SREM", "conjuntos sin repetir"],
              ["Sorted Set (ZSET)", "ZADD · ZRANGE WITHSCORES", "rankings por score"],
            ]}
          />
          <Callout variant="warning" title="Uso típico">
            Redis brilla como <Bold>caché con TTL</Bold> delante de una BD: respuestas de API, sesiones y
            leaderboards (sorted sets). Menos carga a la base y latencia mínima.
          </Callout>

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
