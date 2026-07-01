"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Ol, Callout, Table, Pseudo, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "ex-final-2025-1", label: "Examen Final 2025-1" },
  { id: "ex-p1",           label: "P1 · Preguntas cortas" },
  { id: "ex-p2",           label: "P2 · Multimedia" },
  { id: "ex-p3",           label: "P3 · Fragmentación distribuida" },
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

/* Pequeña etiqueta de puntaje */
function Pts({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", background: "var(--accent-glow)", border: "1px solid rgba(124,106,247,0.25)", borderRadius: 5, padding: "1px 7px", marginLeft: 8, fontFamily: "var(--font-code)", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Exámenes pasados (Utilidades) — Examen Final 2025-1 (sección 1) resuelto
   ───────────────────────────────────────────────────────────────────────────── */
export default function ExamenesPasados() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("ex-final-2025-1");

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
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Utilidades · Exámenes pasados
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Exámenes pasados
            </h1>
          </div>

          <Divider />

          {/* ══ EXAMEN FINAL 2025-1 ══ */}
          <H2 id="ex-final-2025-1">Examen Final 2025-1 (sección 1)</H2>

          {/* ══ PREGUNTA 1 ══ */}
          <H3 id="ex-p1">Pregunta 1: Preguntas cortas <Pts>5 pts</Pts></H3>

          <H3>1.1 ¿En qué escenarios se aplica el diseño Bottom-Up? <Pts>1 pt</Pts></H3>
          <P>
            Cuando <Bold>ya existen varias bases de datos</Bold> en distintos sitios y se quieren{" "}
            <Bold>integrar</Bold> en un esquema global (no se diseña desde cero como en Top-Down). Escenarios:
          </P>
          <Ul items={[
            <>Integración de <Bold>sistemas heredados</Bold> (legacy) o bases preexistentes.</>,
            <><Bold>Fusiones o adquisiciones</Bold> de empresas, cada una con su base.</>,
            <><Bold>Federación</Bold> de bases autónomas y heterogéneas que deben verse como una sola.</>,
          ]} />
          <P>
            En Bottom-Up <Bold>no hay problema de fragmentación</Bold> (los datos ya están repartidos): el reto es
            la <Bold>integración de esquemas</Bold> (esquema conceptual local → esquema de exportación →
            integración → esquema unificado).
          </P>

          <H3>1.2 Backup vs replicación; cuándo usar cada uno <Pts>1 pt</Pts></H3>
          <Table
            headers={["", "Backup (respaldo)", "Replicación"]}
            rows={[
              ["Qué es", "Copia puntual e histórica", "Copias vivas y sincronizadas en varios nodos"],
              ["Estado", "Offline, no consultable", "Online, consultable y activa"],
              ["Objetivo", "Recuperación / durabilidad", "Disponibilidad, tolerancia a fallos, rendimiento"],
              ["Frecuencia", "Periódica", "Continua / casi en tiempo real"],
              ["Borrado lógico", "Protege (se vuelve atrás)", "No protege (replica el borrado)"],
            ]}
          />
          <Ul items={[
            <><Bold>Backup:</Bold> cumplimiento, ransomware, corrupción o borrado accidental, recuperación a un punto en el tiempo.</>,
            <><Bold>Replicación:</Bold> alta disponibilidad 24/7, failover, escalar lecturas, baja latencia geográfica.</>,
          ]} />
          <Callout variant="note">
            Son <Bold>complementarios</Bold>: la replicación da disponibilidad; el backup da protección histórica
            (volver a un estado anterior).
          </Callout>

          <H3>1.3 Consulta con GIN que aproxime la similitud de coseno <Pts>1 pt</Pts></H3>
          <P>
            El índice <Bold>GIN</Bold> es un <Bold>índice invertido</Bold>: trae solo los documentos que{" "}
            <Bold>comparten términos</Bold> con la consulta (como recorrer las posting lists del modelo
            vectorial), y un ranking ponderado aproxima el coseno.
          </P>
          <SqlCode label="GIN + ranking que aproxima el coseno" sql={`CREATE INDEX idx_doc_fts ON documentos
USING GIN (to_tsvector('spanish', contenido));

SELECT d.id,
       ts_rank_cd(to_tsvector('spanish', d.contenido), q, 32) AS score
FROM   documentos d,
       to_tsquery('spanish', 'oro & plata & camion') AS q
WHERE  to_tsvector('spanish', d.contenido) @@ q   -- usa el GIN (candidatos)
ORDER  BY score DESC
LIMIT  10;`} />
          <Ul items={[
            <><Code>@@</Code> usa el GIN para traer <Bold>solo docs que comparten términos</Bold> con la consulta.</>,
            <><Code>ts_rank_cd</Code> pondera por <Bold>frecuencia</Bold> de términos (efecto TF) y su cercanía.</>,
            <>La <Bold>normalización 32</Bold> divide por la longitud del documento, imitando la normalización por <Code>||d||</Code> del coseno.</>,
          ]} />

          <H3>1.4 Dos diferencias y dos similitudes: Cassandra vs MongoDB <Pts>1 pt</Pts></H3>
          <Table
            headers={["", "Cassandra", "MongoDB"]}
            rows={[
              ["Similitud 1", "NoSQL distribuido, escala horizontal", "NoSQL distribuido, escala horizontal"],
              ["Similitud 2", "Schema-flexible, consistencia ajustable", "Schema-flexible, consistencia ajustable"],
              ["Modelo (dif. 1)", "Wide-column (partition + clustering key)", "Document store (JSON/BSON anidado)"],
              ["Arquitectura (dif. 2)", "Masterless / peer-to-peer (writes rápidas)", "Replica set master-slave"],
            ]}
          />
          <H3>1.5 Interpretar la consulta MongoDB <Pts>1 pt</Pts></H3>
          <Pseudo>{`db.usuarios.aggregate([
  { $match: { edad: { $gte: 18 } } },                  // (1) filtra adultos
  { $group: { _id: "$ciudad", total: { $sum: 1 } } },  // (2) cuenta por ciudad
  { $sort:  { total: -1 } }                            // (3) ordena desc
])`}</Pseudo>
          <P>
            Devuelve <Bold>las ciudades ordenadas por su cantidad de usuarios adultos</Bold> (edad ≥ 18), de la
            que más tiene a la que menos. Equivalente SQL:
          </P>
          <SqlCode sql={`SELECT ciudad, COUNT(*) AS total
FROM   usuarios
WHERE  edad >= 18
GROUP  BY ciudad
ORDER  BY total DESC;`} />

          <Divider />

          {/* ══ PREGUNTA 2 ══ */}
          <H3 id="ex-p2">Pregunta 2: Base de Datos Multimedia <Pts>7 pts</Pts></H3>

          <H3>2.a Búsqueda eficiente con descriptores locales <Pts>4 pts</Pts></H3>
          <P>
            Cada imagen (o una parte) se transforma en uno o varios vectores de dimensión <Code>d</Code>{" "}
            (descriptores <Bold>locales</Bold>, p. ej. SIFT). Una imagen produce un <Bold>conjunto</Bold> de
            vectores, y el número <Bold>varía</Bold> por imagen.
          </P>
          <H4Like>Proceso</H4Like>
          <Ol items={[
            <><Bold>Extracción:</Bold> por cada imagen se detectan puntos de interés y se calcula un descriptor por cada uno: <Code>Imgᵢ → {`{P₁, …, Pₘ}`}</Code> (conviene baja dimensión por la maldición de la dimensionalidad).</>,
            <><Bold>Indexación:</Bold> se inserta <Bold>cada</Bold> descriptor en un índice multidimensional (R*-Tree / KD-Tree / Ball-Tree o ANN) como pares <Code>(IdImagen, Pⱼ)</Code>.</>,
            <><Bold>Consulta:</Bold> de la imagen query se extraen <Code>{`{Q₁, …, Qₙ}`}</Code> y se hace <Bold>k-NN por cada Qᵢ</Bold> con filtrar-y-refinar.</>,
            <><Bold>Combinación de parciales:</Bold> cada Qᵢ vota por las imágenes de sus vecinos; se combinan los votos para el ranking final.</>,
          ]} />
          <P>Al resolver por partes y combinar, el resultado es <Bold>búsqueda aproximada (ANN)</Bold> pero escalable.</P>
          <Pseudo>{` Imagen de consulta
        │
        ▼
 [ Extracción de descriptores locales ]   Q1, Q2, …, Qn   (dim d)
        │
        ▼
 [ Índice multidimensional ] ── k-NN por cada Qi ──► candidatos (IdImagen, Pj)
        │                              (filtrar-y-refinar)
        ▼
 [ Combinación de parciales / votación ]
        │
        ▼
 Ranking de imágenes más similares  (k-NN final)`}</Pseudo>

          <H4Like>¿Qué tipo de búsqueda soporta?</H4Like>
          <P>
            Soporta <Bold>búsqueda por contenido (CBIR) por objeto / sub-imagen</Bold>: encontrar imágenes que
            contienen la misma región u objeto, aunque aparezca <Bold>parcial, a otra escala o rotado</Bold>.
          </P>
          <Ul items={[
            <><Bold>Fundamento:</Bold> al indexar descriptores locales, basta que un subconjunto haga match; da robustez a oclusión, vistas parciales y cambios de escala (SIFT es invariante a escala, lo que encaja con el enunciado de imágenes de <Bold>distinta resolución</Bold>).</>,
          ]} />
          <Callout variant="example" title="Ejemplo de dato válido">
            Dar como consulta el <Bold>recorte de un logotipo</Bold> a baja resolución y recuperar todas las fotos
            (incluso en alta resolución y con el logo parcialmente tapado) donde aparece. También: detección de
            copias / near-duplicates y búsqueda de objetos.
          </Callout>

          <H3>2.b k-NN con Distancia de Cota Inferior <Pts>3 pts</Pts></H3>
          <P>
            El algoritmo de 1-NN solo calcula la distancia real cuando la cota inferior no permite descartar. Para
            K vecinos eficientemente: mantener un <Bold>heap máximo de tamaño K</Bold>; su raíz es la{" "}
            <Bold>K-ésima distancia</Bold> y sirve de <Bold>umbral de poda</Bold>.
          </P>
          <Callout variant="definition" title="Garantía de la poda">
            Se descarta sin calcular la distancia real cuando <Code>LB(Q,C) ≥ K-ésima</Code>. Es correcto porque{" "}
            <Code>LB(Q,C) ≤ Dist(Q,C)</Code>: si ni la cota cabe en el top-K, la distancia real tampoco. Resultado{" "}
            <Bold>exacto</Bold>, sin falsos negativos.
          </Callout>
          <Pseudo>{`import heapq

# KNN con Lower Bounding Distance
# Q: objeto de consulta ; K: nº de vecinos
def Lower_Bounding_KNN(Q, K):
    heap = []                       # max-heap tamaño K: (-dist_real, id)
    kth = float('inf')              # K-ésima distancia (umbral de poda)

    for i, C in enumerate(collection):
        lb = LB(Q, C)               # cota inferior (barata)
        if lb >= kth:               # PODA: ni en el mejor caso entra al top-K
            continue
        d = Dist(Q, C)              # distancia verdadera (cara) solo si pasa el filtro
        if len(heap) < K:
            heapq.heappush(heap, (-d, i))
            if len(heap) == K:
                kth = -heap[0][0]   # ya hay K: fija el umbral
        elif d < kth:
            heapq.heapreplace(heap, (-d, i))  # saca el peor, mete el nuevo (O(log K))
            kth = -heap[0][0]                 # actualiza la K-ésima

    return [i for (_, i) in sorted(heap, reverse=True)]   # del más cercano al más lejano`}</Pseudo>
          <Ul items={[
            <>Evita el <Code>Dist</Code> caro en todo candidato cuya cota ya supera la K-ésima distancia.</>,
            <>El heap de tamaño K mantiene el umbral lo más bajo posible desde temprano (poda agresiva).</>,
            <>Cada inserción/reemplazo es <Code>O(log K)</Code>; garantiza el k-NN <Bold>exacto</Bold>.</>,
          ]} />

          <Divider />

          {/* ══ PREGUNTA 3 ══ */}
          <H3 id="ex-p3">Pregunta 3: Fragmentación y consulta distribuida <Pts>8 pts</Pts></H3>
          <P>
            Repositorio histórico (empresa de delivery tipo RAPPI) con <Code>Pedidos(IdPedido, IdCliente,
            FechaPedido, Monto, Ciudad, Estado)</Code> y <Code>Repartidores(IdRepartidor, Nombre, TipoVehiculo,
            Ciudad, Disponibilidad, Calificacion)</Code>. Entorno: <Bold>3 esclavos</Bold> + <Bold>1 servidor
            central</Bold> coordinador.
          </P>

          <H3>3.1 Fragmentación horizontal <Pts>1 pt</Pts></H3>
          <Table
            headers={["Tabla", "Acceso frecuente", "Fragmentación", "Por qué"]}
            rows={[
              ["Pedidos", "rangos de FechaPedido", "Horizontal por RANGO de fecha", "permite partition pruning por intervalo de fechas"],
              ["Repartidores", "IdRepartidor (auto-increment)", "Horizontal por HASH de IdRepartidor", "reparto uniforme entre los 3 nodos; búsqueda por id va a un fragmento"],
            ]}
          />
          <Callout variant="warning" title="Clave para la consulta">
            Ninguna tabla se fragmenta por <Code>Ciudad</Code>, así que el <Code>JOIN ON Ciudad</Code> NO es local:
            es una <Bold>agregación distribuida</Bold> que el coordinador debe orquestar.
          </Callout>

          <H3>3.2 Algoritmo distribuido optimizado <Pts>4 pts</Pts></H3>
          <Callout variant="note" title="Análisis">
            La métrica de repartidores viene solo de <Code>Repartidores</Code> y la de monto solo de{" "}
            <Code>Pedidos</Code>. Hacer el <Code>JOIN</Code> por ciudad antes de agregar <Bold>infla el monto</Bold>{" "}
            (cada pedido se repite por cada repartidor de la ciudad). La versión óptima calcula <Bold>dos
            agregaciones por ciudad independientes</Bold> y las mezcla al final: correcto y con <Bold>mínimo
            tráfico de red</Bold> (solo viajan agregados parciales, no filas).
          </Callout>
          <P>
            Como <Code>Repartidores</Code> está particionada por <Code>HASH(IdRepartidor)</Code>, cada repartidor
            está en un único fragmento, así que <Code>COUNT(DISTINCT IdRepartidor)</Code> se reduce a sumar los
            conteos parciales. Los fragmentos de <Code>Pedidos</Code> son disjuntos, así que los montos se suman
            sin doble conteo. Estrategia: push-down de la agregación (Map) + mezcla en el coordinador (Reduce).
          </P>

          <DistribDiagram />

          <Ul items={[
            <><Bold>Agregación parcial en el origen:</Bold> solo viajan los agregados, no las filas.</>,
            <><Bold>Evita el join distribuido</Bold> y el doble conteo del monto.</>,
            <><Bold>Paralelismo:</Bold> los 3 esclavos trabajan a la vez; el coordinador solo mezcla.</>,
          ]} />

          <H3>3.3 Sentencias SQL derivadas <Pts>3 pts</Pts></H3>
          <SqlCode label="DDL de fragmentación (particionamiento declarativo)" sql={`-- Pedidos: horizontal por RANGO de FechaPedido
CREATE TABLE Pedidos (
  IdPedido int, IdCliente int, FechaPedido date,
  Monto numeric, Ciudad text, Estado text
) PARTITION BY RANGE (FechaPedido);

CREATE TABLE Pedidos_s1 PARTITION OF Pedidos
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE Pedidos_s2 PARTITION OF Pedidos
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE Pedidos_s3 PARTITION OF Pedidos
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Repartidores: horizontal por HASH de IdRepartidor
CREATE TABLE Repartidores (
  IdRepartidor int, Nombre text, TipoVehiculo text,
  Ciudad text, Disponibilidad boolean, Calificacion numeric
) PARTITION BY HASH (IdRepartidor);

CREATE TABLE Repartidores_s1 PARTITION OF Repartidores
  FOR VALUES WITH (MODULUS 3, REMAINDER 0);
CREATE TABLE Repartidores_s2 PARTITION OF Repartidores
  FOR VALUES WITH (MODULUS 3, REMAINDER 1);
CREATE TABLE Repartidores_s3 PARTITION OF Repartidores
  FOR VALUES WITH (MODULUS 3, REMAINDER 2);`} />
          <SqlCode label="Subconsultas locales (cada esclavo, sobre su fragmento)" sql={`SELECT Ciudad, COUNT(*) AS parcial_repartidores
FROM   Repartidores
GROUP  BY Ciudad;

SELECT Ciudad, SUM(Monto) AS parcial_monto
FROM   Pedidos
GROUP  BY Ciudad;`} />
          <SqlCode label="Mezcla final en el coordinador" sql={`SELECT  COALESCE(r.Ciudad, m.Ciudad)             AS Ciudad,
        COALESCE(SUM(r.parcial_repartidores), 0) AS TotalRepartidores,
        COALESCE(SUM(m.parcial_monto), 0)        AS MontoTotal
FROM        parciales_repartidores r
FULL JOIN   parciales_monto m ON r.Ciudad = m.Ciudad
GROUP BY    COALESCE(r.Ciudad, m.Ciudad)
ORDER BY    MontoTotal DESC;`} />

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}

/* H4 ligero local (subtítulo dentro de subsección) */
function H4Like({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", margin: "16px 0 6px", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-ui)" }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Diagrama del algoritmo distribuido (P3.2): pipeline de fases de la consulta
   distribuida (particionar → procesar local → unir → mezclar → resultado).
   ───────────────────────────────────────────────────────────────────────────── */
function DistribDiagram() {
  const stages: { v: string; s: string; c: string }[] = [
    { v: "Particionar",    s: "datos fragmentados en los 3 nodos (fecha / hash)",     c: "#3b82f6" },
    { v: "Procesar local", s: "cada nodo agrega por ciudad → parciales (#Rep, Σ Monto)", c: "#8b5cf6" },
    { v: "Unir",           s: "el coordinador junta los parciales de los 3 nodos",    c: "#a855f7" },
    { v: "Mezclar",        s: "suma por ciudad + ORDER BY MontoTotal DESC",           c: "#10b981" },
    { v: "Resultado",      s: "(Ciudad, TotalRepartidores, MontoTotal)",              c: "var(--accent)" },
  ];
  return (
    <div style={{ margin: "16px 0", padding: "18px 14px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-base)", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", minWidth: "min-content" }}>
        {stages.map((st, i) => (
          <div key={st.v} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 118,
                flexShrink: 0,
                alignSelf: "stretch",
                border: `1.5px solid ${st.c}`,
                background: `color-mix(in srgb, ${st.c} 9%, var(--bg-surface))`,
                borderRadius: 10,
                padding: "10px 11px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 12, color: st.c, fontFamily: "var(--font-ui)" }}>
                {i + 1}. {st.v}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, fontFamily: "var(--font-ui)" }}>
                {st.s}
              </div>
            </div>
            {i < stages.length - 1 && (
              <span style={{ color: "var(--text-muted)", fontSize: 20, padding: "0 4px", flexShrink: 0 }}>⟶</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
