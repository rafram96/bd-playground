"use client";

import GuideLayout from "@/components/guide/GuideLayout";

import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, CompareCards,
  Collapse, Pipeline, MathBlock, MathInline, Pseudo, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-que",          label: "1. ¿Qué es la fragmentación vertical?" },
  { id: "sec-correctitud",  label: "2. Reglas de correctitud" },
  { id: "sec-reto",         label: "3. El join sin pérdida: dos caminos" },
  { id: "sec-fd",           label: "4. Camino A: dependencias funcionales" },
  { id: "sec-afinidad",     label: "5. Camino B: matriz de afinidad" },
  { id: "sec-bea",          label: "6. Agrupar atributos (BEA)" },
  { id: "sec-particion",    label: "7. Particionar la matriz" },
  { id: "sec-postgres",     label: "8. En PostgreSQL y cierre" },
];


/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents (con toggle ocultar/mostrar)
   ───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   S13 Guide — Fragmentación Vertical y Matriz de Afinidad
   ───────────────────────────────────────────────────────────────────────────── */
export default function S13Guide() {
  return (
    <GuideLayout sections={SECTIONS}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 13 · Módulo III · BD Distribuidas
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Fragmentación Vertical y Matriz de Afinidad
            </h1>
            <P>
              En la Semana 12 partimos la tabla <Bold>por filas</Bold> (horizontal). Ahora la partimos{" "}
              <Bold>por columnas</Bold>: cada fragmento se queda con un subconjunto de atributos. El reto es
              decidir <Bold>qué columnas van juntas</Bold> para que las consultas toquen un solo fragmento, y
              garantizar que la tabla original se pueda <Bold>reconstruir sin pérdida</Bold>. La herramienta
              estrella para decidir la agrupación es la <Bold>matriz de afinidad de atributos</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Hilo de la semana">
            Qué es la fragmentación vertical (parecido a normalizar) → reglas de correctitud (completitud y join
            sin pérdida; por qué la disjunción NO es deseable) → los dos caminos para el join sin pérdida →
            dependencias funcionales → matriz de afinidad (la fórmula, con ejemplo) → agrupar con BEA →
            particionar la matriz agrupada.
          </Callout>

          <Divider />

          {/* ══ 1. QUÉ ══ */}
          <H2 id="sec-que">1. ¿Qué es la fragmentación vertical?</H2>
          <P>
            La <Bold>fragmentación vertical</Bold> divide una relación en fragmentos que contienen{" "}
            <Bold>distintos subconjuntos de columnas</Bold>. Es muy parecida a la <Bold>normalización</Bold>
            (descomponer una tabla en varias), pero aquí el objetivo es de <Bold>rendimiento distribuido</Bold>:
            poner juntas las columnas que se consultan juntas.
          </P>
          <Callout variant="example" title="Ejemplo del deck">
            <P>
              La tabla <Code>E(id, name, location, salary)</Code> se parte verticalmente en:
            </P>
            <Ul items={[
              <><Code>E₁(id, name, location)</Code></>,
              <><Code>E₂(id, salary)</Code></>,
            ]} />
            <P>
              Cada fragmento conserva el <Bold>id</Bold> (la clave) para poder volver a unir las columnas después.
            </P>
          </Callout>
          <H3>Formalización</H3>
          <P>
            Sea <MathInline>{String.raw`R[A]`}</MathInline> una relación con su conjunto de atributos{" "}
            <MathInline>{String.raw`A = \{a_1, a_2, \dots, a_n\}`}</MathInline>. La fragmentación vertical produce
            fragmentos <MathInline>{String.raw`R_i[A_i]`}</MathInline> donde cada{" "}
            <MathInline>{String.raw`A_i \subseteq A`}</MathInline>:
          </P>
          <MathBlock>{String.raw`R[A] \;\Longrightarrow\; R_1[A_1],\; R_2[A_2],\; \dots,\; R_n[A_n]`}</MathBlock>

          <Divider />

          {/* ══ 2. CORRECTITUD ══ */}
          <H2 id="sec-correctitud">2. Reglas de correctitud</H2>
          <P>Para que una fragmentación vertical sea correcta debe cumplir:</P>

          <H3>(1) Completitud</H3>
          <P>Cada atributo de <Code>R</Code> debe aparecer en al menos un fragmento. No se pierde ninguna columna:</P>
          <MathBlock>{String.raw`\bigcup_i A_i = A`}</MathBlock>

          <H3>(2) Reconstrucción: join sin pérdida</H3>
          <P>
            Debe ser posible <Bold>reconstruir totalmente</Bold> <Code>R</Code> uniendo los fragmentos,{" "}
            <Bold>sin tuplas falsas y sin perder tuplas</Bold>. La reconstrucción se hace con el operador{" "}
            <Bold>join</Bold>:
          </P>
          <MathBlock>{String.raw`R = R_1 \bowtie R_2 \bowtie \dots \bowtie R_w`}</MathBlock>

          <H3>(3) ¿Y la disjunción?</H3>
          <Callout variant="warning" title="La disjunción NO es una propiedad deseable aquí">
            <P>
              En horizontal queríamos fragmentos disjuntos. En vertical, exigir que los conjuntos de atributos no
              se solapen
            </P>
            <MathBlock>{String.raw`A_i \cap A_j = \varnothing \quad \forall i,j:\; i \neq j`}</MathBlock>
            <P>
              <Bold>rompe la reconstrucción</Bold>. Si <Code>E(id, location, salary)</Code> se partiera en{" "}
              <Code>E₁(id, location)</Code> y <Code>E₂(salary)</Code> sin compartir nada, no habría forma de saber
              qué <Code>salary</Code> corresponde a qué fila: el join sería imposible.
            </P>
          </Callout>
          <Callout variant="definition" title="La clave se replica a propósito">
            La <Bold>clave primaria</Bold> (o un identificador de tupla, el TID) debe estar en{" "}
            <Bold>todos</Bold> los fragmentos. Es la única excepción a la disjunción, y es justo lo que permite el
            join sin pérdida. Por eso <Code>E₂</Code> es <Code>(id, salary)</Code> y no solo <Code>(salary)</Code>.
          </Callout>

          <Divider />

          {/* ══ 3. RETO ══ */}
          <H2 id="sec-reto">3. El join sin pérdida: dos caminos</H2>
          <P>
            Lograr la fragmentación de modo que el join reconstruya <Code>R</Code> exactamente no es trivial. Hay
            dos formas de conseguirlo:
          </P>
          <Pipeline steps={[
            { label: "Dependencias funcionales", sub: "estructura semántica", color: "#8b5cf6" },
            { label: "Matriz de afinidad", sub: "patrón de acceso", color: "#10b981" },
          ]} />
          <Ul items={[
            <><Bold>Camino A (dependencias funcionales):</Bold> fragmentar según relaciones <Code>X → Y</Code> entre
              atributos, como en normalización. Garantiza el join sin pérdida por construcción.</>,
            <><Bold>Camino B (matriz de afinidad):</Bold> fragmentar según <Bold>cómo las consultas acceden</Bold> a
              los atributos. Agrupa las columnas que se usan juntas para minimizar el costo de red.</>,
          ]} />

          <Divider />

          {/* ══ 4. FD ══ */}
          <H2 id="sec-fd">4. Camino A: dependencias funcionales</H2>
          <Callout variant="definition" title="Dependencia funcional">
            Dada una relación <Code>R</Code> y dos conjuntos de atributos <MathInline>{String.raw`X \in R`}</MathInline>,{" "}
            <MathInline>{String.raw`Y \in R`}</MathInline>, decimos que <Bold>X determina funcionalmente a Y</Bold>{" "}
            (<MathInline>{String.raw`X \rightarrow Y`}</MathInline>) si y solo si <Bold>dos tuplas con el mismo
            valor de X tienen por fuerza el mismo valor de Y</Bold>. <Code>X</Code> e <Code>Y</Code> pueden ser
            atributos <Bold>compuestos</Bold>.
          </Callout>
          <Callout variant="example" title="Ejemplo: la tabla IMPARTIR">
            <Table
              headers={["Profesor", "Curso", "Texto"]}
              rows={[
                ["Juan", "Estructuras de datos", "Bartram"],
                ["Juan", "Administración", "Martín"],
                ["Pedro", "Compiladores", "Hoffman"],
                ["Celis", "Estructura de datos", "Horowitz"],
                ["Pedro", "Administración", "Martín"],
              ]}
            />
            <Ul items={[
              <><Bold>{`{Texto} → {Curso}`}</Bold> <Bold>SÍ se cumple</Bold>: cada texto se usa en un único curso
                (Martín siempre con Administración, etc.).</>,
              <><Bold>{`{Profesor} → {Curso}`}</Bold> <Bold>NO se cumple</Bold>: Juan dicta dos cursos distintos
                (Estructuras de datos y Administración), así que el mismo valor de Profesor no determina un único
                Curso.</>,
            ]} />
          </Callout>
          <P>
            Conociendo las dependencias funcionales válidas se descompone la relación (igual que al pasar a 3FN o
            BCNF), garantizando que el join reconstruye la tabla sin pérdida. Si quieres repasar el detalle, mira
            las utilidades <Bold>Dependencias Funcionales</Bold> y <Bold>Normalización</Bold>.
          </P>

          <Divider />

          {/* ══ 5. AFINIDAD ══ */}
          <H2 id="sec-afinidad">5. Camino B: la matriz de afinidad de atributos</H2>
          <P>
            La idea: en lugar de la semántica (dependencias), usar el <Bold>comportamiento real de las
            consultas</Bold>. Si dos atributos casi siempre se piden juntos, deberían vivir en el mismo fragmento.
            La <Bold>afinidad</Bold> mide exactamente eso.
          </P>

          <H3>Paso 1: matriz de uso de atributos</H3>
          <P>
            Para cada consulta <MathInline>{String.raw`q_k`}</MathInline> y cada atributo{" "}
            <MathInline>{String.raw`A_j`}</MathInline> definimos <MathInline>{String.raw`use(q_k, A_j)`}</MathInline>{" "}
            = 1 si la consulta usa ese atributo, 0 si no. Además, cada consulta tiene una{" "}
            <Bold>frecuencia de acceso</Bold> <MathInline>{String.raw`acc(q_k)`}</MathInline> (cuántas veces se
            ejecuta, sumada sobre todos los sitios).
          </P>
          <P>Ejemplo con <Code>EMP(A₁=id, A₂=name, A₃=location, A₄=salary)</Code> y 4 consultas:</P>
          <Table
            headers={["Consulta", "A₁", "A₂", "A₃", "A₄", "acc(qₖ)"]}
            rows={[
              [<><Code>q₁</Code> ficha (id, name, location)</>, "1", "1", "1", "0", "25"],
              [<><Code>q₂</Code> directorio (name, location)</>, "0", "1", "1", "0", "20"],
              [<><Code>q₃</Code> nómina (id, salary)</>, "1", "0", "0", "1", "30"],
              [<><Code>q₄</Code> reporte salarios (id, salary)</>, "1", "0", "0", "1", "10"],
            ]}
          />

          <H3>Paso 2: la fórmula de afinidad</H3>
          <Callout variant="definition" title="Afinidad entre dos atributos">
            La afinidad <MathInline>{String.raw`aff(A_i, A_j)`}</MathInline> suma la frecuencia de acceso de{" "}
            <Bold>todas las consultas que usan los dos atributos a la vez</Bold>:
          </Callout>
          <MathBlock>{String.raw`aff(A_i, A_j) \;=\; \sum_{k\,:\;use(q_k,A_i)=1\,\wedge\,use(q_k,A_j)=1}\;\; \sum_{\forall S_l} acc_l(q_k)`}</MathBlock>
          <P>De forma equivalente, usando el producto de los indicadores de uso:</P>
          <MathBlock>{String.raw`aff(A_i, A_j) \;=\; \sum_{k=1}^{Q}\; use(q_k,A_i)\cdot use(q_k,A_j)\cdot acc(q_k)`}</MathBlock>
          <Callout variant="note" title="Cómo leerla">
            Para cada par <Code>(Aᵢ, Aⱼ)</Code>: recorre todas las consultas; si una usa <Bold>ambos</Bold>
            atributos, suma su frecuencia. Cuanto mayor el número, más se acceden juntos esos dos atributos, y más
            sentido tiene ponerlos en el mismo fragmento. La <Bold>diagonal</Bold>{" "}
            <Code>aff(Aᵢ, Aᵢ)</Code> suma la frecuencia de todas las consultas que usan <Code>Aᵢ</Code>.
          </Callout>

          <H3>Paso 3: construir la matriz de afinidad (AA)</H3>
          <P>
            Aplicando la fórmula al ejemplo. Por ejemplo,{" "}
            <Code>aff(A₂, A₃) = acc(q₁) + acc(q₂) = 25 + 20 = 45</Code> (q₁ y q₂ usan name y location juntos), y{" "}
            <Code>aff(A₁, A₄) = acc(q₃) + acc(q₄) = 30 + 10 = 40</Code>. La matriz simétrica resultante es:
          </P>
          <Table
            headers={["AA", "A₁", "A₂", "A₃", "A₄"]}
            rows={[
              [<Bold key="a1">A₁</Bold>, "65", "25", "25", "40"],
              [<Bold key="a2">A₂</Bold>, "25", "45", "45", "0"],
              [<Bold key="a3">A₃</Bold>, "25", "45", "45", "0"],
              [<Bold key="a4">A₄</Bold>, "40", "0", "0", "40"],
            ]}
          />
          <Callout variant="note">
            Se leen dos vínculos fuertes: <Code>A₂–A₃</Code> (name, location) con afinidad <Bold>45</Bold> y{" "}
            <Code>A₁–A₄</Code> (id, salary) con afinidad <Bold>40</Bold>. En cambio <Code>A₂–A₄</Code> y{" "}
            <Code>A₃–A₄</Code> tienen afinidad <Bold>0</Bold>: nunca se piden juntos.
          </Callout>

          <Divider />

          {/* ══ 6. BEA ══ */}
          <H2 id="sec-bea">6. Agrupar atributos: Bond Energy Algorithm (BEA)</H2>
          <P>
            La matriz <Code>AA</Code> tiene los números, pero los atributos están en orden arbitrario. El{" "}
            <Bold>Bond Energy Algorithm (BEA)</Bold> <Bold>reordena filas y columnas</Bold> para que los atributos
            con alta afinidad queden <Bold>juntos</Bold>, formando bloques (clusters) claros. El resultado es la{" "}
            <Bold>matriz de afinidad agrupada (CA)</Bold>.
          </P>
          <H3>La medida que maximiza</H3>
          <P>BEA coloca cada atributo en la posición que maximiza su <Bold>contribución</Bold> al vínculo (bond):</P>
          <MathBlock>{String.raw`bond(A_x, A_y) \;=\; \sum_{z=1}^{n} aff(A_z, A_x)\cdot aff(A_z, A_y)`}</MathBlock>
          <MathBlock>{String.raw`cont(A_i, A_k, A_j) \;=\; 2\,bond(A_i, A_k) + 2\,bond(A_k, A_j) - 2\,bond(A_i, A_j)`}</MathBlock>
          <P>
            Globalmente, BEA maximiza la <Bold>medida de afinidad global (AM)</Bold>, que premia que cada celda
            tenga vecinos (arriba, abajo, izquierda, derecha) de alto valor:
          </P>
          <MathBlock>{String.raw`AM = \sum_{i}\sum_{j} aff(A_i, A_j)\bigl[\,aff(A_i, A_{j-1}) + aff(A_i, A_{j+1}) + aff(A_{i-1}, A_j) + aff(A_{i+1}, A_j)\,\bigr]`}</MathBlock>
          <Collapse title="Pseudocódigo: BEA (matriz de afinidad agrupada)" defaultOpen>
            <Pseudo>{`BEA(AA)
 // AA: matriz de afinidad n×n. Devuelve CA, la matriz agrupada.
 1  CA[·,1] = AA[·,1]                       // fija las dos primeras columnas
 2  CA[·,2] = AA[·,2]
 3  index = 3
 4  while index ≤ n
 5      for loc = 1 to index − 1            // probar cada hueco entre columnas
 6          calcular cont(A_{loc-1}, A_index, A_loc)
 7      calcular cont(A_{index-1}, A_index, A_{end})   // y el extremo derecho
 8      colocar AA[·,index] en CA en la posición de mayor cont
 9      index = index + 1
10  ordenar las filas de CA igual que las columnas
11  return CA`}</Pseudo>
          </Collapse>
          <P>
            En el ejemplo, BEA agrupa <Code>{`{A₂, A₃}`}</Code> (afinidad 45) y <Code>{`{A₁, A₄}`}</Code>{" "}
            (afinidad 40) en bloques contiguos de la diagonal.
          </P>

          <Divider />

          {/* ══ 7. PARTICION ══ */}
          <H2 id="sec-particion">7. Particionar la matriz agrupada</H2>
          <P>
            Con la matriz ya agrupada, hay que elegir <Bold>dónde cortar</Bold> para formar dos fragmentos: un
            grupo de arriba <MathInline>{String.raw`TA`}</MathInline> y uno de abajo{" "}
            <MathInline>{String.raw`BA`}</MathInline>. Para cada corte candidato clasificamos las consultas y
            maximizamos:
          </P>
          <MathBlock>{String.raw`z = CTQ \cdot CBQ - COQ^2`}</MathBlock>
          <Ul items={[
            <><MathInline>{String.raw`CTQ`}</MathInline>: suma de accesos de consultas que usan <Bold>solo</Bold> atributos de TA.</>,
            <><MathInline>{String.raw`CBQ`}</MathInline>: suma de accesos de consultas que usan <Bold>solo</Bold> atributos de BA.</>,
            <><MathInline>{String.raw`COQ`}</MathInline>: suma de accesos de consultas que usan atributos de <Bold>ambos</Bold> (las que cruzan el corte).</>,
          ]} />
          <Callout variant="example" title="Corte del ejemplo: TA = {A₁, A₄}, BA = {A₂, A₃}">
            <Ul items={[
              <><Code>q₃, q₄</Code> usan solo <Code>{`{id, salary}`}</Code> (TA) → <Code>CTQ = 30 + 10 = 40</Code>.</>,
              <><Code>q₂</Code> usa solo <Code>{`{name, location}`}</Code> (BA) → <Code>CBQ = 20</Code>.</>,
              <><Code>q₁</Code> usa id (TA) y name, location (BA) → cruza → <Code>COQ = 25</Code>.</>,
            ]} />
            <MathBlock>{String.raw`z = (40)(20) - (25)^2 = 800 - 625 = 175 > 0`}</MathBlock>
            <P>
              El corte es bueno (z positivo y máximo): pocas consultas cruzan. Los fragmentos, replicando la clave
              <Code> id</Code> en ambos, quedan:
            </P>
            <Ul items={[
              <><Code>F₁(id, salary)</Code> (la nómina vive aquí)</>,
              <><Code>F₂(id, name, location)</Code> (la ficha y el directorio viven aquí)</>,
            ]} />
          </Callout>
          <Callout variant="note">
            Solo <Code>q₁</Code> (la ficha completa) tendrá que hacer un join entre los dos fragmentos; las demás
            consultas tocan un único fragmento. Eso es exactamente lo que buscábamos: <Bold>minimizar los accesos
            que cruzan la red</Bold>.
          </Callout>

          <Divider />

          {/* ══ 8. POSTGRES ══ */}
          <H2 id="sec-postgres">8. En PostgreSQL y cierre</H2>
          <P>
            No hay un comando de fragmentación vertical: se modela con <Bold>tablas separadas que comparten la
            clave primaria</Bold> y se reconstruyen con un <Code>JOIN</Code>. Es la misma idea de separar columnas{" "}
            <Bold>calientes</Bold> (muy consultadas) de las <Bold>frías</Bold> (raras o grandes, como un BLOB).
          </P>
          <SqlCode label="Fragmentación vertical: dos tablas con la misma PK" sql={`-- F2: columnas calientes (ficha, directorio)
CREATE TABLE emp_info (
  id       int PRIMARY KEY,
  name     text,
  location text
);

-- F1: columna fría / sensible (nómina), misma clave
CREATE TABLE emp_payroll (
  id     int PRIMARY KEY REFERENCES emp_info(id),
  salary numeric
);

-- Reconstrucción (join sin pérdida) sobre la clave replicada:
SELECT i.id, i.name, i.location, p.salary
FROM   emp_info i
JOIN   emp_payroll p ON p.id = i.id;`} />
          <CompareCards
            items={[
              {
                label: "Ventajas",
                color: "#10b981",
                bg: "#051a0f",
                pros: [
                  "Las consultas tocan solo las columnas que necesitan",
                  "Aísla columnas sensibles o grandes (BLOB, salary)",
                  "Menos I/O y menos datos por la red",
                ],
                cons: ["Requiere replicar la clave en cada fragmento"],
              },
              {
                label: "Costo",
                color: "#f59e0b",
                bg: "#1c1207",
                pros: [
                  "Las consultas que cruzan fragmentos pagan un JOIN",
                  "Hay que mantener la integridad entre fragmentos",
                ],
                cons: ["Mala agrupación = muchos joins = peor que no fragmentar"],
              },
            ]}
          />
          <Callout variant="note" title="Cierre de la semana">
            La fragmentación vertical parte la tabla <Bold>por columnas</Bold> y debe cumplir{" "}
            <Bold>completitud</Bold> y <Bold>join sin pérdida</Bold> (la clave se replica; la disjunción no
            aplica). Para decidir la agrupación, la <Bold>matriz de afinidad</Bold> mide qué atributos se acceden
            juntos con la fórmula <MathInline>{String.raw`aff(A_i,A_j) = \sum use(q_k,A_i)\,use(q_k,A_j)\,acc(q_k)`}</MathInline>,
            se agrupa con <Bold>BEA</Bold> y se corta maximizando{" "}
            <MathInline>{String.raw`z = CTQ\cdot CBQ - COQ^2`}</MathInline>. La meta, como siempre en BD
            distribuidas: <Bold>poner juntos los datos que se usan juntos</Bold>.
          </Callout>

    </GuideLayout>
  );
}
