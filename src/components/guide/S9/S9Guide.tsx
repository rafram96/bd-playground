"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Ol, Callout, Table, CompareCards,
  Collapse, Pipeline, DiagramPlaceholder, SqlCode, Pseudo,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-reto",       label: "1. El reto: indexar a escala" },
  { id: "sec-bsbi",       label: "2. BSBI: construcción por bloques" },
  { id: "sec-bsbi-merge", label: "3. BSBI: mezcla de bloques" },
  { id: "sec-spimi",      label: "4. SPIMI: single-pass" },
  { id: "sec-spimi-post", label: "5. SPIMI: postings dinámicas" },
  { id: "sec-dict-disco", label: "6. Diccionario en disco" },
  { id: "sec-gin",        label: "7. PostgreSQL: GIN" },
  { id: "sec-gist",       label: "8. GiST y GIN vs GiST" },
  { id: "sec-motores",    label: "9. Motores: Mongo, Solr, ES" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents
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
    <aside
      style={{
        width: 210,
        flexShrink: 0,
        borderLeft: "1px solid var(--border)",
        padding: "36px 0 36px 16px",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 1,
            fontFamily: "var(--font-ui)",
          }}
        >
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
   S9 Guide — Índice Invertido Optimizado
   ───────────────────────────────────────────────────────────────────────────── */
export default function S9Guide() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-reto");

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
              Semana 9 · Módulo II · Motores Especializados
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Índice Invertido Optimizado
            </h1>
            <P>
              En la Semana 8 entendimos <Bold>qué</Bold> es un índice invertido. Ahora resolvemos el
              problema: <Bold>¿cómo se construye cuando la colección no cabe en memoria?</Bold>{" "}
              Veremos dos algoritmos clásicos (<Bold>BSBI</Bold> y <Bold>SPIMI</Bold>) y cómo lo
              implementan los motores reales: Postgres (GIN/GiST), MongoDB, Solr y Elasticsearch.
            </P>
          </div>

          <Callout variant="note" title="Conexión con la Semana 4">
            Esto es <Bold>External Memory Algorithms</Bold> aplicado a la indexación: cuando los datos
            exceden la RAM, hay que ordenar y mezclar por bloques en disco. Es el mismo principio del
            external merge sort.
          </Callout>

          <Divider />

          {/* ══ 1. EL RETO ══ */}
          <H2 id="sec-reto">1. El reto: indexar a escala</H2>
          <P>
            Construir el índice acumulando todo en memoria principal <Bold>no es escalable</Bold>: no
            podemos mantener una colección de millones de documentos en RAM. Hay que diseñar la
            construcción tomando en cuenta las restricciones del hardware.
          </P>
          <Ul items={[
            <><Bold>Memoria limitada:</Bold> el índice no cabe en RAM → hay que volcar resultados parciales a disco.</>,
            <><Bold>Disco lento:</Bold> el acceso a memoria secundaria domina el costo (recuerda la jerarquía de memoria).</>,
            <><Bold>Transferencia por bloques:</Bold> leer/escribir <Bold>bloques grandes contiguos</Bold> es
              mucho más rápido que muchos fragmentos pequeños dispersos.</>,
          ]} />
          <Callout variant="note" title="Idea central">
            Procesar la colección <Bold>por bloques</Bold>: construir un mini-índice de cada bloque que sí
            quepa en RAM, escribirlo a disco, y al final <Bold>mezclar (merge)</Bold> todos los bloques en
            un único índice grande y ordenado.
          </Callout>

          <Divider />

          {/* ══ 2. BSBI ══ */}
          <H2 id="sec-bsbi">2. BSBI  (Blocked Sort-Based Indexing)</H2>
          <P>
            BSBI representa cada ocurrencia como una entrada <Code>(termID, docID)</Code> de tamaño fijo
            (aprox 8 bytes), generada a medida que se parsea cada documento.
          </P>
          <Pipeline steps={[
            { label: "Parsear bloque", sub: "generar (termID, docID)", color: "#3b82f6" },
            { label: "Invertir", sub: "ordenar por termID", color: "#3b82f6" },
            { label: "Escribir a disco", sub: "índice local del bloque", color: "#3b82f6" },
            { label: "Merge", sub: "fusionar todos los bloques", color: "#10b981" },
          ]} />
          <P>Idea básica del algoritmo:</P>
          <Ol items={[
            <>Acumular las entradas <Code>(termID, docID)</Code> de un bloque hasta llenar la memoria
              disponible. Un <Bold>posting</Bold> puede incluir docID, frecuencia (tf) y/o posiciones.</>,
            <><Bold>Ordenar</Bold> las entradas del bloque por <Code>termID</Code> y construir un índice
              local (invertido) del bloque.</>,
            <>Escribir ese índice local a disco y pasar al siguiente bloque.</>,
            <>Cuando todos los bloques están en disco, <Bold>mezclarlos</Bold> en una estructura grande y ordenada.</>,
          ]} />

          <Collapse title="Pseudocódigo: BSBIndexConstruction" defaultOpen>
            <Pseudo>{`BSBI-INDEX-CONSTRUCTION()
1  n = 0
2  while quedan documentos por procesar
3      n = n + 1
4      block = PARSE-NEXT-BLOCK()
5      BSBI-INVERT(block)               // ordena y construye el índice local
6      WRITE-BLOCK-TO-DISK(block, fₙ)
7  MERGE-BLOCKS(f₁, …, fₙ, f_merged)`}</Pseudo>
          </Collapse>
          <DiagramPlaceholder label="Diagrama: bloques 1..6 → índices locales (ordenados por termID) en disk blocks" height={180} />

          <Divider />

          {/* ══ 3. BSBI MERGE ══ */}
          <H2 id="sec-bsbi-merge">3. BSBI: Mezcla de bloques</H2>
          <P>
            Cada índice local está ordenado, pero <Bold>un mismo término puede aparecer en varios bloques</Bold>.
            La fase de merge debe combinar sus posting lists en una sola, manteniendo el orden por docID.
          </P>

          <H3>Opción A: mezclas binarias</H3>
          <Ul items={[
            <>Mezclar de a pares, en un árbol de mezcla de <Code>lg(nº bloques)</Code> niveles.</>,
            <>Ej.: 10 bloques → <Code>lg(10) = 4 (aproxmadamente)</Code> niveles. En cada nivel se lee, fusiona y reescribe.</>,
          ]} />

          <H3>Opción B: mezcla multi-way (mejor)</H3>
          <P>Es más eficiente leer <Bold>todos los bloques simultáneamente</Bold>:</P>
          <Ul items={[
            <>Abrir todos los archivos de bloque a la vez, con un <Bold>buffer de lectura por cada uno</Bold> y
              un buffer de escritura para la salida.</>,
            <>En cada iteración, seleccionar el <Bold>termID más bajo</Bold> aún no procesado usando una{" "}
              <Bold>cola de prioridad</Bold> (min-heap).</>,
            <>Combinar todas las posting lists de ese termID y escribirlas al disco.</>,
          ]} />
          <DiagramPlaceholder label="Diagrama: B buffers de entrada → cola de prioridad → output (multi-way merge)" height={170} />

          <Callout variant="warning" title="Problema pendiente de BSBI">
            BSBI asume que el <Bold>diccionario cabe en memoria principal</Bold> y necesita mantener el
            mapeo <Code>term → termID</Code> (que crece dinámicamente). Para colecciones enormes, ese
            mapeo también es un problema. SPIMI lo elimina.
          </Callout>

          <Divider />

          {/* ══ 4. SPIMI ══ */}
          <H2 id="sec-spimi">4. SPIMI  (Single-Pass In-Memory Indexing)</H2>
          <P>
            SPIMI mejora BSBI con dos ideas: trabajar <Bold>directamente con el término</Bold> (sin mapeo
            term→termID) y <Bold>no ordenar</Bold> durante la construcción del bloque.
          </P>
          <Ul items={[
            <>Genera <Bold>diccionarios hash separados</Bold> para cada bloque, sin mantener el mapeo
              term→termID entre bloques.</>,
            <><Bold>No ordena:</Bold> acumula las publicaciones en listas a medida que van ocurriendo
              (append directo a la posting list del término).</>,
            <>Así genera un <Bold>índice invertido completo por bloque</Bold>; luego los bloques se
              mezclan en un big index (análogo a BSBI).</>,
          ]} />

          <Collapse title="Pseudocódigo: SPIMI-Invert">
            <Pseudo>{`SPIMI-INVERT(token_stream)
 1  output_file = NEW-FILE()
 2  dictionary = NEW-HASH()
 3  while hay memoria libre
 4      token = NEXT(token_stream)
 5      if token.term ∉ dictionary
 6          postings_list = ADD-TO-DICTIONARY(dictionary, token.term)
 7      else postings_list = GET-POSTINGS-LIST(dictionary, token.term)
 8      if FULL(postings_list)
 9          postings_list = DOUBLE-POSTINGS-LIST(dictionary, token.term)
10      ADD-TO-POSTINGS-LIST(postings_list, token.docID)
11  sorted_terms = SORT-TERMS(dictionary)
12  WRITE-BLOCK-TO-DISK(sorted_terms, dictionary, output_file)
13  return output_file`}</Pseudo>
            <P>
              El ordenamiento (línea 11) ocurre <Bold>una sola vez al final del bloque</Bold>, no en cada
              inserción.
            </P>
          </Collapse>

          <Divider />

          {/* ══ 5. SPIMI POSTINGS ══ */}
          <H2 id="sec-spimi-post">5. SPIMI: Posting lists dinámicas y merge</H2>
          <Ul items={[
            <><Bold>Posting list de tamaño dinámico:</Bold> mantiene un tamaño inicial fijo; si se llena,{" "}
              <Bold>duplica</Bold> su tamaño (<Code>DoublePostingsList</Code>), amortiza el costo de crecer.</>,
            <><Bold>Vaciado a disco:</Bold> cuando el diccionario local se llena, se escribe (se vacía) a disco
              y se empieza un bloque nuevo.</>,
            <><Bold>Buckets independientes:</Bold> las posting lists pueden almacenarse en buckets separados.</>,
          ]} />
          <Callout variant="note" title="Ventaja de SPIMI">
            Al no gastar memoria en el mapeo term→termID, los <Bold>diccionarios locales pueden almacenar
            más términos</Bold> (ya ordenados), lo que <Bold>acelera el merge</Bold> final.
          </Callout>
          <DiagramPlaceholder label="Diagrama: Local Dictionary (key, df, bucket) → posting lists en buckets → merge" height={180} />

          <Divider />

          {/* ══ 6. DICCIONARIO EN DISCO ══ */}
          <H2 id="sec-dict-disco">6. Diccionario en disco: localizar términos</H2>
          <P>
            Tras el merge tenemos posting lists en muchos buckets. ¿Cómo localizar <Bold>eficientemente</Bold>{" "}
            el bucket de un término específico (y cómo agregar documentos nuevos)? Aquí reaparecen las
            estructuras ya vistas: <Bold>B+Tree</Bold> vs <Bold>hash extendible</Bold>. La elección depende de los requisitos de la aplicación:
          </P>
          <CompareCards
            items={[
              {
                label: "B+Tree",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: [
                  "Búsqueda por término en O(log n)",
                  "Soporta rangos y orden alfabético de términos",
                  "Inserción de nuevos términos balanceada",
                ],
                cons: [
                  "Overhead de nodos internos",
                  "Más lento que hash para igualdad pura",
                ],
              },
              {
                label: "Extendible Hashing",
                color: "#f59e0b",
                bg: "#1c1207",
                pros: [
                  "Acceso O(1) al bucket del término (igualdad)",
                  "Crecimiento dinámico sin reorganizar todo",
                ],
                cons: [
                  "No soporta rangos ni orden",
                  "Directorio puede crecer",
                ],
              },
            ]}
          />
          <Callout variant="note">
            La pregunta típica: <Bold>¿cómo agregar un nuevo documento al índice ya construido?</Bold>{" "}
            Se localiza cada término del documento (vía B+Tree o hash) y se hace append a su posting list,
            manteniendo el orden por docID.
          </Callout>

          <Divider />

          {/* ══ 7. GIN ══ */}
          <H2 id="sec-gin">7. Postgres: GIN (el índice invertido real)</H2>
          <P>
            <Code>GIN</Code> (<Bold>Generalized Inverted Index</Bold>) es, literalmente, el índice
            invertido que construimos. PostgreSQL lo crea a partir de la representación vectorial
            (<Code>tsvector</Code>) generada de cada tupla en el campo textual.
          </P>
          <SqlCode label="Crear un índice GIN para full-text search" sql={`-- GIN sobre una columna tsvector
CREATE INDEX content_idx ON news USING gin (to_tsvector('spanish', content));

-- O con columna generada (recomendado)
ALTER TABLE articles ADD COLUMN full_text tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', title || ' ' || content)) STORED;
CREATE INDEX full_text_gin ON articles USING GIN (full_text);

-- Consulta usando el índice
SELECT * FROM news
WHERE to_tsvector('spanish','content') @@ to_tsquery('spanish','keyword1 & keyword2');`} />
          <Callout variant="example" title="Desempeño: indexado vs no-indexado">
            En los benchmarks del curso, sin índice el tiempo de consulta crece de forma{" "}
            <Bold>lineal con el número de registros</Bold> (cientos de miles de ms), mientras que con
            GIN se mantiene <Bold>casi plano</Bold>. La diferencia es de uno a dos órdenes de magnitud.
          </Callout>

          <Divider />

          {/* ══ 8. GiST ══ */}
          <H2 id="sec-gist">8. GiST y GIN vs GiST</H2>
          <P>
            <Code>GiST</Code> (Generalized Search Tree) es un índice <Bold>dinámico</Bold> (soporta
            inserciones y eliminaciones eficientes) y adaptable para grandes volúmenes. Internamente usa
            un árbol con <Bold>posting trees / posting lists</Bold>.
          </P>
          <SqlCode label="Índice GiST para texto" sql={`CREATE INDEX docs_gist_idx
ON news USING GIST (to_tsvector('spanish', content));

SELECT * FROM news
WHERE to_tsvector('spanish', content) @@ plainto_tsquery('spanish', 'inteligencia artificial')
LIMIT 10;`} />

          <H3>GIN vs GiST: ¿cuál elegir?</H3>
          <Table
            headers={["Criterio", "GIN", "GiST"]}
            rows={[
              ["Velocidad de búsqueda", "Más rápido", "Más lento"],
              ["Construcción / actualización", "Más costosa", "Más barata"],
              ["Escrituras frecuentes", "Peor", "Mejor"],
              ["Caso ideal", "Motores de búsqueda, grandes volúmenes, muchas lecturas", "Sistemas de gestión de contenido, muchas escrituras"],
            ]}
          />
          <Callout variant="note">
            Regla práctica: <Bold>GIN para leer mucho</Bold> (search engines), <Bold>GiST para escribir
            mucho</Bold> (CMS). Ambos son índices invertidos eficientes; la elección depende del balance
            lectura/escritura.
          </Callout>

          <Divider />

          {/* ══ 9. MOTORES ══ */}
          <H2 id="sec-motores">9. Otros motores de búsqueda textual</H2>

          <H3>MongoDB</H3>
          <P>
            Soporte nativo de full-text search con consultas en lenguaje natural; gestiona el
            procesamiento de texto y el índice invertido automáticamente.
          </P>
          <SqlCode label="MongoDB: text index" sql={`db.articulos.createIndex({ "campoTexto": "text" })

db.articulos.find({ $text: { $search: "big data y análisis de datos",
                              $caseSensitive: true } })`} />
          <Callout variant="note">
            MongoDB usa <Bold>BM25</Bold>, una versión mejorada de TF-IDF que normaliza por longitud de
            documento y satura la frecuencia de términos (el estándar moderno).
          </Callout>

          <H3>Solr y Elasticsearch</H3>
          <Ul items={[
            <><Bold>Apache Solr:</Bold> motor de índice textual sobre Lucene, con API de consulta y panel de
              administración; combina búsqueda textual con consultas tipo SQL.</>,
            <><Bold>Elasticsearch:</Bold> motor distribuido sobre Lucene; soporta <Code>POST _sql</Code> para
              ejecutar SQL sobre los índices textuales además de su DSL de búsqueda.</>,
          ]} />

          <Callout variant="lab" title="Laboratorio 9">
            Implementarás BSBI y SPIMI sobre una colección de documentos, y compararás el desempeño de la
            búsqueda textual (indexado vs no-indexado) en Postgres con <Code>EXPLAIN ANALYZE</Code>.
          </Callout>

          <Callout variant="note" title="Siguiente: Semana 10">
            Hasta aquí, recuperación <Bold>textual</Bold> (palabras exactas/lexemas). La Semana 10 generaliza
            a <Bold>búsqueda por similitud</Bold> en espacios vectoriales: embeddings, distancias y kNN/ANN
            para datos multimedia.
          </Callout>

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
