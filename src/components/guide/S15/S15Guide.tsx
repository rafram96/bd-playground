"use client";

import GuideLayout from "@/components/guide/GuideLayout";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, CompareCards,
  Collapse, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-columna",      label: "1. BD de columna ancha" },
  { id: "sec-family",       label: "2. Column Family" },
  { id: "sec-cassandra",    label: "3. Cassandra: modelo" },
  { id: "sec-partition",    label: "4. Partition + Clustering Key" },
  { id: "sec-fraude",       label: "5. Ejemplo: fraude (CQL)" },
  { id: "sec-kv",           label: "6. BD clave-valor" },
  { id: "sec-redis",        label: "7. Redis: características" },
  { id: "sec-persistencia", label: "8. Persistencia y escalabilidad" },
  { id: "sec-comandos",     label: "9. Comandos y TTL" },
  { id: "sec-estructuras",  label: "10. Estructuras de datos" },
];


/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents (con toggle ocultar/mostrar)
   ───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   S15 Guide — NoSQL: Columna Ancha (Cassandra) y Clave-Valor (Redis)
   ───────────────────────────────────────────────────────────────────────────── */
export default function S15Guide() {
  return (
    <GuideLayout sections={SECTIONS}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 15 · Módulo III · NoSQL
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              NoSQL: Columna Ancha (Cassandra) y Clave-Valor (Redis)
            </h1>
            <P>
              Cerramos NoSQL con dos modelos más. Las <Bold>bases de columna ancha</Bold> (Cassandra, inspiradas
              en BigTable) están hechas para <Bold>Big Data distribuido</Bold> y consultas por rango a gran
              escala. Las <Bold>bases clave-valor</Bold> (Redis) son diccionarios <Bold>en memoria</Bold> con
              latencia mínima, ideales para caché, sesiones y datos en tiempo real.
            </P>
          </div>

          {/* ══ 1. COLUMNA ANCHA ══ */}
          <H2 id="sec-columna">1. Bases de datos de columna ancha</H2>
          <P>
            Inspiradas en el modelo <Bold>BigTable</Bold> de Google, organizan los datos por{" "}
            <Bold>columnas</Bold> en vez de filas tradicionales, con esquema flexible y pensadas para{" "}
            <Bold>escalar horizontalmente</Bold>.
          </P>
          <Ul items={[
            <><Bold>Esquema flexible:</Bold> ciertas columnas solo aplican a ciertos registros.</>,
            <>Las filas se identifican por una <Bold>clave primaria</Bold> (simple o compuesta).</>,
            <><Bold>Alta disponibilidad:</Bold> datos replicados automáticamente entre nodos; procesamiento distribuido.</>,
          ]} />
          <Callout variant="note" title="Agregar una columna nueva">
            En una BD <Bold>relacional</Bold>, agregar una columna obliga a rellenar con <Bold>NULL</Bold> las
            demás filas. En una BD de <Bold>columna ancha</Bold>, se agrega la columna solo a los registros que la
            necesitan, <Bold>sin tocar</Bold> los datos existentes.
          </Callout>

          <Divider />

          {/* ══ 2. COLUMN FAMILY ══ */}
          <H2 id="sec-family">2. Column Family (familia de columnas)</H2>
          <P>Dos preguntas clave:</P>
          <Ul items={[
            <><Bold>¿Por qué "columna ancha"?</Bold> porque cada fila puede tener un <Bold>número enorme de columnas</Bold> (y distintas por fila).</>,
            <><Bold>¿Qué es una Column Family?</Bold> una <Bold>agrupación de columnas</Bold> que comparten la misma clave de fila. En BigTable/HBase es un grupo lógico explícito; en <Bold>Cassandra equivale a una tabla</Bold>.</>,
          ]} />
          <H3>Productos del mercado</H3>
          <Table
            headers={["Producto", "Año", "Notas"]}
            rows={[
              ["Google BigTable", "2005", "análisis en tiempo real, almacenamiento masivo, IoT"],
              ["Apache Cassandra", "2008", "escalabilidad horizontal, alta disponibilidad, Big Data"],
              ["HBase", "2008", "integración con Hadoop, consistencia fuerte"],
              ["ScyllaDB", "2015", "compatible con Cassandra, baja latencia, alto rendimiento"],
            ]}
          />

          <Divider />

          {/* ══ 3. CASSANDRA MODELO ══ */}
          <H2 id="sec-cassandra">3. Cassandra: modelo de datos</H2>
          <P>
            <Bold>Apache Cassandra</Bold> (originalmente de Facebook) organiza los datos en <Bold>tablas</Bold>{" "}
            dentro de <Bold>keyspaces</Bold>, y se consulta con <Bold>CQL</Bold>. Es{" "}
            <Bold>peer-to-peer</Bold> (sin nodo maestro): alta disponibilidad y escalabilidad horizontal
            agregando nodos.
          </P>
          <Table
            headers={["Concepto", "Qué es"]}
            rows={[
              ["Columna", "un par nombre / valor"],
              ["Fila", "contenedor de columnas identificado por una clave primaria"],
              ["Tabla (Column Family)", "contenedor de filas organizadas por particiones"],
              ["Partición", "colección de filas relacionadas almacenadas juntas en los mismos nodos"],
              ["Keyspace", "contenedor de tablas (define la replicación)"],
              ["Cluster", "contenedor de keyspaces que abarca uno o más nodos"],
            ]}
          />
          <Callout variant="definition" title="Representación interna">
            Cassandra guarda las filas como un mapa de mapas:
            <SqlCode sql={`Map<RowKey, SortedMap<ColumnKey, ColumnValue>>`} />
            La fila es una clave que apunta a un mapa <Bold>ordenado</Bold> de columnas.
          </Callout>
          <SqlCode label="Crear un keyspace con replicación" sql={`CREATE KEYSPACE mi_keyspace WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 3
};`} />

          <Divider />

          {/* ══ 4. PARTITION + CLUSTERING ══ */}
          <H2 id="sec-partition">4. Partition Key + Clustering Key</H2>
          <Callout variant="definition" title="La clave primaria manda">
            En Cassandra la <Bold>PRIMARY KEY</Bold> tiene dos partes:
            <Ul items={[
              <><Bold>Partition Key:</Bold> decide <Bold>en qué nodo</Bold> se almacena la fila (cómo se{" "}
                <Bold>distribuyen</Bold> los datos entre nodos).</>,
              <><Bold>Clustering Key:</Bold> decide <Bold>cómo se ordenan</Bold> las filas <Bold>dentro</Bold> de esa
                partición (cómo se almacenan en el nodo).</>,
            ]} />
          </Callout>
          <SqlCode label="Fragmentación horizontal en Cassandra" sql={`CREATE TABLE sensor_data (
  Sensor    int,
  Date      date,
  Timestamp timestamp,
  Speed     float,
  Torque    float,
  Power     float,
  PRIMARY KEY ((Sensor, Date), Timestamp)
) WITH CLUSTERING ORDER BY (Timestamp ASC);`} />
          <Ul items={[
            <><Code>((Sensor, Date), Timestamp)</Code>: la <Bold>partition key</Bold> es{" "}
              <Code>(Sensor, Date)</Code> (compuesta) y la <Bold>clustering key</Bold> es <Code>Timestamp</Code>.</>,
            <>Todas las lecturas de un mismo <Code>(Sensor, Date)</Code> caen en el <Bold>mismo nodo</Bold> y
              vienen <Bold>ordenadas por Timestamp</Bold>: ideal para consultas por rango de tiempo.</>,
          ]} />
          <PartitionClusteringDiagram />
          <Callout variant="warning" title="Cuidado con una mala partition key">
            Si eliges una partition key con pocos valores o muy desbalanceada (ej. un sensor "estrella" con casi
            todos los datos), esa partición crece enorme y cae siempre en el <Bold>mismo nodo</Bold>: es una{" "}
            <Bold>hot partition</Bold> que satura ese nodo mientras los demás están ociosos. Se busca una clave
            que <Bold>reparta parejo</Bold> la carga.
          </Callout>

          <Divider />

          {/* ══ 5. EJEMPLO FRAUDE ══ */}
          <H2 id="sec-fraude">5. Ejemplo: detección de fraude</H2>
          <P>
            Un sistema de pagos quiere detectar transacciones sospechosas en tiempo real. Se particiona por{" "}
            <Bold>usuario</Bold> y se ordena por <Bold>fecha descendente</Bold> (ver primero las más recientes):
          </P>
          <SqlCode sql={`CREATE TABLE transacciones (
  id_usuario  UUID,
  timestamp   timestamp,
  monto       decimal,
  ubicacion   text,
  metodo_pago text,
  PRIMARY KEY (id_usuario, timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);

-- Insertar una transacción sospechosa (monto elevado)
INSERT INTO transacciones (id_usuario, timestamp, monto, ubicacion, metodo_pago)
VALUES (uuid(), toTimestamp(now()), 5000.00, 'New York', 'Tarjeta de Crédito');

-- Transacciones del usuario en las últimas 24 horas
SELECT * FROM transacciones
WHERE id_usuario = <UUID> AND timestamp >= <TIMESTAMP_HACE_24_HORAS>;`} />
          <Callout variant="note">
            Todas las transacciones de un usuario están en la <Bold>misma partición</Bold> y ordenadas por{" "}
            <Bold>timestamp descendente</Bold>: se construyen alertas en tiempo real y consultas por rango muy
            eficientes.
          </Callout>

          <Divider />

          {/* ══ 6. CLAVE-VALOR ══ */}
          <H2 id="sec-kv">6. Bases de datos clave-valor</H2>
          <P>
            El modelo más simple: una colección de pares <Bold>clave → valor</Bold>. La clave es <Bold>única</Bold>{" "}
            y los datos se obtienen por <Bold>coincidencia exacta</Bold> con la clave.
          </P>
          <Ul items={[
            <>Ideal para <Bold>CRUD básico rápido</Bold>; no está pensado para consultas complejas.</>,
            <>El valor puede ser un número, cadena o algo más complejo (hasta un JSON).</>,
          ]} />
          <Callout variant="note" title="Casos de uso">
            Caché, <Bold>sesiones de usuario</Bold>, perfiles y preferencias, carrito de compras, datos
            geoespaciales, colas de mensajes.
          </Callout>
          <Table
            headers={["Producto", "Almacenamiento", "Persistencia", "Casos"]}
            rows={[
              ["Redis (2009)", "en memoria", "opcional (RDB + AOF)", "caché, sesiones, colas"],
              ["DynamoDB (2012)", "SSD gestionado (AWS)", "sí (gestionado)", "web/móvil, IoT, gaming"],
              ["Memcached (2003)", "en memoria", "no", "caché distribuido"],
              ["Riak KV (2009)", "disco y memoria", "sí", "distribuido, big data"],
            ]}
          />

          <Divider />

          {/* ══ 7. REDIS ══ */}
          <H2 id="sec-redis">7. Redis: características</H2>
          <P>
            <Bold>Redis</Bold> es clave-valor <Bold>en memoria</Bold>, por eso su latencia es extremadamente
            baja. Se puede configurar en tres modos:
          </P>
          <CompareCards
            items={[
              {
                label: "Standalone / Sentinel",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: [
                  "Standalone: un solo nodo",
                  "Sentinel: master-slave replication (alta disponibilidad)",
                ],
                cons: ["Sin reparto de datos entre nodos"],
              },
              {
                label: "Cluster",
                color: "#10b981",
                bg: "#051a0f",
                pros: [
                  "Sharding: reparte los datos entre nodos",
                  "Escalabilidad horizontal",
                ],
                cons: ["Más complejo de operar"],
              },
            ]}
          />

          <Divider />

          {/* ══ 8. PERSISTENCIA ══ */}
          <H2 id="sec-persistencia">8. Persistencia y escalabilidad</H2>
          <P>Aunque vive en RAM, Redis puede persistir a disco de dos formas (o combinarlas):</P>
          <Table
            headers={["Modo", "Qué guarda", "Trade-off"]}
            rows={[
              ["Snapshot (RDB)", "copias puntuales del dataset en intervalos", "rápido, pero puede perder los últimos cambios"],
              ["Append Only File (AOF)", "registra cada operación de escritura en un log", "muy durable, pero el archivo crece mucho"],
              ["Híbrido (RDB + AOF)", "carga el último RDB y reproduce el AOF", "rendimiento (RDB) + durabilidad (AOF)"],
            ]}
          />
          <Callout variant="note" title="Escalabilidad">
            <Bold>Redis Cluster</Bold> hace sharding automático con rebalanceo sin interrupciones;{" "}
            <Bold>Redis Sentinel</Bold> gestiona la replicación y el failover master-slave.
          </Callout>

          <Divider />

          {/* ══ 9. COMANDOS Y TTL ══ */}
          <H2 id="sec-comandos">9. Comandos CRUD y TTL</H2>
          <SqlCode label="CRUD básico (Redis no tiene UPDATE: se sobrescribe con SET)" sql={`SET clave1 valor1        # crear
GET clave1               # leer
SET clave1 nuevo_valor   # actualizar (sobrescribe)
DEL clave1               # eliminar
EXISTS clave1            # ¿existe?`} />
          <H3>TTL (Time To Live)</H3>
          <P>El TTL es el tiempo de vida de una clave antes de que Redis la elimine automáticamente. Es clave para la caché:</P>
          <Table
            headers={["Comando", "Qué hace"]}
            rows={[
              ["EXPIRE clave segundos", "fija el TTL (en segundos)"],
              ["PEXPIRE clave ms", "fija el TTL (en milisegundos)"],
              ["TTL clave", "consulta el tiempo restante"],
              ["PERSIST clave", "quita el TTL (la clave ya no expira)"],
              ["SETEX clave seg valor", "crea la clave con TTL en un solo paso"],
            ]}
          />

          <H3>Patrón de caché con TTL (cache-aside)</H3>
          <P>
            El uso estrella de Redis: poner una caché <Bold>delante</Bold> de la BD. Se busca primero en Redis; si
            está (<Bold>HIT</Bold>) se devuelve al instante; si no (<Bold>MISS</Bold>) se consulta la BD y se{" "}
            <Bold>cachea con TTL</Bold> para las próximas lecturas.
          </P>
          <CacheFlowDiagram />

          <Collapse title="Ejemplo: caché de una API (Python)">
            <SqlCode sql={`import redis, requests, json
rc = redis.StrictRedis(host='localhost', port=6379, db=0)

def obtener_clima(ciudad):
    cache_key = f"clima:{ciudad}"
    clima = rc.get(cache_key)          # ¿está en caché?
    if clima:
        return json.loads(clima)
    data = requests.get(URL, params={"q": ciudad}).json()
    rc.setex(cache_key, 600, json.dumps(data))   # cachear 10 min
    return data`} />
            <P>
              Menos llamadas a la API externa, menor costo y respuesta más rápida. El mismo patrón sirve para{" "}
              <Bold>caché de sesiones</Bold> (token con <Code>setex</Code> a 1 hora).
            </P>
          </Collapse>

          <Divider />

          {/* ══ 10. ESTRUCTURAS ══ */}
          <H2 id="sec-estructuras">10. Estructuras de datos de Redis</H2>
          <P>Redis no guarda solo strings: soporta estructuras ricas, cada una con sus comandos.</P>
          <Table
            headers={["Estructura", "Comandos", "Para qué"]}
            rows={[
              ["String", "SET · GET · DEL · INCR", "valores simples, contadores, caché"],
              ["Lista", "LPUSH · RPUSH · LPOP · RPOP · LRANGE", "colas y pilas (tareas, feeds)"],
              ["Hash (diccionario)", "HSET · HGET · HGETALL · HDEL", "objetos con campos (usuario:1 → {nombre, ...})"],
              ["Set", "SADD · SMEMBERS · SREM", "conjuntos sin repetición (tags, únicos)"],
              ["Sorted Set (ZSET)", "ZADD · ZRANGE ... WITHSCORES", "rankings y leaderboards por score"],
            ]}
          />
          <SqlCode label="Ejemplos" sql={`# Lista (cola)
LPUSH tareas "Estudiar"
RPUSH tareas "Dormir"
LRANGE tareas 0 -1        # todos los elementos

# Hash (objeto)
HSET usuario:1 nombre "Juan"
HGETALL usuario:1

# Sorted Set (ranking)
ZADD ranking 100 "Carlos"
ZRANGE ranking 0 -1 WITHSCORES`} />

          <Callout variant="note" title="Cierre del bloque NoSQL">
            Con <Bold>documentos</Bold> (MongoDB), <Bold>columna ancha</Bold> (Cassandra) y <Bold>clave-valor</Bold>{" "}
            (Redis) cerramos NoSQL. La elección depende del patrón de acceso: documentos flexibles para catálogos,
            columna ancha para Big Data distribuido y consultas por rango, clave-valor en memoria para caché y
            baja latencia. Todos comparten el ADN NoSQL: <Bold>escala horizontal</Bold> y disponibilidad sobre
            consistencia estricta (CAP: AP).

            Suerte en el examen final
          </Callout>

    </GuideLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Diagrama Partition Key vs Clustering Key (sección 4):
   las filas se distribuyen a un nodo por la partition key (Sensor, Date) y,
   dentro del nodo, se ordenan por la clustering key (Timestamp).
   ───────────────────────────────────────────────────────────────────────────── */
function PartitionClusteringDiagram() {
  const col: Record<string, string> = { A: "#3b82f6", B: "#a855f7", C: "#10b981" };
  const incoming = [
    { p: "S1 · 01-Ene", t: "09:05", g: "A" },
    { p: "S2 · 01-Ene", t: "10:30", g: "B" },
    { p: "S1 · 01-Ene", t: "08:55", g: "A" },
    { p: "S1 · 02-Ene", t: "07:10", g: "C" },
    { p: "S1 · 01-Ene", t: "09:00", g: "A" },
    { p: "S2 · 01-Ene", t: "10:00", g: "B" },
    { p: "S1 · 02-Ene", t: "07:00", g: "C" },
  ];
  const nodes = [
    { node: "Nodo 1", part: "(S1, 01-Ene)", rows: ["08:55", "09:00", "09:05"], g: "A" },
    { node: "Nodo 2", part: "(S2, 01-Ene)", rows: ["10:00", "10:30"], g: "B" },
    { node: "Nodo 3", part: "(S1, 02-Ene)", rows: ["07:00", "07:10"], g: "C" },
  ];
  return (
    <div style={{ margin: "16px 0", padding: "18px 14px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-base)", overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14, minWidth: 540 }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-ui)", lineHeight: 1.5 }}>
          <b style={{ color: "var(--accent)" }}>Partition Key (Sensor, Date)</b><br />decide el <b>nodo</b> (distribución)
        </div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-ui)", textAlign: "right", lineHeight: 1.5 }}>
          <b style={{ color: "var(--accent)" }}>Clustering Key (Timestamp)</b><br />decide el <b>orden</b> dentro del nodo
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 540 }}>
        {/* filas que llegan */}
        <div style={{ flexShrink: 0, width: 138 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, fontFamily: "var(--font-ui)" }}>Filas (en desorden)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {incoming.map((r, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${col[r.g]}`, background: "var(--bg-surface)", border: "1px solid var(--border)", borderLeftWidth: 3, borderRadius: 5, padding: "4px 8px", fontFamily: "var(--font-code)", fontSize: 10.5 }}>
                <span style={{ color: "var(--text-secondary)" }}>{r.p}</span>{" "}<span style={{ color: "var(--text-muted)" }}>{r.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* flecha */}
        <div style={{ alignSelf: "center", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: 10, minWidth: 66, lineHeight: 1.4 }}>
          hash de la<br />partition key<br /><span style={{ fontSize: 20 }}>⟶</span>
        </div>

        {/* nodos */}
        <div style={{ display: "flex", gap: 8, flex: 1 }}>
          {nodes.map((n) => (
            <div key={n.node} style={{ flex: 1, minWidth: 118, border: `1.5px solid ${col[n.g]}`, borderRadius: 9, padding: 8, background: `color-mix(in srgb, ${col[n.g]} 7%, var(--bg-surface))` }}>
              <div style={{ fontWeight: 700, fontSize: 11.5, color: col[n.g], fontFamily: "var(--font-ui)", marginBottom: 5 }}>{n.node}</div>
              <div style={{ border: `1px dashed ${col[n.g]}`, borderRadius: 6, padding: "5px 6px", background: "var(--bg-surface)" }}>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "var(--font-code)", marginBottom: 4 }}>partición {n.part}</div>
                {n.rows.map((t, i) => (
                  <div key={i} style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-code)", padding: "2px 4px", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                    ⏱ {t}
                  </div>
                ))}
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3, fontStyle: "italic", fontFamily: "var(--font-ui)" }}>↑ orden por Timestamp</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Diagrama del patrón cache-aside con TTL (sección 9):
   App → GET en Redis → ¿existe? HIT: devuelve / MISS: consulta BD + SETEX + devuelve.
   ───────────────────────────────────────────────────────────────────────────── */
function FlowStep({ n, title, sub, color }: { n?: string; title: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div style={{ border: `1.5px solid ${color || "var(--border-bright)"}`, background: color ? `color-mix(in srgb, ${color} 9%, var(--bg-surface))` : "var(--bg-surface)", borderRadius: 9, padding: "8px 12px", textAlign: "center", minWidth: 150 }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: color || "var(--text-primary)", fontFamily: "var(--font-ui)" }}>
        {n && <span>{n}. </span>}{title}
      </div>
      {sub && <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-ui)" }}>{sub}</div>}
    </div>
  );
}

function Down() {
  return <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 16, lineHeight: 1.2, margin: "2px 0" }}>▼</div>;
}

function CacheFlowDiagram() {
  return (
    <div style={{ margin: "16px 0", padding: "18px 14px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 240, margin: "0 auto" }}>
        <FlowStep n="1" title="App pide un dato" />
        <Down />
        <FlowStep n="2" title="GET clave" sub="busca en Redis" />
        <Down />
        <FlowStep title="¿existe la clave?" sub="(y no expiró el TTL)" color="var(--accent)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 520, margin: "6px auto 0", alignItems: "start" }}>
        {/* HIT */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", fontFamily: "var(--font-code)" }}>HIT (sí) ▼</div>
          <FlowStep title="Devuelve desde Redis" sub="latencia mínima" color="var(--success)" />
        </div>
        {/* MISS */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--warning)", fontFamily: "var(--font-code)", marginBottom: 4 }}>MISS (no) ▼</div>
          <FlowStep n="3" title="Consulta la BD" sub="más lento" color="var(--warning)" />
          <Down />
          <FlowStep n="4" title="SETEX clave TTL valor" sub="cachea con expiración" color="var(--warning)" />
          <Down />
          <FlowStep title="Devuelve al App" color="var(--warning)" />
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", margin: "12px auto 0", fontFamily: "var(--font-ui)", maxWidth: 520, lineHeight: 1.5 }}>
        Las siguientes lecturas serán <b style={{ color: "var(--success)" }}>HIT</b> hasta que expire el TTL; entonces se vuelve a cachear.
      </div>
    </div>
  );
}
