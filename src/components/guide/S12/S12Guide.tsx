"use client";

import GuideLayout from "@/components/guide/GuideLayout";

import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, CompareCards, ProsCons,
  Collapse, Pipeline, DiagramPlaceholder, MathBlock, Pseudo, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-porque",      label: "1. ¿Por qué distribuir?" },
  { id: "sec-paralelo",    label: "2. Paralelo vs distribuido" },
  { id: "sec-quees",       label: "3. ¿Qué es un sistema distribuido?" },
  { id: "sec-propiedades", label: "4. Un buen sistema distribuido" },
  { id: "sec-bdd",         label: "5. BDD y SGBDD" },
  { id: "sec-diseno",      label: "6. Diseño: top-down y bottom-up" },
  { id: "sec-problemas",   label: "7. Fragmentación y asignación" },
  { id: "sec-tipos",       label: "8. Tipos de fragmentación" },
  { id: "sec-correctitud", label: "9. Reglas de correctitud" },
  { id: "sec-phf",         label: "10. Fragmentación horizontal primaria" },
  { id: "sec-derivada",    label: "11. Fragmentación horizontal derivada" },
  { id: "sec-asignacion",  label: "12. Asignación (allocation)" },
];


/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents (con toggle ocultar/mostrar)
   ───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   S12 Guide — Bases de Datos Distribuidas y Fragmentación Horizontal
   ───────────────────────────────────────────────────────────────────────────── */
