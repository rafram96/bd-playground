"use client";

import GuideLayout, { GuideHeader } from "@/components/guide/GuideLayout";
import { H2, P, Bold, Code, Callout, Divider, Pipeline, SqlCode } from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Colores (mismos del resaltador SQL del proyecto)
   ───────────────────────────────────────────────────────────────────────────── */
const C = {
  kw: "var(--syntax-keyword)",
  fn: "var(--syntax-fn)",
  str: "var(--syntax-string)",
  num: "var(--syntax-number)",
  plain: "var(--syntax-plain)",
};
const Str = ({ children }: { children: React.ReactNode }) => <span style={{ color: C.str }}>{children}</span>;
const Fn = ({ children }: { children: React.ReactNode }) => <span style={{ color: C.fn }}>{children}</span>;
const Num = ({ children }: { children: React.ReactNode }) => <span style={{ color: C.num }}>{children}</span>;
const Kw = ({ children }: { children: React.ReactNode }) => <span style={{ color: C.kw }}>{children}</span>;

/* ─────────────────────────────────────────────────────────────────────────────
   Cláusula anotada
   ───────────────────────────────────────────────────────────────────────────── */
function Clause({ kw, code, desc, last }: { kw: string; code: React.ReactNode; desc: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: "12px 16px", borderBottom: last ? "none" : "1px solid var(--code-line)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: "var(--font-code)", fontSize: 14, flexWrap: "wrap" }}>
        <span style={{
          padding: "2px 9px", borderRadius: 5, background: "rgba(255,123,114,0.12)",
          border: "1px solid rgba(255,123,114,0.4)", color: C.kw, fontWeight: 700,
          fontSize: 12.5, letterSpacing: 0.5, whiteSpace: "nowrap",
        }}>
          {kw}
        </span>
        <span style={{ color: C.plain }}>{code}</span>
      </div>
      <div style={{ marginTop: 7, marginLeft: 2, paddingLeft: 12, borderLeft: "2px solid var(--accent)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {desc}
      </div>
    </div>
  );
}

function QueryCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)", borderRadius: 10, margin: "14px 0", overflow: "hidden" }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Página
   ───────────────────────────────────────────────────────────────────────────── */
export default function SqlSyntaxGuide() {
  return (
    <GuideLayout maxWidth={760}>

        <GuideHeader eyebrow="Utilidades" title="Sintaxis SQL">
          <P>
            <Bold>SQL</Bold> (Structured Query Language) es un lenguaje de consulta estructurada que permite{" "}
            <Bold>administrar y recuperar información</Bold> en la base de datos. Aquí tienes la estructura de
            una consulta <Code>SELECT</Code>, cláusula por cláusula.
          </P>
        </GuideHeader>

        <Divider />

        {/* ── Consulta básica ── */}
        <H2>Consulta básica: SELECT · FROM · WHERE</H2>
        <QueryCard>
          <Clause
            kw="SELECT"
            code="nombre, autor, genero"
            desc="Indica las columnas que se quieren consultar (la proyección del resultado)."
          />
          <Clause
            kw="FROM"
            code="libros"
            desc="Selecciona la(s) tabla(s) de donde se leen los datos."
          />
          <Clause
            kw="WHERE"
            code={<>genero = <Str>&apos;Novela negra&apos;</Str>;</>}
            desc="Define las condiciones que debe cumplir cada fila para entrar al resultado."
            last
          />
        </QueryCard>

        <Divider />

        {/* ── Consulta con agregación ── */}
        <H2>Consulta con agregación: GROUP BY · HAVING · ORDER BY</H2>
        <QueryCard>
          <Clause
            kw="SELECT"
            code={<>autor, <Fn>COUNT</Fn>(libroID)</>}
            desc={<>Proyecta columnas y <Bold>funciones de agregación</Bold> como <Code>COUNT()</Code>, que cuentan/­resumen filas por grupo.</>}
          />
          <Clause
            kw="FROM"
            code="libros"
            desc="Selecciona la tabla."
          />
          <Clause
            kw="WHERE"
            code={<>genero = <Str>&apos;Novela negra&apos;</Str></>}
            desc="Filtra las filas individuales ANTES de agrupar."
          />
          <Clause
            kw="GROUP BY"
            code="autor"
            desc={<>Muestra cómo se agruparán los registros. Se usa cuando hay funciones de agregación como <Code>COUNT()</Code>: aquí, una fila de resultado por cada autor.</>}
          />
          <Clause
            kw="HAVING"
            code={<><Fn>COUNT</Fn>(libroID) &gt; <Num>3</Num></>}
            desc={<>Indica qué condición deben cumplir los <Bold>grupos</Bold> para aparecer. <Code>COUNT()</Code> cuenta los libros del autor y la regla deja solo a los que tienen más de 3.</>}
          />
          <Clause
            kw="ORDER BY"
            code={<>nombre <Kw>ASC</Kw>;</>}
            desc={<>Ordena el resultado final. <Code>ASC</Code> = ascendente (A→Z, menor→mayor); <Code>DESC</Code> = descendente.</>}
            last
          />
        </QueryCard>

        <Divider />

        {/* ── Orden lógico de ejecución ── */}
        <H2>Orden lógico de ejecución</H2>
        <P>
          Aunque <Bold>escribes</Bold> la consulta empezando por <Code>SELECT</Code>, la base de datos la{" "}
          <Bold>ejecuta</Bold> en otro orden. Entender esto explica muchos errores comunes:
        </P>
        <Pipeline steps={[
          { label: "FROM", sub: "elige tablas", color: "#3b82f6" },
          { label: "WHERE", sub: "filtra filas", color: "#8b5cf6" },
          { label: "GROUP BY", sub: "agrupa", color: "#a855f7" },
          { label: "HAVING", sub: "filtra grupos", color: "#ec4899" },
          { label: "SELECT", sub: "proyecta", color: "#10b981" },
          { label: "ORDER BY", sub: "ordena", color: "#f59e0b" },
        ]} />
        <Callout variant="warning" title="Por qué importa">
          Como <Code>SELECT</Code> se evalúa casi al final, <Bold>no puedes usar un alias definido en el
          SELECT dentro del WHERE</Bold> (el WHERE corre antes). Y por eso el filtro sobre un{" "}
          <Code>COUNT()</Code> va en <Code>HAVING</Code> y no en <Code>WHERE</Code>: el conteo aún no existe
          cuando se evalúa el WHERE.
        </Callout>

        <Divider />

        {/* ── WHERE vs HAVING ── */}
        <H2>WHERE vs HAVING</H2>
        <Callout variant="note" title="La diferencia clave">
          <Bold>WHERE</Bold> filtra <Bold>filas individuales</Bold> antes de agrupar (no puede usar funciones
          de agregación). <Bold>HAVING</Bold> filtra <Bold>grupos</Bold> después de <Code>GROUP BY</Code> (sí
          puede usar <Code>COUNT()</Code>, <Code>SUM()</Code>, etc.).
        </Callout>

        <Divider />

        {/* ── Ejemplos completos ── */}
        <H2>Ejemplos completos para ejecutar</H2>
        <P>
          Dos consultas reales sobre una tabla <Code>libros</Code>, con las indicaciones escritas como{" "}
          <Bold>comentarios SQL</Bold> (todo lo que va después de <Code>--</Code> en una línea es un
          comentario y la base de datos lo ignora).
        </P>

        <SqlCode label="1 · Filtrar y ordenar (SELECT · WHERE · ORDER BY · LIMIT)" sql={`-- Los 5 libros de novela negra más recientes
SELECT titulo, autor, anio        -- columnas a mostrar
FROM libros                       -- tabla de origen
WHERE genero = 'Novela negra'     -- solo este género
  AND anio >= 2010                -- publicados desde 2010 (AND = ambas condiciones)
ORDER BY anio DESC                -- del más nuevo al más viejo (DESC = descendente)
LIMIT 5;                          -- devuelve como máximo 5 filas`} />

        <SqlCode label="2 · Agrupar y filtrar grupos (GROUP BY · HAVING)" sql={`-- Autores con más de 3 libros de novela negra, del más prolífico al menos
SELECT autor,
       COUNT(*) AS total_libros   -- cuenta los libros de cada autor; "AS" le da un alias
FROM libros
WHERE genero = 'Novela negra'     -- filtra filas ANTES de agrupar
GROUP BY autor                    -- crea un grupo por cada autor
HAVING COUNT(*) > 3               -- deja solo los grupos con más de 3 libros
ORDER BY total_libros DESC;       -- ordena por la cantidad (mayor primero)`} />

        <Callout variant="lab" title="Pruébalo">
          Copia estas consultas en el <Bold>SQL Playground</Bold> de esta herramienta y ejecútalas (crea
          antes la tabla <Code>libros</Code>). Cambia el <Code>HAVING COUNT(...) &gt; 3</Code> por{" "}
          <Code>WHERE</Code> y observa el error: es la mejor forma de entender la diferencia.
        </Callout>

    </GuideLayout>
  );
}
