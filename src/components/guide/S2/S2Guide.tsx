"use client";

import { useState, useEffect, useRef } from "react";
import {
  H2, H3, P, Bold, Code, Formula, Divider,
  Ul, Ol, Callout, ProsCons, Table, CompareCards,
  Collapse, Pipeline, DiagramPlaceholder, SqlCode,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (used by both TOC and IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-archivos",      label: "1. Organización de Archivos" },
  { id: "sec-fija",          label: "2. Registros de Longitud Fija" },
  { id: "sec-variable",      label: "3. Registros de Longitud Variable" },
  { id: "sec-comparativa",   label: "4. Fija vs Variable" },
  { id: "sec-heap",          label: "5. Heap Files" },
  { id: "sec-secuencial",    label: "6. Organización Secuencial" },
  { id: "sec-indices",       label: "7. Índices Dense vs Sparse" },
  { id: "sec-resumen",       label: "Resumen" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents
   ───────────────────────────────────────────────────────────────────────────── */
function Toc({ active }: { active: string }) {
  return (
    <aside
      style={{
        width: 188,
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
   S2 Guide — main page
   ───────────────────────────────────────────────────────────────────────────── */
export default function S2Guide() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("sec-archivos");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        /* Pick the topmost visible section */
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

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 32px 80px" }}>

          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 2 · Módulo I — Almacenamiento y Registros
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Organización Física y Almacenamiento
            </h1>
            <P>
              Las bases de datos organizan los datos en el disco mediante archivos, páginas y registros.
              Entender cómo se almacenan los datos físicamente es fundamental para optimizar el acceso,
              gestionar el espacio eficientemente y diseñar índices efectivos.
            </P>
          </div>

          <Callout variant="note" title="Jerarquía de Almacenamiento">
            <Bold>Base de datos</Bold> = colección de <Bold>archivos</Bold> = secuencia de <Bold>páginas</Bold> (bloques de 8 KB)
            = secuencia de <Bold>registros</Bold> (tuplas) = secuencia de <Bold>campos</Bold> (columnas).
          </Callout>

          <Divider />

          {/* ══ 1. ORGANIZACIÓN DE ARCHIVOS ══ */}
          <H2 id="sec-archivos">1. Organización de Archivos</H2>
          <P>
            Una base de datos es conceptualmente una colección de archivos. Cada archivo contiene registros,
            donde cada registro representa una tupla. Los registros se organizan en páginas (bloques) de 8 KB,
            que es la unidad de E/S con el disco.
          </P>

          <H3>Equivalencias Conceptuales</H3>
          <Table
            headers={["Nivel Lógico", "Nivel Físico"]}
            rows={[
              ["Tabla", "Archivo"],
              ["Tupla / Fila", "Registro"],
              ["Columna / Atributo", "Campo"],
              ["Clave primaria", "Key (búsqueda)"],
              ["Rango de tuplas", "Página (8 KB)"],
            ]}
          />

          <H3>Conceptos Clave</H3>
          <Ul items={[
            <><Bold>Key:</Bold> atributo o conjunto de atributos que identifica unívocamente un registro.</>,
            <><Bold>Page / Bloque:</Bold> unidad de E/S con el disco, típicamente 8 KB en PostgreSQL.</>,
            <><Bold>Index:</Bold> estructura auxiliar que acelera la búsqueda de registros por key.</>,
          ]} />

          <H3>Archivos: Texto vs Binarios</H3>
          <Table
            headers={["Tipo", "Formato", "Ventajas", "Desventajas"]}
            rows={[
              ["Texto (CSV)", "Caracteres legibles + delimitadores", "Legible, portable", "Lento, delimitador en datos"],
              ["Binario", "Bytes con longitudes explícitas", "Rápido, compacto", "Menos legible"],
            ]}
          />

          <H3>Operaciones Básicas sobre Archivos</H3>
          <Ol items={[
            <>
              <Bold>Read (Lectura):</Bold>
              <Ul items={[
                "Secuencial: O(n), barrido completo de todas las páginas.",
                "Directa: O(1), salto a una página específica mediante un índice.",
              ]} />
            </>,
            <>
              <Bold>Write (Escritura):</Bold>
              <Ul items={[
                "Append: agregar al final, O(1) amortizado.",
                "En posición: escribir en un offset específico, O(1).",
                "Sobrescribir: reemplazar registro existente, O(1).",
              ]} />
            </>,
            <>
              <Bold>Delete (Eliminación):</Bold>
              <Ul items={[
                "Lógica: marcar como eliminado, sin mover datos, O(1).",
                "Física: remover completamente, puede ser O(n) si requiere compactación.",
              ]} />
            </>,
          ]} />

          <H3>Tipos de Organización</H3>
          <Ul items={[
            <>
              <Bold>Secuencial:</Bold> registros en orden, ideal para ETL y logs.
              Búsqueda binaria O(log N), rango queries eficientes.
            </>,
            <>
              <Bold>Indexado:</Bold> registros sin orden, índice apunta a posiciones.
              Búsqueda O(log N), inserciones más costosas.
            </>,
          ]} />

          <Divider />

          {/* ══ 2. REGISTROS DE LONGITUD FIJA ══ */}
          <H2 id="sec-fija">2. Registros de Longitud Fija</H2>
          <P>
            En registros de longitud fija, todos los registros ocupan exactamente el mismo número de bytes.
            Esto permite acceso directo O(1) a cualquier registro mediante cálculo de offset.
          </P>

          <H3>Tipos de Datos de PostgreSQL (Longitud Fija)</H3>
          <Table
            headers={["Tipo", "Tamaño", "Descripción"]}
            rows={[
              ["INTEGER", "4 bytes", "Entero de 32 bits"],
              ["SMALLINT", "2 bytes", "Entero de 16 bits"],
              ["BIGINT", "8 bytes", "Entero de 64 bits"],
              ["REAL", "4 bytes", "Punto flotante de 32 bits"],
              ["DOUBLE PRECISION", "8 bytes", "Punto flotante de 64 bits"],
              ["BOOLEAN", "1 byte", "Verdadero / Falso"],
              ["CHAR(n)", "n bytes", "Texto fijo de n caracteres"],
              ["DATE", "4 bytes", "Fecha (años desde 1900)"],
              ["TIME", "8 bytes", "Hora con precisión de microsegundos"],
            ]}
          />

          <H3>Acceso Directo a Registros</H3>
          <P>
            Si todos los registros tienen tamaño fijo <Code>record_size</Code>, acceder al i-ésimo registro
            es trivial: <Formula>offset = i × record_size</Formula>
          </P>
          <P>
            Complejidad: <Bold>O(1)</Bold> — una única operación aritmética y un read de página.
          </P>

          <H3>Problemas de Registros Fijos</H3>
          <Ol items={[
            <><Bold>Cruzar bloques:</Bold> un registro grande puede ocupar múltiples páginas.</>,
            <><Bold>Eliminación:</Bold> dejar huecos causa fragmentación, requiere compactación.</>,
          ]} />

          <H3>Estrategias de Eliminación</H3>
          <Collapse title="Ver alternativas de eliminación">
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <P>
                Cuando se elimina un registro, hay tres enfoques principales:
              </P>
              <Ol items={[
                <>
                  <Bold>Shift (Desplazamiento):</Bold> correr todos los registros posteriores hacia atrás.
                  <Ul items={[
                    "Ventaja: no deja huecos, mantiene densidad.",
                    "Desventaja: O(n) — costoso con muchos registros.",
                  ]} />
                </>,
                <>
                  <Bold>Mover Último Registro:</Bold> intercambiar eliminado con el último.
                  <Ul items={[
                    "Ventaja: O(1) — una copia.",
                    "Desventaja: cambia orden de registros, RID (Record ID) no es persistente.",
                  ]} />
                </>,
                <>
                  <Bold>Free List (Lista Libre):</Bold> mantener lista enlazada de huecos.
                  <Ul items={[
                    "Ventaja: O(1) inserción y eliminación, reutilización inteligente.",
                    "Desventaja: requiere campo de puntero en cada registro (overhead).",
                  ]} />
                </>,
              ]} />
            </div>
          </Collapse>

          <H3>Free List con Linked List</H3>
          <P>
            La estrategia más eficiente es mantener una <Bold>Free List</Bold> — una lista enlazada de espacios
            libres que se reutilizan en inserciones.
          </P>
          <Pipeline
            steps={[
              { label: "Header del archivo", color: "var(--accent)" },
              { label: "Puntero al primer hueco", color: "var(--accent)" },
              { label: "Primer hueco eliminado", color: "var(--accent)" },
              { label: "Puntero al siguiente hueco (LIFO)", color: "var(--accent)" },
              { label: "...", color: "var(--accent)" },
            ]}
          />
          <P>
            Estructura: <Code>Header → [eliminado_1] → [eliminado_2] → ... → NULL</Code>
          </P>
          <Callout variant="example">
            Inserción con Free List: si hay espacios libres, se reutiliza el primero (LIFO).
            Complejidad: O(1). Si no hay libres, append al final.
          </Callout>

          <Divider />

          {/* ══ 3. REGISTROS DE LONGITUD VARIABLE ══ */}
          <H2 id="sec-variable">3. Registros de Longitud Variable</H2>
          <P>
            En registros de longitud variable, diferentes registros pueden ocupar diferentes cantidades de espacio.
            Esto es ideal para datos como VARCHAR, TEXT, JSON, ARRAY y NUMERIC, que varían en tamaño.
          </P>

          <H3>Campos de Longitud Variable en PostgreSQL</H3>
          <Ul items={[
            <><Code>VARCHAR(n)</Code> — cadena de hasta n caracteres.</>,
            <><Code>TEXT</Code> — cadena de longitud arbitraria.</>,
            <><Code>BYTEA</Code> — datos binarios de longitud variable.</>,
            <><Code>JSON / JSONB</Code> — documentos semiestructurados.</>,
            <><Code>ARRAY</Code> — arreglos heterogéneos.</>,
            <><Code>NUMERIC</Code> — números con precisión arbitraria.</>,
          ]} />

          <H3>Métodos de Almacenamiento</H3>
          <Table
            headers={["Método", "Descripción", "Ventaja", "Desventaja"]}
            rows={[
              [
                "Delimitadores",
                "Usar carácter separador (ej. CSV con comas)",
                "Simple",
                "Delimitador puede aparecer en datos, acceso O(n)"
              ],
              [
                "Indicadores de Longitud",
                "Guardar longitud al inicio de cada campo",
                "Robusto",
                "Requiere parsing binario"
              ],
            ]}
          />

          <H3>Archivos de Texto con Delimitadores</H3>
          <P>
            Formato CSV es legible pero problemático:
          </P>
          <Ul items={[
            "Delimitador en contenido requiere escaping.",
            "Acceso a un campo requiere parseo desde inicio: O(n).",
            "Ideal para ETL, no para OLTP.",
          ]} />

          <Collapse title="Ejemplo: CSV con problemas">
            <SqlCode sql={`name,email,address
"John Smith","john@example.com","123 Main St, Apt 4, New York"
"Jane Doe","jane@example.com","456 Oak Ave, Apt B-2 (near park), Boston"
`} />
            <div style={{ marginTop: 12 }}>
              <P>
                Problema: comas dentro de campos requieren comillas y escaping.
                Acceso a <Code>address</Code> requiere escanear desde inicio.
              </P>
            </div>
          </Collapse>

          <H3>Archivos Binarios con Indicadores de Longitud</H3>
          <P>
            Formato más eficiente: guardar longitud explícita antes de cada campo variable.
          </P>
          <DiagramPlaceholder
            label="Estructura: [len1:2B][campo1][len2:2B][campo2][len3:2B][campo3]"
            height={100}
          />
          <Callout variant="example">
            Registro: <Code>|2|ab|5|hello|3|xyz|</Code>
            = campos: "ab", "hello", "xyz"
          </Callout>

          <H3>Slotted Page (Página Ranurada)</H3>
          <P>
            PostgreSQL y la mayoría de DBMS usan <Bold>Slotted Page</Bold> para almacenar registros variables.
            Es la estructura más versátil y permite compactación sin cambiar RID (Record ID).
          </P>
          <DiagramPlaceholder
            label="Slotted Page: Header → ItemId Array → Free Space → Tuple Data (from end)"
            height={140}
          />

          <H3>Estructura de Página en PostgreSQL</H3>
          <Table
            headers={["Sección", "Tamaño", "Contenido"]}
            rows={[
              [
                "Page Header",
                "~24 bytes",
                "Metadatos: LSN, estado de bits, offsets"
              ],
              [
                "ItemId Array",
                "Variable",
                "Array de (offset, length) para cada tupla"
              ],
              [
                "Free Space",
                "Variable",
                "Espacio sin usar entre ItemIds y Tuple Data"
              ],
              [
                "Tuple Data",
                "Variable",
                "Tuplas crecen desde el final hacia arriba"
              ],
              [
                "Special Space",
                "Variable",
                "Datos específicos del tipo de índice (si aplica)"
              ],
            ]}
          />

          <Collapse title="Ventajas de Slotted Page">
            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <Ul items={[
                "Acceso O(1): ItemId array da offset directo a cada tupla.",
                "Compactación sin mover RID: solo ajustar ItemId array, no los datos.",
                "Flex space management: tuplas pueden crecer/encogerse dentro de la página.",
                "Soporte para variable-length: cada tupla puede tener tamaño diferente.",
              ]} />
            </div>
          </Collapse>

          <H3>Alternativa: Header Independiente</H3>
          <P>
            Algunos sistemas usan archivo separado para metadatos:
          </P>
          <Ul items={[
            <><Code>Header.dat</Code> — array de (offset, tamaño) para cada tupla.</>,
            <><Code>Datos.txt</Code> — tuplas en orden.</>,
          ]} />
          <P>
            Acceso: leer Header.dat para obtener offset, luego leer Datos.txt en O(1).
            Simple pero menos eficiente que Slotted Page (dos archivos, más I/Os).
          </P>

          <Divider />

          {/* ══ 4. COMPARATIVA FIJA VS VARIABLE ══ */}
          <H2 id="sec-comparativa">4. Comparativa: Fija vs Variable</H2>

          <Table
            headers={["Dimensión", "Longitud Fija", "Longitud Variable"]}
            rows={[
              [
                "Tamaño en disco",
                "Mayor (campos pequeños desperdiciados)",
                "Menor (ajustado al contenido)"
              ],
              [
                "Acceso a campo i",
                "O(1) — cálculo directo de offset",
                "O(i) — debe parsear desde inicio (texto) u O(1) con Slotted Page (binario)"
              ],
              [
                "Acceso por slot/RID",
                "O(1) — offset = i × size",
                "O(1) con Slotted Page, ItemId array"
              ],
              [
                "Complejidad implementación",
                "Simple, sin metadatos",
                "Compleja, requiere índices de offset o Slotted Page"
              ],
              [
                "Actualizaciones",
                "O(1) — sobrescribir en lugar",
                "Compleja — puede no caber, requiere relocalización"
              ],
              [
                "Compactación",
                "Periódica (VACUUM), costo O(n)",
                "Más frecuente con Slotted Page, puede ser O(1) sin mover RID"
              ],
              [
                "Casos de uso",
                "Datos estructurados, tipos fijos",
                "Datos semiestructurados, variabilidad"
              ],
              [
                "PostgreSQL usa",
                "Raramente (legacy)",
                "Siempre (Slotted Page para todo)"
              ],
            ]}
          />

          <Callout variant="note" title="Enfoque Híbrido">
            PostgreSQL usa un enfoque <Bold>híbrido</Bold>: almacena tipos fijos (INT, DATE) y variables (TEXT)
            juntos en la misma Slotted Page. Los tipos fijos se almacenan inline, los variables pueden estarlo
            o comprimirse/externalizarse si son muy grandes.
          </Callout>

          <Divider />

          {/* ══ 5. HEAP FILES ══ */}
          <H2 id="sec-heap">5. Heap Files</H2>
          <P>
            Un <Bold>Heap File</Bold> (archivo de montículo) es la estructura más básica: páginas desordenadas
            donde registros se insertan sin seguir ningún orden específico.
            PostgreSQL usa Heap Files como estructura base para todas las tablas.
          </P>

          <H3>Características</H3>
          <Ul items={[
            "Registros se insertan en primer espacio libre disponible (First Fit).",
            "Sin índice de búsqueda integrado — requiere Full Table Scan para búsquedas.",
            <>Ideal para <Code>INSERT</Code> muy rápido.</>,
          ]} />

          <H3>Ventajas y Desventajas</H3>
          <ProsCons
            pros={[
              "Inserciones rápidas: append o First Fit, O(1) amortizado",
              "Estructura simple: sin overhead de ordenamiento",
              "Ideal para cargas INSERT-heavy (logs, eventos)",
              "Sin overhead de índice en espacio de disco",
            ]}
            cons={[
              "Búsqueda secuencial: O(n), debe leer todas las páginas",
              "Sin orden natural: rango queries requieren Full Table Scan",
              "Fragmentación con DELETEs: huecos dejan páginas medio vacías",
              "Requiere VACUUM periódico para compactación",
            ]}
          />

          <Divider />

          {/* ══ 6. ORGANIZACIÓN SECUENCIAL ══ */}
          <H2 id="sec-secuencial">6. Organización Secuencial</H2>
          <P>
            En organización secuencial, registros se almacenan <Bold>ordenados</Bold> por una clave de búsqueda.
            Esto permite búsqueda binaria y rango queries eficientes, a costo de inserciones más caras.
          </P>

          <H3>Búsqueda Binaria</H3>
          <P>
            Si registros están ordenados por key y sabemos el tamaño total de registros,
            podemos hacer búsqueda binaria: O(log N).
          </P>
          <Formula>
            Pasos para encontrar un registro en N registros: log₂(N)
          </Formula>
          <Callout variant="example">
            1 millón de registros: log₂(10⁶) ≈ 20 comparaciones vs 500,000 en búsqueda secuencial.
          </Callout>

          <H3>Rango Queries (Range Queries)</H3>
          <P>
            Consultas como <Code>WHERE salary BETWEEN 30000 AND 50000</Code> son naturales en archivos secuenciales:
          </P>
          <Ol items={[
            <>Búsqueda binaria para encontrar primer registro con <Code>salary {'>='} 30000</Code>.</>,
            <>Lectura secuencial hasta encontrar primer registro con <Code>salary {'>'} 50000</Code>.</>,
          ]} />

          <H3>Ventajas y Desventajas</H3>
          <ProsCons
            pros={[
              "Búsqueda binaria: O(log N) vs O(n) en Heap",
              "Rango queries muy eficientes: lectura secuencial del rango",
              "Localidad espacial: registros similares en mismas páginas",
            ]}
            cons={[
              "Inserciones costosas: O(n) — puede requerir shift de registros",
              "Eliminaciones costosas: O(n) si se mantiene orden",
              "Reorganización periódica: overhead O(n log n) sorting",
              "Sobrevida limitada: orden se corrompe con actualizaciones",
            ]}
          />

          <H3>Técnicas de Mantenimiento</H3>
          <Ul items={[
            <>
              <Bold>Pointer Chains:</Bold> mantener lista enlazada de registros en orden,
              evita shift físico, O(1) inserción pero O(n) búsqueda.
            </>,
            <>
              <Bold>Overflow Area:</Bold> nuevos registros van a área de desbordamiento,
              periódicamente mergear con área principal.
            </>,
            <>
              <Bold>Periodic Reconstruction:</Bold> cada cierto tiempo, resort completo de archivo.
            </>,
          ]} />

          <Divider />

          {/* ══ 7. ÍNDICES DENSE VS SPARSE ══ */}
          <H2 id="sec-indices">7. Índices Dense vs Sparse</H2>
          <P>
            Un índice es una estructura auxiliar que mapea claves de búsqueda a registros.
            Hay dos tipos principales: Dense (denso) y Sparse (disperso).
          </P>

          <H3>Dense Index (Índice Denso)</H3>
          <P>
            Un <Bold>Dense Index</Bold> tiene una entrada por cada registro en el archivo base.
          </P>
          <Table
            headers={["Key", "Pointer (RID)"]}
            rows={[
              ["101", "→ registro 1"],
              ["102", "→ registro 2"],
              ["103", "→ registro 3"],
              ["104", "→ registro 4"],
              ["105", "→ registro 5"],
            ]}
          />
          <Callout variant="example">
            Base de datos con 1 millón de registros → índice denso con 1 millón de entradas.
            Búsqueda: binaria en índice O(log N), luego salto directo al registro O(1).
          </Callout>

          <H3>Sparse Index (Índice Disperso)</H3>
          <P>
            Un <Bold>Sparse Index</Bold> tiene entrada solo para cada página (o bloque).
            Requiere que el archivo base esté <Bold>ordenado</Bold>.
          </P>
          <Table
            headers={["Key (de página)", "Pointer (inicio de página)"]}
            rows={[
              ["101", "→ página 1 (contiene 101-110)"],
              ["111", "→ página 2 (contiene 111-120)"],
              ["121", "→ página 3 (contiene 121-130)"],
            ]}
          />
          <Callout variant="example">
            1 millón de registros en páginas de 100 registros → 10,000 páginas
            → índice disperso con 10,000 entradas en lugar de 1 millón.
          </Callout>

          <H3>Comparativa: Dense vs Sparse</H3>
          <CompareCards
            items={[
              {
                label: "Dense Index",
                color: "var(--accent)",
                bg: "var(--bg-secondary)",
                pros: [
                  "Una entrada por registro",
                  "Búsqueda rápida en índice",
                  "Funciona incluso si datos no están ordenados",
                  "Mayor consumo de espacio",
                  "O(log N) búsqueda en índice + O(1) acceso",
                ],
                cons: [],
              },
              {
                label: "Sparse Index",
                color: "var(--accent)",
                bg: "var(--bg-secondary)",
                pros: [
                  "Una entrada por página",
                  "Menos espacio (N/B veces menor)",
                  "Requiere datos ordenados",
                  "Búsqueda más lenta en índice (más grandes comparaciones)",
                  "O(log N) búsqueda en índice + O(B) lectura de página",
                ],
                cons: [],
              },
            ]}
          />

          <H3>Índices Multinivel</H3>
          <P>
            Si el índice es muy grande, podemos construir un índice sobre el índice (meta-índice).
            Esto lleva al concepto de <Bold>árbol de índices</Bold> que es la base de B-Trees.
          </P>
          <Pipeline
            steps={[
              { label: "Archivos de datos (ordenados)", color: "var(--accent)" },
              { label: "Índice de primer nivel (disperso)", color: "var(--accent)" },
              { label: "Índice de segundo nivel", color: "var(--accent)" },
              { label: "...", color: "var(--accent)" },
              { label: "Índice raíz (pequeño, en RAM)", color: "var(--accent)" },
            ]}
          />
          <Callout variant="note" title="Conexión a B+Trees">
            B+Trees generalizan esta idea de índices multinivel con invariantes que garantizan
            balance y permiten búsqueda, inserción y eliminación en O(log N).
          </Callout>

          <Divider />

          {/* ══ RESUMEN ══ */}
          <H2 id="sec-resumen">Resumen</H2>
          <Ul items={[
            <>
              <Bold>Organización de Archivos:</Bold> BD = archivos = páginas = registros = campos.
              Operaciones básicas: read, write, delete con diferentes complejidades.
            </>,
            <>
              <Bold>Registros Fijos:</Bold> O(1) acceso directo, pero desperdician espacio.
              Eliminación requiere estrategia (shift, mover último, free list).
            </>,
            <>
              <Bold>Registros Variables:</Bold> Slotted Page permite acceso O(1) y compactación sin cambiar RID.
              Ideal para VARCHAR, TEXT, JSON, etc.
            </>,
            <>
              <Bold>Heap Files:</Bold> inserción O(1), búsqueda O(n). Ideal para INSERT-heavy.
            </>,
            <>
              <Bold>Secuencial:</Bold> búsqueda O(log N) y rango queries eficientes,
              pero inserciones O(n) y reorganización periódica.
            </>,
            <>
              <Bold>Índices:</Bold> Dense (O(log N) búsqueda, más espacio) vs Sparse (menos espacio, requiere orden).
              Base para B+Trees multinivel.
            </>,
            <>
              <Bold>PostgreSQL:</Bold> usa Heap Files + Slotted Page + B+Trees para índices.
              VACUUM compacta páginas eliminando tuplas muertas de MVCC.
            </>,
          ]} />

          <Callout variant="note" title="Próximo Paso: Índices B+Tree">
            Ahora que entiendes cómo se almacenan registros, el siguiente paso es aprender
            cómo indexar eficientemente con B+Trees, que permite O(log N) para búsqueda, inserción
            y eliminación manteniendo datos ordenados.
          </Callout>

        </div>
      </div>

      {/* ── Right-side TOC ── */}
      <Toc active={activeSection} />

    </div>
  );
}
