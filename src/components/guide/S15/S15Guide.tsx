"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, CompareCards,
  Collapse, Pipeline, SqlCode,
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
   S15 Guide — NoSQL: Columna Ancha (Cassandra) y Clave-Valor (Redis)
   ───────────────────────────────────────────────────────────────────────────── */
export default function S15Guide() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-columna");

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

          <Callout variant="note" title="Hilo de la semana">
            Columna ancha (BigTable → Cassandra): column family, keyspace, partition key + clustering key, CQL →
            clave-valor (Redis): en memoria, persistencia (RDB/AOF), escalabilidad, comandos, TTL y estructuras
            (listas, hashes, sets, sorted sets).
          </Callout>

          <Divider />

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
          </Callout>

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
