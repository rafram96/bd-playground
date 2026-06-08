"use client";

import {
  H2, H3, P, Bold, Code, Callout, Divider, Ul, Ol, Table, SqlCode, MathBlock,
} from "@/components/guide/blocks";

export default function FuncionalDepsGuide() {
  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Utilidades · Diseño relacional
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
            Dependencias Funcionales
          </h1>
          <P>
            Las <Bold>dependencias funcionales (DF)</Bold> son la base teórica del diseño relacional:
            permiten detectar redundancias, guiar la normalización y justificar la fragmentación. Esta
            página resume qué son, sus reglas (axiomas de Armstrong), el cierre de atributos y los conceptos
            de superclave y atributo primo.
          </P>
        </div>

        <Divider />

        {/* ── 1. Qué son ── */}
        <H2>¿Qué son las Dependencias Funcionales?</H2>
        <P>
          En un esquema relacional, un conjunto de atributos <Code>X</Code> <Bold>determina funcionalmente</Bold>{" "}
          a un conjunto <Code>Y</Code> (se denota <Code>X → Y</Code>) si:
        </P>
        <Callout variant="definition" title="Regla de la dependencia funcional X → Y">
          Siempre que dos tuplas tengan el <Bold>mismo valor en X</Bold>, también tendrán el{" "}
          <Bold>mismo valor en Y</Bold>.
        </Callout>
        <P><Bold>Ejemplo.</Bold> En la relación:</P>
        <SqlCode label="Relación y dependencia" sql={`Empleado(id_emp, nombre, salario, depto)

id_emp → nombre, salario, depto`} />
        <P>
          Esto significa que <Bold>el ID del empleado determina de forma única</Bold> los demás atributos:
          no puede haber dos empleados con el mismo <Code>id_emp</Code> pero distinto <Code>nombre</Code>,{" "}
          <Code>salario</Code> o <Code>depto</Code>.
        </P>

        <Divider />

        {/* ── 2. Para qué sirven ── */}
        <H2>¿Para qué sirven?</H2>
        <Ul items={[
          <>Detectar <Bold>redundancias</Bold>.</>,
          <>Evaluar la <Bold>normalización</Bold> (1FN, 2FN, 3FN, BCNF).</>,
          <>Diseñar esquemas <Bold>correctos y eficientes</Bold>.</>,
          <>Guiar la <Bold>fragmentación vertical</Bold> (Módulo III).</>,
        ]} />

        <Divider />

        {/* ── 3. Axiomas de Armstrong ── */}
        <H2>Axiomas de Armstrong</H2>
        <P>
          Son las <Bold>reglas fundamentales</Bold> para deducir nuevas DF a partir de un conjunto dado.
          Las tres primarias:
        </P>
        <MathBlock>{String.raw`\begin{aligned}
          \textbf{Reflexividad:} &\quad Y \subseteq X \;\Rightarrow\; X \rightarrow Y \\[4pt]
          \textbf{Aumentación:} &\quad X \rightarrow Y \;\Rightarrow\; XZ \rightarrow YZ \\[4pt]
          \textbf{Transitividad:} &\quad (X \rightarrow Y)\,\wedge\,(Y \rightarrow Z) \;\Rightarrow\; X \rightarrow Z
        \end{aligned}`}</MathBlock>
        <Ul items={[
          <><Bold>Reflexividad:</Bold> <Code>{`{A, B} → A`}</Code> (un conjunto determina a sus subconjuntos).</>,
          <><Bold>Aumentación:</Bold> si <Code>A → B</Code>, entonces <Code>AC → BC</Code>.</>,
          <><Bold>Transitividad:</Bold> si <Code>A → B</Code> y <Code>B → C</Code>, entonces <Code>A → C</Code>.</>,
        ]} />

        <H3>Reglas derivadas</H3>
        <MathBlock>{String.raw`\begin{aligned}
          \textbf{Unión:} &\quad (X\rightarrow Y)\,\wedge\,(X\rightarrow Z) \;\Rightarrow\; X \rightarrow YZ \\[4pt]
          \textbf{Descomposición:} &\quad X \rightarrow YZ \;\Rightarrow\; (X\rightarrow Y)\,\wedge\,(X\rightarrow Z) \\[4pt]
          \textbf{Pseudo-transitividad:} &\quad (X\rightarrow Y)\,\wedge\,(WY\rightarrow Z) \;\Rightarrow\; WX \rightarrow Z
        \end{aligned}`}</MathBlock>

        <Divider />

        {/* ── 4. Clausura ── */}
        <H2>Cierre de atributos (X⁺)</H2>
        <P>
          La <Bold>clausura de X</Bold>, denotada <Code>X⁺</Code>, es el conjunto de <Bold>todos los atributos
          que X determina funcionalmente</Bold> dado un conjunto de DF. Sirve para:
        </P>
        <Ul items={[
          <>Determinar si <Bold>X es una superclave</Bold> (si <Code>X⁺</Code> = todos los atributos).</>,
          <>Ver si una DF como <Code>X → A</Code> se <Bold>deduce</Bold> del conjunto de DF.</>,
          <>Verificar <Bold>equivalencia de esquemas</Bold>.</>,
        ]} />

        <Callout variant="example" title="Calcular el cierre de A">
          <P>Dadas las DF: <Code>A → B</Code>, <Code>B → C</Code>, <Code>C → D</Code>. ¿Cuál es <Code>A⁺</Code>?</P>
          <MathBlock>{String.raw`\begin{aligned}
            A^{+} &= \{A\} \\
            A \rightarrow B &\;\Rightarrow\; A^{+} = \{A, B\} \\
            B \rightarrow C &\;\Rightarrow\; A^{+} = \{A, B, C\} \\
            C \rightarrow D &\;\Rightarrow\; A^{+} = \{A, B, C, D\}
          \end{aligned}`}</MathBlock>
          <P>
            Como <Code>A⁺</Code> incluye <Bold>todos</Bold> los atributos de la relación,{" "}
            <Bold>A es una clave candidata</Bold>.
          </P>
        </Callout>

        <Divider />

        {/* ── 5. Superclave ── */}
        <H2>Superclave</H2>
        <Callout variant="definition" title="Definición">
          Una <Bold>superclave</Bold> es cualquier conjunto de atributos que identifica de manera{" "}
          <Bold>única</Bold> cada tupla de una relación. Puede contener atributos adicionales innecesarios
          (no mínimos). Toda clave primaria es superclave, pero <Bold>no toda superclave es clave primaria</Bold>.
        </Callout>
        <P><Bold>Ejemplo.</Bold> Relación <Code>Empleado(id_emp, nombre, email, depto)</Code> con <Code>id_emp</Code> como clave primaria:</P>
        <Ul items={[
          <><Code>{`{id_emp}`}</Code> → superclave <Bold>mínima</Bold> (clave candidata).</>,
          <><Code>{`{id_emp, nombre}`}</Code> → superclave <Bold>no mínima</Bold>.</>,
          <><Code>{`{id_emp, email}`}</Code> → superclave.</>,
        ]} />

        <Divider />

        {/* ── 6. Atributo primo ── */}
        <H2>Atributo primo</H2>
        <Callout variant="definition" title="Definición">
          Un <Bold>atributo primo</Bold> es cualquier atributo que forma parte de <Bold>alguna clave
          candidata</Bold>. Los que no están en ninguna clave candidata se llaman <Bold>no primos</Bold>.
        </Callout>
        <P><Bold>Ejemplo.</Bold> Relación <Code>R(A, B, C)</Code> con dos claves candidatas <Code>{`{A, B}`}</Code> y <Code>{`{A, C}`}</Code>:</P>
        <Ul items={[
          <><Code>A</Code> es <Bold>primo</Bold> (está en ambas claves).</>,
          <><Code>B</Code> y <Code>C</Code> son <Bold>primos</Bold> (están en al menos una clave).</>,
          <>Un atributo <Code>D</Code> que no participe en ninguna clave sería <Bold>no primo</Bold>.</>,
        ]} />
        <Callout variant="note">
          Esta distinción primo / no primo es clave para la <Bold>2FN y 3FN</Bold>: ve la página de{" "}
          <Bold>Normalización</Bold>.
        </Callout>

        <Divider />

        {/* ── 7. Fragmentación vertical ── */}
        <H2>DF y fragmentación vertical</H2>
        <P>
          Cuando se fragmenta una relación <Bold>por dependencias funcionales</Bold> (Módulo III), la
          descomposición debe cumplir cuatro condiciones:
        </P>
        <Table
          headers={["Condición", "Qué exige"]}
          rows={[
            ["Completitud", "Todos los atributos originales deben estar en algún fragmento."],
            ["Desarticulación", "Salvo las claves, ningún atributo debe repetirse en más de un fragmento."],
            ["Reconstrucción sin pérdida", "Mediante joins naturales / equi-joins debe poder reconstruirse la relación original."],
            ["Preservación de dependencias", "Las DF del esquema original deben seguir siendo válidas (o derivables) en los fragmentos."],
          ]}
        />

      </div>
    </div>
  );
}
