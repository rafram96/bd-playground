export interface Snippet {
    id: string;
    label: string;
    description: string;
    sql: string;
}

export interface SnippetGroup {
    id: string;
    label: string;
    icon: string;
    snippets: Snippet[];
}

export const SNIPPET_GROUPS: SnippetGroup[] = [
    {
        id: "basic",
        label: "Básico",
        icon: "🔰",
        snippets: [
            {
                id: "select-all-emp",
                label: "SELECT todos los empleados",
                description: "SELECT básico sobre la tabla employees",
                sql: `SELECT * FROM employees LIMIT 20;`,
            },
            {
                id: "join-emp-dept",
                label: "JOIN empleados ↔ departamentos",
                description: "INNER JOIN para enlazar empleados con su departamento",
                sql: `SELECT
  e.first_name || ' ' || e.last_name AS employee,
  d.dept_name,
  e.salary,
  e.hire_date
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY e.salary DESC;`,
            },
            {
                id: "group-by-dept",
                label: "GROUP BY — salario por depto",
                description: "Agregación con GROUP BY y HAVING",
                sql: `SELECT
  d.dept_name,
  COUNT(e.emp_id)        AS headcount,
  ROUND(AVG(e.salary),2) AS avg_salary,
  MIN(e.salary)          AS min_salary,
  MAX(e.salary)          AS max_salary
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
GROUP BY d.dept_name
HAVING COUNT(e.emp_id) > 5
ORDER BY avg_salary DESC;`,
            },
            {
                id: "subquery",
                label: "Subquery — sobre el promedio",
                description: "Empleados con salario mayor al promedio general",
                sql: `SELECT
  first_name || ' ' || last_name AS employee,
  salary,
  salary - (SELECT AVG(salary) FROM employees) AS diff_from_avg
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;`,
            },
            {
                id: "self-join",
                label: "Self-JOIN — empleado y manager",
                description: "Self-join para mostrar la jerarquía manager → empleado",
                sql: `SELECT
  e.first_name || ' ' || e.last_name AS employee,
  m.first_name || ' ' || m.last_name AS manager,
  e.salary
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.emp_id
ORDER BY manager NULLS FIRST, employee;`,
            },
        ],
    },
    {
        id: "modulo1-index",
        label: "Módulo I — Índices",
        icon: "🗂️",
        snippets: [
            {
                id: "explain-seq",
                label: "EXPLAIN — Seq Scan sin índice",
                description:
                    "Un full scan forzado (sin índice en salary_category inventado)",
                sql: `EXPLAIN (ANALYZE, FORMAT TEXT)
SELECT *
FROM employees
WHERE first_name LIKE 'A%';`,
            },
            {
                id: "explain-index-scan",
                label: "EXPLAIN — Index Scan por salario",
                description: "Aprovecha idx_emp_salary creado en el seed",
                sql: `EXPLAIN (ANALYZE, FORMAT TEXT)
SELECT *
FROM employees
WHERE salary > 85000;`,
            },
            {
                id: "explain-visual",
                label: "EXPLAIN visual — JOIN con índice",
                description:
                    "Usa Ctrl+Shift+Enter para ver el árbol visual de este plan",
                sql: `SELECT e.first_name, e.last_name, d.dept_name, o.order_date, o.total
FROM employees e
JOIN departments d  ON e.dept_id  = d.dept_id
JOIN orders o       ON o.emp_id   = e.emp_id
WHERE o.total > 2000
ORDER BY o.order_date DESC
LIMIT 50;`,
            },
            {
                id: "create-index",
                label: "CREATE / DROP INDEX",
                description: "Crea un índice compuesto y observa el cambio en EXPLAIN",
                sql: `-- Ejecuta primero, luego usa EXPLAIN en la query de abajo
CREATE INDEX IF NOT EXISTS idx_emp_dept_salary
  ON employees(dept_id, salary DESC);

-- Ahora prueba esto con EXPLAIN (Ctrl+Shift+Enter):
-- SELECT * FROM employees WHERE dept_id = 1 ORDER BY salary DESC;`,
            },
            {
                id: "index-only-scan",
                label: "Index Only Scan",
                description:
                    "Una query cubierta completamente por el índice (no va al heap)",
                sql: `EXPLAIN (ANALYZE, FORMAT TEXT)
SELECT dept_id, salary
FROM employees
WHERE dept_id = 1
ORDER BY salary DESC;`,
            },
        ],
    },
    {
        id: "modulo1-sort",
        label: "Módulo I — Sort & Buffer",
        icon: "⚙️",
        snippets: [
            {
                id: "sort-in-memory",
                label: "ORDER BY — sort en memoria",
                description: "Sort simple usando idx_emp_salary",
                sql: `EXPLAIN (ANALYZE, FORMAT TEXT)
SELECT emp_id, first_name, salary
FROM employees
ORDER BY salary DESC;`,
            },
            {
                id: "window-rank",
                label: "Window Function — RANK()",
                description: "Ranking de salarios por departamento con RANK()",
                sql: `SELECT
  d.dept_name,
  e.first_name || ' ' || e.last_name AS employee,
  e.salary,
  RANK()       OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rank,
  DENSE_RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS dense_rank,
  ROW_NUMBER() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS row_num
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY d.dept_name, rank;`,
            },
            {
                id: "window-lead-lag",
                label: "Window — LEAD / LAG",
                description: "Diferencia de salario con el empleado anterior",
                sql: `SELECT
  first_name || ' ' || last_name AS employee,
  dept_id,
  salary,
  LAG(salary)  OVER (PARTITION BY dept_id ORDER BY salary) AS prev_salary,
  LEAD(salary) OVER (PARTITION BY dept_id ORDER BY salary) AS next_salary,
  salary - LAG(salary) OVER (PARTITION BY dept_id ORDER BY salary) AS diff
FROM employees
ORDER BY dept_id, salary;`,
            },
        ],
    },
    {
        id: "lab01-explain",
        label: "Lab 01 — EXPLAIN ANALYZE",
        icon: "🔬",
        snippets: [
            {
                id: "explain-basic",
                label: "EXPLAIN ANALYZE básico",
                description: "Ejecuta la query y muestra el plan real con métricas de tiempo y filas",
                sql: `EXPLAIN ANALYZE
SELECT e.first_name, e.last_name, d.dept_name
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
WHERE e.salary > 50000;

-- QUÉ OBSERVAR:
-- cost=      → estimación del optimizer (startup..total)
-- rows=      → filas estimadas por el plan
-- actual time= → tiempo real de ejecución (ms)
-- actual rows= → filas realmente procesadas
-- loops=     → veces que se ejecutó el nodo
-- buffers:   → páginas leídas del buffer / disco`,
            },
            {
                id: "explain-seq-vs-index",
                label: "Seq Scan vs Index Scan",
                description: "Compara cuándo el optimizer elige cada tipo de scan",
                sql: `-- ① High selectivity → Index Scan
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM employees WHERE salary > 90000;

-- ② Low selectivity → Seq Scan
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM employees WHERE salary > 40000;`,
            },
            {
                id: "explain-join-methods",
                label: "Métodos de JOIN",
                description: "Analiza Nested Loop, Hash Join, Merge Join en distintas queries",
                sql: `-- Hash Join (tablas medianas sin índice en join key)
EXPLAIN ANALYZE
SELECT e.first_name, d.dept_name
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id;

-- Para forzar Nested Loop:
-- SET enable_hashjoin = off;
-- SET enable_mergejoin = off;`,
            },
            {
                id: "explain-group-agg",
                label: "HashAggregate — GROUP BY",
                description: "Observa HashAggregate en el plan de una consulta agrupada",
                sql: `EXPLAIN ANALYZE
SELECT
  d.dept_name,
  COUNT(e.emp_id)        AS headcount,
  ROUND(AVG(e.salary),2) AS avg_salary
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
GROUP BY d.dept_name
ORDER BY avg_salary DESC;`,
            },
        ],
    },
    {
        id: "lab01-pgcatalog",
        label: "Lab 01 — pg_catalog",
        icon: "📖",
        snippets: [
            {
                id: "pgcatalog-tables",
                label: "pg_class — Tablas e índices",
                description: "Lista todas las tablas e índices del schema actual",
                sql: `-- pg_class: tablas, índices, vistas, secuencias
SELECT
  relname        AS nombre,
  relkind        AS tipo,   -- 'r'=tabla, 'i'=índice, 'v'=vista
  reltuples::int AS filas_estimadas,
  relpages       AS paginas
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
ORDER BY relkind, relname;`,
            },
            {
                id: "pgcatalog-columns",
                label: "pg_attribute — Columnas de tabla",
                description: "Inspecciona las columnas de una tabla específica",
                sql: `-- pg_attribute: columnas de cada tabla/vista
SELECT
  a.attname                               AS columna,
  pg_catalog.format_type(a.atttypid, a.atttypmod) AS tipo,
  a.attnotnull                            AS not_null,
  a.attnum                                AS orden
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
WHERE c.relname = 'employees'
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY a.attnum;`,
            },
            {
                id: "pgcatalog-indexes",
                label: "pg_index — Índices definidos",
                description: "Ve todos los índices con sus columnas y propiedades",
                sql: `-- pg_index + pg_class: índices definidos en la BD
SELECT
  i.relname                   AS indice,
  t.relname                   AS tabla,
  ix.indisunique              AS unico,
  ix.indisprimary             AS primary_key,
  array_to_string(
    array(SELECT pg_get_indexdef(ix.indexrelid, k+1, true)
          FROM generate_subscripts(ix.indkey, 1) AS k),
    ', '
  )                           AS columnas
FROM pg_index ix
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
WHERE t.relnamespace = 'public'::regnamespace
ORDER BY t.relname, i.relname;`,
            },
            {
                id: "pgcatalog-stats",
                label: "pg_stats — Histogramas del optimizer",
                description: "Consulta las estadísticas que usa el optimizer para estimar costos",
                sql: `-- pg_stats: estadísticas para el optimizer
-- n_distinct, histogramas, MCVs, correlation
SELECT
  attname          AS columna,
  n_distinct,
  correlation,     -- 1 = perfectamente ordenado, -1 = inverso
  null_frac        AS fraccion_nulos,
  most_common_vals AS valores_frecuentes
FROM pg_stats
WHERE tablename = 'employees'
ORDER BY attname;`,
            },
            {
                id: "pgcatalog-ndistinct-compare",
                label: "n_distinct real vs estimado",
                description: "Compara el n_distinct real contra la estimación del optimizer",
                sql: `-- n_distinct real vs estimado por el optimizer (Lab 01 actividad 3)
SELECT
  s.attname                              AS columna,
  s.n_distinct                           AS estimado_optimizer,
  COUNT(DISTINCT e.dept_id)              AS real_dept_id,
  COUNT(DISTINCT e.salary)               AS real_salary
FROM pg_stats s
CROSS JOIN employees e
WHERE s.tablename = 'employees'
  AND s.attname IN ('dept_id', 'salary')
GROUP BY s.attname, s.n_distinct;`,
            },
            {
                id: "pgcatalog-constraints",
                label: "pg_constraint — PK, FK, UQ, Check",
                description: "Muestra todas las restricciones definidas en el schema",
                sql: `-- pg_constraint: restricciones PK, FK, UQ, Check
SELECT
  c.conname   AS restriccion,
  c.contype   AS tipo,  -- 'p'=PK, 'f'=FK, 'u'=UQ, 'c'=Check
  t.relname   AS tabla,
  r.relname   AS tabla_referenciada
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
LEFT JOIN pg_class r ON r.oid = c.confrelid
WHERE t.relnamespace = 'public'::regnamespace
ORDER BY t.relname, c.contype;`,
            },
        ],
    },
    {
        id: "modulo2-fts",
        label: "Módulo II — Full-Text",
        icon: "🔍",
        snippets: [
            {
                id: "fts-basic",
                label: "Full-Text Search básico",
                description: "Búsqueda con to_tsquery sobre el GIN index",
                sql: `SELECT product_name, category, price
FROM products
WHERE ts_name @@ to_tsquery('english', 'keyboard | monitor | headset');`,
            },
            {
                id: "fts-rank",
                label: "Full-Text con ts_rank",
                description: "Ranking por relevancia usando ts_rank",
                sql: `SELECT
  product_name,
  category,
  price,
  ts_rank(ts_name, query) AS relevance
FROM products,
     to_tsquery('english', 'wireless | monitor | keyboard | ergonomic') query
WHERE ts_name @@ query
ORDER BY relevance DESC;`,
            },
            {
                id: "cte-sales",
                label: "CTE — análisis de ventas",
                description: "WITH clause para análisis multi-nivel",
                sql: `WITH monthly_sales AS (
  SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(total)                      AS revenue,
    COUNT(*)                        AS orders
  FROM orders
  WHERE status NOT IN ('cancelled')
  GROUP BY 1
),
ranked AS (
  SELECT *,
    RANK() OVER (ORDER BY revenue DESC) AS rank
  FROM monthly_sales
)
SELECT
  TO_CHAR(month, 'Mon YYYY') AS month,
  orders,
  ROUND(revenue, 2)          AS revenue,
  rank
FROM ranked
ORDER BY month;`,
            },
        ],
    },
    {
        id: "modulo3-partition",
        label: "Módulo III — Particionamiento",
        icon: "🧩",
        snippets: [
            {
                id: "range-partition-sim",
                label: "Simulación partición por rango (salary)",
                description:
                    "Simula cómo se distribuirían los empleados en particiones de salario",
                sql: `SELECT
  CASE
    WHEN salary < 65000 THEN 'Partition 1: < 65k'
    WHEN salary < 80000 THEN 'Partition 2: 65k–80k'
    WHEN salary < 90000 THEN 'Partition 3: 80k–90k'
    ELSE                     'Partition 4: ≥ 90k'
  END AS partition,
  COUNT(*)           AS rows,
  MIN(salary)        AS min_sal,
  MAX(salary)        AS max_sal
FROM employees
GROUP BY 1
ORDER BY 1;`,
            },
            {
                id: "hash-partition-sim",
                label: "Simulación Hash Partition (4 nodos)",
                description:
                    "Muestra cómo hashmod distribuiría las filas entre 4 nodos",
                sql: `SELECT
  'Node ' || (emp_id % 4) AS node,
  COUNT(*)                AS rows,
  ROUND(AVG(salary), 2)  AS avg_salary
FROM employees
GROUP BY 1
ORDER BY 1;`,
            },
            {
                id: "vertical-fragment",
                label: "Simulación fragmentación vertical",
                description:
                    "Columnas 'hot' vs 'cold' — query que solo toca el fragmento hot",
                sql: `-- Fragmento HOT (columnas frecuentemente consultadas)
SELECT emp_id, first_name, last_name, dept_id, salary
FROM employees
WHERE dept_id = 1
ORDER BY salary DESC;

-- Fragmento COLD (datos históricos, raramente consultados)
-- SELECT emp_id, hire_date, manager_id FROM employees;`,
            },
        ],
    },
];
