"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, MathBlock,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "ex-conceptos",   label: "1. Conceptos clave" },
  { id: "ex-complejidad", label: "2. Complejidad de búsqueda" },
  { id: "ex-filtrar",     label: "3. Filtrar-y-refinar" },
  { id: "ex-dtw",         label: "4. DTW y LB_Keogh" },
  { id: "ex-indices",     label: "5. Índices y dimensionalidad" },
  { id: "ex-descriptores",label: "6. Descriptores locales" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Local helpers
   ───────────────────────────────────────────────────────────────────────────── */
function FormulaCard({
  title, formula, legend, note,
}: {
  title: string;
  formula: React.ReactNode;
  legend: [React.ReactNode, React.ReactNode][];
  note?: React.ReactNode;
}) {
  return (
    <div style={{ margin: "14px 0", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--bg-surface)" }}>
      <div style={{ padding: "8px 14px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-ui)" }}>
        {title}
      </div>
      <div style={{ padding: "8px 18px", borderBottom: "1px solid var(--border)", color: "#a78bfa" }}>
        {formula}
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
        {legend.map(([sym, mean], i) => (
          <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-code)", color: "#a5d6ff", minWidth: 70, flexShrink: 0, fontWeight: 600 }}>{sym}</span>
            <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{mean}</span>
          </div>
        ))}
      </div>
      {note && (
        <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic" }}>
          {note}
        </div>
      )}
    </div>
  );
}

function DefList({ items }: { items: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div style={{ margin: "10px 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(([term, def], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 12, padding: "8px 12px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, alignItems: "baseline" }}>
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
    <aside style={{ width: 210, flexShrink: 0, borderLeft: "1px solid var(--border)", padding: "36px 0 36px 16px", overflowY: "auto" }}>
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
   S11 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S11Exam() {
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
              Semana 11 · Hoja de repaso
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Esencial para el examen
            </h1>
            <P>
              Búsqueda eficiente por similitud y descriptores locales, condensado: complejidad, filtrar-y-refinar,
              la garantía de la cota inferior, DTW/LB_Keogh, índices multidimensionales y SIFT. Para la
              explicación completa, ve a la guía <Bold>Búsqueda Eficiente · Descriptores Locales</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Lo más preguntado">
            (1) por qué la <Bold>cota inferior</Bold> garantiza no perder resultados, (2) cómo funciona{" "}
            <Bold>filtrar-y-refinar</Bold> y la <Bold>selectividad</Bold>, (3) <Bold>DTW</Bold> y por qué{" "}
            <Bold>LB_Keogh ≤ DTW</Bold>, (4) la <Bold>maldición de la dimensionalidad</Bold>, (5){" "}
            descriptores <Bold>locales vs globales</Bold> y SIFT.
          </Callout>

          <Divider />

          {/* ══ 1. CONCEPTOS ══ */}
          <H2 id="ex-conceptos">1. Conceptos clave</H2>
          <DefList items={[
            ["Búsqueda secuencial", <>Recorrer toda la colección calculando la distancia a cada objeto. Exacta pero <Bold>no escala</Bold>.</>],
            ["Filtrar-y-refinar", <>Arquitectura multi-step: un <Bold>filtro barato</Bold> da candidatos; solo a ellos se les calcula la <Bold>distancia verdadera</Bold> (refinamiento).</>],
            ["Candidato", <>Objeto que devuelve el índice/filtro; <Bold>no</Bold> es la respuesta final hasta refinarlo.</>],
            ["Cota inferior (lower bound)", <>Distancia barata que <Bold>nunca sobreestima</Bold> la verdadera. Si la usa el filtro → sin falsos negativos.</>],
            ["DTW", <><Bold>Dynamic Time Warping</Bold>: distancia que <Bold>alinea</Bold> dos series de tiempo desfasadas. Exacta pero lenta (O(N·D²)).</>],
            ["LB_Keogh", <>Cota inferior <Bold>rápida</Bold> de DTW basada en una envolvente U/L de la consulta.</>],
            ["Maldición de la dimensionalidad", <>En alta dimensión las distancias se <Bold>concentran</Bold> y los índices degeneran a búsqueda secuencial.</>],
            ["Descriptor local", <>Conjunto de vectores por objeto (SIFT, ORB, FREAK), robusto a oclusión, vs descriptor <Bold>global</Bold> (1 vector: GIST, HOG).</>],
          ]} />

          <Divider />

          {/* ══ 2. COMPLEJIDAD ══ */}
          <H2 id="ex-complejidad">2. Complejidad de la búsqueda</H2>
          <FormulaCard
            title="Búsqueda secuencial"
            formula={<MathBlock>{String.raw`\text{rango: } O(N \cdot D^{p}) \qquad k\text{-NN: } O(N \cdot D^{p}) + O(N \log N)`}</MathBlock>}
            legend={[
              [<>N</>, <>nº de objetos en la colección (puede ser enorme)</>],
              [<>D</>, <>dimensión del espacio de características</>],
              [<>p</>, <>tipo de distancia (p ≥ 1; p = 2 ⇒ cuadrática)</>],
              [<>N log N</>, <>el k-NN además debe <Bold>ordenar</Bold> por distancia</>],
            ]}
            note={<>Para reducirla se usan índices y filtrar-y-refinar.</>}
          />
          <Table
            headers={["Operación", "Devuelve", "Coste"]}
            rows={[
              ["RANGE-SEARCH(Q, r)", "Todo lo que está a distancia < r", "O(N · Dᵖ)"],
              ["KNN-SEARCH(Q, k)", "Los k más cercanos (ordenados)", "O(N · Dᵖ) + O(N log N)"],
              ["DTW contra toda la BD", "Mejor match exacto", "O(N · D²)"],
            ]}
          />

          <Divider />

          {/* ══ 3. FILTRAR-Y-REFINAR ══ */}
          <H2 id="ex-filtrar">3. Filtrar-y-refinar</H2>
          <FormulaCard
            title="Selectividad del filtro"
            formula={<MathBlock>{String.raw`\sigma_F = \frac{\#\ \text{de candidatos}}{\#\ \text{de objetos en la BD}}`}</MathBlock>}
            legend={[
              [<>σ_F</>, <>fracción de la BD que pasa el filtro; <Bold>cuanto menor, mejor</Bold></>],
            ]}
            note={<>Pocos candidatos = menos distancias verdaderas (caras) que calcular.</>}
          />
          <FormulaCard
            title="Garantía de corrección (cota inferior)"
            formula={<MathBlock>{String.raw`d_{\text{filtro}}(Q,C) \;\le\; d_{\text{verdadera}}(Q,C)`}</MathBlock>
            }
            legend={[
              [<>≤</>, <>el filtro <Bold>nunca</Bold> sobreestima la distancia real</>],
            ]}
            note={<>Si se cumple → NO hay falsos negativos (no se pierde ningún relevante). Si NO se cumple → resultado incompleto.</>}
          />
          <Callout variant="note" title="Cascada">
            Filtro 1 (índice) → candidatos → Filtro 2 (cota inferior LB) → menos candidatos → Refinamiento
            (distancia verdadera Dist) → resultado.
          </Callout>

          <Divider />

          {/* ══ 4. DTW ══ */}
          <H2 id="ex-dtw">4. DTW y LB_Keogh</H2>
          <FormulaCard
            title="DTW: recurrencia (programación dinámica, ADA D:)"
            formula={<MathBlock>{String.raw`M(i,j) = d(q_i, c_j) + \min\bigl\{ M(i\!-\!1,j\!-\!1),\, M(i\!-\!1,j),\, M(i,j\!-\!1) \bigr\}`}</MathBlock>}
            legend={[
              [<>M(i,j)</>, <>costo acumulado mínimo de alinear hasta qᵢ y cⱼ</>],
              [<>d(qᵢ,cⱼ)</>, <>distancia local entre los puntos qᵢ y cⱼ</>],
            ]}
            note={<>El camino de alineación (warping path) de costo mínimo da el DTW. Permite desfases temporales.</>}
          />
          <FormulaCard
            title="LB_Keogh: cota inferior de DTW"
            formula={<MathBlock>{String.raw`LB\_Keogh(Q,C) = \sum_{i=1}^{n} \begin{cases} (c_i - U_i)^2 & c_i > U_i \\[2pt] (c_i - L_i)^2 & c_i < L_i \\[2pt] 0 & \text{otherwise} \end{cases}`}</MathBlock>}
            legend={[
              [<>U, L</>, <>envolvente superior / inferior alrededor de la consulta Q</>],
              [<>cᵢ</>, <>i-ésimo punto de la secuencia candidata C</>],
            ]}
            note={<>Se cumple LB_Keogh(Q,C) ≤ DTW(Q,C): por eso sirve de filtro exacto. Es mucho más rápida que el DTW.</>}
          />
          <Callout variant="warning" title="Idea del scan con cota inferior">
            Por cada candidato: calcular <Code>LB_Keogh</Code> (barato); solo si pasa el umbral{" "}
            <Code>best_so_far</Code>, calcular el <Code>DTW</Code> verdadero (caro). Así se poda la mayoría sin
            tocar el DTW.
          </Callout>

          <Divider />

          {/* ══ 5. ÍNDICES ══ */}
          <H2 id="ex-indices">5. Índices multidimensionales y dimensionalidad</H2>
          <Table
            headers={["Índice", "Idea", "Dimensión ideal"]}
            rows={[
              ["R*-Tree", "R-Tree optimizado; minimiza solapamiento de MBRs", "Baja"],
              ["KD-Tree", "Árbol binario; particiona dimensión por dimensión", "Baja a moderada"],
              ["Ball-Tree", "Hiperesferas anidadas (ball nodes)", "Alta (mejor que KD-Tree)"],
            ]}
          />
          <Ul items={[
            <><Bold>Propiedad clave:</Bold> la región de un nodo hijo está <Bold>contenida</Bold> en la de su padre; dinámicos en O(log n).</>,
          ]} />
          <Callout variant="warning" title="Maldición de la dimensionalidad">
            A más dimensiones, las distancias <Bold>se concentran</Bold> en un rango estrecho → el vecino más
            cercano y el más lejano <Bold>convergen</Bold>, el índice visita casi todas las páginas y degenera a
            búsqueda secuencial. Motiva los <Bold>descriptores de baja dimensión</Bold> y la <Bold>búsqueda
            aproximada (ANN)</Bold>.
          </Callout>

          <Divider />

          {/* ══ 6. DESCRIPTORES ══ */}
          <H2 id="ex-descriptores">6. Descriptores locales</H2>
          <Table
            headers={["", "Global", "Local"]}
            rows={[
              ["Vectores por objeto", "Uno", "Muchos (nº variable)"],
              ["Ejemplos", "GIST, HOG, VGG-GAP", "SIFT, ORB, FREAK"],
              ["Robustez a oclusión", "Baja", "Alta"],
              ["Comparación", "Directa (1 vs 1)", "Conjunto vs conjunto (no trivial)"],
            ]}
          />
          <H3>SIFT</H3>
          <Ul items={[
            <>Invariante a <Bold>escala y rotación</Bold>; cada descriptor es de <Bold>128 dimensiones</Bold>.</>,
            <>Número de descriptores <Bold>variable por imagen</Bold>.</>,
          ]} />
          <H3>Estrategias de similitud</H3>
          <Table
            headers={["", "Agregada", "Directa"]}
            rows={[
              ["Idea", "Resume el conjunto en 1 vector", "Indexa cada descriptor y combina parciales"],
              ["Técnicas", "Cuantización k-means, árboles (HKM), índice invertido", "Índice multidimensional, ANN, búsqueda lineal (DTW/ED)"],
            ]}
          />
          <Callout variant="note" title="Indexar descriptores locales (un solo índice)">
            Insertar cada descriptor <Code>Pⱼ</Code> como <Code>(Objᵢ, Pⱼ)</Code> en un índice; aplicar{" "}
            <Bold>k-NN a cada descriptor de la consulta</Bold> y <Bold>combinar los resultados parciales</Bold>{" "}
            (votación). El resultado es <Bold>aproximado</Bold> (no idéntico a la búsqueda lineal), pero escala.
          </Callout>

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
