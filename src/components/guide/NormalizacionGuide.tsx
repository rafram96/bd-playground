"use client";

import GuideLayout, { GuideHeader } from "@/components/guide/GuideLayout";
import {
  H2, P, Bold, Code, Callout, Divider, Ul, Table, SqlCode, MathBlock,
} from "@/components/guide/blocks";

export default function NormalizacionGuide() {
  return (
    <GuideLayout maxWidth={780}>

        <GuideHeader eyebrow="Utilidades · Diseño relacional" title="Normalización">
          <P>
            La <Bold>normalización</Bold> es el proceso de organizar los datos para{" "}
            <Bold>eliminar redundancias</Bold>, evitar <Bold>anomalías</Bold> (de inserción, actualización y
            eliminación) y <Bold>mejorar la integridad</Bold>. Se basa en las{" "}
            <Bold>dependencias funcionales</Bold> y otras dependencias más complejas (multivaluadas, de join).
          </P>
        </GuideHeader>

        <Callout variant="note" title="Requisito previo">
          La normalización se apoya en las <Bold>dependencias funcionales</Bold>, superclaves y atributos
          primos: repásalos en la página de <Bold>Dependencias Funcionales</Bold>.
        </Callout>

        <Divider />

        {/* ── Tabla resumen ── */}
        <H2>Las formas normales de un vistazo</H2>
        <Table
          headers={["Forma", "Requiere", "Elimina"]}
          rows={[
            ["1FN", "Valores atómicos (sin listas/repetición)", "Atributos multivaluados"],
            ["2FN", "1FN + dependencia completa de la clave", "Dependencias parciales de clave compuesta"],
            ["3FN", "2FN + sin dependencias transitivas", "Atributos que dependen de otros no clave"],
            ["BCNF", "Toda DF X→Y tiene X como superclave", "Anomalías que 3FN no resuelve"],
            ["4FN", "BCNF + sin dependencias multivaluadas no triviales", "Multivaluadas independientes"],
            ["5FN", "Sin dependencias de join que generen pérdida", "Descomposiciones espurias (joins falsos)"],
          ]}
        />

        <Divider />

        {/* ── 1FN ── */}
        <H2>1FN: Primera Forma Normal</H2>
        <Callout variant="definition" title="Regla">
          Una relación está en 1FN si <Bold>todos los atributos contienen valores atómicos</Bold> (no
          repetitivos ni multivaluados). <Bold>Objetivo:</Bold> eliminar campos con listas, arreglos o tablas internas.
        </Callout>
        <SqlCode label="No cumple 1FN · atributo multivaluado" sql={`Alumno(id, nombre, cursos)
(1, Ana, [BD, Redes])`} />
        <SqlCode label="Corregido · ya en 1FN, una fila por valor" sql={`Alumno(id, nombre, curso)
(1, Ana, BD)
(1, Ana, Redes)`} />

        <Divider />

        {/* ── 2FN ── */}
        <H2>2FN: Segunda Forma Normal</H2>
        <Callout variant="definition" title="Regla">
          Una relación está en 2FN si está en <Bold>1FN</Bold> y <Bold>todos los atributos no clave
          dependen completamente de toda la clave primaria</Bold> (no de una parte de ella). Solo aplica si
          la <Bold>clave primaria es compuesta</Bold>.
        </Callout>
        <SqlCode label="No cumple 2FN · dependencia parcial" sql={`CursoAlumno(id_curso, id_alumno, nombre_curso)

-- nombre_curso depende SOLO de id_curso, no de la clave completa`} />
        <P><Bold>Convertido a 2FN:</Bold> se separa lo que depende de parte de la clave:</P>
        <Ul items={[
          <><Code>Curso(id_curso, nombre_curso)</Code></>,
          <><Code>CursoAlumno(id_curso, id_alumno)</Code></>,
        ]} />

        <Divider />

        {/* ── 3FN ── */}
        <H2>3FN: Tercera Forma Normal</H2>
        <Callout variant="definition" title="Regla">
          Una relación está en 3FN si está en <Bold>2FN</Bold> y <Bold>no hay dependencias transitivas</Bold>{" "}
          entre atributos no clave. <Bold>Objetivo:</Bold> eliminar columnas que dependen de otras columnas
          no clave, en lugar de depender directamente de la clave primaria.
        </Callout>
        <SqlCode label="No cumple 3FN · dependencia transitiva" sql={`Empleado(id_emp, nombre, id_depto, nombre_depto)

-- nombre_depto depende de id_depto, que depende de id_emp
-- id_emp → id_depto → nombre_depto`} />
        <P><Bold>Convertido a 3FN:</Bold></P>
        <Ul items={[
          <><Code>Empleado(id_emp, nombre, id_depto)</Code></>,
          <><Code>Departamento(id_depto, nombre_depto)</Code></>,
        ]} />

        <Divider />

        {/* ── BCNF ── */}
        <H2>BCNF: Forma Normal de Boyce-Codd</H2>
        <Callout variant="definition" title="Regla">
          Una relación está en BCNF si para <Bold>toda</Bold> dependencia funcional <Code>X → Y</Code>,{" "}
          <Bold>X es una superclave</Bold>.
        </Callout>
        <MathBlock>{String.raw`\forall\, (X \rightarrow Y) : \; X \text{ es superclave}`}</MathBlock>
        <P>
          Es una versión más <Bold>estricta</Bold> que 3FN; se aplica en casos donde 3FN no elimina ciertas
          anomalías lógicas.
        </P>
        <SqlCode label="No cumple BCNF" sql={`Profesor(materia, aula, profesor)

DF:  materia → aula
     aula    → profesor
-- pero ninguna de esas es clave única`} />
        <P>
          <Bold>Solución:</Bold> descomponer según las dependencias y reconstruir las claves de forma que cada
          determinante sea superclave.
        </P>

        <Divider />

        {/* ── 4FN ── */}
        <H2>4FN: Cuarta Forma Normal</H2>
        <Callout variant="definition" title="Regla">
          Una relación está en 4FN si está en <Bold>BCNF</Bold> y <Bold>no tiene dependencias multivaluadas
          no triviales</Bold>. Una dependencia multivaluada ocurre cuando un atributo tiene{" "}
          <Bold>múltiples valores independientes</Bold> para una clave.
        </Callout>
        <SqlCode label="No cumple 4FN · multivaluadas independientes" sql={`AutorLibro(id_autor, libro, idioma)

-- un autor escribe varios libros Y habla varios idiomas,
-- de forma independiente entre sí`} />
        <P><Bold>Solución:</Bold> separar las dos relaciones independientes:</P>
        <Ul items={[
          <><Code>AutorLibro(id_autor, libro)</Code></>,
          <><Code>AutorIdioma(id_autor, idioma)</Code></>,
        ]} />

        <Divider />

        {/* ── 5FN ── */}
        <H2>5FN: Quinta Forma Normal (Proyección-Unión)</H2>
        <Callout variant="definition" title="Regla">
          Una relación está en 5FN si <Bold>no puede descomponerse en subrelaciones más pequeñas sin perder
          información</Bold> al hacer <Code>JOIN</Code>. Se refiere a <Bold>dependencias de join</Bold>; es
          muy rara en la práctica.
        </Callout>
        <SqlCode label="Ejemplo teórico" sql={`ProyectoEmpleado(id_proy, id_emp, rol)

-- la información se puede dividir en combinaciones de
-- empleado, proyecto y rol; si se separa incorrectamente,
-- al recomponer con JOIN se generan combinaciones falsas (espurias)`} />

    </GuideLayout>
  );
}
