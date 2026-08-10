"use client";

import GuideLayout from "@/components/guide/GuideLayout";
import {
  H2, H3, P, Bold, Code, Divider,
  Callout, Table, SqlCode,
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

/* ─────────────────────────────────────────────────────────────────────────────
   S14 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S14Exam() {
  return (
    <GuideLayout sections={SECTIONS}>

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
              [<Code key="compare">$gt $gte $lt $lte</Code>, "comparación numérica"],
              [<Code key="list">$in / $nin</Code>, "está / no está en lista"],
              [<Code key="logic">$or / $and / $not</Code>, "combinar / negar condiciones"],
              [<Code key="exists">$exists</Code>, "el campo existe"],
              [<span key="dot">dot notation</span>, "consultar anidados: \"detalles.fabricante\""],
              [<Code key="text">$text / $search</Code>, "búsqueda de texto (con índice text)"],
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

    </GuideLayout>
  );
}
