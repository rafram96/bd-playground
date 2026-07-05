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
  { id: "ex-cap",       label: "2. CAP y modelos" },
  { id: "ex-crud",      label: "3. MongoDB: CRUD y operadores" },
  { id: "ex-agg",       label: "4. Agregaciones e índices" },
  { id: "ex-escala",    label: "5. Réplicas y sharding" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Local helper */
function DefList({ items }: { items: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div style={{ margin: "10px 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(([term, def], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, padding: "8px 12px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, alignItems: "baseline" }}>
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
    <aside style={{ width: 220, flexShrink: 0, borderLeft: "1px solid var(--border)", padding: "36px 0 36px 16px", overflowY: "auto" }}>
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
   S14 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S14Exam() {
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
              Semana 14 · Hoja de repaso
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Esencial para el examen
            </h1>
            <P>
              NoSQL y bases de documentos, condensado: por qué NoSQL, Teorema CAP, los 4 modelos, y MongoDB
              (CRUD, operadores, agregaciones, índices, réplicas y sharding). Para el desarrollo, ve a la guía{" "}
              <Bold>NoSQL · Documentos (MongoDB)</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Lo más preguntado">
            (1) cuándo NO usar relacional y el <Bold>costo del ACID</Bold>, (2) <Bold>Teorema CAP</Bold> (CP vs AP,
            NoSQL = AP), (3) los <Bold>4 modelos</Bold> y sus casos de uso, (4) CRUD y{" "}
            <Bold>operadores de MongoDB</Bold>, (5) <Bold>aggregation pipeline</Bold>, (6){" "}
            <Bold>sharding vs replicación</Bold>.
          </Callout>

          <Divider />

          {/* ══ 1. CONCEPTOS ══ */}
          <H2 id="ex-conceptos">1. Conceptos clave</H2>
          <DefList items={[
            ["NoSQL", <>"Not Only SQL": bases <Bold>no relacionales, distribuidas</Bold>, que relajan ACID para ganar flexibilidad y escala.</>],
            ["Escalabilidad horizontal", <>Repartir datos y carga entre <Bold>muchos nodos</Bold> (vs vertical: una máquina más grande).</>],
            ["Costo del ACID", <>Locks, versioning y logging: &gt;90% de instrucciones en <Bold>sobrecarga</Bold> (640 vs 12 700 tps del estudio).</>],
            ["Documento", <>Registro <Bold>JSON/BSON</Bold> flexible y anidado; sin esquema fijo.</>],
            ["Colección", <>Contenedor de documentos en MongoDB (≈ tabla).</>],
            ["Sharding", <>Fragmentación horizontal: repartir documentos entre nodos por una clave.</>],
            ["Replica Set", <>Copias sincronizadas para <Bold>alta disponibilidad</Bold> (failover del primario).</>],
          ]} />

          <Divider />

          {/* ══ 2. CAP ══ */}
          <H2 id="ex-cap">2. Teorema CAP y los 4 modelos</H2>
          <Table
            headers={["", "Significado"]}
            rows={[
              ["C · Consistencia", "todos los nodos ven la última escritura"],
              ["A · Disponibilidad", "toda solicitud recibe respuesta"],
              ["P · Tolerancia a particiones", "sigue funcionando ante fallos de red"],
            ]}
          />
          <Callout variant="warning" title="La clave del CAP">
            No se pueden las 3 a la vez ante una partición. <Bold>CP</Bold> = fuerte consistencia (relacionales
            distribuidas); <Bold>AP</Bold> = alta disponibilidad, datos quizá desactualizados = <Bold>la mayoría
            de NoSQL</Bold>.
          </Callout>
          <Table
            headers={["Modelo", "Ejemplos", "Caso de uso"]}
            rows={[
              ["Clave-Valor", "Redis, DynamoDB", "caché, sesiones, carrito"],
              ["Documento", "MongoDB, CouchBase", "web/móvil, CMS, catálogos"],
              ["Columna Ancha", "Cassandra, BigTable, HBase", "Big Data, IoT, tiempo real"],
              ["Grafo", "Neo4j", "redes sociales, recomendación, fraude"],
            ]}
          />

          <Divider />

          {/* ══ 3. CRUD ══ */}
          <H2 id="ex-crud">3. MongoDB: CRUD y operadores</H2>
          <SqlCode label="CRUD" sql={`db.productos.insertOne({ nombre: "Laptop", precio: 1500 })
db.productos.updateOne({ nombre: "Laptop" }, { $set: { precio: 1400 } })   // $set reemplaza
db.productos.updateMany({ categoria: "Electrónica" }, { $inc: { precio: 100 } })  // $inc suma
db.productos.deleteMany({ categoria: "Accesorios" })
db.productos.find({ categoria: "Electrónica" }, { nombre: 1, precio: 1 })  // filtro + proyección`} />
          <Table
            headers={["Operador", "Uso"]}
            rows={[
              [<Code>$gt $gte $lt $lte</Code>, "comparación numérica"],
              [<Code>$in / $nin</Code>, "está / no está en lista"],
              [<Code>$or / $and / $not</Code>, "combinar / negar condiciones"],
              [<Code>$exists</Code>, "el campo existe"],
              [<>dot notation</>, "consultar anidados: \"detalles.fabricante\""],
              [<Code>$text / $search</Code>, "búsqueda de texto (con índice text)"],
            ]}
          />

          <Divider />

          {/* ══ 4. AGG ══ */}
          <H2 id="ex-agg">4. Agregaciones e índices</H2>
          <P>El <Bold>pipeline</Bold> encadena etapas (≈ WHERE + GROUP BY + ORDER BY):</P>
          <SqlCode sql={`db.productos.aggregate([
  { $match: { categoria: "Electrónica" } },   // WHERE
  { $group: { _id: "$categoria", conteo: { $sum: 1 }, suma: { $sum: "$precio" } } },  // GROUP BY
  { $sort: { conteo: -1 } }                    // ORDER BY
])`} />
          <Callout variant="note">
            <Code>_id</Code> = clave de agrupación. <Code>$sum: 1</Code> cuenta; <Code>$sum: "$campo"</Code> suma.
          </Callout>
          <H3>Índices (B+Tree)</H3>
          <Table
            headers={["Tipo", "Ejemplo"]}
            rows={[
              ["Un campo", "createIndex({ score: 1 })"],
              ["Compuesto (importa el orden)", "createIndex({ userid: 1, score: -1 })"],
              ["Multikey (arrays)", "createIndex({ \"addr.zip\": 1 })"],
              ["Único", "createIndex({ dni: 1 }, { unique: true })"],
            ]}
          />

          <Divider />

          {/* ══ 5. ESCALA ══ */}
          <H2 id="ex-escala">5. Réplicas y sharding</H2>
          <Table
            headers={["", "Replicación (Replica Set)", "Sharding"]}
            rows={[
              ["Qué hace", "copias sincronizadas de los datos", "reparte documentos entre nodos"],
              ["Objetivo", "alta disponibilidad (failover)", "escalabilidad horizontal"],
              ["Clave", "primario + secundarios", "clave de partición (o hash) + config server"],
            ]}
          />
          <Callout variant="warning" title="No confundir">
            <Bold>Backup</Bold> = copia histórica para recuperación (permite volver atrás). <Bold>Replicación</Bold>{" "}
            = copias vivas para disponibilidad (replica también los borrados). En producción cada <Bold>shard</Bold>{" "}
            es un <Bold>Replica Set</Bold>: escalabilidad + disponibilidad juntas.
          </Callout>

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