export default function S12Guide() {
  return (
    <GuideLayout sections={SECTIONS}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 12 · Módulo III · BD Distribuidas
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Bases de Datos Distribuidas y Fragmentación Horizontal
            </h1>
            <P>
              Arranca el <Bold>Módulo III</Bold>. Cuando los datos y la carga crecen más rápido que cualquier
              máquina, una sola BD deja de alcanzar: necesitamos <Bold>varias máquinas que cooperen</Bold>.
              Veremos qué es un sistema distribuido, qué propiedades debe cumplir un buen diseño, y el primer
              gran problema del diseño de una BD distribuida: <Bold>cómo dividir los datos (fragmentación)</Bold> y{" "}
              <Bold>dónde ubicar cada fragmento (asignación)</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Hilo de la semana">
            Crecimiento de datos y escala → paralelo vs distribuido → qué es (y qué cuesta) un sistema
            distribuido → las 5 propiedades de un buen sistema → BDD/SGBDD y transparencia → diseño top-down vs
            bottom-up → los dos problemas: fragmentación + asignación → fragmentación horizontal (primaria y
            derivada).
          </Callout>

          <Divider />

          {/* ══ 1. POR QUÉ ══ */}
          <H2 id="sec-porque">1. ¿Por qué bases de datos distribuidas?</H2>
          <P>
            El volumen de datos crece sin freno (tráfico de internet en petabytes por día, modelos con billones
            de parámetros). Cada aplicación es distinta: datos <Bold>estructurados</Bold> (SQL, JSON, CSV) o{" "}
            <Bold>no estructurados</Bold> (texto, imágenes, video), y procesamientos muy variados (indexación,
            NLP, minería de datos). Pero todas comparten un factor común: <Bold>la escala</Bold>.
          </P>
          <Callout variant="warning" title="La escala es el factor común">
            Tengo un algoritmo y una máquina que procesa 1000 elementos por hora. Si compro una máquina{" "}
            <Bold>n veces más potente</Bold>, ¿cuántos elementos proceso? <Bold>Depende del algoritmo.</Bold> Si
            es <Code>O(n)</Code>, escala lineal; si es <Code>O(n²)</Code> o peor, comprar hardware más rápido casi
            no ayuda. En algún punto, una sola máquina (por más potente que sea) no alcanza.
          </Callout>
          <P>
            La salida es <Bold>dividir el trabajo entre muchas máquinas</Bold>. Google en 1998 corría sobre PCs
            de escritorio apilados; en 2014, sobre centros de datos enteros. La misma idea: más máquinas
            cooperando en lugar de una sola gigante.
          </P>

          <Divider />

          {/* ══ 2. PARALELO VS DISTRIBUIDO ══ */}
          <H2 id="sec-paralelo">2. Monolítico, paralelo y distribuido</H2>
          <P>
            Hay dos formas de ganar potencia: <Bold>una máquina n veces más poderosa</Bold> (monolítico) o{" "}
            <Bold>n máquinas igual de poderosas</Bold> trabajando juntas. La segunda es el camino distribuido.
          </P>
          <CompareCards
            items={[
              {
                label: "Sistema PARALELO",
                color: "#f59e0b",
                bg: "#1c1207",
                pros: [
                  "Varios procesadores en una sola máquina",
                  "Generalmente memoria compartida (shared memory)",
                  "Comunicación muy rápida entre procesos",
                ],
                cons: [
                  "Límite físico de una sola máquina",
                  "La memoria compartida es un cuello de botella",
                ],
              },
              {
                label: "Sistema DISTRIBUIDO",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: [
                  "Varias máquinas independientes en red",
                  "Generalmente NO comparten memoria (shared nothing)",
                  "Escala agregando más máquinas",
                ],
                cons: [
                  "Comunicación por red (lenta y falible)",
                  "Coordinación y consistencia más difíciles",
                ],
              },
            ]}
          />
          <Callout variant="note" title="Shared memory vs shared nothing">
            En un sistema <Bold>paralelo</Bold>, varios procesadores acceden a la misma memoria. En un sistema{" "}
            <Bold>distribuido</Bold>, cada nodo tiene su propio procesador y su propia memoria, y se comunican
            enviando mensajes por la red.
          </Callout>

          <Divider />

          {/* ══ 3. QUÉ ES ══ */}
          <H2 id="sec-quees">3. ¿Qué es un sistema distribuido?</H2>
          <Callout variant="definition" title="Definición">
            Un <Bold>sistema distribuido</Bold> es un sistema que permite que una <Bold>colección de
            computadoras independientes</Bold> se comunique para resolver un <Bold>objetivo común</Bold>.
          </Callout>
          <P>
            Para resolver ese objetivo hay que <Bold>repartir las tareas entre muchas máquinas</Bold>, y esas
            máquinas necesitan comunicarse... pero <Bold>no demasiado</Bold>. La comunicación tiene un costo, y no
            todos los recursos cuestan igual.
          </P>

          <H3>El costo de transporte de datos</H3>
          <P>De forma simplificada, mover datos cuesta muy distinto según dónde estén:</P>
          <Pipeline steps={[
            { label: "Main Memory", sub: "barato", color: "#10b981" },
            { label: "CPU", sub: "barato", color: "#10b981" },
            { label: "Disk", sub: "barato", color: "#84cc16" },
            { label: "Network", sub: "CARO", color: "#ef4444" },
          ]} />
          <Callout variant="warning" title="Minimizar el costo de red">
            La <Bold>red</Bold> es el recurso más caro de un sistema distribuido. Toda la teoría que sigue
            (fragmentación, asignación, optimización de consultas) persigue el mismo objetivo:{" "}
            <Bold>mover por la red la menor cantidad de datos posible</Bold>.
          </Callout>

          <H3>Ventajas y desventajas</H3>
          <ProsCons
            pros={[
              "Costo: mejor relación desempeño/precio que una sola máquina gigante",
              "Extensibilidad: agregar otra máquina es sencillo",
              "Confiabilidad: idealmente no hay un punto central de fallo",
              "Carga de trabajo: se balancea entre nodos",
              "Compartido: acceso remoto a servicios y datos",
            ]}
            cons={[
              "Software: requiere programas especiales (más complejos)",
              "Redes: la comunicación puede ser lenta",
              "Mantenimiento: depurar hardware/software distribuido es difícil",
              "Seguridad: múltiples usuarios y accesos remotos",
              "Paralelización: no siempre el problema se puede dividir",
            ]}
          />

          <Divider />

          {/* ══ 4. PROPIEDADES ══ */}
          <H2 id="sec-propiedades">4. Las 5 propiedades de un buen sistema distribuido</H2>
          <P>
            Un buen sistema distribuido debe <Bold>parecer uno solo</Bold> y comportarse bien bajo carga y bajo
            fallos. El deck destaca cinco propiedades:
          </P>
          <Table
            headers={["Propiedad", "Qué busca", "Cómo se logra"]}
            rows={[
              ["Transparencia", "Dar la impresión de un solo sistema", "Direcciones abstractas, APIs, ocultar acceso/ubicación/heterogeneidad/concurrencia"],
              ["Flexibilidad", "Agregar o quitar máquinas rápido y fácil", "Replicación, software independiente de plataforma, heart-beats, balanceo de carga"],
              ["Confiabilidad", "Evitar fallos y seguir trabajando ante uno", "Replicación, enrutamiento flexible, seguridad, protocolos de consenso"],
              ["Desempeño", "Hacer las cosas rápido (baja latencia)", "Optimización de red, recursos computacionales suficientes"],
              ["Escalabilidad", "Crecer la infraestructura sin degradarse", "Peer-to-peer, comunicación directa, índices distribuidos"],
            ]}
          />
          <Callout variant="note" title="Transparencia: la propiedad central">
            El usuario debe ver la colección de máquinas <Bold>como si fuera un solo sistema</Bold>. Se le oculta:
            cómo se accede a cada máquina (acceso), dónde están físicamente (ubicación), que tengan distinto
            hardware/software (heterogeneidad) y que varios usuarios accedan a la vez (concurrencia).
          </Callout>
          <Callout variant="warning" title="Cuidado con la escalabilidad">
            Dos enemigos de la escalabilidad: <Bold>cuellos de botella</Bold> (confiar demasiado en una sola
            parte) y los <Bold>mensajes por pares</Bold>, que crecen <Code>O(n²)</Code> con el número de nodos.
            Por eso se prefiere comunicación directa peer-to-peer e índices distribuidos.
          </Callout>

          <Divider />

          {/* ══ 5. BDD Y SGBDD ══ */}
          <H2 id="sec-bdd">5. Base de datos distribuida (BDD) y SGBD distribuido</H2>
          <Callout variant="definition" title="Definiciones">
            <Ul items={[
              <><Bold>Base de datos distribuida (BDD):</Bold> varias bases de datos <Bold>interrelacionadas
                lógicamente</Bold> y situadas en <Bold>diferentes nodos</Bold> de una red de computadoras.</>,
              <><Bold>SGBD distribuido:</Bold> el software que gestiona la BDD de forma <Bold>transparente</Bold>{" "}
                para el usuario. El usuario ve las bases como si fueran <Bold>una sola BD centralizada</Bold>.</>,
            ]} />
          </Callout>
          <P>La transparencia que ofrece un SGBD distribuido tiene varias caras:</P>
          <Ul items={[
            <><Bold>Localización transparente de los datos:</Bold> consultas sin saber en qué nodo está cada dato.</>,
            <><Bold>Transparencia de nombres:</Bold> un objeto se nombra igual sin importar dónde resida.</>,
            <><Bold>Transparencia de fragmentación:</Bold> el usuario consulta la relación completa aunque esté
              partida en fragmentos repartidos por la red.</>,
          ]} />
          <Callout variant="note" title="Tópicos del módulo">
            El Módulo III recorre tres bloques: (1) <Bold>diseño de la BDD</Bold> (fragmentación horizontal y
            vertical), (2) <Bold>procesamiento de consultas distribuidas</Bold> (descomposición, localización,
            optimización) y (3) <Bold>NoSQL</Bold> (MongoDB, Cassandra, Redis). Esta semana abre el bloque (1).
          </Callout>

          <Divider />

          {/* ══ 6. DISEÑO ══ */}
          <H2 id="sec-diseno">6. Diseño de una BDD: top-down y bottom-up</H2>
          <P>
            <Bold>Fragmentar</Bold> es decidir <Bold>dónde situar las partes</Bold> de la base de datos
            distribuida. Hay dos enfoques de diseño, según si la BDD se construye desde cero o integrando bases
            que ya existen.
          </P>
          <CompareCards
            items={[
              {
                label: "TOP-DOWN",
                color: "#8b5cf6",
                bg: "#1a0a2e",
                pros: [
                  "Se diseña desde cero (pizarra en blanco)",
                  "Similar al diseño de una BD centralizada",
                  "Se controla el esquema global completo",
                ],
                cons: [
                  "Aparecen problemas de diseño: ¿cómo fragmentar y dónde asignar?",
                  "Requiere conocer de antemano datos y consultas",
                ],
              },
              {
                label: "BOTTOM-UP",
                color: "#10b981",
                bg: "#051a0f",
                pros: [
                  "Ya existen múltiples bases en distintos sitios",
                  "Se integran esquemas locales en un esquema unificado",
                  "No hay problema de diseño de fragmentación",
                ],
                cons: [
                  "El reto es la integración de esquemas heterogéneos",
                  "Esquemas de exportación y mapeos por cada base local",
                ],
              },
            ]}
          />
          <Callout variant="note" title="Bottom-up: integración de esquemas">
            Cada base local tiene su <Bold>esquema conceptual local</Bold>; se publica un <Bold>esquema de
            exportación</Bold> y mediante <Bold>integración de esquemas</Bold> se construye un <Bold>esquema
            unificado</Bold>. Como las bases ya existen, no hay problema de fragmentación: el reto es integrarlas.
          </Callout>
          <Callout variant="note" title="Top-down: el flujo de diseño">
            Requisitos → diseño conceptual y de vistas → esquema global y esquema externo →{" "}
            <Bold>diseño de la distribución</Bold> → esquemas locales → diseño físico → monitoreo (con feedback).
            El paso clave, el que nos interesa, es el <Bold>diseño de la distribución</Bold>.
          </Callout>

          <Divider />

          {/* ══ 7. PROBLEMAS ══ */}
          <H2 id="sec-problemas">7. Los dos problemas: fragmentación y asignación</H2>
          <P>En el diseño top-down de la distribución aparecen dos problemas nuevos:</P>
          <Pipeline steps={[
            { label: "Fragmentación", sub: "¿cómo dividimos los datos?", color: "#3b82f6" },
            { label: "Asignación", sub: "¿dónde va cada fragmento?", color: "#10b981" },
          ]} />
          <Ul items={[
            <><Bold>Fragmentación:</Bold> ¿cómo dividimos los datos en pedazos (fragmentos)?</>,
            <><Bold>Asignación (allocation):</Bold> ¿en qué sitio/nodo debe ir cada fragmento?</>,
          ]} />
          <Callout variant="warning" title="No son independientes (pero los vemos por separado)">
            Cómo fragmentar y dónde asignar están relacionados (la mejor fragmentación depende de dónde se van a
            usar los datos). Aun así, por claridad, el diseño los aborda <Bold>por separado</Bold>: primero
            fragmentación, luego asignación.
          </Callout>

          <Divider />

          {/* ══ 8. TIPOS ══ */}
          <H2 id="sec-tipos">8. Tipos de fragmentación</H2>
          <P>
            Pensemos en una relación como una <Bold>tabla</Bold>. Fragmentarla es partir esa tabla en pedazos que
            se repartirán por la red. Hay tres formas de cortar:
          </P>
          <Table
            headers={["Tipo", "Cómo corta", "Operador relacional"]}
            rows={[
              ["Horizontal", "Por filas (tuplas): cada fragmento es un subconjunto de filas", "Selección σ"],
              ["Vertical", "Por columnas (atributos): cada fragmento tiene un subconjunto de columnas + la clave", "Proyección π"],
              ["Mixta (híbrida)", "Combina ambas: fragmentos horizontales que luego se cortan en vertical (o al revés)", "σ y π"],
            ]}
          />
          <CompareCards
            items={[
              {
                label: "Horizontal",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: [
                  "Cada nodo guarda las filas que más usa (ej. clientes de su región)",
                  "Se reconstruye con UNIÓN de fragmentos",
                ],
                cons: ["Las consultas que cruzan fragmentos pagan red"],
              },
              {
                label: "Vertical",
                color: "#f59e0b",
                bg: "#1c1207",
                pros: [
                  "Separa columnas calientes de frías (hot/cold)",
                  "Se reconstruye con JOIN sobre la clave",
                ],
                cons: ["Hay que repetir la clave en cada fragmento"],
              },
            ]}
          />
          <Callout variant="note">
            Esta semana nos centramos en la <Bold>fragmentación horizontal</Bold>, que es por filas. La vertical
            (por columnas) y la mixta se tratan en el deck siguiente.
          </Callout>

          <Divider />

          {/* ══ 9. CORRECTITUD ══ */}
          <H2 id="sec-correctitud">9. Reglas de correctitud de la fragmentación</H2>
          <P>
            No se puede fragmentar de cualquier manera. Para que la fragmentación sea <Bold>correcta</Bold> (que
            no se pierda ni se duplique información) debe cumplir <Bold>tres reglas</Bold>:
          </P>
          <Callout variant="definition" title="Las 3 reglas">
            <Ul items={[
              <><Bold>1. Completitud:</Bold> cada ítem de datos de la relación <Code>R</Code> debe estar en{" "}
                <Bold>al menos un</Bold> fragmento. No se pierde nada. (En horizontal: cada tupla; en vertical:
                cada atributo.)</>,
              <><Bold>2. Reconstrucción:</Bold> debe existir una operación que <Bold>recupere</Bold> la relación
                original a partir de sus fragmentos.</>,
              <><Bold>3. Disjunción:</Bold> los fragmentos no deben <Bold>solaparse</Bold> (un mismo dato no está
                repetido en dos fragmentos). En vertical, la clave es la excepción: se repite a propósito para
                poder reconstruir.</>,
            ]} />
          </Callout>
          <H3>Cómo se reconstruye cada tipo</H3>
          <P>La regla de reconstrucción se concreta con un operador distinto según el tipo:</P>
          <MathBlock>{String.raw`\text{Horizontal:}\quad R = R_1 \cup R_2 \cup \dots \cup R_w \qquad\text{(unión)}`}</MathBlock>
          <MathBlock>{String.raw`\text{Vertical:}\quad R = R_1 \bowtie R_2 \bowtie \dots \bowtie R_w \qquad\text{(join sobre la clave)}`}</MathBlock>
          <Callout variant="note" title="Regla de oro">
            <Bold>Completitud</Bold> garantiza que no se pierde información, <Bold>reconstrucción</Bold> que se
            puede volver a armar la tabla original, y <Bold>disjunción</Bold> que no hay redundancia innecesaria.
          </Callout>

          <Divider />

          {/* ══ 10. PHF ══ */}
          <H2 id="sec-phf">10. Fragmentación horizontal primaria (PHF)</H2>
          <P>
            La <Bold>fragmentación horizontal primaria</Bold> (PHF) parte una relación según predicados de{" "}
            <Bold>sus propios atributos</Bold>: cada fragmento es una <Bold>selección</Bold> sobre la tabla.
          </P>

          <H3>Predicados simples</H3>
          <Callout variant="definition" title="Predicado simple">
            Un <Bold>predicado simple</Bold> tiene la forma <Code>atributo θ valor</Code>, donde{" "}
            <Code>θ ∈ {`{=, <, ≤, >, ≥, ≠}`}</Code>. Ejemplos: <Code>ciudad = &apos;Lima&apos;</Code>,{" "}
            <Code>saldo {`>`} 5000</Code>.
          </Callout>
          <P>
            Llamamos <Code>Pr = {`{p₁, p₂, …, pₘ}`}</Code> al conjunto de predicados simples sobre los que vamos a
            fragmentar.
          </P>

          <H3>Predicados mintérmino (minterms)</H3>
          <P>
            Un <Bold>predicado mintérmino</Bold> es la <Bold>conjunción</Bold> de todos los predicados simples,
            cada uno en su forma <Bold>normal</Bold> o <Bold>negada</Bold>. Cada combinación define un fragmento:
          </P>
          <MathBlock>{String.raw`m_i = \bigwedge_{p_k \in Pr} p_k^{*}, \qquad p_k^{*} \in \{\, p_k,\; \neg p_k \,\}`}</MathBlock>
          <P>
            Cada fragmento es la selección de la relación con su mintérmino:{" "}
            <Code>Rᵢ = σ<sub>mᵢ</sub>(R)</Code>.
          </P>

          <Callout variant="example" title="Ejemplo: fragmentar CLIENTE por ciudad">
            <P>
              Sea <Code>CLIENTE(cid, nombre, ciudad, saldo)</Code> y dos predicados simples:
            </P>
            <Ul items={[
              <><Code>p₁: ciudad = &apos;Lima&apos;</Code></>,
              <><Code>p₂: ciudad = &apos;Arequipa&apos;</Code></>,
            ]} />
            <P>Los mintérminos que tienen sentido producen dos fragmentos:</P>
            <Ul items={[
              <><Code>CLIENTE₁ = σ<sub>ciudad=&apos;Lima&apos;</sub>(CLIENTE)</Code></>,
              <><Code>CLIENTE₂ = σ<sub>ciudad=&apos;Arequipa&apos;</sub>(CLIENTE)</Code></>,
            ]} />
            <P>
              Cada nodo guarda los clientes de su ciudad. La relación se reconstruye con{" "}
              <Code>CLIENTE = CLIENTE₁ ∪ CLIENTE₂</Code>.
            </P>
          </Callout>

          <H3>Completitud y minimalidad del conjunto de predicados</H3>
          <P>
            No cualquier conjunto de predicados sirve. Antes de generar los mintérminos, <Code>Pr</Code> debe ser{" "}
            <Bold>completo</Bold> y <Bold>mínimo</Bold>:
          </P>
          <Ul items={[
            <><Bold>Completo:</Bold> dos tuplas que caen en el mismo fragmento deben ser accedidas{" "}
              <Bold>de la misma manera</Bold> por toda aplicación. Si una aplicación distingue entre dos tuplas
              del mismo fragmento, falta un predicado que las separe.</>,
            <><Bold>Mínimo:</Bold> todo predicado debe ser <Bold>relevante</Bold>, es decir, debe influir en cómo
              se fragmenta (debe haber al menos una aplicación que acceda distinto a los dos fragmentos que ese
              predicado genera). Si un predicado no cambia nada, sobra.</>,
          ]} />
          <Callout variant="note" title="Regla de partición (Rule 1)">
            Una relación o fragmento se parte en al menos dos pedazos que son <Bold>accedidos de forma
            distinta</Bold> por al menos una aplicación. Si dividir no cambia cómo se accede a los datos, esa
            división no aporta.
          </Callout>

          <H3>Algoritmos (Özsu &amp; Valduriez)</H3>
          <P>
            El algoritmo <Code>COM-MIN</Code> toma un conjunto de predicados y devuelve uno{" "}
            <Bold>completo y mínimo</Bold>; luego <Code>PHORIZONTAL</Code> genera los mintérminos y descarta los
            contradictorios.
          </P>
          <Collapse title="Pseudocódigo: COM-MIN (conjunto completo y mínimo)" defaultOpen>
            <Pseudo>{`COM-MIN(R, Pr)
 // R: relación;  Pr: conjunto de predicados simples
 // Regla 1: todo fragmento se accede distinto por ≥ 1 aplicación
 1  encontrar pᵢ ∈ Pr que particione R según la Regla 1
 2  Pr' = {pᵢ}
 3  Pr  = Pr − {pᵢ}
 4  F   = {fᵢ}                       // fᵢ: fragmento definido por pᵢ
 5  repeat
 6      encontrar pⱼ ∈ Pr que particione algún fₖ de Pr' según la Regla 1
 7      Pr' = Pr' ∪ {pⱼ}
 8      Pr  = Pr  − {pⱼ}
 9      F   = F   ∪ {fⱼ}
10      if ∃ pₖ ∈ Pr' que es no relevante
11          Pr' = Pr' − {pₖ}
12          F   = F   − {fₖ}
13  until Pr' es completo
14  return Pr'`}</Pseudo>
          </Collapse>
          <Collapse title="Pseudocódigo: PHORIZONTAL (genera los fragmentos)">
            <Pseudo>{`PHORIZONTAL(R, Pr)
 // genera el conjunto M de predicados mintérmino
 1  Pr' = COM-MIN(R, Pr)
 2  determinar el conjunto M de predicados mintérmino
 3  determinar el conjunto I de implicaciones entre pᵢ ∈ Pr'
 4  for each mᵢ ∈ M
 5      if mᵢ es contradictorio según I
 6          M = M − {mᵢ}
 7  return M`}</Pseudo>
            <P>
              Las <Bold>implicaciones</Bold> (<Code>I</Code>) descartan mintérminos imposibles: por ejemplo,{" "}
              <Code>ciudad = &apos;Lima&apos; ∧ ciudad = &apos;Arequipa&apos;</Code> es contradictorio y se elimina.
            </P>
          </Collapse>

          <H3>En PostgreSQL: particionamiento declarativo</H3>
          <P>
            La fragmentación horizontal por predicados se modela directamente con <Code>PARTITION BY</Code>. Por
            lista (equivale a predicados de igualdad):
          </P>
          <SqlCode label="Fragmentación horizontal por LIST" sql={`CREATE TABLE cliente (
  cid    int,
  nombre text,
  ciudad text,
  saldo  numeric
) PARTITION BY LIST (ciudad);

-- cada partición es un fragmento horizontal: σ(ciudad = ...)
CREATE TABLE cliente_lima     PARTITION OF cliente FOR VALUES IN ('Lima');
CREATE TABLE cliente_arequipa PARTITION OF cliente FOR VALUES IN ('Arequipa');`} />
          <P>También se puede fragmentar por <Bold>rango</Bold> o por <Bold>hash</Bold>:</P>
          <SqlCode label="Por RANGE (rangos de un atributo) y por HASH" sql={`-- Por rango: σ(saldo entre a y b)
CREATE TABLE cliente_r (cid int, saldo numeric) PARTITION BY RANGE (saldo);
CREATE TABLE cliente_bajo  PARTITION OF cliente_r FOR VALUES FROM (0)     TO (5000);
CREATE TABLE cliente_alto  PARTITION OF cliente_r FOR VALUES FROM (5000)  TO (1000000);

-- Por hash: reparte uniformemente (no por predicado de negocio)
CREATE TABLE cliente_h (cid int) PARTITION BY HASH (cid);
CREATE TABLE cliente_h0 PARTITION OF cliente_h FOR VALUES WITH (MODULUS 2, REMAINDER 0);
CREATE TABLE cliente_h1 PARTITION OF cliente_h FOR VALUES WITH (MODULUS 2, REMAINDER 1);`} />

          <Divider />

          {/* ══ 11. DERIVADA ══ */}
          <H2 id="sec-derivada">11. Fragmentación horizontal derivada</H2>
          <P>
            A veces conviene fragmentar una tabla <Bold>según cómo se fragmentó otra</Bold>, para que las tuplas
            relacionadas (típicamente unidas por una clave foránea) <Bold>queden en el mismo nodo</Bold> y los{" "}
            <Code>JOIN</Code> se resuelvan localmente, sin pagar red.
          </P>
          <Callout variant="definition" title="Fragmentación derivada">
            La <Bold>fragmentación horizontal derivada</Bold> de una relación <Bold>miembro</Bold> se define a
            partir de los fragmentos de una relación <Bold>propietaria (owner)</Bold>, usando un{" "}
            <Bold>semijoin</Bold>:
          </Callout>
          <MathBlock>{String.raw`R_i = R \ltimes S_i, \qquad i = 1, \dots, w`}</MathBlock>
          <Ul items={[
            <><Code>S</Code> es la relación <Bold>owner</Bold> (ya fragmentada en <Code>S₁, …, S_w</Code>).</>,
            <><Code>R</Code> es la relación <Bold>miembro</Bold> que se fragmenta.</>,
            <><Code>⋉</Code> es el <Bold>semijoin</Bold>: se quedan las tuplas de <Code>R</Code> que hacen match
              con el fragmento <Code>Sᵢ</Code> del owner.</>,
          ]} />
          <Callout variant="example" title="Ejemplo: fragmentar PEDIDO según CLIENTE">
            <P>
              Ya tenemos <Code>CLIENTE</Code> fragmentado por ciudad (sección 10). Queremos que cada nodo guarde
              también <Bold>los pedidos de sus clientes</Bold>. Sea <Code>PEDIDO(pid, cid, monto, fecha)</Code>{" "}
              con <Code>cid</Code> apuntando a <Code>CLIENTE</Code>:
            </P>
            <Ul items={[
              <><Code>PEDIDO₁ = PEDIDO ⋉ CLIENTE₁</Code> (pedidos de clientes de Lima)</>,
              <><Code>PEDIDO₂ = PEDIDO ⋉ CLIENTE₂</Code> (pedidos de clientes de Arequipa)</>,
            ]} />
            <P>
              Ahora el <Code>JOIN</Code> entre clientes y sus pedidos <Bold>se resuelve dentro de cada nodo</Bold>,
              sin mover datos por la red.
            </P>
          </Callout>
          <SqlCode label="Semijoin: las tuplas de PEDIDO que hacen match con un fragmento de CLIENTE" sql={`-- PEDIDO_1 = PEDIDO ⋉ CLIENTE_1
SELECT p.*
FROM   pedido p
WHERE  p.cid IN (SELECT c.cid FROM cliente c WHERE c.ciudad = 'Lima');`} />
          <Callout variant="note" title="Lo que necesita la fragmentación derivada">
            Para definirla hacen falta tres cosas: el <Bold>conjunto de fragmentos del owner</Bold>, la{" "}
            <Bold>relación miembro</Bold>, y la <Bold>condición de join</Bold> (el link owner-member, casi
            siempre la relación clave primaria - clave foránea).
          </Callout>

          <Divider />

          {/* ══ 12. ASIGNACIÓN ══ */}
          <H2 id="sec-asignacion">12. Asignación (allocation)</H2>
          <P>
            Una vez decididos los fragmentos, hay que resolver el segundo problema:{" "}
            <Bold>en qué nodo(s) colocar cada fragmento</Bold>. Hay dos grandes estrategias:
          </P>
          <CompareCards
            items={[
              {
                label: "NO replicado (partitioned)",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: [
                  "Cada fragmento vive en un solo nodo",
                  "Sin costo de mantener copias sincronizadas",
                  "Escrituras simples (un solo lugar)",
                ],
                cons: [
                  "Si el nodo cae, ese fragmento no está disponible",
                  "Las lecturas remotas pagan red",
                ],
              },
              {
                label: "Replicado",
                color: "#10b981",
                bg: "#051a0f",
                pros: [
                  "Copias en varios nodos: lecturas locales y rápidas",
                  "Tolerancia a fallos (alta disponibilidad)",
                ],
                cons: [
                  "Las escrituras deben propagarse a todas las copias",
                  "Costo de mantener consistencia",
                ],
              },
            ]}
          />
          <Callout variant="warning" title="El trade-off lectura vs escritura">
            La <Bold>replicación favorece las lecturas</Bold> (cada nodo tiene su copia local) pero{" "}
            <Bold>penaliza las escrituras</Bold> (hay que actualizar todas las copias). La decisión depende de la
            proporción de lecturas y escrituras de la aplicación.
          </Callout>
          <P>Para decidir la asignación se necesita información de cuatro fuentes:</P>
          <Ul items={[
            <><Bold>De la base:</Bold> tamaño de cada fragmento, selectividad de los predicados.</>,
            <><Bold>De la aplicación:</Bold> qué consultas hay, con qué frecuencia y desde qué sitios se lanzan.</>,
            <><Bold>Del sitio:</Bold> capacidad de almacenamiento y de procesamiento de cada nodo.</>,
            <><Bold>De la red:</Bold> costo de comunicación entre nodos (el recurso caro).</>,
          ]} />
          <DiagramPlaceholder label="Diagrama: fragmentos CLIENTE_1/PEDIDO_1 → Nodo Lima, CLIENTE_2/PEDIDO_2 → Nodo Arequipa (datos junto a quien los usa)" height={170} />

          <Callout variant="note" title="Cierre de la semana">
            Distribuir nace de la <Bold>escala</Bold>: cuando una máquina no alcanza, varias cooperan. Un buen
            sistema distribuido es <Bold>transparente</Bold> y minimiza el <Bold>costo de red</Bold>. El diseño
            top-down de una BDD plantea dos problemas: <Bold>fragmentar</Bold> (horizontal primaria por
            predicados mintérmino, o derivada por semijoin, siempre cumpliendo completitud, reconstrucción y
            disjunción) y <Bold>asignar</Bold> (replicado vs no replicado, según el patrón de lecturas y
            escrituras). La meta siempre es la misma: <Bold>poner los datos cerca de quien los usa</Bold>.
          </Callout>

    </GuideLayout>
  );
}
