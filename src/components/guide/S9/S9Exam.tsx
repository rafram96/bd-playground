"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "ex-conceptos",  label: "1. Conceptos clave" },
  { id: "ex-bsbi",       label: "2. BSBI en 1 minuto" },
  { id: "ex-spimi",      label: "3. SPIMI en 1 minuto" },
  { id: "ex-vs",         label: "4. BSBI vs SPIMI" },
  { id: "ex-merge",      label: "5. Mezcla y complejidad" },
  { id: "ex-gin-gist",   label: "6. GIN vs GiST" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Compact definition chip-list (shared style with S8Exam) */
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

/* Numbered step strip for the two algorithms */
function Steps({ steps, color }: { steps: React.ReactNode[]; color: string }) {
  return (
    <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 6 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          <span
            style={{
              flexShrink: 0,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: color + "22",
              border: `1px solid ${color}`,
              color,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-code)",
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s}</span>
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
   S9 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S9Exam() {
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
              Semana 9 · Hoja de repaso
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Esencial para el examen
            </h1>
            <P>
              Construcción escalable del índice invertido (<Bold>BSBI</Bold> y <Bold>SPIMI</Bold>) e
              implementación en motores reales, condensado para el examen. Para la explicación completa,
              ve a la guía <Bold>BSBI · SPIMI · GIN/GiST · Motores</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Lo más preguntado">
            (1) <Bold>Diferencia BSBI vs SPIMI</Bold>, (2) por qué SPIMI <Bold>no usa termID</Bold> y{" "}
            <Bold>no ordena</Bold> mientras parsea, (3) la <Bold>mezcla multi-way con cola de prioridad</Bold>,
            (4) <Bold>GIN vs GiST</Bold>, (5) que <Bold>GIN = índice invertido</Bold> en PostgreSQL.
          </Callout>

          <Divider />

          {/* ══ 1. CONCEPTOS ══ */}
          <H2 id="ex-conceptos">1. Conceptos clave</H2>
          <DefList items={[
            ["Escalar la indexación", <>Construir el índice cuando la colección <Bold>no cabe en RAM</Bold>: procesar por bloques, volcar a disco y mezclar.</>],
            ["BSBI", <><Bold>Blocked Sort-Based Indexing</Bold>. Genera entradas <Code>(termID, docID)</Code>, las <Bold>ordena por termID</Bold> por bloque, escribe a disco y mezcla.</>],
            ["SPIMI", <><Bold>Single-Pass In-Memory Indexing</Bold>. Usa el <Bold>término directamente</Bold> (sin termID), <Bold>no ordena</Bold> mientras parsea, acumula postings por append.</>],
            ["Posting list", <>Lista de docIDs de un término. En SPIMI es de <Bold>tamaño dinámico</Bold> (duplica al llenarse).</>],
            ["Merge", <>Fusión de los índices locales (bloques) en un índice global ordenado.</>],
            ["GIN", <><Bold>Generalized Inverted Index</Bold> de PostgreSQL = el índice invertido. Rápido en lectura.</>],
            ["GiST", <><Bold>Generalized Search Tree</Bold>: índice dinámico, mejor para muchas escrituras.</>],
            ["BM25", <>Versión mejorada de TF-IDF (normaliza por longitud, satura tf). La usa MongoDB y los motores modernos.</>],
          ]} />

          <Divider />

          {/* ══ 2. BSBI ══ */}
          <H2 id="ex-bsbi">2. BSBI en 1 minuto</H2>
          <Steps color="#3b82f6" steps={[
            <>Parsear documentos → generar entradas <Code>(termID, docID)</Code> (≈8 bytes c/u).</>,
            <>Llenar un bloque hasta agotar la memoria disponible.</>,
            <><Bold>Ordenar el bloque por termID</Bold> y construir su índice local invertido.</>,
            <>Escribir el índice local a disco. Repetir con el siguiente bloque.</>,
            <><Bold>Mezclar (merge)</Bold> todos los bloques en un índice global ordenado.</>,
          ]} />
          <Callout variant="warning" title="Talón de Aquiles de BSBI">
            Asume que el <Bold>diccionario cabe en RAM</Bold> y necesita el mapeo <Code>term → termID</Code>,
            que también crece. → motivación de SPIMI.
          </Callout>

          <Divider />

          {/* ══ 3. SPIMI ══ */}
          <H2 id="ex-spimi">3. SPIMI en 1 minuto</H2>
          <Steps color="#10b981" steps={[
            <>Crear un <Bold>diccionario hash local</Bold> para el bloque (sin termID, se usa el término).</>,
            <>Por cada token: si el término es nuevo → agregarlo al diccionario; si no → obtener su posting list.</>,
            <>Si la posting list está llena → <Bold>duplicar su tamaño</Bold> (<Code>DoublePostingsList</Code>).</>,
            <><Bold>Append</Bold> del docID a la posting list (sin ordenar todavía).</>,
            <>Al agotar memoria: <Bold>ordenar términos una vez</Bold> y volcar el bloque a disco. Luego merge (como BSBI).</>,
          ]} />
          <Callout variant="note" title="Por qué es mejor">
            Sin mapeo term→termID, cabe <Bold>más vocabulario por bloque</Bold>; el ordenamiento ocurre{" "}
            <Bold>una sola vez por bloque</Bold> (no por inserción) → construcción más rápida y menos memoria.
          </Callout>

          <Divider />

          {/* ══ 4. BSBI VS SPIMI ══ */}
          <H2 id="ex-vs">4. BSBI vs SPIMI (la tabla del examen)</H2>
          <Table
            headers={["", "BSBI", "SPIMI"]}
            rows={[
              ["Unidad de trabajo", "(termID, docID)", "(término, docID) — sin termID"],
              ["Mapeo term → termID", "Sí (en RAM)", "No lo necesita"],
              ["¿Ordena al parsear?", "Sí, por termID en cada bloque", "No; ordena 1 vez al final del bloque"],
              ["Postings", "Tras ordenar entradas", "Append directo, lista que duplica tamaño"],
              ["Memoria por bloque", "Más (mapeo + entradas)", "Menos → más términos por bloque"],
              ["Merge final", "Sí (multi-way)", "Sí (multi-way)"],
            ]}
          />

          <Divider />

          {/* ══ 5. MERGE ══ */}
          <H2 id="ex-merge">5. Mezcla y complejidad</H2>
          <H3>Mezcla binaria vs multi-way</H3>
          <Ul items={[
            <><Bold>Binaria:</Bold> mezclar de a pares en un árbol de <Code>log₂(nº bloques)</Code> niveles
              (ej. 10 bloques → ~4 niveles). Se relee todo en cada nivel.</>,
            <><Bold>Multi-way (mejor):</Bold> abrir <Bold>todos</Bold> los bloques a la vez, un buffer de
              lectura por bloque, y usar una <Bold>cola de prioridad (min-heap)</Bold> para elegir en cada
              paso el termID más bajo y combinar sus postings.</>,
          ]} />
          <Table
            headers={["Operación", "Coste", "Nota"]}
            rows={[
              ["Entrada BSBI", "≈ 8 bytes", "(termID, docID)"],
              ["Mezcla binaria", "lg(b) niveles", "b = nº de bloques"],
              ["Selección en multi-way", "O(lg b) por paso", "con cola de prioridad / heap"],
              ["Merge de 2 posting lists", "O(n + m)", "listas ordenadas por docID (igual que S8)"],
            ]}
          />

          <Divider />

          {/* ══ 6. GIN VS GIST ══ */}
          <H2 id="ex-gin-gist">6. GIN vs GiST</H2>
          <Table
            headers={["Criterio", "GIN", "GiST"]}
            rows={[
              ["Qué es", "Generalized Inverted Index = índice invertido", "Generalized Search Tree (árbol dinámico)"],
              ["Búsqueda", "Más rápida", "Más lenta"],
              ["Construir / actualizar", "Más costoso", "Más barato"],
              ["Escrituras frecuentes", "Peor", "Mejor"],
              ["Caso ideal", "Search engines, muchas lecturas", "CMS, muchas escrituras"],
            ]}
          />
          <SqlCode label="Sintaxis" sql={`-- GIN
CREATE INDEX idx ON news USING GIN (to_tsvector('spanish', content));
-- GiST
CREATE INDEX idx ON news USING GIST (to_tsvector('spanish', content));
-- consulta
SELECT * FROM news
WHERE to_tsvector('spanish', content) @@ to_tsquery('spanish', 'a & b');`} />

        </div>
      </div>

      <Toc active={activeSection} />
    </div>
  );
}
