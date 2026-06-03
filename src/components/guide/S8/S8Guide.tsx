"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Ol, Callout, Table,
  Collapse, Pipeline, DiagramPlaceholder, SqlCode, MathBlock, Pseudo,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (used by both TOC and IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-problema",   label: "1. El problema: buscar en texto" },
  { id: "sec-ir",         label: "2. ¿Qué es Information Retrieval?" },
  { id: "sec-bow",        label: "3. Bag of Words" },
  { id: "sec-booleano",   label: "4. Modelo Booleano" },
  { id: "sec-ranking",    label: "5. Ranked Retrieval & Scoring" },
  { id: "sec-tf",         label: "6. Term Frequency (TF)" },
  { id: "sec-idf",        label: "7. Document Frequency (IDF)" },
  { id: "sec-tfidf",      label: "8. TF-IDF" },
  { id: "sec-coseno",     label: "9. Espacio Vectorial & Coseno" },
  { id: "sec-invertido",  label: "10. Índice Invertido" },
  { id: "sec-consultas",  label: "11. Consultas sobre el índice" },
  { id: "sec-postgres",   label: "12. Full-Text Search en PostgreSQL" },
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
   S8 Guide — Recuperación de Información Textual
   ───────────────────────────────────────────────────────────────────────────── */
export default function S8Guide() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-problema");

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
      {/* ── Scrollable content ── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 32px 80px" }}>

          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 8 · Módulo II — Motores Especializados
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Recuperación de Información Textual
            </h1>
            <P>
              ¿Cómo busca Google entre miles de millones de documentos en milisegundos y te devuelve
              los más relevantes primero? Esta semana construimos la maquinaria detrás de la búsqueda
              de texto: cómo representar documentos como vectores (<Bold>Bag of Words</Bold>), cómo
              medir relevancia (<Bold>TF-IDF</Bold> y <Bold>similitud de coseno</Bold>), y cómo
              indexar todo eficientemente con un <Bold>índice invertido</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Mapa de la semana">
            Vamos del problema (¿por qué <Code>LIKE</Code> no basta?) → representación (Bag of Words) →
            recuperación booleana → recuperación por ranking (TF-IDF + coseno) → la estructura que lo
            hace rápido (índice invertido) → la implementación real en PostgreSQL.
          </Callout>

          <Divider />

          {/* ══ 1. EL PROBLEMA ══ */}
          <H2 id="sec-problema">1. El problema: buscar en texto</H2>
          <P>
            En las aplicaciones modernas es fundamental procesar <Bold>datos no estructurados</Bold>{" "}
            (texto, imágenes, audio, video) para permitir consultas <Bold>basadas en su contenido</Bold>.
            El caso más común es el texto: artículos, noticias, papers, reseñas, código fuente.
          </P>

          <H3>El intento ingenuo: LIKE / ILIKE</H3>
          <P>
            En una base de datos relacional, el campo textual suele ser un atributo de tipo{" "}
            <Code>text</Code>, y la búsqueda se hace con el operador <Code>LIKE</Code> o <Code>ILIKE</Code>:
          </P>
          <SqlCode label="Búsqueda con ILIKE — funciona en demo, falla en producción (creanme D:)" sql={`SELECT * FROM news
WHERE content ILIKE '%keyword1%'
  AND content ILIKE '%keyword2%';`} />

          <Callout variant="warning" title="En producción, esta aplicación no sirve. ¿Por qué?">
            <Ol items={[
              <><Bold>No considera la relación léxica</Bold> de las palabras en textos escritos por
                humanos: <Code>programar</Code>, <Code>programación</Code> y <Code>programador</Code>{" "}
                comparten raíz pero <Code>LIKE '%programación%'</Code> no las une.</>,
              <><Bold>Demasiados resultados sin ordenar</Bold> desesperan al usuario: no hay noción de
                "qué documento es más relevante".</>,
              <><Bold>Excesivo tiempo computacional</Bold>: complejidad <Code>O(N·n)</Code> con N = #tuplas
                y n = tamaño del texto. Un índice B+Tree o Hash <Bold>no ayuda</Bold> porque buscan valores
                exactos o rangos, no subcadenas dentro del texto.</>,
            ]} />
          </Callout>

          <H3>Information Retrieval vs Bases de Datos Relacionales</H3>
          <P>
            La diferencia es de fondo: la BD relacional responde con <Bold>exactitud</Bold>; la
            recuperación de información responde con <Bold>aproximación y relevancia</Bold>.
          </P>
          <Table
            headers={["Aspecto", "BD Relacional", "Information Retrieval"]}
            rows={[
              ["Acierto", "Exacto", "Aproximado, el mejor"],
              ["Inferencia", "Algebraica", "Inductiva"],
              ["Modelo", "Determinístico", "Heurístico, probabilístico"],
              ["Lenguaje de consulta", "Fuertemente estructurado (SQL)", "No estructurado, natural"],
              ["Especificación", "Precisa", "Imprecisa"],
              ["Error en la respuesta", "Sensible (no se tolera)", "Insensible (se tolera ruido)"],
            ]}
          />

          <Divider />

          {/* ══ 2. INFORMATION RETRIEVAL ══ */}
          <H2 id="sec-ir">2. ¿Qué es Information Retrieval?</H2>
          <Callout variant="definition" title="Information Retrieval (IR)">
            Es la ciencia de la búsqueda de información en <Bold>documentos digitales</Bold>, de
            naturaleza <Bold>no estructurada</Bold>, que satisfaga una necesidad de información dentro
            de <Bold>grandes colecciones</Bold>.
          </Callout>

          <P>
            Sobre una base de datos multimedia, IR se materializa principalmente como{" "}
            <Bold>Full-Text Search</Bold> (texto) y <Bold>Content-Based Image Search</Bold> (imágenes).
            Esta semana nos enfocamos en texto.
          </P>

          <H3>Entrada y salida de un sistema IR</H3>
          <Ul items={[
            <><Bold>Input:</Bold> una gran colección de documentos de texto no estructurados + una
              consulta del usuario expresada como texto.</>,
            <><Bold>Output:</Bold> una <Bold>lista ordenada</Bold> (ranking) de documentos relevantes
              para la consulta.</>,
          ]} />

          <Pipeline steps={[
            { label: "Query String", sub: "necesidad de información", color: "#3b82f6" },
            { label: "IR System", sub: "matching + scoring", color: "#8b5cf6" },
            { label: "Ranked Docs", sub: "Doc1, Doc2, Doc3…", color: "#10b981" },
          ]} />

          <Callout variant="note" title="Atributos externos vs internos">
            Un documento (ej. un libro) tiene <Bold>atributos externos</Bold> (ISBN, autor, fecha → se
            buscan como en una BD normal) y <Bold>atributos internos</Bold> (el contenido textual). IR
            es precisamente la <Bold>búsqueda basada en el contenido interno</Bold>.
          </Callout>

          <Divider />

          {/* ══ 3. BAG OF WORDS ══ */}
          <H2 id="sec-bow">3. Bag of Words</H2>
          <P>
            <Bold>Bag of Words (BoW)</Bold> transforma texto en una representación{" "}
            <Bold>numérica vectorial</Bold>, para dar soporte a técnicas de Machine Learning e
            Information Retrieval (que operan en espacios vectoriales). Sirve para clasificación,
            clustering, recuperación, recomendación, análisis de sentimientos y detección de tópicos.
          </P>
          <Callout variant="note">
            Se llama "bolsa de palabras" porque <Bold>ignora el orden</Bold>: solo importa qué palabras
            aparecen y cuántas veces, no su posición. <Code>"el perro muerde"</Code> y{" "}
            <Code>"muerde el perro"</Code> tienen el mismo vector.
          </Callout>

          <H3>Preprocesamiento: del texto crudo a tokens</H3>
          <Pipeline steps={[
            { label: "Tokenización", sub: "cortar en palabras", color: "#06b6d4" },
            { label: "Normalización", sub: "O.N.U. → ONU", color: "#06b6d4" },
            { label: "Stop words", sub: "quitar de, el, los…", color: "#06b6d4" },
            { label: "Stemming", sub: "amigos → amig", color: "#06b6d4" },
          ]} />
          <Ul items={[
            <><Bold>Tokenización:</Bold> cortar la secuencia de caracteres en tokens de palabras.</>,
            <><Bold>Normalización:</Bold> mapear texto y consulta a la misma forma (¿quieres que{" "}
              <Code>O.N.U.</Code> y <Code>ONU</Code> coincidan?).</>,
            <><Bold>Stop words:</Bold> omitir palabras muy comunes y poco informativas (<Code>de</Code>,{" "}
              <Code>el</Code>, <Code>los</Code>, <Code>uno</Code>…).</>,
            <><Bold>Stemming / Lematización:</Bold> reducir palabras a su raíz para que coincidan{" "}
              (<Code>autorizar</Code>, <Code>autorización</Code> → <Code>autoriz</Code>).</>,
          ]} />

          <Callout variant="example">
            <P><Bold>Texto:</Bold> "Mis amigas y amigos peruanos son estudiosos."</P>
            <P><Bold>Tras tokenizar + quitar stop words:</Bold> [amigas, amigos, peruanos, estudiosos]</P>
            <P><Bold>Tras stemming:</Bold> [amig, peruan, estudi] — note cómo <Code>amigas</Code> y{" "}
              <Code>amigos</Code> colapsan en un solo término.</P>
          </Callout>

          <H3>Vectorización: la matriz de incidencia</H3>
          <P>
            Cada documento se convierte en un vector sobre el vocabulario. En su forma más simple,
            la <Bold>matriz de incidencia</Bold> usa 1 si el término aparece, 0 si no.
          </P>
          <Collapse title="Ejemplo: matriz de incidencia de 4 documentos" defaultOpen>
            <P>Documentos ya procesados (sin stop words):</P>
            <Code>D1: [casa, grande]   D2: [gato, casa]   D3: [casa, bonita, grande]   D4: [sol, brilla, casa]</Code>
            <div style={{ marginTop: 10 }}>
              <Table
                headers={["", "casa", "grande", "gato", "bonita", "sol", "brilla"]}
                rows={[
                  ["Doc 1", "1", "1", "0", "0", "0", "0"],
                  ["Doc 2", "1", "0", "1", "0", "0", "0"],
                  ["Doc 3", "1", "1", "0", "1", "0", "0"],
                  ["Doc 4", "1", "0", "0", "0", "1", "1"],
                ]}
              />
            </div>
          </Collapse>

          <H3>Esquemas de ponderación (weighting)</H3>
          <P>El valor de cada celda del vector puede ser:</P>
          <Ul items={[
            <><Bold>Incidencia (1/0):</Bold> ¿aparece o no? — matriz binaria.</>,
            <><Bold>Conteo (count):</Bold> número de veces que aparece el término (frecuencia).</>,
            <><Bold>TF-IDF:</Bold> el esquema más usado, que veremos en la sección 8.</>,
          ]} />

          <Divider />

          {/* ══ 4. MODELO BOOLEANO ══ */}
          <H2 id="sec-booleano">4. Modelo Booleano</H2>
          <P>
            El modelo booleano usa la matriz de incidencia binaria y trata cada fila (término) como un
            <Bold> vector de bits</Bold> sobre los documentos. Las consultas se resuelven con operaciones
            booleanas <Code>AND</Code>, <Code>OR</Code>, <Code>NOT</Code> sobre esos vectores.
          </P>

          <Collapse title="Ejemplo clásico: obras de Shakespeare" defaultOpen>
            <P>Matriz término–documento (1 = el término aparece en la obra):</P>
            <Table
              headers={["término", "Antony&Cleo", "Julius Caesar", "Tempest", "Hamlet", "Othello", "Macbeth"]}
              rows={[
                ["Antony",    "1", "1", "0", "0", "0", "1"],
                ["Brutus",    "1", "1", "0", "1", "0", "0"],
                ["Caesar",    "1", "1", "0", "1", "1", "1"],
                ["Calpurnia", "0", "1", "0", "0", "0", "0"],
                ["Cleopatra", "1", "0", "0", "0", "0", "0"],
                ["mercy",     "1", "0", "1", "1", "1", "1"],
              ]}
            />
            <div style={{ marginTop: 10 }}>
              <P><Bold>Query:</Bold> <Code>Brutus AND Caesar AND NOT Calpurnia</Code></P>
            </div>
            <MathBlock>{String.raw`\begin{aligned}
              & M(\text{Brutus}) \wedge M(\text{Caesar}) \wedge \neg M(\text{Calpurnia}) \\
              ={}& \texttt{110100} \wedge \texttt{110111} \wedge \neg\,\texttt{010000} \\
              ={}& \texttt{110100} \wedge \texttt{110111} \wedge \texttt{101111} \\
              ={}& \texttt{100100} \;\Rightarrow\; \text{Antony \& Cleopatra, Hamlet}
            \end{aligned}`}</MathBlock>
          </Collapse>

          <H3>Problemas de la búsqueda booleana</H3>
          <P>
            La consulta booleana es <Bold>buena para usuarios expertos</Bold> con comprensión precisa de
            sus necesidades y de la colección, y para aplicaciones que consumen miles de resultados. Pero
            es <Bold>mala para la mayoría de usuarios</Bold>:
          </P>
          <Ul items={[
            <>La mayoría no sabe (o no quiere) escribir consultas booleanas.</>,
            <>Nadie quiere revisar miles de resultados sin ordenar — especialmente en la web.</>,
            <>Las consultas dan <Bold>muy pocos (0)</Bold> o <Bold>demasiados (miles)</Bold> resultados.</>,
          ]} />
          <Callout variant="warning" title="El dilema AND / OR">
            <Code>standard AND user AND dlink 650</Code> → 200,000 resultados.{" "}
            <Code>… AND NOT card</Code> → 0 resultados. <Bold>AND da muy pocos, OR da demasiados.</Bold>{" "}
            Se requiere mucha habilidad para llegar a un número manejable. La solución es{" "}
            <Bold>ordenar por relevancia</Bold> en lugar de filtrar.
          </Callout>

          <Divider />

          {/* ══ 5. RANKED RETRIEVAL ══ */}
          <H2 id="sec-ranking">5. Ranked Retrieval & Scoring</H2>
          <P>
            En lugar de un lenguaje de operadores, en <Bold>Ranked Retrieval</Bold> la consulta es{" "}
            <Bold>texto libre</Bold> (lenguaje natural) y el sistema devuelve un <Bold>orden</Bold> de
            documentos según su relevancia para la consulta.
          </P>
          <Callout variant="definition" title="Scoring">
            Asignamos un <Bold>score entre [0, 1]</Bold> a cada documento, que mide qué tan bien "coinciden"
            el documento y la consulta. Ese score es la base del ranking: ordenamos los documentos de mayor
            a menor score y devolvemos el <Bold>Top-K</Bold>.
          </Callout>
          <P>Intuiciones que debe cumplir el score de un solo término de la consulta:</P>
          <Ul items={[
            <>Si el término <Bold>no aparece</Bold> en el documento → score 0.</>,
            <>Cuanto <Bold>más frecuente</Bold> sea el término en el documento → mayor score.</>,
          ]} />
          <P>
            Construiremos ese score en tres pasos: <Bold>TF</Bold> (frecuencia en el documento),{" "}
            <Bold>IDF</Bold> (rareza en la colección) y su producto <Bold>TF-IDF</Bold>.
          </P>

          <Divider />

          {/* ══ 6. TF ══ */}
          <H2 id="sec-tf">6. Term Frequency (TF)</H2>
          <P>
            La frecuencia del término <Code>tf(t,d)</Code> es el número de veces que ocurre el término{" "}
            <Code>t</Code> en el documento <Code>d</Code>. Cada documento es un <Bold>vector de conteo</Bold>.
          </P>
          <Callout variant="warning" title="La frecuencia cruda NO es lo que queremos">
            Un documento con 10 apariciones de un término es más relevante que uno con 1 sola… pero{" "}
            <Bold>no 10 veces más relevante</Bold>. La relevancia <Bold>no crece proporcionalmente</Bold>{" "}
            con la frecuencia.
          </Callout>

          <H3>Log-frequency weighting</H3>
          <P>Para amortiguar el efecto, usamos el peso log-frecuencia:</P>
          <MathBlock>{String.raw`w_{t,d} = \begin{cases} 1 + \log_{10}\mathrm{tf}_{t,d} & \text{si } \mathrm{tf}_{t,d} > 0 \\[2pt] 0 & \text{en otro caso} \end{cases}`}</MathBlock>
          <P>
            Así: 0 → 0, &nbsp; 1 → 1, &nbsp; 2 → 1.3, &nbsp; 10 → 2, &nbsp; 1000 → 4. El score
            documento–consulta es la suma sobre los términos que coinciden en ambos:
          </P>
          <MathBlock>{String.raw`\mathrm{Score}(q,d) = \sum_{t \in q \cap d} \bigl(1 + \log \mathrm{tf}_{t,d}\bigr)`}</MathBlock>
          <P>El score es 0 si ningún término de la consulta está presente en el documento.</P>

          <Divider />

          {/* ══ 7. IDF ══ */}
          <H2 id="sec-idf">7. Document Frequency (IDF)</H2>
          <P>
            Los <Bold>términos raros</Bold> tienden a ser más informativos que los frecuentes. Si la
            consulta contiene un término raro (ej. <Code>aracnocéntrico</Code>), un documento que lo
            contiene es muy probablemente relevante → queremos darle un <Bold>peso alto</Bold>.
          </P>
          <P>
            En cambio, términos frecuentes (<Code>alto</Code>, <Code>aumentar</Code>, <Code>línea</Code>)
            son menos seguros como indicador de relevancia → peso positivo pero <Bold>más bajo</Bold>.
            Para esto usamos la <Bold>frecuencia de documento</Bold> <Code>df(t)</Code>.
          </P>

          <Callout variant="definition" title="IDF — Inverse Document Frequency">
            <Code>df(t)</Code> = número de documentos que contienen <Code>t</Code> (es una medida inversa
            de la informatividad; df(t) ≤ N). Definimos el idf como:
          </Callout>
          <MathBlock>{String.raw`\mathrm{idf}_t = \log_{10}\!\frac{N}{\mathrm{df}_t}`}</MathBlock>
          <P>
            Usamos <Code>log(N/df)</Code> en lugar de <Code>N/df</Code> para "amortiguar" el efecto. La
            base del log es irrelevante. Hay un único valor idf por término en la colección.
          </P>

          <Collapse title="Ejemplo: idf con N = 1 millón de documentos">
            <Table
              headers={["término", "df(t)", "idf(t)"]}
              rows={[
                ["calpurnia", "1", "6"],
                ["animal", "100", "4"],
                ["sunday", "1,000", "3"],
                ["fly", "10,000", "2"],
                ["under", "100,000", "1"],
                ["the", "1,000,000", "0"],
              ]}
            />
            <P>
              <Code>the</Code> aparece en todos los documentos → idf = log(1) = 0 → no aporta nada al
              ranking. <Code>calpurnia</Code> es rarísimo → idf alto → muy discriminante.
            </P>
          </Collapse>

          <Divider />

          {/* ══ 8. TF-IDF ══ */}
          <H2 id="sec-tfidf">8. TF-IDF</H2>
          <P>
            El peso <Bold>TF-IDF</Bold> de un término es el producto de su peso TF por su peso IDF. Es el
            <Bold> mejor esquema de ponderación conocido</Bold> en recuperación de información.
          </P>
          <MathBlock>{String.raw`\begin{aligned} w_{t,d} &= \log_{10}(1 + \mathrm{tf}_{t,d}) \times \log_{10}\frac{N}{\mathrm{df}_t} \\ &= \mathrm{tf}_{t,d}\times\mathrm{idf}_t \end{aligned}`}</MathBlock>
          <Ul items={[
            <><Bold>Aumenta</Bold> con el número de ocurrencias dentro de un documento (TF).</>,
            <><Bold>Aumenta</Bold> con la rareza del término en la colección (IDF).</>,
          ]} />
          <P>El score de un documento dada una consulta es la suma de los TF-IDF de los términos comunes:</P>
          <MathBlock>{String.raw`\mathrm{Score}(q,d) = \sum_{t \in q \cap d} \text{tf-idf}_{t,d}`}</MathBlock>

          <Callout variant="example">
            <P>
              <Bold>Documentos:</Bold> D1 "Cargamento de oro dañado por el fuego" · D2 "La entrega de la
              plata llegó en el camión color plata" · D3 "El cargamento de oro llegó en un camión".
            </P>
            <P><Bold>Consulta:</Bold> "oro plata camión".</P>
            <P>
              Calculando los pesos TF-IDF y la similitud, el resultado ordenado por relevancia es{" "}
              <Bold>D2, D3, D1</Bold>: D2 menciona "plata" dos veces (término discriminante), D3 tiene "oro"
              y "camión", y D1 apenas comparte "oro".
            </P>
          </Callout>

          <Divider />

          {/* ══ 9. COSENO ══ */}
          <H2 id="sec-coseno">9. Espacio Vectorial & Similitud de Coseno</H2>
          <P>
            Representamos tanto la consulta como cada documento como <Bold>vectores de pesos TF-IDF</Bold>{" "}
            en un espacio donde cada dimensión es un término del vocabulario. La relevancia se convierte en
            <Bold> proximidad geométrica</Bold>.
          </P>
          <MathBlock>{String.raw`\begin{aligned}
            \text{Espacio} &: [\,t_1, t_2, t_3, \ldots, t_n\,] \\
            \text{Documento } D &= [\,a_1, a_2, \ldots, a_n\,] \quad (a_i = \text{peso de } t_i \text{ en } D) \\
            \text{Consulta } Q &= [\,b_1, b_2, \ldots, b_n\,] \quad (b_i = \text{peso de } t_i \text{ en } Q)
          \end{aligned}`}</MathBlock>

          <H3>¿Por qué NO usar distancia euclidiana?</H3>
          <Callout variant="warning" title="La distancia euclidiana es una mala idea">
            La distancia euclidiana es <Bold>grande para vectores de diferente longitud</Bold>.
            Experimento mental: toma un documento <Code>d</Code> y duplícalo en sí mismo →{" "}
            <Code>d'</Code>. Semánticamente <Code>d</Code> y <Code>d'</Code> son idénticos, pero su
            distancia euclidiana es enorme. Sin embargo, <Bold>el ángulo entre ellos es 0</Bold>.
          </Callout>
          <P>
            <Bold>Key idea:</Bold> rankear los documentos según el <Bold>ángulo</Bold> que forman con la
            consulta, no su distancia. Ordenar por ángulo creciente ≡ ordenar por coseno decreciente
            (el coseno es monótonamente decreciente en [0°, 180°]).
          </P>

          <H3>La fórmula del coseno</H3>
          <MathBlock>{String.raw`\cos(q,d) = \frac{q\cdot d}{\lVert q\rVert\,\lVert d\rVert} = \frac{\sum_i q_i d_i}{\sqrt{\sum_i q_i^{2}}\,\sqrt{\sum_i d_i^{2}}}`}</MathBlock>
          <Ul items={[
            <><Bold>Numerador (q · d):</Bold> producto punto — mide cuánto se solapan.</>,
            <><Bold>Denominador:</Bold> normaliza por la longitud (norma) de cada vector → los convierte
              en vectores unitarios. Así documentos largos y cortos tienen pesos comparables.</>,
          ]} />
          <DiagramPlaceholder label="Diagrama: vectores q, d₁, d₂, d₃ en el plano y el ángulo θ (espacio vectorial)" height={200} />

          <Collapse title="Ejemplo: ¿qué tan similares son tres novelas?">
            <P>
              <Bold>SS</Bold> Sentido y Sensibilidad · <Bold>OP</Bold> Orgullo y Prejuicio ·{" "}
              <Bold>CB</Bold> Cumbres Borrascosas. Frecuencias de términos (TF):
            </P>
            <Table
              headers={["término", "SS", "OP", "CB"]}
              rows={[
                ["afecto",    "115", "58", "20"],
                ["celoso",    "10", "7", "11"],
                ["chisme",    "2", "0", "6"],
                ["borrascoso","0", "0", "38"],
              ]}
            />
            <P>Tras log-frequency weighting y normalización de longitud, las similitudes son:</P>
            <MathBlock>{String.raw`\begin{aligned}
              \cos(\text{SS}, \text{OP}) &\approx 0.94 \\
              \cos(\text{SS}, \text{CB}) &\approx 0.79 \\
              \cos(\text{OP}, \text{CB}) &\approx 0.69
            \end{aligned}`}</MathBlock>
            <P>
              SS y OP (ambas de Jane Austen) son las más parecidas. CB (Emily Brontë) introduce
              <Code>borrascoso</Code>, que la aleja. El coseno captura la similitud semántica.
            </P>
          </Collapse>

          <Callout variant="note" title="Resumen del ranking por coseno">
            <Ol items={[
              <>Representar la consulta como vector de pesos TF-IDF.</>,
              <>Representar cada documento como vector de pesos TF-IDF.</>,
              <>Calcular la similitud coseno entre la consulta y cada documento.</>,
              <>Rankear los documentos por su score.</>,
              <>Retornar el Top-K al usuario.</>,
            ]} />
          </Callout>

          <Divider />

          {/* ══ 10. ÍNDICE INVERTIDO ══ */}
          <H2 id="sec-invertido">10. Índice Invertido</H2>
          <P>
            Calcular el coseno contra <Bold>todos</Bold> los documentos es inviable a escala. Y la matriz
            término–documento es enorme y casi vacía.
          </P>
          <Callout variant="warning" title="La matriz vectorial es prohibitivamente dispersa">
            Colección de 1M documentos, ~1000 palabras c/u, 500,000 términos únicos:
            <Ul items={[
              <>Almacenar el texto: 1M × 1000 × 6 bytes ≈ <Bold>6 GB</Bold> ✓</>,
              <>Matriz de incidencia término–documento: 500,000 × 1,000,000 = 0.5 × 10¹² bits ✗</>,
              <>De las 500 mil millones de entradas, a lo sumo mil millones son no-cero →{" "}
                <Bold>al menos el 99.8% son ceros</Bold>.</>,
            ]} />
            Solución: una <Bold>representación dispersa</Bold> que guarde solo las entradas no-cero → el
            <Bold> índice invertido</Bold>.
          </Callout>

          <H3>Estructura: diccionario + posting lists</H3>
          <P>
            Para cada término <Code>t</Code> guardamos una lista de todos los documentos que lo contienen
            (cada documento identificado por un <Code>docID</Code>). Dos componentes:
          </P>
          <Ul items={[
            <><Bold>Diccionario (Dictionary):</Bold> los términos, en memoria. Para cada uno: su{" "}
              <Code>df</Code> y un puntero a su posting list.</>,
            <><Bold>Listas de publicaciones (Postings):</Bold> de tamaño variable, <Bold>ordenadas por
              docID</Bold> (crucial — veremos por qué). En disco: lectura continua; en memoria: listas
              enlazadas o vectores dinámicos.</>,
          ]} />
          <DiagramPlaceholder label="Diagrama: Diccionario (términos) → Posting Lists ordenadas por docID" height={190} />

          <Collapse title="Ejemplo: índice invertido con stop list">
            <P>
              <Bold>Doc 1:</Bold> "The bright blue butterfly hangs on the breeze" ·{" "}
              <Bold>Doc 2:</Bold> "It's best to forget the great sky" ·{" "}
              <Bold>Doc 3:</Bold> "Under blue sky, one need not search around".
            </P>
            <Table
              headers={["Término", "Posting List (docIDs)"]}
              rows={[
                ["best", "2"],
                ["blue", "1, 3"],
                ["bright", "1"],
                ["butterfly", "1"],
                ["sky", "2, 3"],
                ["search", "3"],
              ]}
            />
            <P>
              Tras quitar stop words (<Code>a, and, the, to, on, not…</Code>) cada término apunta a los
              documentos donde aparece.
            </P>
          </Collapse>

          <Divider />

          {/* ══ 11. CONSULTAS SOBRE EL ÍNDICE ══ */}
          <H2 id="sec-consultas">11. Consultas sobre el índice</H2>

          <H3>Consulta AND: merge de posting lists</H3>
          <P>
            Para <Code>Brutus AND Caesar</Code>: localizar ambos términos en el diccionario, recuperar
            sus postings y <Bold>mezclar (merge)</Bold> = intersección de conjuntos de documentos.
          </P>
          <Callout variant="note" title="Por eso las postings van ordenadas por docID">
            Si las listas tienen longitudes <Code>n</Code> y <Code>m</Code>, la mezcla toma{" "}
            <Bold>O(n + m)</Bold> operaciones: se recorren ambas simultáneamente con dos punteros,
            avanzando el que apunta al docID menor. <Bold>Esto solo funciona si están ordenadas.</Bold>
          </Callout>
          <Collapse title="Pseudocódigo: INTERSECT (consulta AND)" defaultOpen>
            <Pseudo>{`INTERSECT(p₁, p₂)
 1  answer = ⟨⟩
 2  while p₁ ≠ NIL and p₂ ≠ NIL
 3      if p₁.docID == p₂.docID
 4          ADD(answer, p₁.docID)
 5          p₁ = p₁.next
 6          p₂ = p₂.next
 7      elseif p₁.docID < p₂.docID
 8          p₁ = p₁.next
 9      else p₂ = p₂.next
10  return answer`}</Pseudo>
            <P>
              <Code>OR</Code> (unión): mismo recorrido pero se agregan <Bold>todos</Bold> los docID.{" "}
              <Code>AND NOT</Code>: se agregan los de <Code>p₁</Code> que <Bold>no</Bold> están en{" "}
              <Code>p₂</Code> — también en O(n+m).
            </P>
          </Collapse>

          <H3>Ranking sobre el índice: CosineScore</H3>
          <P>
            El índice invertido también acelera el ranking por coseno: solo recorremos los documentos que
            contienen algún término de la consulta, acumulando scores parciales.
          </P>
          <Collapse title="Pseudocódigo: CosineScore(q)">
            <Pseudo>{`COSINE-SCORE(q)
 1  let Scores[1..N] and Length[1..N] be new arrays
 2  for d = 1 to N
 3      Scores[d] = 0
 4  for each query term t
 5      calcular w(t,q) y obtener la posting list de t
 6      for each (d, tf(t,d)) en la posting list de t
 7          Scores[d] = Scores[d] + w(t,d) · w(t,q)
 8  leer el arreglo Length
 9  for d = 1 to N
10      Scores[d] = Scores[d] / Length[d]    // normalización por longitud
11  return los K mayores componentes de Scores`}</Pseudo>
          </Collapse>

          <Callout variant="lab" title="Laboratorios 8.1 y 8.2">
            En el laboratorio implementarás Bag of Words + matriz de incidencia (8.1) y el índice
            invertido con cálculo de similitud coseno (8.2) sobre una colección real de documentos.
          </Callout>

          <Divider />

          {/* ══ 12. POSTGRESQL ══ */}
          <H2 id="sec-postgres">12. Full-Text Search en PostgreSQL</H2>
          <P>
            PostgreSQL implementa todo lo anterior de forma nativa. Convierte texto a un{" "}
            <Code>tsvector</Code> (documento procesado: tokens normalizados + posiciones) y las consultas
            a un <Code>tsquery</Code>; el operador <Code>@@</Code> verifica la coincidencia.
          </P>
          <SqlCode label="LIKE vs Full-Text Search" sql={`-- Búsqueda ingenua con LIKE: sin stemming, sin ranking, sin índice útil
SELECT * FROM frases WHERE content LIKE '%pasear%';

-- Full-Text Search: stemming en español, coincide 'pasear', 'paseando', 'paseo'…
SELECT * FROM frases
WHERE to_tsvector('spanish', content) @@ to_tsquery('spanish', 'pasear');`} />

          <H3>tsvector y tsquery</H3>
          <Ul items={[
            <><Code>to_tsvector('spanish', content)</Code> → lexemas normalizados con stemming y sin
              stop words: <Code>'buen':2 'dia':3 'mot':7 'pas':5</Code>.</>,
            <><Code>to_tsquery('spanish', 'pasear &amp; moto')</Code> → consulta booleana de lexemas
              (<Code>&amp;</Code> = AND, <Code>|</Code> = OR, <Code>!</Code> = NOT).</>,
            <><Code>plainto_tsquery</Code> / <Code>websearch_to_tsquery</Code> → convierten texto libre del
              usuario a un tsquery automáticamente.</>,
          ]} />

          <H3>Índice GIN: el índice invertido de PostgreSQL</H3>
          <P>
            <Code>GIN</Code> (Generalized Inverted Index) es, literalmente, el índice invertido que vimos:
            mapea cada lexema a la lista de filas que lo contienen. Es lo que hace que la búsqueda escale.
          </P>
          <SqlCode label="Indexar para Full-Text Search con GIN" sql={`-- Columna generada + índice GIN (recomendado en producción)
ALTER TABLE articles ADD COLUMN full_text tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', title || ' ' || content)) STORED;

CREATE INDEX full_text_gin ON articles USING GIN (full_text);

-- Consulta indexada + ranking por relevancia
SELECT title, ts_rank(full_text, query) AS rank
FROM articles, to_tsquery('spanish', 'inteligencia & artificial') query
WHERE full_text @@ query
ORDER BY rank DESC
LIMIT 10;`} />

          <Callout variant="note" title="GIN vs GiST (vista previa de la Semana 9)">
            <Bold>GIN</Bold> es más rápido en búsqueda (ideal para motores de búsqueda y grandes
            volúmenes), pero su construcción/actualización es más costosa. <Bold>GiST</Bold> es mejor
            para datos con muchas escrituras. La Semana 9 profundiza en cómo se construye el índice de
            forma escalable (BSBI, SPIMI) y compara motores (PostgreSQL, MongoDB, Solr, Elasticsearch).
          </Callout>

          <Callout variant="example">
            Practica estas consultas en el <Bold>SQL Playground</Bold> de esta herramienta: crea una tabla
            con texto, genera el <Code>tsvector</Code>, crea el índice <Code>GIN</Code> y compara los planes
            con <Code>EXPLAIN ANALYZE</Code> contra una búsqueda con <Code>LIKE</Code>.
          </Callout>

        </div>
      </div>

      {/* ── Right TOC ── */}
      <Toc active={activeSection} />

    </div>
  );
}
