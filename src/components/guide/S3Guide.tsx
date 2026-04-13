"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Formula, Divider,
  Ul, Ol, Callout, ProsCons, Table, CompareCards,
  Collapse, Pipeline, DiagramPlaceholder, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (used by both TOC and IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-fundamentos",      label: "1. Fundamentos de Indexación" },
  { id: "sec-bptree-estructura", label: "2. B+Tree — Estructura" },
  { id: "sec-bptree-ops",        label: "3. B+Tree — Operaciones" },
  { id: "sec-clustered",         label: "4. Clustered vs Unclustered" },
  { id: "sec-bitmap",            label: "5. Bitmap Index Scan" },
  { id: "sec-hash",              label: "6. Hash Index" },
  { id: "sec-costos",            label: "7. Tabla de Costos" },
  { id: "sec-postgres",          label: "8. Índices en PostgreSQL" },
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
   S3 Guide — main page
   ───────────────────────────────────────────────────────────────────────────── */
export default function S3Guide() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-fundamentos");

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
              Semana 3 · Módulo II — Técnicas de Indexación
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Técnicas de Indexación
            </h1>
            <P>
              Los índices son estructuras de datos fundamentales que aceleran búsquedas y evitan
              escaneos de tabla completa. Cada DBMS moderno implementa una colección de tipos de índices
              optimizados para diferentes patrones de consulta. Entender cuándo usar cada uno es crucial
              para optimizar el rendimiento de bases de datos en producción.
            </P>
          </div>

          <Callout variant="note" title="Analogía">
            Un índice en una base de datos actúa como el índice de un libro: en lugar de leer
            cada página de la novela para encontrar referencias a un personaje, el índice te lleva
            directamente a las páginas relevantes. Sin el índice, el costo de búsqueda es O(n);
            con él, se reduce a O(log n).
          </Callout>

          <Divider />

          {/* ══ 1. FUNDAMENTOS ══ */}
          <H2 id="sec-fundamentos">1. Fundamentos de Indexación</H2>
          <P>
            Un índice es una estructura de datos auxiliar que mapea valores de clave de búsqueda
            a referencias físicas de registros de datos. Su propósito es acelerar la localización
            de registros sin necesidad de escanear toda la tabla.
          </P>

          <H3>¿Por qué necesitamos índices?</H3>
          <P>
            Sin índices, cualquier búsqueda requiere un <Bold>full table scan</Bold> — examinar
            cada fila de la tabla secuencialmente. Si una tabla contiene N registros, la búsqueda
            es O(n) en tiempo. Para tablas grandes (millones de filas), esto es prohibitivamente costoso.
          </P>
          <Ul items={[
            <>Un índice reduce la complejidad de búsqueda a O(log n) con B+Tree o similar</>,
            <>Reduce E/S de disco: sin índice = N lecturas; con índice = log(N) lecturas</>,
            <>Acelera JOINs, WHERE, ORDER BY y GROUP BY cuando están indexados</>,
          ]} />

          <H3>Trade-off: Lectura vs Escritura</H3>
          <P>
            Los índices aceleran lecturas pero ralentizan escrituras. Al insertar, actualizar o
            eliminar un registro, el DBMS debe actualizar <Bold>todos</Bold> los índices sobre esa tabla.
          </P>
          <ProsCons
            pros={[
              "Búsquedas más rápidas (O(log n) vs O(n))",
              "Range queries eficientes",
              "JOINs optimizados",
              "Reduce E/S de disco dramáticamente",
            ]}
            cons={[
              "Escrituras más lentas (INSERT/UPDATE/DELETE)",
              "Mantenimiento de índices (rebalanceo)",
              "Espacio en disco adicional",
              "Overhead de memoria durante la construcción",
            ]}
          />

          <H3>Conceptos clave</H3>
          <Table
            headers={["Término", "Definición"]}
            rows={[
              ["Search Key", "Atributo(s) sobre los que se indexa (ej: `salary`, `last_name`)"],
              ["Data Entry", "Tupla (clave, referencia a registro) almacenada en el índice"],
              ["Data Record", "La fila completa en la tabla original (heap file o clustered)"],
              ["Index Scan", "Traversal del índice para localizar data entries"],
              ["Table Access", "Acceso posterior a la tabla para obtener registros completos"],
            ]}
          />

          <Divider />

          {/* ══ 2. B+TREE ESTRUCTURA ══ */}
          <H2 id="sec-bptree-estructura">2. B+Tree — Estructura</H2>
          <P>
            El B+Tree es la estructura de índice más común en DBMS modernos (PostgreSQL, MySQL/InnoDB,
            SQL Server, Oracle). Es un árbol balanceado multicamino optimizado para acceso a disco.
          </P>

          <H3>Propiedades fundamentales</H3>
          <Ul items={[
            <><Bold>Balanceado:</Bold> todas las hojas están al mismo nivel (altura h), garantizando O(log n)</>,
            <><Bold>Nodos internos como directorios:</Bold> contienen solo claves y punteros a hijos, no datos</>,
            <><Bold>Nodos hoja:</Bold> almacenan data entries (clave + referencia a registro) o valores directos</>,
            <><Bold>Hojas enlazadas:</Bold> conectadas como lista doblemente enlazada para range queries eficientes</>,
            <><Bold>Ocupación de nodos:</Bold> cada nodo ocupa una página de disco (típicamente 4-8 KB)</>,
          ]} />

          <DiagramPlaceholder label="Diagrama: B+Tree con raíz, nodos internos, y hojas enlazadas" height={180} />

          <H3>Parámetros del B+Tree</H3>
          <P>
            El <Bold>orden del B+Tree</Bold> (a menudo denotado como n) define el número máximo de claves
            por nodo. Si el orden es n:
          </P>
          <Ul items={[
            <>Cada nodo hoja puede contener hasta n claves (y n data entries)</>,
            <>Cada nodo interno puede contener hasta n claves y n+1 punteros a hijos</>,
            <>Ocupación mínima: al menos ⌈n/2⌉ claves (excepto raíz)</>,
            <>Capacidad por nivel crece exponencialmente: raíz → n, nivel 1 → n², nivel 2 → n³, etc.</>,
          ]} />

          <H3>Fórmula de altura</H3>
          <P>
            Para un B+Tree almacenando K registros con orden n:
          </P>
          <Formula>h = ⌈log_{"{⌈n/2⌉}"}(K)⌉</Formula>
          <Callout variant="example">
            Si K = 1 millón de registros y n = 100 (orden), entonces:
            <br />h = ⌈log₅₀(1,000,000)⌉ = ⌈5.57⌉ = 6 niveles
            <br />
            Esto significa máximo 6 accesos a disco por búsqueda, incluso con un millón de registros.
          </Callout>

          <Divider />

          {/* ══ 3. B+TREE OPERACIONES ══ */}
          <H2 id="sec-bptree-ops">3. B+Tree — Operaciones</H2>
          <P>
            Las operaciones de B+Tree (búsqueda, inserción, eliminación) mantienen las propiedades
            de balanceo y ocupación mínima a través de rotaciones y divisiones de nodos.
          </P>

          <H3>Búsqueda (Search)</H3>
          <P>
            Comienza en la raíz y desciende comparando la clave buscada con las claves de cada nodo.
            Sigue el puntero correspondiente hasta alcanzar una hoja.
          </P>
          <Pipeline steps={[
            { label: "Inicio", sub: "Cargar raíz desde disco", color: "#3b82f6" },
            { label: "Comparar", sub: "Comparar clave con entrada de nodo interno", color: "#3b82f6" },
            { label: "Descender", sub: "Seguir puntero al hijo apropiado", color: "#3b82f6" },
            { label: "Repetir", sub: "Hasta alcanzar una hoja", color: "#3b82f6" },
            { label: "Encontrar", sub: "Búsqueda lineal en hoja para la data entry", color: "#3b82f6" },
          ]} />
          <div style={{ marginTop: 12 }}>
            <P><Bold>Complejidad:</Bold> O(log n) accesos a disco + búsqueda lineal en hoja O(n) = O(log n) dominante</P>
          </div>

          <H3>Inserción (Insert)</H3>
          <P>
            Insertar un registro requiere:
          </P>
          <Ol items={[
            <>Buscar la hoja correcta donde debe entrar la clave</>,
            <>Insertar la data entry en orden dentro de la hoja</>,
            <>Si la hoja no está llena, terminar. Si está llena, ejecutar <Bold>split de hoja</Bold></>,
            <>Un split de hoja crea una nueva hoja, distribuye las claves, y propaga la mediana al padre</>,
            <>Si el padre se llena, propagar split hacia arriba (cascada de splits)</>,
            <>Si la raíz se divide, crear una nueva raíz (incrementar altura del árbol)</>,
          ]} />

          <Collapse title="Ejemplo: split de hoja">
            <P>Supón una hoja llena con orden n=3:</P>
            <Code>Hoja: [10, 20, 30] — capacidad llena</Code>
            <div style={{ marginTop: 8 }}>
              <P>Insertar 25:</P>
            </div>
            <Code>Hoja (antes): [10, 20, 30]</Code>
            <Code>Hoja (después inserción): [10, 20, 25, 30] — ¡desbordamiento!</Code>
            <div style={{ marginTop: 8 }}>
              <P>Split en mediana 25:</P>
            </div>
            <Code>Hoja izq: [10, 20]</Code>
            <Code>Hoja der: [25, 30]</Code>
            <Code>Padre: promocionar 25 hacia arriba</Code>
          </Collapse>

          <H3>Eliminación (Delete)</H3>
          <P>
            Eliminar es más complejo: debe mantener la ocupación mínima de nodos.
          </P>
          <Ol items={[
            <>Buscar y eliminar la data entry de la hoja</>,
            <>Si la hoja mantiene ⌈n/2⌉ claves, terminar</>,
            <>Si la hoja cae por debajo del mínimo, intentar <Bold>redistribuir</Bold> con un hermano adyacente</>,
            <>Si la redistribución no es posible, <Bold>fusionar (merge)</Bold> con el hermano</>,
            <>Propagar cambios hacia arriba si el padre queda por debajo del mínimo</>,
            <>Si la raíz se queda sin claves, eliminarla (disminuir altura)</>,
          ]} />

          <Callout variant="warning" title="Regla de ocupación mínima">
            Todo nodo (excepto raíz) debe tener <Bold>al menos ⌈n/2⌉ claves</Bold> para mantener
            el O(log n) garantizado. Si cae por debajo, el árbol se degenera.
          </Callout>

          <Divider />

          {/* ══ 4. CLUSTERED VS UNCLUSTERED ══ */}
          <H2 id="sec-clustered">4. Clustered vs Unclustered</H2>
          <P>
            La diferencia fundamental es si el <Bold>orden físico</Bold> de los datos en disco
            coincide con el <Bold>orden lógico del índice</Bold>.
          </P>

          <H3>Clustered Index (Índice Agrupado)</H3>
          <P>
            El índice determina el orden físico de almacenamiento de los registros. Los datos están
            realmente ordenados en disco según el índice.
          </P>
          <Ul items={[
            <>Solo puede haber <Bold>un</Bold> clustered index por tabla (el orden físico es único)</>,
            <>En InnoDB: la <Bold>Primary Key siempre es clustered</Bold></>,
            <>En PostgreSQL: el comando <Code>CLUSTER</Code> reorganiza los datos una sola vez (no se mantiene)</>,
            <>Excelente para range queries: READ secuencial en disco</>,
            <>Ideal para GROUP BY y ORDER BY sobre la clave clustered</>,
          ]} />

          <H3>Unclustered Index (Índice No Agrupado)</H3>
          <P>
            El índice es independiente del orden físico de datos. Acceder a registros requiere
            saltar entre el índice y la tabla (random I/O).
          </P>
          <Ul items={[
            <>Puede haber <Bold>múltiples</Bold> unclustered indices por tabla</>,
            <>PostgreSQL: por defecto, <Code>CREATE INDEX</Code> crea unclustered</>,
            <>El índice apunta a localizaciones físicas de registros (TID en PostgreSQL)</>,
            <>Range queries pueden ser lentas: random I/O para cada registro</>,
            <>Útil para igualdad exacta (=) y búsquedas selectivas</>,
          ]} />

          <CompareCards
            items={[
              {
                label: "Clustered",
                color: "#10b981",
                bg: "#051a0f",
                pros: [
                  "Solo uno por tabla",
                  "Datos ordenados en disco",
                  "Range queries rápidas",
                ],
                cons: [
                  "INSERT/UPDATE lento (reordenar físicamente)",
                  "Espacio: datos = índice",
                ],
              },
              {
                label: "Unclustered",
                color: "#f59e0b",
                bg: "#1c1207",
                pros: [
                  "Múltiples por tabla",
                  "INSERT/UPDATE rápido (solo actualizar índice)",
                ],
                cons: [
                  "Índice ≠ orden físico",
                  "Range queries pueden ser lentas",
                  "Espacio: índice + datos separados",
                ],
              },
            ]}
          />

          <Divider />

          {/* ══ 5. BITMAP INDEX SCAN ══ */}
          <H2 id="sec-bitmap">5. Bitmap Index Scan</H2>
          <P>
            Problema: si un unclustered index coincide con muchas filas, acceder a cada una
            resulta en random I/O, lo que es peor que un sequential scan de toda la tabla.
          </P>

          <H3>La solución de PostgreSQL: Bitmap Index Scan</H3>
          <P>
            PostgreSQL resuelve esto con un paso intermedio: construir un bitmap (bitset) de páginas
            candidatas, luego hacer un scan secuencial de esas páginas.
          </P>
          <Pipeline steps={[
            { label: "Index Scan", sub: "Recorrer índice, anotar todas las página de datos coincidentes", color: "#06b6d4" },
            { label: "Build Bitmap", sub: "Crear un bitmap comprimido de páginas de heap", color: "#06b6d4" },
            { label: "Sort by Page", sub: "Ordenar páginas de heap por número de página", color: "#06b6d4" },
            { label: "Heap Scan", sub: "Hacer scan secuencial de esas páginas", color: "#06b6d4" },
          ]} />

          <H3>Combinación de índices</H3>
          <P>
            Bitmap permite combinar múltiples índices con AND/OR:
          </P>
          <Ul items={[
            <>AND: Intersección de bitmaps (ambas condiciones deben cumplirse)</>,
            <>OR: Unión de bitmaps (cualquiera de las condiciones)</>,
          ]} />

          <Collapse title="Ejemplo: EXPLAIN ANALYZE con Bitmap Scan">
            <SqlCode label="Consulta con múltiples índices" sql={`-- tabla employees con indices en dept_id y salary
SELECT * FROM employees
WHERE dept_id = 5 AND salary > 50000;

-- Salida de EXPLAIN ANALYZE:
-- Bitmap Index Scan on idx_dept_id (cost=0.29..18.50 rows=450)
--   Index Cond: (dept_id = 5)
-- Bitmap Index Scan on idx_salary (cost=0.29..25.75 rows=320)
--   Index Cond: (salary > 50000)
-- BitmapAnd (cost=44.25..68.75 rows=180)
-- Bitmap Heap Scan on employees (cost=44.25..100.50 rows=180)
--   Recheck Cond: ((dept_id = 5) AND (salary > 50000))`} />
          </Collapse>

          <Callout variant="note">
            PostgreSQL decide automáticamente cuándo usar Bitmap Index Scan comparando costos:
            si el bitmap scan es más barato que acceso random, lo elige; si el sequential
            scan es mejor, lo usa en su lugar.
          </Callout>

          <Divider />

          {/* ══ 6. HASH INDEX ══ */}
          <H2 id="sec-hash">6. Hash Index</H2>
          <P>
            Hash indices organizan datos usando una función hash en lugar de un árbol. Excelentes
            para búsquedas exactas de igualdad, pero no soportan range queries.
          </P>

          <H3>Static Hashing</H3>
          <P>
            La función hash mapea claves a un bucket fijo en un array de tamaño fijo.
          </P>
          <Ul items={[
            <>Hash function: h(key) = clave % M (M = número de buckets)</>,
            <>Overflow chains: si dos claves hashen al mismo bucket, se encadenan (linked list)</>,
            <>Búsqueda: O(1) en promedio si distribuye bien; O(n) peor caso con muchas colisiones</>,
            <>Problema: si tabla crece más allá de M buckets, la función se vuelve ineficiente</>,
          ]} />

          <H3>Extendible Hashing</H3>
          <P>
            Soluciona el problema de crecimiento con un directorio dinámico y buckets con
            profundidad local.
          </P>
          <Ul items={[
            <>Directorio global: array de 2^d punteros (d = profundidad global)</>,
            <>Buckets con profundidad local: cada bucket puede ser más pequeño que el directorio</>,
            <>Split dinámico: cuando un bucket se llena, puede duplicarse si profundidad local = global</>,
            <>Crecimiento: solo duplicar buckets necesarios, no toda la tabla</>,
          ]} />

          <ProsCons
            pros={[
              "O(1) para igualdad exacta (hash indexing)",
              "Mejor que B+Tree para búsquedas de igualdad sin order",
              "Dinámico: crecimiento sin costosa reorganización",
            ]}
            cons={[
              "NO soporta range queries (=, ≠, >, <)",
              "No soporta ORDER BY o GROUP BY",
              "Función hash debe ser buena (distribuir evenly)",
              "Colisiones degradan rendimiento",
            ]}
          />

          <SqlCode label="Crear Hash Index en PostgreSQL" sql={`-- Hash index (solo igualdad)
CREATE INDEX idx_email_hash ON users USING HASH (email);

-- Buscar con igualdad: BIEN
SELECT * FROM users WHERE email = 'alice@example.com';
-- Plan: Index Scan using idx_email_hash

-- Buscar con rango: MAL (no puede usar índice)
SELECT * FROM users WHERE email LIKE 'alice@%';
-- Plan: Sequential Scan (ignora el hash index)`} />

          <Divider />

          {/* ══ 7. TABLA DE COSTOS ══ */}
          <H2 id="sec-costos">7. Tabla de Costos</H2>
          <P>
            Comparación de complejidad de operaciones entre diferentes estructuras de índice.
            Supongamos B páginas en el archivo de datos y F = capacidad de un nodo de B+Tree (branching factor).
          </P>

          <Table
            headers={["Operación", "Heap File", "Sorted File", "Static Hash", "B+Tree"]}
            rows={[
              [
                "Scan (todas las filas)",
                "B",
                "B",
                "O(B + # buckets)",
                "log_F(B) + B",
              ],
              [
                "Igualdad (a = k)",
                "B/2",
                "log_F(B)",
                "~1 (mejor caso) a B (peor)",
                "log_F(B)",
              ],
              [
                "Rango (a ≥ k1 AND a ≤ k2)",
                "B",
                "log_F(B) + resultado",
                "No soportado",
                "log_F(B) + resultado",
              ],
              [
                "INSERT",
                "1",
                "B/2 (reordenar)",
                "~1 + splits",
                "log_F(B) + splits",
              ],
              [
                "DELETE",
                "B/2 (buscar + eliminar)",
                "B/2",
                "~1 + merges",
                "log_F(B) + merges",
              ],
            ]}
          />

          <Callout variant="note" title="En la práctica">
            <Bold>B+Tree es la estructura por defecto en casi todos los DBMS modernos</Bold>
            porque ofrece un balance óptimo entre búsqueda, rango, escritura y mantenimiento.
            Hash es útil solo en casos muy específicos (búsquedas masivas de igualdad).
          </Callout>

          <Divider />

          {/* ══ 8. ÍNDICES EN POSTGRESQL ══ */}
          <H2 id="sec-postgres">8. Índices en PostgreSQL</H2>
          <P>
            PostgreSQL soporta múltiples tipos de índices, cada uno optimizado para patrones
            de consulta diferentes. El optimizador elige automáticamente cuál usar.
          </P>

          <H3>Tipos de índice disponibles</H3>
          <Table
            headers={["Tipo", "Uso", "Operadores soportados"]}
            rows={[
              [
                <Code>BTREE</Code>,
                "Defecto. Rango, orden, igualdad",
                "=, <, >, <=, >=, BETWEEN, LIKE, IN",
              ],
              [
                <Code>HASH</Code>,
                "Igualdad exacta, búsquedas fast-path",
                "=",
              ],
              [
                <Code>GiST</Code>,
                "Geometría, búsqueda espacial, full-text",
                "Dependiente del operador",
              ],
              [
                <Code>GIN</Code>,
                "Array, JSON, full-text (invertido)",
                "@>, ?, &&, @@ (JSON/arrays)",
              ],
              [
                <Code>BRIN</Code>,
                "Tablas grandes con orden correlacionado",
                "Rango",
              ],
            ]}
          />

          <H3>Crear índices</H3>
          <SqlCode label="Sintaxis y ejemplos" sql={`-- B-tree (defecto)
CREATE INDEX idx_salary ON employees(salary);

-- Hash (solo igualdad)
CREATE INDEX idx_email_hash ON users USING HASH(email);

-- Multi-columna (composite)
CREATE INDEX idx_dept_salary ON employees(dept_id, salary);

-- Índice expresivo (función)
CREATE INDEX idx_lower_name ON users(LOWER(name));

-- Índice parcial (condicional)
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- Examinar índices de una tabla
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'employees';

-- Ver tamaño del índice
SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes WHERE relname = 'employees';`} />

          <H3>EXPLAIN ANALYZE: ver decisión del optimizador</H3>
          <SqlCode label="Analizar plan de ejecución" sql={`-- Sin índice: Sequential Scan
EXPLAIN ANALYZE
SELECT * FROM employees WHERE dept_id = 5;
-- Seq Scan on employees  (cost=0.00..35.50 rows=100 width=64)
--   Filter: (dept_id = 5)

-- Con índice: Index Scan
CREATE INDEX idx_dept ON employees(dept_id);

EXPLAIN ANALYZE
SELECT * FROM employees WHERE dept_id = 5;
-- Index Scan using idx_dept on employees (cost=0.29..8.32 rows=100 width=64)
--   Index Cond: (dept_id = 5)`} />

          <H3>Cuándo PostgreSQL ignora un índice</H3>
          <Ul items={[
            <>Selectividad baja: si la consulta retorna {'>'}5-10% de filas, sequential scan es más rápido</>,
            <>Tabla pequeña: si cabe en pocas páginas, acceso al índice es overhead innecesario</>,
            <>Tipo incompatible: ej. Hash index para rango queries (NOT SUPPORTED)</>,
            <>Costo estimado: EXPLAIN dice "Sequential Scan" si estima que es más barato</>,
            <>Índice no válido: si está corrupto o marcado como INVALID</>,
          ]} />

          <Collapse title="Forzar o deshabilitar índices">
            <SqlCode label="Control de índices en PostgreSQL" sql={`-- Ver configuración de índices
SHOW constraint_exclusion;

-- Deshabilitar un índice temporalmente
ALTER INDEX idx_salary INVALID;

-- Habilitar nuevamente
REINDEX INDEX idx_salary;

-- Forzar uso de índice (no recomendado)
SET enable_seqscan = off;  -- PostgreSQL preferirá índices
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM employees WHERE salary > 50000;
SET enable_seqscan = on;   -- Restaurar comportamiento normal`} />
          </Collapse>

        </div>
      </div>

      {/* ── Right TOC ── */}
      <Toc active={activeSection} />

    </div>
  );
}
