Perfecto. Te doy el contexto completo de la visión antes de codear nada.

---

## DB Visualizer — Visión Completa

**Propósito:** Herramienta de aprendizaje visual para el curso CS2042 Base de Datos II de UTEC. Todo corre en el browser (PGlite + WASM), deployable en Vercel sin backend.

---

## Las dos secciones principales

### 1. SQL Playground

Un entorno completo de experimentación SQL con Postgres real en el browser.

**Editor:**
Monaco Editor (el de VS Code) con syntax highlighting SQL, autocompletado de tablas/columnas, atajos `Ctrl+Enter` para ejecutar y `Ctrl+Shift+Enter` para EXPLAIN.

**Base de datos pre-seeded:**
Al cargar la app, PGlite inicializa automáticamente tablas con datos suficientes para que los ejemplos del sílabo funcionen de inmediato — employees, orders, products, con índices B+Tree y Hash ya creados. El usuario no configura nada.

**Panel de resultados:**
Tabla con colores por tipo de dato (números en azul, nulls en gris, booleans en verde/rojo), paginación, contador de filas y tiempo de ejecución.

**EXPLAIN ANALYZE visual:**
Aquí está el valor real. En vez de mostrar texto plano, parseas el JSON que devuelve `EXPLAIN (ANALYZE, FORMAT JSON)` y renderizas un árbol interactivo donde:
- Cada nodo del plan es una card coloreada por costo relativo (verde → amarillo → rojo)
- Se muestra el tipo de operación con ícono (Seq Scan, Index Scan, Hash Join, Sort, etc.)
- Tiempo real vs estimado con badge de error si la estimación estuvo muy lejos
- Los nodos se pueden colapsar/expandir
- Una barra de resumen arriba: costo total, tiempo real, nodos más costosos

**Panel de snippets:**
Queries de ejemplo organizadas por tema del sílabo, agrupadas en categorías: Básico, Módulo I (índices, buffer, sort), Módulo II (full-text, OLAP), Módulo III (fragmentación, particionamiento). Al hacer click en un snippet se carga en el editor.

---

### 2. Visualizador de Estructuras

Cada estructura tiene su propia pestaña con controles interactivos.

**B+Tree (Módulo I — Semana 3)**

Implementación real del árbol en TypeScript, renderizada en SVG. El usuario puede:
- Insertar claves y ver el split de nodos en tiempo real
- Buscar una clave y ver el path resaltado
- Controlar la velocidad de animación
- Ver los nodos hoja enlazados (leaf chaining) con flecha punteada

El árbol se redibuja con cada operación. Orden configurable (3, 4 o 5).

**Hash Index: Estático y Extensible (Módulo I — Semana 3)**

Dos sub-modos:

*Estático:* Visualiza N buckets con función hash configurable. Muestra overflow pages cuando un bucket se llena. El usuario inserta claves y ve en qué bucket caen y cuándo hay colisión.

*Extensible:* Muestra el directorio global con profundidad global/local, los buckets con su profundidad local. Al insertar y producirse un split, se anima el proceso: el directorio se duplica, el bucket se divide, las claves se redistribuyen.

**Fragmentación (Módulo III — Semana 12)**

Tres modos:

*Horizontal (Range/Hash/List):* Una tabla "completa" se muestra visualmente y se va particionando. Para range: las filas se colorean por rango y se separan en nodos distintos. Para hash: se muestra la función hash y el módulo, y las filas "saltan" al nodo correspondiente.

*Vertical:* Una tabla con muchas columnas se divide en dos fragmentos — columnas "hot" vs "cold". Se muestra cómo una query que solo necesita columnas del fragmento hot no toca el fragmento cold (partition pruning visual).

*Reconstrucción:* Muestra el JOIN necesario para reconstruir la tabla completa desde los fragmentos, con el costo visual de la comunicación.

---

## Stack y arquitectura

```
db-visualizer/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              ← layout principal, tabs
│   └── globals.css
├── components/
│   ├── playground/
│   │   ├── SqlPlayground.tsx ← layout del playground
│   │   ├── SqlEditor.tsx     ← Monaco wrapper
│   │   ├── ResultTable.tsx   ← tabla de resultados
│   │   ├── ExplainTree.tsx   ← árbol visual de EXPLAIN
│   │   └── SnippetPanel.tsx  ← panel de ejemplos
│   └── visualizer/
│       ├── BPlusTree.tsx
│       ├── HashIndex.tsx
│       ├── BufferPool.tsx
│       ├── ExternalSort.tsx
│       └── Fragmentation.tsx
├── lib/
│   ├── pglite.ts             ← singleton PGlite + seed
│   ├── snippets.ts           ← queries de ejemplo
│   └── explainParser.ts      ← types del plan JSON
└── package.json
```

**Dependencias clave:**
- `next` 15 + TypeScript + Tailwind
- `@electric-sql/pglite` — Postgres en WASM
- `@monaco-editor/react` — editor SQL
- `lucide-react` — íconos
- `framer-motion` — animaciones de las estructuras

**Deploy:** `vercel deploy` sin configuración adicional. PGlite descarga el WASM en el primer load (~3MB), después todo es local.

---

## Diseño visual

Tema oscuro con paleta técnica/terminal:
- Fondo `#0a0a0f`, superficies `#111118`
- Accent violeta `#7c6af7` para elementos interactivos
- Verde `#22d3a0` para éxito/datos, amarillo `#f0c060` para warnings, rojo `#f87171` para errores/alto costo
- Tipografía: `JetBrains Mono` para código y datos, `DM Sans` para UI general

---

## Orden de implementación por tandas

**Tanda 1 (fundación):**
- Scaffold completo del proyecto
- SQL Playground funcional con PGlite
- EXPLAIN ANALYZE visual básico
- Snippets Módulo I

**Tanda 2 (visualizaciones Módulo I):**
- B+Tree interactivo
- Hash Index estático + extensible

**Tanda 3:**
- Buffer Pool con LRU/Clock
- External Sort animado

**Tanda 4 (Módulo III):**
- Fragmentación horizontal (range + hash)
- Fragmentación vertical

---

¿Hay algo que ajustarías de la visión antes de arrancar a codear la Tanda 1?