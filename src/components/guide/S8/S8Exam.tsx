"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, SqlCode, MathBlock,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "ex-conceptos",  label: "1. Conceptos clave" },
  { id: "ex-preproc",    label: "2. Pipeline de preprocesamiento" },
  { id: "ex-formulas",   label: "3. Fórmulas esenciales" },
  { id: "ex-estructuras",label: "4. Estructuras de datos" },
  { id: "ex-algoritmos", label: "5. Algoritmos y complejidad" },
  { id: "ex-tablas",     label: "6. Tablas comparativas" },
  { id: "ex-postgres",   label: "7. PostgreSQL — comandos" },
  { id: "ex-trampas",    label: "8. Errores comunes (trampas)" },
  { id: "ex-ejercicios", label: "9. Ejercicios resueltos" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Local helpers — exam-style formula card with a legend of every symbol
   ───────────────────────────────────────────────────────────────────────────── */
function FormulaCard({
  title,
  formula,
  legend,
  note,
}: {
  title: string;
  formula: React.ReactNode;
  legend: [React.ReactNode, React.ReactNode][];
  note?: React.ReactNode;
}) {
  return (
    <div
      style={{
        margin: "14px 0",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--bg-surface)",
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontFamily: "var(--font-ui)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          padding: "16px 18px",
          fontFamily: "var(--font-code)",
          fontSize: 16,
          color: "#a78bfa",
          textAlign: "center",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {formula}
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
        {legend.map(([sym, mean], i) => (
          <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "baseline" }}>
            <span
              style={{
                fontFamily: "var(--font-code)",
                color: "#a5d6ff",
                minWidth: 64,
                flexShrink: 0,
                fontWeight: 600,
              }}
            >
              {sym}
            </span>
            <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{mean}</span>
          </div>
        ))}
      </div>
      {note && (
        <div
          style={{
            padding: "8px 14px",
            borderTop: "1px solid var(--border)",
            fontSize: 12.5,
            color: "var(--text-muted)",
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

/* Compact definition chip-list */
function DefList({ items }: { items: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div style={{ margin: "10px 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(([term, def], i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 12,
            padding: "8px 12px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}>
            {term}
          </span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{def}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents
   ───────────────────────────────────────────────────────────────────────────── */
function Toc({ active }: { active: string }) {
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
   S8 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S8Exam() {
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
              Semana 8 · Hoja de repaso
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Esencial para el examen
            </h1>
            <P>
              Todo lo que necesitas para el examen de Recuperación de Información Textual, condensado:
              definiciones precisas, cada fórmula con sus variables explicadas, estructuras, complejidades
              y trampas comunes. Para la explicación completa, ve a la guía{" "}
              <Bold>RI: BoW · TF-IDF · Índice Invertido</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Cómo estudiar esto">
            Si solo tienes 20 minutos: memoriza las <Bold>5 fórmulas</Bold> (§3) entendiendo qué hace
            cada variable, la <Bold>estructura del índice invertido</Bold> (§4), las <Bold>complejidades</Bold> (§5)
            y los <Bold>errores comunes</Bold> (§8). Practica los ejercicios (§9) tapando la solución.
          </Callout>

          <Divider />

          {/* ══ 1. CONCEPTOS ══ */}
          <H2 id="ex-conceptos">1. Conceptos clave</H2>
          <DefList items={[
            ["Information Retrieval", <>Búsqueda de información en documentos <Bold>no estructurados</Bold> que satisfaga una necesidad, dentro de grandes colecciones. Resultado <Bold>aproximado y ordenado por relevancia</Bold> (no exacto como en SQL).</>],
            ["Bag of Words", <>Representación de un documento como <Bold>vector sobre el vocabulario</Bold>. Ignora el orden de las palabras; solo cuenta presencia/frecuencia.</>],
            ["Término (term)", <>Unidad léxica del vocabulario tras el preprocesamiento (token normalizado y stemmizado).</>],
            ["Modelo Booleano", <>Recupera con operaciones <Code>AND</Code>/<Code>OR</Code>/<Code>NOT</Code> sobre vectores binarios de incidencia. Devuelve un <Bold>conjunto</Bold> (sí/no), sin ranking.</>],
            ["Ranked Retrieval", <>Consulta en texto libre; devuelve documentos <Bold>ordenados</Bold> por un score de relevancia en [0, 1]. Retorna el Top-K.</>],
            ["TF", <><Bold>Term Frequency</Bold>: cuántas veces aparece un término <Bold>en un documento</Bold>. Mide importancia local.</>],
            ["DF / IDF", <><Bold>Document Frequency</Bold>: en cuántos documentos aparece el término. <Bold>IDF</Bold> = su inverso (log) → mide <Bold>rareza/discriminación</Bold> en la colección.</>],
            ["Índice Invertido", <>Estructura dispersa: para cada término, la <Bold>lista de documentos</Bold> que lo contienen (diccionario + posting lists).</>],
          ]} />

          <Divider />

          {/* ══ 2. PREPROCESAMIENTO ══ */}
          <H2 id="ex-preproc">2. Pipeline de preprocesamiento</H2>
          <P>El orden importa. De texto crudo a términos indexables:</P>
          <Table
            headers={["#", "Etapa", "Qué hace", "Ejemplo"]}
            rows={[
              ["1", "Tokenización", "Cortar la cadena en tokens de palabras", "\"el perro corre\" → [el, perro, corre]"],
              ["2", "Normalización", "Llevar a forma canónica (minúsculas, sin acentos, siglas)", "O.N.U. → onu"],
              ["3", "Stop words", "Eliminar palabras muy comunes y poco informativas", "quitar: de, el, los, y, en"],
              ["4", "Stemming / Lematización", "Reducir a la raíz para unir variantes", "amigas, amigos → amig"],
            ]}
          />
          <Callout variant="warning" title="Trampa frecuente">
            El stemming es lo que <Bold>une <Code>programar</Code>, <Code>programación</Code> y{" "}
            <Code>programador</Code></Bold> — la razón principal por la que <Code>LIKE</Code> falla:{" "}
            <Code>LIKE '%programación%'</Code> no encuentra <Code>programador</Code>.
          </Callout>

          <Divider />

          {/* ══ 3. FÓRMULAS ══ */}
          <H2 id="ex-formulas">3. Fórmulas esenciales</H2>
          <P>Las 5 fórmulas del examen. Entiende qué hace cada variable, no las memorices a ciegas.</P>

          <FormulaCard
            title="① TF — Log-frequency weight"
            formula={<MathBlock>{String.raw`w_{t,d} = \begin{cases} 1 + \log_{10}\mathrm{tf}_{t,d} & \text{si } \mathrm{tf}_{t,d} > 0 \\[2pt] 0 & \text{si } \mathrm{tf}_{t,d} = 0 \end{cases}`}</MathBlock>}
            legend={[
              [<>tf(t,d)</>, <>frecuencia: nº de veces que el término <Code>t</Code> aparece en el documento <Code>d</Code></>],
              [<>w(t,d)</>, <>peso (importancia) de <Code>t</Code> en <Code>d</Code></>],
            ]}
            note={<>El log amortigua: la relevancia NO crece proporcionalmente. 0→0, 1→1, 2→1.3, 10→2, 1000→4.</>}
          />

          <FormulaCard
            title="② IDF — Inverse Document Frequency"
            formula={<MathBlock>{String.raw`\mathrm{idf}_t = \log_{10}\!\frac{N}{\mathrm{df}_t}`}</MathBlock>}
            legend={[
              [<>N</>, <>número <Bold>total</Bold> de documentos en la colección</>],
              [<>df(t)</>, <>document frequency: en cuántos documentos aparece <Code>t</Code> (df ≤ N)</>],
              [<>idf(t)</>, <>peso por rareza: alto para términos raros, 0 para términos en todos los docs</>],
            ]}
            note={<>Un único valor por término. Ej.: "the" aparece en todos → idf = log(1) = 0 → no discrimina.</>}
          />

          <FormulaCard
            title="③ TF-IDF — el peso definitivo"
            formula={<MathBlock>{String.raw`w_{t,d} \;=\; \bigl(1 + \log_{10}\mathrm{tf}_{t,d}\bigr)\times\log_{10}\frac{N}{\mathrm{df}_t} \;=\; \mathrm{tf}_{t,d}\times\mathrm{idf}_t`}</MathBlock>}
            legend={[
              [<>TF</>, <>sube con la frecuencia <Bold>dentro</Bold> del documento</>],
              [<>IDF</>, <>sube con la <Bold>rareza</Bold> del término en la colección</>],
            ]}
            note={<>Alto cuando el término es frecuente en el doc PERO raro en la colección. Mejor esquema conocido en IR.</>}
          />

          <FormulaCard
            title="④ Score documento–consulta"
            formula={<MathBlock>{String.raw`\mathrm{Score}(q,d) = \sum_{t \in q \cap d} \text{tf-idf}_{t,d}`}</MathBlock>}
            legend={[
              [<>q</>, <>consulta (query)</>],
              [<>d</>, <>documento</>],
              [<>q∩d</>, <>términos presentes <Bold>tanto en la consulta como en el documento</Bold></>],
            ]}
            note={<>Si ningún término de la consulta está en el documento → Score = 0.</>}
          />

          <FormulaCard
            title="⑤ Similitud de Coseno"
            formula={<MathBlock>{String.raw`\cos(q,d) \;=\; \frac{q\cdot d}{\lVert q\rVert\,\lVert d\rVert} \;=\; \frac{\sum_i q_i d_i}{\sqrt{\sum_i q_i^{2}}\,\sqrt{\sum_i d_i^{2}}}`}</MathBlock>}
            legend={[
              [<>q · d</>, <>producto punto (numerador): cuánto se solapan</>],
              [<>|q|, |d|</>, <>norma euclidiana √(Σxᵢ²): la <Bold>longitud</Bold> del vector</>],
              [<>qᵢ, dᵢ</>, <>peso tf-idf del término <Code>i</Code> en <Code>q</Code> y en <Code>d</Code></>],
            ]}
            note={<>Dividir por la norma = normalizar longitud → documentos largos y cortos quedan comparables. Resultado en [0, 1]: 1 = idénticos, 0 = ortogonales.</>}
          />

          <Callout variant="warning" title="¿Por qué coseno y NO distancia euclidiana?">
            La distancia euclidiana <Bold>penaliza vectores de distinta longitud</Bold>. Si duplicas un
            documento consigo mismo, su contenido es el mismo pero la distancia euclidiana se dispara;
            en cambio el <Bold>ángulo entre ellos es 0</Bold> (coseno = 1). Por eso se rankea por ángulo/coseno.
          </Callout>

          <Divider />

          {/* ══ 4. ESTRUCTURAS ══ */}
          <H2 id="ex-estructuras">4. Estructuras de datos</H2>

          <H3>Matriz de incidencia (término × documento)</H3>
          <Ul items={[
            <>Filas = términos, columnas = documentos. Celda = 1 si el término aparece, 0 si no.</>,
            <><Bold>Problema:</Bold> es enorme y casi vacía. Ej.: 500k términos × 1M docs = 0.5×10¹² bits, con{" "}
              <Bold>≥99.8% ceros</Bold>. Inviable almacenarla completa.</>,
            <>Solución → guardar <Bold>solo las entradas no-cero</Bold> = índice invertido.</>,
          ]} />

          <H3>Índice invertido = Diccionario + Posting Lists</H3>
          <DefList items={[
            ["Diccionario", <>Los términos del vocabulario, <Bold>en memoria</Bold>. Para cada término guarda su <Code>df</Code> y un puntero a su posting list.</>],
            ["Posting list", <>Lista de los <Code>docID</Code> donde aparece el término. Tamaño variable. <Bold>Ordenada por docID</Bold> (¡clave!). Puede guardar también tf y posiciones.</>],
          ]} />
          <Callout variant="example">
            <P>Para los términos <Code>blue</Code> y <Code>sky</Code> en 3 documentos:</P>
            <Table
              headers={["Término", "df", "Posting list (docIDs ordenados)"]}
              rows={[
                ["blue", "2", "[1, 3]"],
                ["sky", "2", "[2, 3]"],
                ["bright", "1", "[1]"],
              ]}
            />
            <P><Code>blue AND sky</Code> → intersección de [1,3] y [2,3] = <Bold>[3]</Bold>.</P>
          </Callout>

          <Divider />

          {/* ══ 5. ALGORITMOS Y COMPLEJIDAD ══ */}
          <H2 id="ex-algoritmos">5. Algoritmos y complejidad</H2>

          <H3>Merge de posting lists (consulta AND = INTERSECT)</H3>
          <Ul items={[
            <>Dos punteros recorren ambas listas <Bold>simultáneamente</Bold>. Si los docID coinciden → al resultado y avanzan ambos; si no, avanza el del docID <Bold>menor</Bold>.</>,
            <><Bold>Solo funciona si las listas están ordenadas por docID.</Bold> Esa es la razón del orden.</>,
            <><Code>OR</Code> = unión (agregar todos); <Code>AND NOT</Code> = los de la primera que no están en la segunda.</>,
          ]} />

          <Table
            headers={["Operación", "Complejidad", "Nota"]}
            rows={[
              ["Búsqueda con LIKE / scan completo", "O(N · n)", "N = #tuplas, n = tamaño del texto. No escala."],
              ["Merge de 2 posting lists (INTERSECT)", "O(n + m)", "n, m = longitudes de las listas. Requiere orden."],
              ["Consulta booleana sobre índice invertido", "O(m)", "m = tamaño de la query (nº de términos)."],
              ["Ranking por coseno (CosineScore)", "O(postings recorridas)", "Solo docs que contienen algún término de q."],
            ]}
          />

          <Callout variant="note" title="CosineScore — idea del algoritmo">
            <Ul items={[
              <>Acumulador <Code>Scores[d] = 0</Code> para cada doc.</>,
              <>Por cada término <Code>t</Code> de la query: recorrer su posting list y hacer{" "}
                <Code>Scores[d] += w(t,d) × w(t,q)</Code>.</>,
              <>Normalizar: <Code>Scores[d] /= Length[d]</Code>.</>,
              <>Devolver el <Bold>Top-K</Bold>.</>,
            ]} />
          </Callout>

          <Divider />

          {/* ══ 6. TABLAS COMPARATIVAS ══ */}
          <H2 id="ex-tablas">6. Tablas comparativas</H2>

          <H3>Modelo Booleano vs Ranked Retrieval</H3>
          <Table
            headers={["", "Booleano", "Ranked"]}
            rows={[
              ["Consulta", "Operadores AND/OR/NOT", "Texto libre (lenguaje natural)"],
              ["Resultado", "Conjunto (sí / no)", "Lista ordenada por relevancia"],
              ["Ordenamiento", "No hay", "Sí, por score [0,1]"],
              ["Problema", "0 o miles de resultados", "Requiere calcular scores"],
              ["Usuario ideal", "Experto", "Cualquiera"],
            ]}
          />

          <H3>IR vs Base de Datos Relacional</H3>
          <Table
            headers={["Aspecto", "BD Relacional", "Information Retrieval"]}
            rows={[
              ["Acierto", "Exacto", "Aproximado, el mejor"],
              ["Modelo", "Determinístico", "Heurístico / probabilístico"],
              ["Consulta", "Estructurada (SQL)", "No estructurada, natural"],
              ["Error en respuesta", "No se tolera", "Se tolera (ruido)"],
            ]}
          />

          <H3>Distancia Euclidiana vs Similitud de Coseno</H3>
          <Table
            headers={["", "Euclidiana", "Coseno"]}
            rows={[
              ["Mide", "Magnitud / distancia absoluta", "Dirección / ángulo"],
              ["Sensible a la longitud", "Sí (penaliza)", "No (normaliza)"],
              ["Uso en IR de texto", "Mala idea", "Estándar"],
            ]}
          />

          <Divider />

          {/* ══ 7. POSTGRESQL ══ */}
          <H2 id="ex-postgres">7. PostgreSQL — comandos clave</H2>
          <DefList items={[
            [<Code>to_tsvector</Code>, <>texto → documento procesado (lexemas normalizados + posiciones). Es el Bag of Words.</>],
            [<Code>to_tsquery</Code>, <>texto → consulta de lexemas con <Code>&amp;</Code> (AND), <Code>|</Code> (OR), <Code>!</Code> (NOT).</>],
            [<Code>@@</Code>, <>operador de coincidencia: <Code>tsvector @@ tsquery</Code> → ¿el documento satisface la consulta?</>],
            [<Code>GIN</Code>, <>Generalized Inverted Index: <Bold>es el índice invertido</Bold> de PostgreSQL. Lo que hace que escale.</>],
            [<Code>ts_rank</Code>, <>calcula el score de relevancia para ordenar (el ranking).</>],
          ]} />
          <SqlCode label="Patrón completo de Full-Text Search" sql={`-- 1) Columna tsvector generada + 2) índice GIN
ALTER TABLE articles ADD COLUMN full_text tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', title || ' ' || content)) STORED;
CREATE INDEX full_text_gin ON articles USING GIN (full_text);

-- 3) Consulta indexada + ranking
SELECT title, ts_rank(full_text, q) AS rank
FROM articles, to_tsquery('spanish', 'inteligencia & artificial') q
WHERE full_text @@ q
ORDER BY rank DESC
LIMIT 10;`} />

          <Divider />

          {/* ══ 8. TRAMPAS ══ */}
          <H2 id="ex-trampas">8. Errores comunes (trampas)</H2>
          <Callout variant="warning" title="Lo que más se equivoca en el examen">
            <Ul items={[
              <><Bold>Confundir tf con df:</Bold> tf = veces en UN documento; df = en CUÁNTOS documentos. La idf usa df, no tf.</>,
              <><Bold>Creer que la relevancia es lineal:</Bold> 10 apariciones NO valen 10× — por eso el log.</>,
              <><Bold>Usar distancia euclidiana</Bold> para comparar documentos: penaliza longitud → usar coseno.</>,
              <><Bold>Olvidar el orden de las postings:</Bold> sin orden por docID, el merge NO es O(n+m).</>,
              <><Bold>Pensar que B+Tree o Hash aceleran <Code>LIKE '%...%'</Code>:</Bold> no sirven para subcadenas dentro del texto; se necesita índice invertido (GIN).</>,
              <><Bold>Olvidar que <Code>idf = 0</Code></Bold> para términos que aparecen en TODOS los documentos (df = N → log(1) = 0).</>,
              <><Bold>Confundir Bag of Words con el orden:</Bold> BoW ignora el orden de las palabras.</>,
            ]} />
          </Callout>

          <Divider />

          {/* ══ 9. EJERCICIOS ══ */}
          <H2 id="ex-ejercicios">9. Ejercicios resueltos</H2>
          <P>Tapa la solución e intenta primero.</P>

          <Callout variant="example" title="Ejercicio 1 — IDF">
            <P><Bold>Colección de N = 1,000,000 documentos. El término "animal" aparece en df = 100. ¿Cuál es su idf?</Bold></P>
            <P>
              idf = log₁₀(N / df) = log₁₀(1,000,000 / 100) = log₁₀(10,000) = <Bold>4</Bold>.
            </P>
          </Callout>

          <Callout variant="example" title="Ejercicio 2 — TF (log weight)">
            <P><Bold>El término "datos" aparece tf = 100 veces en un documento. ¿Cuál es su peso log-frecuencia?</Bold></P>
            <P>
              w = 1 + log₁₀(tf) = 1 + log₁₀(100) = 1 + 2 = <Bold>3</Bold>.
            </P>
          </Callout>

          <Callout variant="example" title="Ejercicio 3 — TF-IDF">
            <P><Bold>Con los dos resultados anteriores (w_tf = 3 para "datos", idf = 4 para "animal"): si un término tiene tf-peso = 3 e idf = 4, ¿su tf-idf?</Bold></P>
            <P>
              tf-idf = tf × idf = 3 × 4 = <Bold>12</Bold>. (Frecuente en el doc y relativamente raro → peso alto.)
            </P>
          </Callout>

          <Callout variant="example" title="Ejercicio 4 — Booleano">
            <P><Bold>Postings: Brutus = [1,2,4,11,31] · Caesar = [1,2,4,5,6]. Resultado de Brutus AND Caesar.</Bold></P>
            <P>
              Intersección (merge con 2 punteros): <Bold>[1, 2, 4]</Bold>. Coste O(n+m) = O(5+5) = O(10).
            </P>
          </Callout>

          <Callout variant="example" title="Ejercicio 5 — Coseno">
            <P><Bold>q = (1, 0, 1), d = (1, 1, 1). ¿cos(q, d)?</Bold></P>
            <P>
              q·d = 1·1 + 0·1 + 1·1 = 2. &nbsp; |q| = √(1+0+1) = √2. &nbsp; |d| = √(1+1+1) = √3.
            </P>
            <P>
              cos = 2 / (√2·√3) = 2 / √6 ≈ <Bold>0.816</Bold>.
            </P>
          </Callout>

          <Callout variant="lab" title="Para practicar de verdad">
            Abre el <Bold>SQL Playground</Bold> y reproduce el patrón de la §7: crea una tabla con texto,
            genera el <Code>tsvector</Code>, crea el índice <Code>GIN</Code> y compara <Code>EXPLAIN ANALYZE</Code>{" "}
            contra una búsqueda con <Code>LIKE</Code>.
          </Callout>

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
