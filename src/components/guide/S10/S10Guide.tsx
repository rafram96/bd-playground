"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, CompareCards,
  Pipeline, DiagramPlaceholder, SqlCode, MathBlock,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-mmdb",      label: "1. Bases de datos multimedia" },
  { id: "sec-contenido", label: "2. Recuperación por contenido" },
  { id: "sec-esquema",   label: "3. Búsqueda por similitud" },
  { id: "sec-distancia", label: "4. Medidas de distancia" },
  { id: "sec-metrica",   label: "5. Métrica y formas cuadráticas" },
  { id: "sec-espacios",  label: "6. Espacios métricos vs vectoriales" },
  { id: "sec-consultas", label: "7. Tipos de consulta" },
  { id: "sec-eficiencia",label: "8. Eficiencia y efectividad" },
  { id: "sec-imagenes",  label: "9. Búsqueda de imágenes" },
  { id: "sec-medios",    label: "10. Rostros, video y audio" },
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
   S10 Guide — Bases de Datos Vectoriales y Recuperación Multimedia
   ───────────────────────────────────────────────────────────────────────────── */
export default function S10Guide() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-mmdb");

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
              Semana 10 · Módulo II — Motores Especializados
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Bases de Datos Vectoriales y Recuperación Multimedia
            </h1>
            <P>
              La Semana 8 buscaba <Bold>palabras exactas</Bold>. Ahora generalizamos a{" "}
              <Bold>búsqueda por similitud</Bold>: ¿cómo encontrar imágenes, audio o texto{" "}
              <Bold>semánticamente parecidos</Bold>? La clave es representar cada objeto como un{" "}
              <Bold>vector</Bold> (feature vector o embedding) y buscar los vecinos más cercanos en un
              espacio de alta dimensión. Es la base de la búsqueda por imagen, el reconocimiento facial,
              los sistemas de recomendación y el RAG de los LLMs.
            </P>
          </div>

          <Callout variant="note" title="La gran idea">
            <Bold>Objetos similares → puntos cercanos en el espacio.</Bold> Si convertimos cada imagen/canción/
            documento en un vector tal que la <Bold>distancia geométrica refleje la similitud semántica</Bold>,
            entonces "buscar lo parecido" se reduce a "encontrar los puntos más cercanos".
          </Callout>

          <Divider />

          {/* ══ 1. MMDB ══ */}
          <H2 id="sec-mmdb">1. Bases de datos multimedia (MMDB)</H2>
          <Callout variant="definition" title="MMDB">
            Una <Bold>base de datos multimedia</Bold> es una colección de datos multimedia relacionados:
            texto, imágenes, objetos gráficos, animación, <Bold>audio y video</Bold>. Su SGBD debe permitir
            crear, almacenar, acceder, consultar y controlar esos tipos de datos.
          </Callout>

          <H3>Retos y desafíos</H3>
          <Ul items={[
            <><Bold>Variedad de formatos</Bold> (JPEG, MPEG, WAV, GIF…) con conversión limitada entre ellos.</>,
            <><Bold>Gran almacenamiento</Bold> y mucho consumo de procesamiento y ancho de banda.</>,
            <><Bold>Requisitos temporales</Bold> (video, audio, animación) → afectan almacenamiento y presentación.</>,
            <><Bold>Limitaciones espaciales</Bold> en imágenes/video/gráficos en términos de su contenido.</>,
          ]} />

          <H3>Dos arquitecturas posibles</H3>
          <CompareCards
            items={[
              {
                label: "Principio de Autonomía",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: [
                  "Cada medio se indexa con una estructura óptima para él (Image/Video/Document Index)",
                  "Procesamiento de consultas rápido (estructuras especializadas)",
                ],
                cons: [
                  "Hay que computar uniones entre estructuras distintas",
                ],
              },
              {
                label: "Principio de Uniformidad",
                color: "#f59e0b",
                bg: "#1c1207",
                pros: [
                  "Una única estructura abstracta (Unified Index) para todos los medios",
                  "Implementación más simple",
                ],
                cons: [
                  "Resumir la parte común (metadatos) de medios distintos es muy difícil",
                ],
              },
            ]}
          />

          <Divider />

          {/* ══ 2. CONTENIDO ══ */}
          <H2 id="sec-contenido">2. Recuperación basada en contenido</H2>
          <P>
            "Basado en contenido" significa que la búsqueda analiza el <Bold>contenido real</Bold> del objeto
            (colores, formas, texturas en una imagen) <Bold>en lugar de los metadatos</Bold> (etiquetas,
            descripciones manuales). Evita el costo y la subjetividad de anotar todo a mano.
          </P>
          <Callout variant="definition" title="Vector de características (feature vector / signature)">
            El sistema procesa el objeto y crea una <Bold>abstracción compacta de su contenido</Bold> en forma
            de vector. Toda consulta trabaja con esa abstracción, <Bold>no con el objeto en sí</Bold>.
          </Callout>

          <H3>Feature vectors vs Embeddings</H3>
          <P>
            Hay dos formas de obtener ese vector: diseñarlo a mano (feature engineering) o aprenderlo con un
            modelo (embedding).
          </P>
          <CompareCards
            items={[
              {
                label: "Vector característico",
                color: "#8b5cf6",
                bg: "#160d28",
                pros: [
                  "Diseñado manualmente (color, bordes, textura, MFCC, BoW…)",
                  "Interpretable por el experto",
                ],
                cons: [
                  "Alta dimensionalidad y muy disperso",
                  "Depende de conocimiento experto",
                  "Captura info superficial; generaliza mal a nuevos dominios",
                ],
              },
              {
                label: "Embedding",
                color: "#10b981",
                bg: "#051a0f",
                pros: [
                  "Aprendido automáticamente por ML / Deep Learning",
                  "Baja dimensionalidad y denso",
                  "Captura significado y contexto; generaliza mejor",
                ],
                cons: [
                  "Requiere entrenar un modelo",
                  "Menos interpretable (caja negra)",
                ],
              },
            ]}
          />
          <Callout variant="note">
            Un <Bold>embedding</Bold> es una representación vectorial <Bold>densa</Bold> que captura la
            semántica de los datos en un espacio de alta dimensión, donde la <Bold>similitud geométrica
            refleja la similitud semántica</Bold>. Es lo que usan los LLMs, los buscadores de imágenes y los
            sistemas de recomendación modernos.
          </Callout>

          <Divider />

          {/* ══ 3. ESQUEMA ══ */}
          <H2 id="sec-esquema">3. Búsqueda por similitud (esquema)</H2>
          <Pipeline steps={[
            { label: "Extraer", sub: "objeto → feature vector", color: "#3b82f6" },
            { label: "Indexar", sub: "vectores → base de datos", color: "#8b5cf6" },
            { label: "Consultar", sub: "query → vector", color: "#f59e0b" },
            { label: "Buscar vecinos", sub: "kNN / ANN", color: "#10b981" },
          ]} />
          <P>
            <Bold>Indexing:</Bold> cada objeto se convierte en su feature vector y se guarda en la base.{" "}
            <Bold>Search:</Bold> el objeto de consulta se vectoriza y se buscan los vectores más cercanos con
            <Code>kNN</Code> (exacto) o <Code>ANN</Code> (aproximado, más rápido a gran escala).
          </P>
          <Callout variant="definition" title="Modelo de búsqueda = descriptor + función de similitud">
            <Ul items={[
              <><Bold>Descriptor (vector):</Bold> extracción de características; su estructura está oculta al usuario.</>,
              <><Bold>Función de similitud:</Bold> compara descriptores y debe <Bold>"imitar" la similitud
                semántica</Bold> de los objetos. Ej.: fs(manzana1, manzana2) &gt; fs(manzana1, pera).</>,
            ]} />
          </Callout>
          <DiagramPlaceholder label="Diagrama: Indexing (feature vectors → DB) + Search (query → ANN/kNN → similar results)" height={180} />

          <Divider />

          {/* ══ 4. DISTANCIA ══ */}
          <H2 id="sec-distancia">4. Medidas de distancia</H2>
          <P>
            Una <Bold>función de distancia</Bold> mide la <Bold>disimilitud</Bold> entre objetos: a mayor
            distancia, más distintos. Un objeto tiene distancia 0 a sí mismo. La similitud es su complemento.
          </P>

          <H3>Familia de Minkowski (Lp)</H3>
          <MathBlock>{String.raw`\begin{aligned}
            \text{Manhattan } (p{=}1) &: \; d(x,y) = \sum_i |x_i - y_i| \\
            \text{Euclidiana } (p{=}2) &: \; d(x,y) = \sqrt{\sum_i |x_i - y_i|^{2}} \\
            \text{Máximo } (p{=}\infty) &: \; d(x,y) = \max_i |x_i - y_i|
          \end{aligned}`}</MathBlock>

          <H3>Similitud coseno y producto punto</H3>
          <MathBlock>{String.raw`\begin{aligned} \cos(\theta) &= \frac{a\cdot b}{\lVert a\rVert\,\lVert b\rVert} \\[2pt] \mathrm{dot}(a,b) &= \sum_i a_i \cdot b_i \end{aligned}`}</MathBlock>

          <H3>¿Euclidiana o coseno?</H3>
          <CompareCards
            items={[
              {
                label: "Distancia Euclidiana",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: ["Considera magnitud, escala y diferencias absolutas"],
                cons: ["Penaliza vectores de distinta longitud"],
                when: "kNN, clustering, coordenadas físicas, datos métricos",
              },
              {
                label: "Similitud Coseno",
                color: "#10b981",
                bg: "#051a0f",
                pros: ["Considera dirección / patrón, no la magnitud"],
                cons: ["Ignora diferencias de escala"],
                when: "Embeddings, NLP/texto, imágenes, audio",
              },
            ]}
          />

          <H3>Convertir distancia ↔ similitud</H3>
          <P>Cualquier función monótona decreciente sirve. Ejemplos:</P>
          <MathBlock>{String.raw`\begin{aligned}
            & d = 1 - s \qquad s = \frac{1}{d+1} \\[2pt]
            & s = 1 - \frac{d - \min_d}{\max_d - \min_d} \qquad s = e^{-d}
          \end{aligned}`}</MathBlock>

          <Divider />

          {/* ══ 5. MÉTRICA ══ */}
          <H2 id="sec-metrica">5. Métrica y formas cuadráticas</H2>
          <P>Una función de distancia es una <Bold>métrica</Bold> si cumple cuatro propiedades:</P>
          <Table
            headers={["Propiedad", "Condición", "Significado"]}
            rows={[
              ["No-negatividad", "d(x,y) ≥ 0", "La distancia nunca es negativa"],
              ["Reflexividad", "d(x,y) = 0 ⟺ x = y", "Distancia 0 solo consigo mismo"],
              ["Simetría", "d(x,y) = d(y,x)", "El orden no importa"],
              ["Desigualdad triangular", "d(x,z) ≤ d(x,y) + d(y,z)", "El atajo nunca es más largo (clave para indexar)"],
            ]}
          />

          <H3>Formas cuadráticas</H3>
          <P>
            Generalizan la distancia introduciendo una <Bold>matriz de similitud A</Bold> que captura las
            <Bold> interrelaciones entre dimensiones</Bold>:
          </P>
          <MathBlock>{String.raw`d(x,y) = \sqrt{(x - y)^{\mathsf{T}}\, A\, (x - y)}`}</MathBlock>
          <Ul items={[
            <><Bold>Euclidiana:</Bold> caso particular con A = matriz identidad.</>,
            <><Bold>Mahalanobis:</Bold> A = inversa de la matriz de covarianza (corrige correlación entre dimensiones).</>,
            <><Bold>SQFD</Bold> (Signature Quadratic Form Distance): permite medir distancia entre vectores de{" "}
              <Bold>distinta dimensión</Bold>.</>,
          ]} />
          <Callout variant="note" title="Costo computacional">
            Minkowski es <Code>O(D)</Code> (lineal en la dimensión). La forma cuadrática es <Code>O(D²)</Code>{" "}
            por el producto con la matriz A (más expresiva, pero más cara).
          </Callout>

          <Divider />

          {/* ══ 6. ESPACIOS ══ */}
          <H2 id="sec-espacios">6. Espacios métricos vs vectoriales</H2>
          <CompareCards
            items={[
              {
                label: "Espacio Métrico",
                color: "#8b5cf6",
                bg: "#160d28",
                pros: [
                  "Objetos comparados directamente con δ (disimilitud)",
                  "Funciona sin coordenadas: strings, grafos, conjuntos…",
                  "Ej.: strings + distancia de edición (Levenshtein)",
                ],
                cons: ["Más abstracto; solo se apoya en δ y sus propiedades"],
              },
              {
                label: "Espacio Vectorial",
                color: "#06b6d4",
                bg: "#06181f",
                pros: [
                  "Caso particular: objetos como vectores en ℝᵈ",
                  "Permite coordenadas, histogramas, signatures",
                  "Habilita índices multidimensionales",
                ],
                cons: ["Requiere una representación vectorial fija"],
              },
            ]}
          />
          <Callout variant="example" title="Distancia de edición (espacio métrico sin coordenadas)">
            Mínimo nº de inserciones, borrados o sustituciones para transformar un string en otro.{" "}
            <Code>"casa" → "cosa"</Code> = 1 (una sustitución). No hay "coordenadas", pero δ cumple las
            propiedades de métrica.
          </Callout>

          <Divider />

          {/* ══ 7. CONSULTAS ══ */}
          <H2 id="sec-consultas">7. Tipos de consulta</H2>
          <P>Sea <Code>U</Code> el conjunto de datos y <Code>q</Code> el objeto de consulta.</P>

          <H3>Consulta por rango (range query)</H3>
          <MathBlock>{String.raw`(q, r) = \{\, u \in U : \delta(u, q) \le r \,\}`}</MathBlock>
          <P>
            Devuelve todos los objetos dentro de una <Bold>bola</Bold> de radio <Code>r</Code> alrededor de{" "}
            <Code>q</Code>. <Bold>Problema:</Bold> elegir el radio. Muy pequeño → no devuelve nada; muy
            grande → devuelve demasiado.
          </P>

          <H3>k vecinos más cercanos (k-NN)</H3>
          <MathBlock>{String.raw`\begin{aligned}
            & k\text{-NN}(q) = C, \quad |C| = k \quad \text{tal que} \\[2pt]
            & \forall\, x \in C,\; y \in U - C : \; \delta(x, q) \le \delta(y, q)
          \end{aligned}`}</MathBlock>
          <P>
            Devuelve <Bold>exactamente los k objetos más cercanos</Bold>. A diferencia del rango, siempre
            devuelve k resultados (no hay que adivinar un radio).
          </P>

          <H3>Ranking incremental (give-me-more)</H3>
          <P>
            Cuando no se conoce ni un radio ni un k razonable (ej.: búsqueda en internet), se piden resultados
            ordenados por distancia <Bold>de a poco</Bold>: una función <Code>getnext(k)</Code> devuelve los
            siguientes objetos más relevantes hasta que el usuario se da por satisfecho.
          </P>
          <DiagramPlaceholder label="Diagrama: range query (bola de radio r) vs k-NN (k puntos más cercanos a q)" height={170} />

          <Divider />

          {/* ══ 8. EFICIENCIA Y EFECTIVIDAD ══ */}
          <H2 id="sec-eficiencia">8. Eficiencia y efectividad</H2>
          <H3>Eficiencia — ¿qué tan rápido?</H3>
          <Ul items={[
            <>Se mide por el <Bold>costo de búsqueda</Bold>: tiempo de CPU + tiempo de E/S (acceso a disco).</>,
            <>Se acelera con estructuras de datos especializadas:
              <Ul items={[
                <><Bold>Índices multidimensionales</Bold> (Spatial Access Methods, SAM), para espacios vectoriales.</>,
                <><Bold>Índices métricos</Bold> (Metric Access Methods, MAM), para espacios métricos generales.</>,
              ]} />
            </>,
          ]} />

          <H3>Efectividad — ¿qué tan buena es la respuesta?</H3>
          <P>
            Calidad de los objetos recuperados. No todos los recuperados son relevantes; se evalúa con la
            matriz de confusión:
          </P>
          <Table
            headers={["", "Relevante", "No relevante"]}
            rows={[
              ["Recuperado", "True Positive (TP)", "False Positive (FP)"],
              ["No recuperado", "False Negative (FN)", "True Negative (TN)"],
            ]}
          />
          <MathBlock>{String.raw`\begin{aligned} \text{Precision} &= \frac{TP}{TP + FP} \\[2pt] \text{Recall} &= \frac{TP}{TP + FN} \end{aligned}`}</MathBlock>
          <Ul items={[
            <><Bold>Precision:</Bold> de lo recuperado, ¿cuánto era relevante?</>,
            <><Bold>Recall:</Bold> de lo relevante, ¿cuánto se recuperó?</>,
            <>Relación empírica: <Bold>suelen estar en tensión</Bold>; subir recall (traer más) baja precision (más ruido).</>,
          ]} />
          <Callout variant="note" title="Colecciones de referencia (benchmarks)">
            Para evaluar modelos de RI se usan colecciones con objetos + consultas + relevancias conocidas:{" "}
            <Bold>TREC</Bold> (texto, desde 1992), <Bold>MIR Flickr</Bold> (1M imágenes con descriptores),{" "}
            <Bold>CoPhIR</Bold> (106M imágenes con descriptores MPEG-7). Son difíciles de construir.
          </Callout>

          <Divider />

          {/* ══ 9. IMÁGENES ══ */}
          <H2 id="sec-imagenes">9. Búsqueda de imágenes</H2>
          <P>
            Búsqueda por el contenido de la propia imagen (sus píxeles), evitando anotaciones manuales.
            Características típicas: color, descriptores, texturas y formas.
          </P>

          <H3>Basado en color</H3>
          <CompareCards
            items={[
              {
                label: "Histograma de color",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: ["Distribución de colores de los píxeles", "Simple y rápido"],
                cons: ["NO guarda información espacial"],
              },
              {
                label: "Correlograma de color",
                color: "#10b981",
                bg: "#051a0f",
                pros: ["Color en función de la distancia entre píxeles", "Incluye información espacial → mejor recuperación"],
                cons: ["Más costoso de calcular"],
              },
            ]}
          />
          <Callout variant="example" title="Por qué el histograma no basta">
            Dos imágenes pueden tener <Bold>histogramas idénticos pero correlogramas distintos</Bold>
            (mismos colores, distinta disposición espacial). El correlograma los distingue.
          </Callout>

          <H3>Basado en descriptores: SIFT</H3>
          <Ul items={[
            <><Bold>SIFT</Bold> (Scale Invariant Feature Transform, David Lowe, 2004): detecta regiones{" "}
              <Bold>keypoint</Bold> robustas a escala.</>,
            <>Cada keypoint genera un vector característico (típicamente de <Bold>128 dimensiones</Bold>).</>,
            <>Una imagen se representa por <Bold>N SIFT features</Bold> (N varía según la imagen).</>,
          ]} />

          <H3>Distancia entre imágenes y forma cuadrática</H3>
          <P>
            Con histogramas de color, la distancia euclidiana falla: imágenes RED, PINK y BLUE dan todas
            distancia √2 entre sí, <Bold>sin reconocer que rojo se parece más a rosado que a azul</Bold>. La
            forma cuadrática lo corrige con A:
          </P>
          <MathBlock>{String.raw`\delta(P, Q) = \sqrt{(H^{P} - H^{Q})\, A\, (H^{P} - H^{Q})^{\mathsf{T}}}`}</MathBlock>
          <P>
            Los valores <Code>a(i,j)</Code> de A describen la similitud entre las dimensiones (bins) i y j del
            histograma. Así <Code>δ_A(RED, PINK)</Code> se vuelve mucho menor que <Code>δ_A(RED, BLUE)</Code>.
          </P>
          <Callout variant="note">
            La similitud es <Bold>subjetiva</Bold>: un usuario podría no estar conforme con la matriz A usada.
            Reconstruir el índice al cambiar A es costoso → se busca poder ajustar A <Bold>en tiempo de consulta</Bold>.
          </Callout>

          <Divider />

          {/* ══ 10. OTROS MEDIOS ══ */}
          <H2 id="sec-medios">10. Rostros, video y audio</H2>

          <H3>Reconocimiento facial</H3>
          <P>
            Detectar rostros en imágenes y buscarlos por similitud. Pipeline moderno basado en embeddings:
          </P>
          <Pipeline steps={[
            { label: "Detección", sub: "landmarks del rostro", color: "#3b82f6" },
            { label: "Alineación", sub: "rostro frontal normalizado", color: "#8b5cf6" },
            { label: "Embedding", sub: "CNN → vector 128D", color: "#10b981" },
            { label: "Comparación", sub: "distancia < umbral → match", color: "#f59e0b" },
          ]} />
          <P>
            La CNN produce un <Bold>face embedding</Bold> (descriptor global de 128 dimensiones, una "huella
            digital"). Dos rostros coinciden si la distancia entre sus embeddings está por debajo de un
            <Bold> umbral</Bold>. Librerías: <Code>face-api.js</Code> (JS), <Code>face-recognition</Code> (Python).
          </P>

          <H3>Video y audio</H3>
          <Ul items={[
            <><Bold>Segmentación de video</Bold>: indexar conferencias por cambios de diapositiva + texto de las
              slides, y buscar el segmento relevante por palabras clave o por similitud de contenido.</>,
            <><Bold>Audio musical</Bold>: calcular vectores espectrales (<Bold>MFCC</Bold>), cuantizarlos en un histograma de audio y comparar. (No conserva
              el orden temporal de los sonidos.)</>,
            <><Bold>Representación temporal</Bold>: el video puede modelarse como <Bold>series de tiempo</Bold>{" "}
              (ej.: trayectoria de un gesto), comparables con distancias entre series.</>,
          ]} />

          <Callout variant="lab" title="Pgvector">
            En PostgreSQL, la extensión <Code>pgvector</Code> añade un tipo <Code>vector</Code> y operadores de
            distancia para hacer búsqueda por similitud (kNN) directamente en SQL.
          </Callout>
          <SqlCode label="Búsqueda vectorial con pgvector" sql={`CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE imagenes (
  id     int PRIMARY KEY,
  nombre text,
  emb    vector(128)        -- feature vector / embedding de 128 dimensiones
);

-- k-NN: las 5 imágenes más cercanas a un vector de consulta
SELECT id, nombre, emb <-> '[...]' AS distancia   -- <-> = distancia euclidiana (L2)
FROM imagenes
ORDER BY emb <-> '[...]'
LIMIT 5;
-- Operadores: <-> L2,  <=> coseno,  <#> producto punto (negativo)`} />

          <Callout variant="note" title="Cierre">
            Con esto cerramos los motores especializados: <Bold>espacial</Bold> (S6), <Bold>textual</Bold>{" "}
            (S8-S9) y <Bold>vectorial/multimedia</Bold> (S10). El hilo común es siempre el mismo: una buena
            <Bold> representación</Bold> + una <Bold>medida de similitud</Bold> + un <Bold>índice</Bold> que
            evite comparar contra todo.
          </Callout>

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
