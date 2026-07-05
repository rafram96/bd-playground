"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Ol, Callout, Table, CompareCards,
  Collapse, Pipeline, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-timeline",     label: "1. Del relacional a NoSQL" },
  { id: "sec-limitaciones", label: "2. Límites del relacional" },
  { id: "sec-cap",          label: "3. Teorema CAP" },
  { id: "sec-modelos",      label: "4. Los 4 modelos NoSQL" },
  { id: "sec-doc",          label: "5. BD de documentos" },
  { id: "sec-mongo",        label: "6. MongoDB: modelo y estructura" },
  { id: "sec-crud",         label: "7. CRUD y operadores" },
  { id: "sec-agg",          label: "8. Agregaciones" },
  { id: "sec-indices",      label: "9. Índices" },
  { id: "sec-escala",       label: "10. Réplicas y sharding" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
   S14 Guide — NoSQL: Introducción y Bases de Datos de Documentos (MongoDB)
   ───────────────────────────────────────────────────────────────────────────── */
export default function S14Guide() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-timeline");

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
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 14 · Módulo III · NoSQL
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              NoSQL: Introducción y Bases de Datos de Documentos
            </h1>
            <P>
              El modelo relacional reinó desde los 70, pero la web, los smartphones y el Big Data trajeron datos{" "}
              <Bold>enormes, cambiantes y distribuidos</Bold> que no encajan bien en tablas rígidas con ACID.
              Ahí nace <Bold>NoSQL (Not Only SQL)</Bold>: familias de bases que sacrifican parte de la
              consistencia para ganar <Bold>flexibilidad, escalabilidad horizontal y disponibilidad</Bold>.
              Empezamos por el porqué (CAP), los cuatro modelos, y a fondo el más popular: las{" "}
              <Bold>bases de documentos con MongoDB</Bold>.
            </P>
          </div>

          {/* ══ 1. TIMELINE ══ */}
          <H2 id="sec-timeline">1. Del relacional a NoSQL</H2>
          <P>
            Las bases <Bold>relacionales</Bold> las diseñó <Bold>Edgar F. Codd (1970)</Bold> para{" "}
            <Bold>evitar la redundancia</Bold> cuando el almacenamiento era carísimo: tablas, llaves primarias y
            foráneas, índices, transacciones. Funcionó por décadas, pero el contexto cambió.
          </P>
          <Pipeline steps={[
            { label: "1970", sub: "Relacional (Codd)", color: "#3b82f6" },
            { label: "1991", sub: "WWW", color: "#8b5cf6" },
            { label: "2006/07", sub: "BigTable · DynamoDB", color: "#a855f7" },
            { label: "2009", sub: "NoSQL: Not Only SQL", color: "#10b981" },
            { label: "hoy", sub: "cloud · IA · tiempo real", color: "#f59e0b" },
          ]} />
          <Ul items={[
            <>En <Bold>2006/2007</Bold> Google (BigTable) y Amazon (DynamoDB) crean los primeros enfoques{" "}
              <Bold>distribuidos</Bold>, priorizando la <Bold>escalabilidad horizontal</Bold>.</>,
            <>En <Bold>2009</Bold>, Eric Evans reutiliza el término <Bold>NoSQL = "Not Only SQL"</Bold> para bases
              no relacionales, distribuidas y que no cumplen ACID.</>,
            <>Los <Bold>smartphones</Bold>, el streaming, la visión artificial y la IA multiplican los datos no
              estructurados.</>,
          ]} />

          <Divider />

          {/* ══ 2. LIMITACIONES ══ */}
          <H2 id="sec-limitaciones">2. Límites del modelo relacional</H2>
          <P>SQL es potente y declarativo, pero su rigidez y el costo de ACID pesan a gran escala:</P>
          <Ul items={[
            <><Bold>Modelo poco flexible:</Bold> cambiar el esquema afecta toda la base; es difícil de optimizar.</>,
            <><Bold>ACID es caro:</Bold> multi-phase locks, multi-versioning y write-ahead logging cuestan mucho.</>,
            <><Bold>La distribución no es sencilla:</Bold> repartir una BD relacional entre muchos nodos es complejo.</>,
          ]} />
          <Callout variant="warning" title="El costo del ACID (medido)">
            En un estudio clásico, un sistema con soporte transaccional completo (ACID) hacía aproximadamente{" "}
            <Bold>640 transacciones/segundo</Bold>; el mismo sistema <Bold>sin logging ni bloqueos</Bold> hacía
            aproximadamente <Bold>12 700 transacciones/segundo</Bold>. <Bold>Más del 90%</Bold> de las
            instrucciones se iban en{" "}
            <Bold>sobrecarga administrativa</Bold>, no en procesar la transacción.
          </Callout>
          <H3>Escalar hacia arriba vs hacia los lados</H3>
          <CompareCards
            items={[
              {
                label: "Escalabilidad VERTICAL",
                color: "#f59e0b",
                bg: "#1c1207",
                pros: ["Una máquina más potente (más RAM, CPU, I/O)", "Simple: no cambia la arquitectura"],
                cons: ["Tope físico y precio que se dispara", "Punto único de fallo"],
              },
              {
                label: "Escalabilidad HORIZONTAL",
                color: "#10b981",
                bg: "#051a0f",
                pros: ["Muchas máquinas comunes (nodos)", "Crece casi sin límite; tolerante a fallos"],
                cons: ["Requiere distribución y coordinación", "Consistencia más difícil (ver CAP)"],
              },
            ]}
          />
          <Callout variant="note">
            NoSQL nace justamente para la <Bold>escalabilidad horizontal</Bold>: repartir datos y carga entre
            muchos nodos, aceptando un modelo de consistencia más relajado.
          </Callout>

          <Divider />

          {/* ══ 3. CAP ══ */}
          <H2 id="sec-cap">3. Teorema CAP</H2>
          <P>En un sistema distribuido hay tres propiedades deseables, pero no se pueden garantizar las tres a la vez:</P>
          <Table
            headers={["Propiedad", "Qué significa"]}
            rows={[
              [<><Bold>C</Bold> · Consistencia</>, "Todos los nodos ven los mismos datos a la vez: una lectura devuelve siempre la última escritura."],
              [<><Bold>A</Bold> · Disponibilidad</>, "Cada solicitud recibe respuesta, incluso si algunos nodos están caídos."],
              [<><Bold>P</Bold> · Tolerancia a particiones</>, "El sistema sigue funcionando aunque falle la comunicación entre nodos."],
            ]}
          />
          <Callout variant="definition" title="La disyuntiva CAP">
            Ante un fallo de red (partición) hay que elegir:
            <Ul items={[
              <><Bold>CP</Bold> (Consistencia + Partición): el sistema puede <Bold>rechazar</Bold> solicitudes para
                no dar datos incoherentes. Fuerte consistencia (BD relacionales distribuidas).</>,
              <><Bold>AP</Bold> (Disponibilidad + Partición): el sistema <Bold>siempre responde</Bold>, aunque los
                datos puedan estar desactualizados. Alta disponibilidad: <Bold>la mayoría de las NoSQL</Bold>.</>,
            ]} />
            <Bold>No es posible garantizar las tres simultáneamente</Bold> en presencia de fallos de red.
          </Callout>

          <Divider />

          {/* ══ 4. MODELOS ══ */}
          <H2 id="sec-modelos">4. Los 4 modelos NoSQL</H2>
          <Table
            headers={["Modelo", "Idea", "Ejemplos", "Casos de uso"]}
            rows={[
              ["Clave-Valor", "Diccionario: clave única → valor", "Redis, DynamoDB", "Caché, sesiones, configuración, carrito"],
              ["Documento", "Documentos JSON/BSON flexibles y anidados", "MongoDB, CouchDB, CouchBase", "Apps web/móvil, CMS, catálogos"],
              ["Columna Ancha", "Familias de columnas; filas con muchas columnas", "BigTable, Cassandra, HBase", "Big Data, tiempo real, IoT, distribuido"],
              ["Grafo", "Nodos y relaciones (aristas)", "Neo4j", "Redes sociales, recomendación, fraude"],
            ]}
          />
          <Callout variant="note" title="¿Cuál elegir?">
            <Ul items={[
              <><Bold>Catálogo de e-commerce</Bold> (atributos distintos por producto) → <Bold>documentos</Bold> (MongoDB).</>,
              <><Bold>Sensores IoT en tiempo real</Bold> (millones de puntos, consultas por rango) → <Bold>columna ancha</Bold> (Cassandra).</>,
              <><Bold>Juego multijugador</Bold> (latencia mínima) → <Bold>clave-valor en memoria</Bold> (Redis).</>,
              <><Bold>Recomendación</Bold> (datos heterogéneos de usuarios) → <Bold>documentos</Bold> (MongoDB/CouchBase).</>,
            ]} />
          </Callout>

          <Divider />

          {/* ══ 5. DOCUMENTOS ══ */}
          <H2 id="sec-doc">5. Bases de datos de documentos</H2>
          <P>
            Guardan datos como <Bold>documentos</Bold> (JSON, BSON o XML) en vez de filas de tablas. Cada
            documento es autocontenido y puede tener su propia estructura.
          </P>
          <Ul items={[
            <><Bold>Esquema flexible:</Bold> no hay esquema fijo; se agregan campos sin migrar toda la base.</>,
            <><Bold>Escalabilidad horizontal</Bold> y alta velocidad de lectura/escritura por documento.</>,
            <><Bold>Indexación avanzada</Bold> y buen encaje con APIs web/móviles y datos dinámicos.</>,
          ]} />
          <Callout variant="example" title="Un documento JSON">
            <SqlCode sql={`{
  "nombre": "Laptop",
  "precio": 1500,
  "categoria": "Electrónica",
  "detalles": { "fabricante": "Lenovo", "garantia": "2 años" },
  "caracteristicas": ["Pantalla táctil", "SSD"]
}`} />
          </Callout>
          <H3>Productos del mercado</H3>
          <Table
            headers={["Producto", "Año", "Notas"]}
            rows={[
              ["MongoDB", "2009", "JSON/BSON, agregaciones, sharding + replicación, Atlas (DBaaS)"],
              ["CouchBase", "2010", "Motor híbrido memoria-disco, N1QL (SQL-like)"],
              ["Amazon DocumentDB", "2019", "Compatible con la API de MongoDB, gestionado en AWS"],
              ["Firebase Firestore", "2017", "Realtime, sincronización, SDKs móviles"],
            ]}
          />

          <Divider />

          {/* ══ 6. MONGO ══ */}
          <H2 id="sec-mongo">6. MongoDB: modelo y estructura</H2>
          <P>
            <Bold>MongoDB</Bold> es una BD de documentos open source que almacena en <Bold>BSON</Bold> (JSON
            binario). Es altamente escalable (sharding + replicación), con consultas ricas por agregaciones e
            índices personalizados y de texto.
          </P>
          <H3>Jerarquía</H3>
          <Pipeline steps={[
            { label: "Base de datos", sub: "use miBase", color: "#3b82f6" },
            { label: "Colección", sub: "≈ tabla", color: "#8b5cf6" },
            { label: "Documento", sub: "≈ fila (JSON/BSON)", color: "#10b981" },
          ]} />
          <SqlCode label="Crear base, colección y un documento" sql={`use ecommerce                      // crea/usa la base
db.createCollection("productos")   // crea una colección
db.productos.insertOne({ nombre: "Juan", edad: 30 })`} />
          <Collapse title="Instalación rápida (Docker / Atlas)">
            <SqlCode sql={`# Docker
docker pull mongo
docker run --name mongo -d -p 27017:27017 mongo

# Atlas (nube): crear cluster gratuito, permitir IP 0.0.0.0/0,
# conectar con la cadena:
mongodb+srv://<user>:<password>@<host>/`} />
            <P>MongoDB Compass es la GUI oficial para explorar los datos.</P>
          </Collapse>

          <Divider />

          {/* ══ 7. CRUD ══ */}
          <H2 id="sec-crud">7. CRUD y operadores</H2>
          <H3>Crear, actualizar, eliminar</H3>
          <SqlCode sql={`// Insertar
db.productos.insertOne({ nombre: "Laptop", precio: 1500, categoria: "Electrónica" })
db.productos.insertMany([ { nombre: "Smartphone", precio: 900 }, { nombre: "Audifonos", precio: 100 } ])

// Actualizar ($set reemplaza, $inc suma/resta)
db.productos.updateOne({ nombre: "Laptop" }, { $set: { precio: 1400 } })
db.productos.updateMany({ categoria: "Electrónica" }, { $inc: { precio: 100 } })

// Eliminar
db.productos.deleteOne({ nombre: "Audifonos" })
db.productos.deleteMany({ categoria: "Accesorios" })`} />
          <H3>Consultar y proyectar</H3>
          <SqlCode sql={`db.productos.find({ categoria: "Electrónica" })   // filtro
db.productos.findOne({ nombre: "Laptop" })

// Proyección: 1 = mostrar, 0 = excluir
db.productos.find({}, { nombre: 1, categoria: 1 })
db.productos.find({ categoria: "Electrónica" }, { stock: 0 })`} />
          <H3>Operadores de comparación y lógicos</H3>
          <Table
            headers={["Operador", "Significado", "Ejemplo"]}
            rows={[
              [<Code>$eq / $ne</Code>, "igual / distinto", "{ edad: { $gt: 30 } }"],
              [<Code>$gt $gte $lt $lte</Code>, "mayor / mayor-igual / menor / menor-igual", "{ precio: { $gte: 500 } }"],
              [<Code>$in / $nin</Code>, "está / no está en una lista", "{ categoria: { $in: [\"Electrónica\", \"Hogar\"] } }"],
              [<Code>$and / $or / $not</Code>, "combinar / negar condiciones", "{ $or: [ {a:1}, {b:2} ] }"],
              [<Code>$exists</Code>, "el campo existe", "{ nombre: { $exists: true } }"],
            ]}
          />
          <SqlCode label="Ejemplos combinados" sql={`// Electrónicos O precio > 500
db.productos.find({ $or: [ { categoria: "Electrónica" }, { precio: { $gt: 500 } } ] })

// Categoría Electrónica o Hogar
db.productos.find({ categoria: { $in: ["Electrónica", "Hogar"] } })`} />
          <H3>Anidados, arrays, fechas y texto</H3>
          <SqlCode sql={`// Dot notation (documentos anidados)
db.productos.find({ "detalles.fabricante": "Lenovo" })

// Arrays: contiene un valor / por posición
db.productos.find({ caracteristicas: "Pantalla táctil" })
db.productos.find({ "caracteristicas.0": "Cámara de 64MP" })

// Rango de fechas
db.productos.find({ fecha_lanzamiento: { $gte: ISODate("2023-01-01"), $lt: ISODate("2024-01-01") } })

// Búsqueda de texto (requiere índice text)
db.productos.createIndex({ descripcion: "text" })
db.productos.find({ $text: { $search: "Smart" } })
      .sort({ score: { $meta: "textScore" } })   // por relevancia`} />
          <Collapse title="Lo mismo desde Python (PyMongo)">
            <SqlCode sql={`from pymongo import MongoClient
cliente = MongoClient('mongodb://localhost:27017/')
base = cliente['ecommerce']
col = base['productos']

col.insert_one({"nombre": "Portátil", "precio": 1500, "stock": 10})
for p in col.find({"precio": {"$gt": 1000}}):
    print(p)
col.update_one({"nombre": "Portátil"}, {"$set": {"stock": 15}})
col.delete_many({"stock": {"$lt": 5}})`} />
          </Collapse>

          <Divider />

          {/* ══ 8. AGREGACIONES ══ */}
          <H2 id="sec-agg">8. Agregaciones (pipeline)</H2>
          <P>
            El <Bold>aggregation pipeline</Bold> encadena etapas (<Code>$match</Code>, <Code>$group</Code>,{" "}
            <Code>$sort</Code>, <Code>$count</Code>, ...) donde la salida de una alimenta a la siguiente. Es el
            equivalente a <Code>WHERE</Code> + <Code>GROUP BY</Code> + <Code>ORDER BY</Code> de SQL.
          </P>
          <Pipeline steps={[
            { label: "$match", sub: "filtra (WHERE)", color: "#3b82f6" },
            { label: "$group", sub: "agrupa (GROUP BY)", color: "#8b5cf6" },
            { label: "$sort", sub: "ordena (ORDER BY)", color: "#10b981" },
          ]} />
          <SqlCode label="Contar y sumar por categoría, ordenado" sql={`db.productos.aggregate([
  { $group: { _id: "$categoria",
              conteo: { $sum: 1 },
              sumaPrecio: { $sum: "$precio" } } },
  { $sort: { conteo: 1 } }
])

// Contar sólo una categoría
db.productos.aggregate([
  { $match: { categoria: "Electrónica" } },
  { $count: "total" }
])`} />
          <Callout variant="note">
            <Code>_id</Code> en <Code>$group</Code> es la <Bold>clave de agrupación</Bold>. <Code>$sum: 1</Code>{" "}
            cuenta documentos; <Code>$sum: "$campo"</Code> suma valores.
          </Callout>

          <Divider />

          {/* ══ 9. INDICES ══ */}
          <H2 id="sec-indices">9. Índices en MongoDB</H2>
          <P>
            Los índices organizan los datos para buscar más rápido. MongoDB usa principalmente <Bold>B+Tree</Bold>{" "}
            (árbol balanceado, búsquedas ordenadas y eficientes), igual que vimos en el Módulo I.
          </P>
          <Table
            headers={["Tipo", "Para qué", "Ejemplo"]}
            rows={[
              ["Llave primaria", "MongoDB indexa _id automáticamente", "(implícito)"],
              ["Un solo campo", "búsquedas rápidas por un campo", "db.user.createIndex({ score: 1 })"],
              ["Compuesto", "consultas que filtran por varios campos", "db.user.createIndex({ userid: 1, score: -1 })"],
              ["Multikey", "arrays o campos embebidos", "db.user.createIndex({ \"addr.zip\": 1 })"],
              ["Único (unique)", "impide valores duplicados", "db.users.createIndex({ dni: 1 }, { unique: true })"],
            ]}
          />
          <SqlCode label="Gestionar índices" sql={`db.productos.getIndexes()            // listar
db.users.dropIndex("nombre_del_indice")  // eliminar`} />
          <Callout variant="lab" title="Regla del índice compuesto">
            En <Code>{`{ userid: 1, score: -1 }`}</Code> el orden importa: sirve para filtrar por{" "}
            <Code>userid</Code> (y luego ordenar por <Code>score</Code>), pero no para consultas que sólo usan{" "}
            <Code>score</Code>. Es el mismo principio del índice compuesto en SQL (prefijo izquierdo).
          </Callout>

          <Divider />

          {/* ══ 10. ESCALABILIDAD ══ */}
          <H2 id="sec-escala">10. Escalabilidad: réplicas y sharding</H2>
          <P>
            Ante fallos físicos y crecimiento, MongoDB combina dos mecanismos que vimos en BD distribuidas:{" "}
            <Bold>replicación</Bold> (copias) y <Bold>sharding</Bold> (fragmentación horizontal).
          </P>
          <H3>Replica Set (replicación)</H3>
          <Ul items={[
            <>Un <Bold>Replica Set</Bold> mantiene <Bold>copias sincronizadas</Bold> de los datos en varios nodos.</>,
            <>Da <Bold>alta disponibilidad</Bold>: si el primario cae, un secundario toma su lugar (failover).</>,
            <>Recuerda la diferencia: <Bold>backup</Bold> = copia histórica para recuperación; <Bold>replicación</Bold>{" "}
              = copias vivas para disponibilidad.</>,
          ]} />
          <H3>Sharding (fragmentación horizontal)</H3>
          <P>
            El <Bold>sharding</Bold> reparte los documentos entre varios nodos (shards) según una{" "}
            <Bold>clave de partición</Bold>. Un <Bold>config server</Bold> guarda el mapa de qué shard tiene qué
            datos, y el <Bold>driver</Bold> enruta cada consulta al shard correcto.
          </P>
          <Callout variant="example" title="Sharding por sede">
            <P>Los empleados se reparten por <Code>sede</Code> entre 3 shards:</P>
            <SqlCode sql={`config.server.com  {
  mongo1: { "sede": "Arequipa" },
  mongo2: { "sede": "Trujillo" },
  mongo3: { "sede": "Lima" }
}`} />
            <P>
              Una consulta por <Code>sede = "Lima"</Code> va directo a <Code>mongo3</Code>. También se puede
              repartir por hash de la clave (ej. <Code>X % 3</Code>) para un balance uniforme (Round Robin referencia).
            </P>
          </Callout>
          <Callout variant="note" title="Sharding + Replica Set">
            En producción se combinan: cada <Bold>shard</Bold> es a su vez un <Bold>Replica Set</Bold>, logrando{" "}
            <Bold>escalabilidad</Bold> (sharding) y <Bold>disponibilidad</Bold> (replicación) a la vez.
          </Callout>

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
