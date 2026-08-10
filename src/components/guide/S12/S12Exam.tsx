"use client";

import GuideLayout from "@/components/guide/GuideLayout";

import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, MathBlock, Pseudo,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "ex-conceptos",   label: "1. Conceptos clave" },
  { id: "ex-sistemas",    label: "2. Sistemas distribuidos" },
  { id: "ex-diseno",      label: "3. Diseño: enfoques y problemas" },
  { id: "ex-tipos",       label: "4. Tipos y reglas de correctitud" },
  { id: "ex-phf",         label: "5. Fragmentación horizontal primaria" },
  { id: "ex-derivada",    label: "6. Derivada y asignación" },
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
   S12 Exam — Esencial para el examen
   ───────────────────────────────────────────────────────────────────────────── */
export default function S12Exam() {
  return (
    <GuideLayout sections={SECTIONS}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 12 · Hoja de repaso
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Esencial para el examen
            </h1>
            <P>
              BD distribuidas y fragmentación horizontal, condensado: sistemas distribuidos y sus propiedades,
              diseño top-down vs bottom-up, los dos problemas (fragmentación y asignación), tipos de
              fragmentación, reglas de correctitud, y la fragmentación horizontal primaria (predicados
              mintérmino) y derivada (semijoin). Para el desarrollo completo, ve a la guía{" "}
              <Bold>BD Distribuidas · Fragmentación Horizontal</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Lo más preguntado">
            (1) diferencia <Bold>paralelo vs distribuido</Bold> (shared memory vs shared nothing), (2) las{" "}
            <Bold>5 propiedades</Bold> de un buen sistema distribuido, (3) <Bold>top-down vs bottom-up</Bold> y
            los <Bold>dos problemas</Bold>, (4) las <Bold>3 reglas de correctitud</Bold>, (5) <Bold>predicado
            mintérmino</Bold> y completitud/minimalidad, (6) <Bold>semijoin</Bold> en la fragmentación derivada.
          </Callout>

          <Divider />

          {/* ══ 1. CONCEPTOS ══ */}
          <H2 id="ex-conceptos">1. Conceptos clave</H2>
          <DefList items={[
            ["Sistema distribuido", <>Colección de computadoras <Bold>independientes</Bold> que se comunican para resolver un <Bold>objetivo común</Bold>.</>],
            ["Paralelo vs distribuido", <>Paralelo = varios procesadores con <Bold>memoria compartida</Bold>; distribuido = varias máquinas <Bold>sin memoria compartida</Bold> (mensajes por red).</>],
            ["BDD", <>Varias BD <Bold>interrelacionadas lógicamente</Bold> en distintos nodos de una red.</>],
            ["SGBD distribuido", <>Software que gestiona la BDD de forma <Bold>transparente</Bold>: el usuario la ve como una sola BD centralizada.</>],
            ["Transparencia", <>Dar la <Bold>impresión de un solo sistema</Bold>: ocultar acceso, ubicación, heterogeneidad, concurrencia y fragmentación.</>],
            ["Fragmentación", <>Dividir una relación en <Bold>fragmentos</Bold> (por filas = horizontal, por columnas = vertical).</>],
            ["Asignación (allocation)", <>Decidir <Bold>en qué nodo</Bold> va cada fragmento (replicado o no replicado).</>],
            ["Costo de red", <>El recurso <Bold>más caro</Bold>; toda la teoría busca minimizar datos movidos por la red.</>],
          ]} />

          <Divider />

          {/* ══ 2. SISTEMAS ══ */}
          <H2 id="ex-sistemas">2. Sistemas distribuidos</H2>
          <Table
            headers={["Propiedad", "Qué busca", "Cómo"]}
            rows={[
              ["Transparencia", "Parecer un solo sistema", "Direcciones abstractas, APIs"],
              ["Flexibilidad", "Agregar/quitar máquinas fácil", "Replicación, heart-beats, balanceo"],
              ["Confiabilidad", "Seguir trabajando ante fallos", "Replicación, consenso, enrutamiento"],
              ["Desempeño", "Baja latencia, rápido", "Optimización de red, recursos"],
              ["Escalabilidad", "Crecer sin degradarse", "Peer-to-peer, índices distribuidos"],
            ]}
          />
          <Callout variant="warning" title="Enemigos de la escalabilidad">
            <Bold>Cuellos de botella</Bold> (depender de una sola parte) y los <Bold>mensajes por pares</Bold>, que
            crecen <Code>O(n²)</Code> con el número de nodos.
          </Callout>
          <Callout variant="note" title="Costo de transporte">
            Main Memory, CPU y Disk son baratos; la <Bold>Network es cara</Bold>. Regla: minimizar el costo de red.
          </Callout>

          <Divider />

          {/* ══ 3. DISEÑO ══ */}
          <H2 id="ex-diseno">3. Diseño: enfoques y problemas</H2>
          <Table
            headers={["", "Top-down", "Bottom-up"]}
            rows={[
              ["Punto de partida", "Desde cero (pizarra en blanco)", "Bases que ya existen en cada sitio"],
              ["Similar a", "Diseño de BD centralizada", "Integración de esquemas"],
              ["Reto principal", "¿Cómo fragmentar y dónde asignar?", "Unificar esquemas heterogéneos"],
            ]}
          />
          <Callout variant="definition" title="Los dos problemas (top-down)">
            <Ul items={[
              <><Bold>Fragmentación:</Bold> ¿cómo dividimos los datos?</>,
              <><Bold>Asignación:</Bold> ¿en qué nodo va cada fragmento?</>,
            ]} />
            No son independientes, pero se abordan por separado.
          </Callout>

          <Divider />

          {/* ══ 4. TIPOS Y CORRECTITUD ══ */}
          <H2 id="ex-tipos">4. Tipos y reglas de correctitud</H2>
          <Table
            headers={["Tipo", "Corta por", "Operador", "Reconstrucción"]}
            rows={[
              ["Horizontal", "Filas (tuplas)", "Selección σ", "Unión ∪"],
              ["Vertical", "Columnas (+ clave)", "Proyección π", "Join ⋈"],
              ["Mixta", "Ambas", "σ y π", "Combinada"],
            ]}
          />
          <FormulaCard
            title="Reconstrucción (regla 2)"
            formula={<div>
              <MathBlock>{String.raw`\text{Horizontal: } R = R_1 \cup R_2 \cup \dots \cup R_w`}</MathBlock>
              <MathBlock>{String.raw`\text{Vertical: } R = R_1 \bowtie R_2 \bowtie \dots \bowtie R_w`}</MathBlock>
            </div>}
            legend={[
              [<>∪</>, <>unión de fragmentos horizontales</>],
              [<>⋈</>, <>join de fragmentos verticales sobre la clave</>],
            ]}
          />
          <Callout variant="definition" title="Las 3 reglas de correctitud">
            <Ul items={[
              <><Bold>Completitud:</Bold> cada dato de R está en al menos un fragmento (no se pierde nada).</>,
              <><Bold>Reconstrucción:</Bold> existe una operación que recupera R desde sus fragmentos.</>,
              <><Bold>Disjunción:</Bold> los fragmentos no se solapan (en vertical, la clave se repite a propósito).</>,
            ]} />
          </Callout>

          <Divider />

          {/* ══ 5. PHF ══ */}
          <H2 id="ex-phf">5. Fragmentación horizontal primaria (PHF)</H2>
          <FormulaCard
            title="Predicado mintérmino"
            formula={<MathBlock>{String.raw`m_i = \bigwedge_{p_k \in Pr} p_k^{*}, \quad p_k^{*} \in \{ p_k,\, \neg p_k \}`}</MathBlock>}
            legend={[
              [<>Pr</>, <>conjunto de predicados simples (atributo θ valor)</>],
              [<>p_k*</>, <>cada predicado en forma normal o negada</>],
              [<>mᵢ</>, <>conjunción que define un fragmento: Rᵢ = σ_mᵢ(R)</>],
            ]}
            note={<>Cada fragmento es la selección de R con su mintérmino. Los mintérminos contradictorios se descartan.</>}
          />
          <H3>Completitud y minimalidad de Pr</H3>
          <DefList items={[
            ["Predicado simple", <><Code>atributo θ valor</Code>, con <Code>θ ∈ {`{=, <, ≤, >, ≥, ≠}`}</Code>.</>],
            ["Conjunto completo", <>Dos tuplas del mismo fragmento se acceden <Bold>igual</Bold> por toda aplicación.</>],
            ["Conjunto mínimo", <>Todo predicado es <Bold>relevante</Bold>: influye en cómo se fragmenta. Si no, sobra.</>],
            ["Regla 1 (partición)", <>Un fragmento se parte en ≥ 2 pedazos accedidos <Bold>distinto</Bold> por ≥ 1 aplicación.</>],
          ]} />
          <Callout variant="note" title="Algoritmos (Özsu)">
            <Code>COM-MIN</Code> obtiene un conjunto de predicados <Bold>completo y mínimo</Bold>;{" "}
            <Code>PHORIZONTAL</Code> genera los mintérminos y elimina los contradictorios usando las
            implicaciones.
          </Callout>
          <Pseudo>{`PHORIZONTAL(R, Pr)
 1  Pr' = COM-MIN(R, Pr)              // completo y mínimo
 2  M = conjunto de mintérminos sobre Pr'
 3  I = implicaciones entre predicados de Pr'
 4  for each mᵢ ∈ M
 5      if mᵢ es contradictorio según I
 6          M = M − {mᵢ}
 7  return M`}</Pseudo>
          <Callout variant="example" title="Ejemplo">
            <Code>CLIENTE</Code> por ciudad: <Code>p₁: ciudad=&apos;Lima&apos;</Code>,{" "}
            <Code>p₂: ciudad=&apos;Arequipa&apos;</Code> →{" "}
            <Code>CLIENTE₁ = σ<sub>ciudad=&apos;Lima&apos;</sub>(CLIENTE)</Code>,{" "}
            <Code>CLIENTE₂ = σ<sub>ciudad=&apos;Arequipa&apos;</sub>(CLIENTE)</Code>. En PostgreSQL:{" "}
            <Code>PARTITION BY LIST (ciudad)</Code>.
          </Callout>

          <Divider />

          {/* ══ 6. DERIVADA Y ASIGNACIÓN ══ */}
          <H2 id="ex-derivada">6. Fragmentación derivada y asignación</H2>
          <FormulaCard
            title="Fragmentación horizontal derivada (semijoin)"
            formula={<MathBlock>{String.raw`R_i = R \ltimes S_i, \qquad i = 1, \dots, w`}</MathBlock>}
            legend={[
              [<>S</>, <>relación owner, ya fragmentada en S₁…S_w</>],
              [<>R</>, <>relación miembro que se fragmenta</>],
              [<>⋉</>, <>semijoin: tuplas de R que hacen match con Sᵢ</>],
            ]}
            note={<>Junta tuplas relacionadas (PK-FK) en el mismo nodo → los JOIN se resuelven localmente, sin red.</>}
          />
          <Callout variant="example" title="Ejemplo derivada">
            <Code>PEDIDO₁ = PEDIDO ⋉ CLIENTE₁</Code> deja los pedidos de los clientes de Lima junto a esos
            clientes. Necesita: fragmentos del owner + relación miembro + condición de join.
          </Callout>
          <H3>Asignación</H3>
          <Table
            headers={["", "No replicado", "Replicado"]}
            rows={[
              ["Copias", "Un fragmento en un solo nodo", "Copias en varios nodos"],
              ["Lecturas", "Pueden pagar red", "Locales y rápidas"],
              ["Escrituras", "Simples (un lugar)", "Propagar a todas las copias"],
              ["Tolerancia a fallos", "Baja", "Alta"],
            ]}
          />
          <Callout variant="warning" title="Trade-off">
            La replicación <Bold>favorece lecturas</Bold> y <Bold>penaliza escrituras</Bold>. La decisión usa
            información de la base, la aplicación, el sitio y la red.
          </Callout>

    </GuideLayout>
  );
}
