"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Callout, Table, MathBlock,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "ex-conceptos",  label: "1. Conceptos clave" },
  { id: "ex-distancias", label: "2. Fórmulas de distancia" },
  { id: "ex-metrica",    label: "3. Propiedades de una métrica" },
  { id: "ex-consultas",  label: "4. Tipos de consulta" },
  { id: "ex-efectividad",label: "5. Precision & Recall" },
  { id: "ex-tablas",     label: "6. Tablas comparativas" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Local helpers — exam formula card + definition list
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

function DefList({ items }: { items: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div style={{ margin: "10px 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(([term, def], i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
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
   S10 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S10Exam() {
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
              Semana 10 · Hoja de repaso
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Esencial para el examen
            </h1>
            <P>
              Búsqueda por similitud en espacios vectoriales y métricos, condensado: definiciones, cada
              fórmula con sus variables explicadas, propiedades de una métrica, tipos de consulta y métricas
              de evaluación. Para la explicación completa, ve a la guía{" "}
              <Bold>Multimedia · Embeddings · kNN/ANN</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Lo más preguntado">
            (1) Las <Bold>medidas de distancia</Bold> y cuándo usar coseno vs euclidiana, (2) las{" "}
            <Bold>4 propiedades de una métrica</Bold>, (3) <Bold>range query vs k-NN</Bold>, (4){" "}
            <Bold>precision vs recall</Bold>, (5) <Bold>feature vector vs embedding</Bold>.
          </Callout>

          <Divider />

          {/* ══ 1. CONCEPTOS ══ */}
          <H2 id="ex-conceptos">1. Conceptos clave</H2>
          <DefList items={[
            ["Feature vector", <>Abstracción <Bold>compacta del contenido</Bold> de un objeto (color, textura…), diseñada a mano. Alta dimensión, dispersa.</>],
            ["Embedding", <>Vector <Bold>denso</Bold> aprendido por un modelo (ML/DL) que captura <Bold>semántica</Bold>. Baja dimensión, generaliza mejor.</>],
            ["Búsqueda por similitud", <>Objetos similares → puntos cercanos. Buscar = encontrar los vecinos más cercanos a un vector de consulta.</>],
            ["δ (delta)", <>Función de <Bold>disimilitud</Bold>: a mayor δ, más distintos. δ(x,x) = 0.</>],
            ["Espacio métrico", <>Objetos comparados solo con δ (sirve para strings, grafos…). El espacio vectorial es un caso particular (ℝᵈ).</>],
            ["kNN / ANN", <><Bold>k-Nearest Neighbors</Bold> (exacto) vs <Bold>Approximate NN</Bold> (aproximado, más rápido a gran escala).</>],
            ["SAM / MAM", <><Bold>Spatial / Metric Access Methods</Bold>: índices para acelerar la búsqueda en espacios vectoriales / métricos.</>],
          ]} />

          <Divider />

          {/* ══ 2. DISTANCIAS ══ */}
          <H2 id="ex-distancias">2. Fórmulas de distancia</H2>

          <FormulaCard
            title="① Minkowski (Lp)"
            formula={<MathBlock>{String.raw`\begin{aligned} \text{Manhattan } (p{=}1) &: \sum_i |x_i - y_i| \\ \text{Euclidiana } (p{=}2) &: \sqrt{\sum_i |x_i - y_i|^{2}} \\ \text{Máximo } (p{=}\infty) &: \max_i |x_i - y_i| \end{aligned}`}</MathBlock>}
            legend={[
              [<>x, y</>, <>los dos vectores a comparar</>],
              [<>xᵢ, yᵢ</>, <>componente <Code>i</Code> de cada vector</>],
              [<>p</>, <>parámetro de la norma (1, 2 o ∞)</>],
            ]}
            note={<>Complejidad O(D), con D = dimensión. Mide disimilitud (mayor = más distintos).</>}
          />

          <FormulaCard
            title="② Similitud Coseno"
            formula={<MathBlock>{String.raw`\cos(\theta) = \frac{a\cdot b}{\lVert a\rVert\,\lVert b\rVert}`}</MathBlock>}
            legend={[
              [<>a · b</>, <>producto punto = Σᵢ aᵢ·bᵢ</>],
              [<>|a|, |b|</>, <>normas (longitudes) de los vectores</>],
              [<>θ</>, <>ángulo entre a y b</>],
            ]}
            note={<>Mide DIRECCIÓN, no magnitud. Ideal para embeddings, texto, imágenes, audio.</>}
          />

          <FormulaCard
            title="③ Producto punto (Dot product)"
            formula={<MathBlock>{String.raw`\mathrm{dot}(a, b) = \sum_i a_i \cdot b_i`}</MathBlock>}
            legend={[
              [<>aᵢ, bᵢ</>, <>componentes i de cada vector</>],
            ]}
            note={<>Numerador del coseno. Si los vectores están normalizados, dot = coseno.</>}
          />

          <FormulaCard
            title="④ Forma cuadrática"
            formula={<MathBlock>{String.raw`d(x,y) = \sqrt{(x - y)^{\mathsf{T}}\, A\, (x - y)}`}</MathBlock>}
            legend={[
              [<>A</>, <>matriz de similitud: captura interrelación entre dimensiones</>],
              [<>A = I</>, <>identidad → recupera la distancia Euclidiana</>],
              [<>Mahalanobis</>, <>A = inversa de la matriz de covarianza</>],
            ]}
            note={<>Complejidad O(D²) por la matriz A. SQFD permite comparar vectores de distinta dimensión.</>}
          />

          <FormulaCard
            title="⑤ Distancia ↔ Similitud"
            formula={<MathBlock>{String.raw`d = 1 - s \qquad s = \frac{1}{d+1} \qquad s = e^{-d}`}</MathBlock>}
            legend={[
              [<>d</>, <>distancia (disimilitud)</>],
              [<>s</>, <>similitud</>],
            ]}
            note={<>Cualquier función monótona decreciente sirve para convertir entre ambas.</>}
          />

          <Callout variant="warning" title="Euclidiana vs Coseno (no confundir)">
            <Bold>Euclidiana</Bold> = magnitud / escala / diferencias absolutas → kNN, clustering, coordenadas
            físicas. <Bold>Coseno</Bold> = dirección / patrón, ignora magnitud → embeddings, NLP, imágenes, audio.
          </Callout>

          <Divider />

          {/* ══ 3. MÉTRICA ══ */}
          <H2 id="ex-metrica">3. Propiedades de una métrica</H2>
          <P>Una función δ es una <Bold>métrica</Bold> si cumple las 4:</P>
          <Table
            headers={["Propiedad", "Condición", "Significado"]}
            rows={[
              ["No-negatividad", "d(x,y) ≥ 0", "Nunca negativa"],
              ["Reflexividad", "d(x,y) = 0 ⟺ x = y", "0 solo consigo mismo"],
              ["Simetría", "d(x,y) = d(y,x)", "El orden no importa"],
              ["Desigualdad triangular", "d(x,z) ≤ d(x,y) + d(y,z)", "El atajo nunca es más largo: habilita los índices métricos"],
            ]}
          />
          <Callout variant="note">
            La <Bold>desigualdad triangular</Bold> es la propiedad clave: permite a los índices métricos (MAM)
            <Bold> podar</Bold> ramas sin calcular todas las distancias.
          </Callout>

          <Divider />

          {/* ══ 4. CONSULTAS ══ */}
          <H2 id="ex-consultas">4. Tipos de consulta</H2>
          <FormulaCard
            title="Range query (por rango)"
            formula={<MathBlock>{String.raw`(q, r) = \{\, u \in U : \delta(u, q) \le r \,\}`}</MathBlock>}
            legend={[
              [<>q</>, <>objeto de consulta</>],
              [<>r</>, <>radio de tolerancia</>],
              [<>U</>, <>conjunto de datos</>],
            ]}
            note={<>Todos los objetos dentro de la bola de radio r. Problema: radio pequeño → nada; grande → demasiado.</>}
          />
          <FormulaCard
            title="k-NN (k vecinos más cercanos)"
            formula={<MathBlock>{String.raw`\begin{aligned} & k\text{-NN}(q) = C, \quad |C| = k \\[2pt] & \forall\, x \in C,\; y \in U - C : \delta(x,q) \le \delta(y,q) \end{aligned}`}</MathBlock>}
            legend={[
              [<>k</>, <>número de vecinos a devolver</>],
              [<>C</>, <>conjunto resultado (los k más cercanos)</>],
            ]}
            note={<>Siempre devuelve k resultados: no hay que adivinar un radio.</>}
          />
          <Callout variant="note" title="Ranking incremental (give-me-more)">
            Cuando no se conoce ni un radio ni un k razonable: <Code>getnext(k)</Code> devuelve los siguientes
            objetos más cercanos de a poco, hasta que el usuario se da por satisfecho.
          </Callout>

          <Divider />

          {/* ══ 5. EFECTIVIDAD ══ */}
          <H2 id="ex-efectividad">5. Precision &amp; Recall</H2>
          <Table
            headers={["", "Relevante", "No relevante"]}
            rows={[
              ["Recuperado", "TP", "FP"],
              ["No recuperado", "FN", "TN"],
            ]}
          />
          <FormulaCard
            title="Precision y Recall"
            formula={<MathBlock>{String.raw`\begin{aligned} \text{Precision} &= \frac{TP}{TP + FP} \\[2pt] \text{Recall} &= \frac{TP}{TP + FN} \end{aligned}`}</MathBlock>}
            legend={[
              [<>TP</>, <>relevantes recuperados (acierto)</>],
              [<>FP</>, <>recuperados pero NO relevantes (ruido)</>],
              [<>FN</>, <>relevantes NO recuperados (se escaparon)</>],
            ]}
            note={<>Precision = de lo recuperado, ¿cuánto sirve? Recall = de lo relevante, ¿cuánto encontré? Suelen estar en tensión.</>}
          />

          <Divider />

          {/* ══ 6. TABLAS ══ */}
          <H2 id="ex-tablas">6. Tablas comparativas</H2>

          <H3>Feature vector vs Embedding</H3>
          <Table
            headers={["", "Feature vector", "Embedding"]}
            rows={[
              ["Origen", "Diseñado a mano", "Aprendido por un modelo"],
              ["Dimensión", "Alta", "Baja"],
              ["Densidad", "Disperso (muchos ceros)", "Denso"],
              ["Captura", "Info superficial", "Significado / contexto"],
              ["Generalización", "Mala", "Buena"],
            ]}
          />

          <H3>Range query vs k-NN</H3>
          <Table
            headers={["", "Range query", "k-NN"]}
            rows={[
              ["Parámetro", "radio r", "número k"],
              ["Resultado", "Entre 0 y toda la colección", "Siempre k objetos"],
              ["Riesgo", "Radio mal elegido → nada o demasiado", "Hay que elegir un k razonable"],
            ]}
          />

          <H3>Espacio métrico vs vectorial</H3>
          <Table
            headers={["", "Métrico", "Vectorial"]}
            rows={[
              ["Objetos", "Cualquiera con δ (strings, grafos…)", "Vectores en ℝᵈ"],
              ["Necesita coordenadas", "No", "Sí"],
              ["Índices", "MAM (metric access methods)", "SAM (spatial access methods)"],
            ]}
          />

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
