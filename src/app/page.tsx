"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar, { type PageId } from "@/components/layout/Sidebar";
import ComingSoon from "@/components/layout/ComingSoon";
import S1Guide from "@/components/guide/S1Guide";
import {
  HardDrive,
  GitBranch,
  Hash,
  Layers,
  Cpu,
  Lock,
  Globe,
  FileSearch,
  Leaf,
  BarChart2,
  Scissors,
  Network,
  BookOpen,
  Wrench,
  Construction,
} from "lucide-react";

const SqlPlayground = dynamic(
  () => import("@/components/playground/SqlPlayground"),
  { ssr: false }
);

/* ─────────────────────────────────────────────────────
   Contenido planeado por página (para ComingSoon)
   ───────────────────────────────────────────────────── */
const PLANNED: Record<string, React.ComponentProps<typeof ComingSoon>> = {
  s2: {
    title: "Organización Física y Almacenamiento",
    icon: <HardDrive size={22} color="var(--text-muted)" />,
    semana: "Semana 2 · Módulo I",
    goal: "Entender cómo el diseño físico impacta en el rendimiento.",
    teoria: [
      { label: "Páginas y bloques" },
      { label: "Heap files" },
      { label: "Registros de longitud fija y variable" },
      { label: "Fillfactor" },
      { label: "Layout físico en disco" },
      { label: "Costos de I/O" },
    ],
    lab: [
      { label: "Simulación en Python de registros de longitud fija" },
      { label: "Simulación de registros de longitud variable con offsets" },
      { label: "Análisis comparativo de costos de I/O" },
      { label: "Análisis del tamaño real con pg_relation_size y pg_total_relation_size" },
      { label: "Exploración de páginas con extensión pageinspect" },
      { label: "Evaluación del impacto del fillfactor en distintas cargas de trabajo" },
    ],
    viz: [
      "Diagrama de página con header / ItemId / tuplas",
      "Comparativa registros fijo vs variable",
      "Costo I/O por tipo de organización",
    ],
    refs: [
      "Silberschatz – Database System Concepts (7th Ed.), Chapter 11: Storage and File Structure",
      "Ramakrishnan – DBMS (3rd Ed.), Chapter 8: Storage and Indexing",
      "PostgreSQL Documentation (Physical Storage)",
    ],
  },
  "s3-bptree": {
    title: "B+Tree en Motores Reales",
    icon: <GitBranch size={22} color="var(--text-muted)" />,
    semana: "Semana 3 · Módulo I",
    goal: "Evaluar comportamiento práctico del B+Tree agrupado y no agrupado.",
    teoria: [
      { label: "B+Tree en motores reales — estructura interna" },
      { label: "Índice agrupado (clustered) vs no agrupado" },
      { label: "Splits y merges en inserciones/eliminaciones" },
      { label: "Selección de índices según patrón de acceso" },
    ],
    lab: [
      { label: "Simulación de B+Tree agrupado y no agrupado" },
      { label: "Creación y comparación experimental de índices" },
      { label: "Análisis de planes de ejecución con EXPLAIN ANALYZE" },
      { label: "Benchmark de consultas con y sin índice" },
    ],
    viz: [
      "B+Tree interactivo: inserción y split animado",
      "Comparativa clustered vs non-clustered",
      "Diagrama de nodos hoja → heap page",
    ],
    refs: [
      "Silberschatz – Database System Concepts (7th Ed.), Chapter 12: Indexing and Hashing",
      "Ramakrishnan – DBMS (3rd Ed.), Chapters 8-10: Indexing",
      "PostgreSQL Documentation – Index Types (B-Tree)",
    ],
  },
  "s3-hash": {
    title: "Hash Index — Estático y Extensible",
    icon: <Hash size={22} color="var(--text-muted)" />,
    semana: "Semana 3 · Módulo I",
    goal: "Comprender hashing estático, extensible y lineal con manejo de overflow.",
    teoria: [
      { label: "Hashing estático" },
      { label: "Hashing dinámico: extensible y lineal" },
      { label: "Manejo de overflow y splits" },
    ],
    lab: [
      { label: "Simulación de hashing extensible" },
      { label: "Creación y comparación experimental de índices Hash en PostgreSQL" },
      { label: "Benchmark de equality queries vs B+Tree" },
    ],
    viz: [
      "Hash index interactivo: directorio y buckets",
      "Split de bucket extensible animado",
    ],
    refs: [
      "Silberschatz – Database System Concepts (7th Ed.), Chapter 12",
      "Ramakrishnan – DBMS (3rd Ed.), Chapters 9-10",
    ],
  },
  "s3-adv": {
    title: "Índices Avanzados: GIN, GiST, SP-GiST, BRIN",
    icon: <Layers size={22} color="var(--text-muted)" />,
    semana: "Semana 3 · Módulo I",
    goal: "Seleccionar el tipo de índice adecuado para cada patrón de acceso.",
    teoria: [
      { label: "GIN (Generalized Inverted Index) — full-text search, arrays" },
      { label: "GiST (Generalized Search Tree) — espacial, rango, similitud" },
      { label: "SP-GiST — datos con particiones no uniformes" },
      { label: "BRIN (Block Range Index) — datos correlacionados con su posición física" },
    ],
    lab: [
      { label: "Creación y uso de GIN para full-text search" },
      { label: "Creación y uso de GiST para tipos geométricos" },
      { label: "Comparativa de rendimiento entre tipos de índice" },
    ],
    viz: [
      "Tabla comparativa GIN vs GiST vs BRIN vs B+Tree",
      "Cuándo usar cada tipo (árbol de decisión)",
    ],
    refs: [
      "PostgreSQL Documentation – Index Types (B-Tree, Hash, GiST, GIN, SP-GiST, BRIN)",
      "Hellerstein et al. – Generalized Search Trees for Database Systems (GiST Paper)",
    ],
  },
  s4: {
    title: "External Algorithms y Buffer Management",
    icon: <Cpu size={22} color="var(--text-muted)" />,
    semana: "Semana 4 · Módulo I",
    goal: "Comprender algoritmos para datos que exceden la memoria principal.",
    teoria: [
      { label: "Buffer management en DBMS: estrategias LRU, Clock, 2Q" },
      { label: "Buffer pool organization, pin/unpin y dirty pages" },
      { label: "Write-ahead logging y flush policies" },
      { label: "External sorting: Two-phase multiway merge sort" },
      { label: "Run generation y merging" },
      { label: "External hashing" },
      { label: "Trade-offs memoria vs I/O" },
    ],
    lab: [
      { label: "Implementación de external sort en Python" },
      { label: "Comparación de estrategias de sorting" },
      { label: "Análisis de I/O costs en consultas reales" },
    ],
    viz: [
      "External merge sort animado (runs → merge)",
      "Comparativa buffer replacement policies",
    ],
    refs: [
      "Ramakrishnan – DBMS (3rd Ed.), Chapter 13: External Sorting",
      "Gray & Reuter – Transaction Processing, Chapter 8: Buffer Management",
      "PostgreSQL Documentation – Resource Consumption and Buffer Management",
    ],
  },
  s5: {
    title: "Concurrencia y Recuperación",
    icon: <Lock size={22} color="var(--text-muted)" />,
    semana: "Semana 5 · Módulo I",
    goal: "Comprender cómo se garantiza consistencia bajo carga concurrente.",
    teoria: [
      { label: "Control de concurrencia: Transacciones y ACID" },
      { label: "Problemas: dirty read, non-repeatable read, phantom read" },
      { label: "Niveles de aislamiento SQL" },
      { label: "Mecanismos: Locking (2PL) y MVCC" },
      { label: "Deadlocks: detección y prevención" },
      { label: "WAL (Write-Ahead Logging) y checkpoints" },
      { label: "Algoritmos de Crash Recovery (ARIES)" },
    ],
    lab: [
      { label: "Reproducir problemas de concurrencia en PostgreSQL" },
      { label: "Comparar niveles de aislamiento: medir throughput y latencia" },
      { label: "Simulación de deadlocks en Python" },
      { label: "Benchmark MVCC vs. locking en queries analíticas" },
      { label: "Ejercicios de algoritmo de recuperación: undo/redo con checkpoints" },
      { label: "Analizar logs de WAL con pg_waldump" },
    ],
    viz: [
      "Diagrama de estados de una transacción",
      "Timeline de conflictos 2PL vs MVCC",
      "Flujo ARIES recovery (análisis → redo → undo)",
    ],
    refs: [
      "Silberschatz – Database System Concepts (7th Ed.), Chapters 14-16",
      "Ramakrishnan – DBMS (3rd Ed.), Chapters 16-18: Concurrency Control, Crash Recovery",
      "PostgreSQL Documentation (MVCC and Transactions)",
    ],
  },
  s6: {
    title: "Bases de Datos Espaciales — PostGIS",
    icon: <Globe size={22} color="var(--text-muted)" />,
    semana: "Semana 6 · Módulo II",
    goal: "Aplicar indexación multidimensional en motores reales.",
    teoria: [
      { label: "Representación de objetos geométricos: Point, LineString, Polygon" },
      { label: "Sistemas de coordenadas y proyecciones" },
      { label: "R-Tree: estructura y operaciones" },
      { label: "Implementación mediante GiST en PostgreSQL" },
      { label: "Bounding boxes y MBR (Minimum Bounding Rectangle)" },
      { label: "Relaciones topológicas: contains, intersects, within" },
      { label: "Operaciones de proximidad: distances, KNN" },
    ],
    lab: [
      { label: "Instalación y configuración de PostGIS" },
      { label: "Creación de tablas con tipos geométricos" },
      { label: "ST_Contains, ST_Intersects, ST_Within" },
      { label: "Creación de índices espaciales (GiST)" },
      { label: "Consultas geográficas optimizadas (KNN, ST_Distance, ST_Buffer)" },
      { label: "Caso de estudio: sistema de ubicaciones y proximidad" },
    ],
    viz: [
      "R-Tree interactivo: MBRs y búsqueda espacial",
      "Operaciones topológicas visuales",
    ],
    refs: [
      "Elmasri & Navathe – Fundamentals of Database Systems (6th Ed.), Chapter 26",
      "PostGIS Documentation – Spatial Functions and Indexing",
    ],
  },
  s7: {
    title: "Full-Text Search y BD Vectoriales",
    icon: <FileSearch size={22} color="var(--text-muted)" />,
    semana: "Semana 7 · Módulo II",
    goal: "Diseñar sistemas de recuperación de información textual y vectorial.",
    teoria: [
      { label: "Índices invertidos y modelo booleano" },
      { label: "Algoritmos de ranking y relevancia (TF-IDF, BM25)" },
      { label: "Full-text search en PostgreSQL: tsvector, tsquery, GIN" },
      { label: "Embeddings y búsqueda vectorial" },
      { label: "Índices multidimensionales: IVF y HNSW" },
    ],
    lab: [
      { label: "Full-text search con to_tsvector / to_tsquery" },
      { label: "ts_rank para ranking por relevancia" },
      { label: "GIN index para búsqueda textual" },
      { label: "Búsqueda vectorial con embeddings y pgvector" },
    ],
    viz: [
      "Diagrama de índice invertido",
      "Pipeline RAG: content → embedding → vector DB → query",
    ],
    refs: [
      "PostgreSQL Documentation – Full Text Search",
      "Silberschatz – Database System Concepts (7th Ed.), Chapter 23",
    ],
  },
  s8: {
    title: "Modelos NoSQL",
    icon: <Leaf size={22} color="var(--text-muted)" />,
    semana: "Semana 8 · Módulo II",
    goal: "Comparar modelos NoSQL y sus casos de uso.",
    teoria: [
      { label: "Document stores: MongoDB — modelo de documentos, consultas" },
      { label: "Wide-column stores: Cassandra — CQL, partitioning, replication" },
      { label: "Key-value stores: Redis — tipos de datos, TTL, pub/sub" },
      { label: "Graph databases: introducción" },
      { label: "CAP Theorem y consistencia eventual" },
    ],
    lab: [
      { label: "CRUD en MongoDB con PyMongo" },
      { label: "Modelado en Cassandra: partition key vs clustering key" },
      { label: "Redis: caching, sessions, pub/sub" },
      { label: "Benchmark NoSQL vs PostgreSQL para distintos workloads" },
    ],
    viz: [
      "Comparativa modelos: Document / Wide-column / KV / Graph",
      "CAP Theorem: qué sacrifica cada sistema",
    ],
    refs: [
      "Ramakrishnan – DBMS (3rd Ed.), Chapter 22: Parallel and Distributed DBs",
      "MongoDB, Cassandra, Redis Documentation",
    ],
  },
  s9: {
    title: "OLAP y Data Warehousing",
    icon: <BarChart2 size={22} color="var(--text-muted)" />,
    semana: "Semana 9 · Módulo II",
    goal: "Diseñar arquitecturas analíticas (OLAP, Data Warehousing, HTAP).",
    teoria: [
      { label: "OLTP vs OLAP vs HTAP" },
      { label: "Modelo dimensional: estrella, copo de nieve" },
      { label: "Data Warehouse: arquitectura y ETL" },
      { label: "Particionamiento columnar" },
      { label: "Arquitecturas modernas: Lakehouse" },
    ],
    lab: [
      { label: "Diseño de esquema estrella en PostgreSQL" },
      { label: "Consultas OLAP con GROUPING SETS, ROLLUP, CUBE" },
      { label: "Particionamiento de tablas por rango" },
    ],
    viz: [
      "Esquema estrella interactivo",
      "Comparativa OLTP vs OLAP",
    ],
    refs: [
      "Silberschatz – Database System Concepts (7th Ed.), Chapter 20",
      "Kimball – The Data Warehouse Toolkit",
    ],
  },
  s10: {
    title: "Fragmentación de Datos",
    icon: <Scissors size={22} color="var(--text-muted)" />,
    semana: "Semana 10 · Módulo III",
    goal: "Diseñar esquemas de fragmentación horizontal, vertical y mixta.",
    teoria: [
      { label: "Fragmentación horizontal: rango, hash, lista" },
      { label: "Fragmentación vertical: proyección de columnas" },
      { label: "Fragmentación mixta (híbrida)" },
      { label: "Reglas de correctitud: completitud, reconstrucción, disjunción" },
    ],
    lab: [
      { label: "Simulación de fragmentación por rango en PostgreSQL (PARTITION BY RANGE)" },
      { label: "Simulación de hash partition (PARTITION BY HASH)" },
      { label: "Simulación de fragmentación vertical (columnas hot vs cold)" },
    ],
    viz: [
      "Diagrama de fragmentación horizontal: nodos físicos y lógicos",
      "Comparativa hot columns vs cold columns",
    ],
    refs: [
      "Özsu & Valduriez – Principles of Distributed Database Systems (3rd Ed.)",
    ],
  },
  s11: {
    title: "Bases de Datos Distribuidas",
    icon: <Network size={22} color="var(--text-muted)" />,
    semana: "Semanas 11-16 · Módulo III",
    goal: "Diseñar y optimizar consultas distribuidas con replicación y alta disponibilidad.",
    teoria: [
      { label: "Replicación de datos y balanceo de carga" },
      { label: "Procesamiento de consultas distribuidas" },
      { label: "postgres_fdw, dblink, citus" },
      { label: "MapReduce: diseño de flujos de procesamiento masivo" },
      { label: "Apache Kafka + PostgreSQL: streaming de datos" },
      { label: "Optimización de costos en entornos distribuidos" },
      { label: "Consistencia en sistemas distribuidos: RAFT, Paxos" },
    ],
    lab: [
      { label: "Configuración de postgres_fdw entre instancias" },
      { label: "Consultas federadas con dblink" },
      { label: "MapReduce simulado en Python" },
      { label: "Benchmark de throughput en configuración distribuida" },
    ],
    viz: [
      "Diagrama de sharding físico y lógico",
      "MapReduce: Map → Shuffle → Reduce animado",
      "Topología de replicación master-slave / multi-master",
    ],
    refs: [
      "Özsu & Valduriez – Principles of Distributed Database Systems (3rd Ed.)",
      "PostgreSQL Documentation – Foreign Data Wrappers, Logical Replication",
    ],
  },

  /* ── Utilidades ── */
  "util-cheatsheet": {
    title: "SQL Cheat Sheet",
    icon: <BookOpen size={22} color="var(--text-muted)" />,
  },
  "util-tools": {
    title: "Herramientas",
    icon: <Wrench size={22} color="var(--text-muted)" />,
  },
};

/* ─────────────────────────────────────────────────────
   Página principal
   ───────────────────────────────────────────────────── */
export default function Home() {
  const [activePage, setActivePage] = useState<PageId>("s1");

  function renderPage(id: PageId) {
    if (id === "playground") return <SqlPlayground />;
    if (id === "s1")         return <S1Guide />;
    const plan = PLANNED[id];
    if (plan) return <ComingSoon {...plan} />;
    return <ComingSoon title={id} icon={<Construction size={22} color="var(--text-muted)" />} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
      <Sidebar active={activePage} onSelect={setActivePage} />
      <main style={{ flex: 1, overflow: "hidden" }}>
        {renderPage(activePage)}
      </main>
    </div>
  );
}
