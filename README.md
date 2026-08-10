# DB Visualizer — Guía BD2

Aplicación educativa para el curso CS2042 Base de Datos II de UTEC. Reúne guías teóricas, material de repaso para exámenes, visualizaciones interactivas y un playground de PostgreSQL que funciona completamente en el navegador.

## Características

- SQL Playground basado en PGlite/WASM, sin backend.
- Editor Monaco con resaltado SQL, autocompletado y atajos de ejecución.
- Base de datos precargada con empleados, departamentos, productos, órdenes e índices.
- Resultados tabulares paginados y visualización de `EXPLAIN ANALYZE`.
- Guías de arquitectura DBMS, almacenamiento físico, índices, recuperación de información, bases vectoriales, bases distribuidas y NoSQL.
- Secciones específicas de preparación para exámenes.
- Visualizadores interactivos de B+Tree, slotted pages, costos, TF-IDF y k-NN.
- Temas oscuro y claro persistidos localmente.
- Navegación mediante rutas de Next.js y diseño adaptable a escritorio, tablet y móvil.

## Stack

- Next.js 16 y React 19
- TypeScript
- Tailwind CSS 4
- `@electric-sql/pglite`
- `@monaco-editor/react`
- KaTeX
- Lucide React

## Requisitos

- Node.js 20.19 o superior
- npm 10 o superior

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Verificación

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

## Atajos del playground

- `Ctrl/Cmd + Enter`: ejecutar SQL.
- `Ctrl/Cmd + Shift + Enter`: ejecutar `EXPLAIN ANALYZE` y mostrar el plan visual.

La instancia PGlite vive en memoria. Los cambios realizados durante una sesión se pierden al recargar la página.

## Estructura principal

```text
src/
├── app/
│   ├── (course)/
│   │   ├── [seccion]/page.tsx   # páginas SSG y metadata por sección
│   │   ├── layout.tsx           # shell persistente del curso
│   │   └── page.tsx             # redirección inicial a /s1
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── architecture/            # diagramas de arquitectura DBMS
│   ├── guide/                   # guías y GuideLayout compartido
│   ├── layout/                  # CourseShell, navegación y tema
│   ├── playground/              # editor, resultados y EXPLAIN
│   ├── visualizer/              # visualizaciones interactivas
│   └── SectionContent.tsx       # registro de contenido diferido
└── lib/
    ├── navigation.ts            # rutas, tipos y títulos de secciones
    ├── pglite.ts                # inicialización, seed y consultas
    └── snippets.ts              # consultas de ejemplo
```

## Despliegue

El proyecto puede desplegarse directamente en Vercel. PGlite y PostgreSQL WASM se cargan en el navegador, por lo que no se necesita una base de datos ni un servidor de aplicación adicional.
