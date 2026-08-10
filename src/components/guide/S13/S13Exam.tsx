"use client";

import GuideLayout from "@/components/guide/GuideLayout";

import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, MathBlock, Pseudo, Collapse,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "ex-conceptos",  label: "1. Conceptos clave" },
  { id: "ex-correctitud",label: "2. Reglas de correctitud" },
  { id: "ex-fd",         label: "3. Dependencias funcionales" },
  { id: "ex-afinidad",   label: "4. Matriz de afinidad (la fórmula)" },
  { id: "ex-bea",        label: "5. BEA y partición" },
];


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
      <div style={{ padding: "8px 18px", borderBottom: "1px solid var(--border)", color: "var(--math-text)" }}>
        {formula}
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
        {legend.map(([sym, mean], i) => (
          <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-code)", color: "var(--code-text)", minWidth: 84, flexShrink: 0, fontWeight: 600 }}>{sym}</span>
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
        <div key={i} style={{ display: "grid", gridTemplateColumns: "190px 1fr", gap: 12, padding: "8px 12px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, alignItems: "baseline" }}>
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

/* ─────────────────────────────────────────────────────────────────────────────
   S13 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S13Exam() {
  return (
    <GuideLayout sections={SECTIONS}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 13 · Hoja de repaso
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Esencial para el examen
            </h1>
            <P>
              Fragmentación vertical condensada: reglas de correctitud (completitud y join sin pérdida, por qué la
              disjunción no aplica), los dos caminos (dependencias funcionales y matriz de afinidad), y el método
              de afinidad completo (la fórmula, BEA y la partición). Para el desarrollo, ve a la guía{" "}
              <Bold>Fragmentación Vertical · Matriz de Afinidad</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Lo más preguntado">
            (1) por qué la <Bold>disjunción no es deseable</Bold> y la clave se replica, (2) qué es{" "}
            <Bold>join sin pérdida</Bold>, (3) la <Bold>fórmula de la matriz de afinidad</Bold> y saber calcularla,
            (4) qué hace <Bold>BEA</Bold>, (5) la partición con <Bold>z = CTQ·CBQ − COQ²</Bold>.
          </Callout>

          <Divider />

          {/* ══ 1. CONCEPTOS ══ */}
          <H2 id="ex-conceptos">1. Conceptos clave</H2>
          <DefList items={[
            ["Fragmentación vertical", <>Partir una relación <Bold>por columnas</Bold>: cada fragmento tiene un subconjunto de atributos. Parecida a la normalización.</>],
            ["Completitud", <>Cada atributo está en al menos un fragmento: <Code>∪ Aᵢ = A</Code>.</>],
            ["Join sin pérdida", <>Se reconstruye R con <Code>⋈</Code> sin tuplas falsas ni pérdida: <Code>R = R₁ ⋈ … ⋈ Rₙ</Code>.</>],
            ["Disjunción", <><Bold>NO deseable</Bold> en vertical: la <Bold>clave se replica</Bold> en todos los fragmentos para poder hacer el join.</>],
            ["Dependencia funcional", <><Code>X → Y</Code>: dos tuplas con igual X tienen por fuerza igual Y. Un camino para fragmentar.</>],
            ["Matriz de afinidad", <>Mide cuánto se <Bold>acceden juntos</Bold> dos atributos según las consultas. El otro camino.</>],
            ["BEA", <><Bold>Bond Energy Algorithm</Bold>: reordena la matriz para agrupar atributos afines (matriz agrupada CA).</>],
          ]} />

          <Divider />

          {/* ══ 2. CORRECTITUD ══ */}
          <H2 id="ex-correctitud">2. Reglas de correctitud</H2>
          <Table
            headers={["Regla", "Qué exige", "Fórmula"]}
            rows={[
              ["Completitud", "Ningún atributo se pierde", "∪ Aᵢ = A"],
              ["Reconstrucción", "Join sin pérdida de R", "R = R₁ ⋈ … ⋈ Rₙ"],
              ["Disjunción", "NO aplica: la clave se repite", "Aᵢ ∩ Aⱼ = clave"],
            ]}
          />
          <Callout variant="warning" title="Por qué la disjunción rompe todo">
            Si los fragmentos no comparten la <Bold>clave</Bold>, no se puede saber qué valores corresponden a qué
            fila y el <Code>JOIN</Code> es imposible (reconstrucción con pérdida). Por eso la clave primaria (o el
            TID) se <Bold>replica</Bold> en cada fragmento. Es la única excepción a la disjunción.
          </Callout>

          <Divider />

          {/* ══ 3. FD ══ */}
          <H2 id="ex-fd">3. Dependencias funcionales</H2>
          <FormulaCard
            title="Dependencia funcional X → Y"
            formula={<MathBlock>{String.raw`X \rightarrow Y \iff (t_1[X] = t_2[X] \;\Rightarrow\; t_1[Y] = t_2[Y])`}</MathBlock>}
            legend={[
              [<>X, Y</>, <>conjuntos de atributos (pueden ser compuestos)</>],
              [<>t₁, t₂</>, <>dos tuplas cualquiera de la relación</>],
            ]}
            note={<>Si dos filas coinciden en X, deben coincidir en Y. Fragmentar por DF garantiza el join sin pérdida.</>}
          />
          <Callout variant="example" title="Ejemplo IMPARTIR(Profesor, Curso, Texto)">
            <Ul items={[
              <><Code>{`{Texto} → {Curso}`}</Code> <Bold>se cumple</Bold> (cada texto, un solo curso).</>,
              <><Code>{`{Profesor} → {Curso}`}</Code> <Bold>no se cumple</Bold> (Juan dicta dos cursos distintos).</>,
            ]} />
          </Callout>

          <Divider />

          {/* ══ 4. AFINIDAD ══ */}
          <H2 id="ex-afinidad">4. Matriz de afinidad (la fórmula)</H2>
          <FormulaCard
            title="Afinidad de atributos aff(Aᵢ, Aⱼ)"
            formula={<MathBlock>{String.raw`aff(A_i, A_j) = \sum_{k=1}^{Q} use(q_k, A_i)\cdot use(q_k, A_j)\cdot acc(q_k)`}</MathBlock>}
            legend={[
              [<>use(qₖ,Aⱼ)</>, <>1 si la consulta qₖ usa el atributo Aⱼ, 0 si no</>],
              [<>acc(qₖ)</>, <>frecuencia de acceso de qₖ (sumada sobre todos los sitios)</>],
              [<>Q</>, <>número de consultas</>],
            ]}
            note={<>Suma la frecuencia de las consultas que usan AMBOS atributos a la vez. Mayor afinidad = deben ir en el mismo fragmento. La diagonal aff(Aᵢ,Aᵢ) suma los accesos a Aᵢ.</>}
          />
          <H3>Cómo calcularla (ejemplo)</H3>
          <P>
            Con <Code>q₁{`{A₁A₂A₃}`}</Code>=25, <Code>q₂{`{A₂A₃}`}</Code>=20, <Code>q₃{`{A₁A₄}`}</Code>=30,{" "}
            <Code>q₄{`{A₁A₄}`}</Code>=10:
          </P>
          <Ul items={[
            <><Code>aff(A₂,A₃) = 25 + 20 = 45</Code> (q₁ y q₂ usan ambos).</>,
            <><Code>aff(A₁,A₄) = 30 + 10 = 40</Code> (q₃ y q₄ usan ambos).</>,
            <><Code>aff(A₂,A₄) = 0</Code> (ninguna consulta usa los dos).</>,
          ]} />

          <Divider />

          {/* ══ 5. BEA Y PARTICIÓN ══ */}
          <H2 id="ex-bea">5. BEA y partición</H2>
          <FormulaCard
            title="Bond Energy Algorithm: medidas"
            formula={<div>
              <MathBlock>{String.raw`bond(A_x, A_y) = \sum_{z=1}^{n} aff(A_z, A_x)\cdot aff(A_z, A_y)`}</MathBlock>
              <MathBlock>{String.raw`cont(A_i, A_k, A_j) = 2\,bond(A_i,A_k) + 2\,bond(A_k,A_j) - 2\,bond(A_i,A_j)`}</MathBlock>
            </div>}
            legend={[
              [<>bond</>, <>fuerza del vínculo entre dos columnas</>],
              [<>cont</>, <>ganancia de colocar Aₖ entre Aᵢ y Aⱼ</>],
            ]}
            note={<>BEA reordena filas/columnas para maximizar la afinidad global y dejar los atributos afines contiguos (matriz agrupada CA).</>}
          />
          <FormulaCard
            title="Partición de la matriz agrupada"
            formula={<MathBlock>{String.raw`z = CTQ \cdot CBQ - COQ^2`}</MathBlock>}
            legend={[
              [<>CTQ</>, <>accesos de consultas que usan solo el grupo de arriba (TA)</>],
              [<>CBQ</>, <>accesos de consultas que usan solo el grupo de abajo (BA)</>],
              [<>COQ</>, <>accesos de consultas que cruzan ambos grupos</>],
            ]}
            note={<>Se elige el corte que MAXIMIZA z: muchos accesos a un solo lado (CTQ·CBQ alto) y pocos que cruzan (COQ bajo).</>}
          />
          <Collapse title="Pseudocódigo: BEA">
            <Pseudo>{`BEA(AA)
 1  CA[·,1] = AA[·,1];  CA[·,2] = AA[·,2]   // fija 2 columnas
 2  index = 3
 3  while index ≤ n
 4      probar cada hueco: cont(A_{loc-1}, A_index, A_loc)
 5      colocar la columna en la posición de mayor cont
 6      index = index + 1
 7  ordenar las filas igual que las columnas
 8  return CA`}</Pseudo>
          </Collapse>
          <Callout variant="example" title="Partición del ejemplo">
            Corte <Code>TA={`{A₁,A₄}`}</Code> / <Code>BA={`{A₂,A₃}`}</Code>: CTQ=40 (q₃,q₄), CBQ=20 (q₂), COQ=25
            (q₁). <Code>z = 40·20 − 25² = 175</Code>. Fragmentos (con la clave id replicada):{" "}
            <Code>F₁(id, salary)</Code> y <Code>F₂(id, name, location)</Code>.
          </Callout>

    </GuideLayout>
  );
}
