import { PGlite } from "@electric-sql/pglite";

let db: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

const SEED_SQL = `
-- Departments
CREATE TABLE IF NOT EXISTS departments (
  dept_id   SERIAL PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL,
  location  VARCHAR(50)
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  emp_id      SERIAL PRIMARY KEY,
  first_name  VARCHAR(50) NOT NULL,
  last_name   VARCHAR(50) NOT NULL,
  dept_id     INT REFERENCES departments(dept_id),
  salary      NUMERIC(10,2),
  hire_date   DATE,
  manager_id  INT REFERENCES employees(emp_id)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  product_id   SERIAL PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  category     VARCHAR(50),
  price        NUMERIC(10,2),
  stock        INT DEFAULT 0
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  order_id    SERIAL PRIMARY KEY,
  emp_id      INT REFERENCES employees(emp_id),
  order_date  DATE NOT NULL,
  total       NUMERIC(10,2),
  status      VARCHAR(20) DEFAULT 'pending'
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  item_id    SERIAL PRIMARY KEY,
  order_id   INT REFERENCES orders(order_id),
  product_id INT REFERENCES products(product_id),
  quantity   INT NOT NULL,
  unit_price NUMERIC(10,2)
);

-- Seed departments
INSERT INTO departments (dept_name, location) VALUES
  ('Engineering',  'Lima'),
  ('Sales',        'Arequipa'),
  ('Marketing',    'Lima'),
  ('HR',           'Cusco'),
  ('Finance',      'Lima')
ON CONFLICT DO NOTHING;

-- Seed employees (50 rows)
INSERT INTO employees (first_name, last_name, dept_id, salary, hire_date, manager_id) VALUES
  ('Ana',      'Torres',    1, 95000,  '2019-03-15', NULL),
  ('Luis',     'García',    1, 87000,  '2020-06-01', 1),
  ('María',    'López',     2, 72000,  '2018-11-20', NULL),
  ('Carlos',   'Mendez',    2, 68000,  '2021-01-10', 3),
  ('Sofia',    'Ríos',      3, 78000,  '2019-08-05', NULL),
  ('Diego',    'Paredes',   1, 92000,  '2020-02-14', 1),
  ('Valentina','Cruz',      4, 60000,  '2022-03-01', NULL),
  ('Andrés',   'Flores',    5, 85000,  '2017-09-18', NULL),
  ('Camila',   'Suárez',    1, 76000,  '2021-07-22', 1),
  ('Roberto',  'Vargas',    2, 65000,  '2023-01-05', 3),
  ('Isabella', 'Morales',   3, 70000,  '2020-04-30', 5),
  ('Miguel',   'Romero',    1, 88000,  '2019-12-01', 1),
  ('Lucía',    'Jiménez',   4, 58000,  '2022-08-15', 7),
  ('Fernando', 'Reyes',     5, 79000,  '2018-05-20', 8),
  ('Mariana',  'Castro',    2, 67000,  '2021-11-11', 3),
  ('Pablo',    'Ortega',    1, 83000,  '2020-09-09', 1),
  ('Daniela',  'Guerrero',  3, 73000,  '2019-06-25', 5),
  ('Santiago', 'Medina',    1, 91000,  '2018-03-03', 1),
  ('Natalia',  'Vega',      4, 62000,  '2023-02-28', 7),
  ('Emilio',   'Silva',     5, 77000,  '2020-10-14', 8),
  ('Paola',    'Ramos',     2, 69000,  '2021-05-17', 3),
  ('Javier',   'Peña',      1, 86000,  '2019-01-07', 1),
  ('Carolina', 'Herrera',   3, 74000,  '2022-04-19', 5),
  ('Gustavo',  'Ramírez',   5, 81000,  '2018-07-23', 8),
  ('Valeria',  'Acosta',    4, 59000,  '2023-06-01', 7),
  ('Sebastián','Delgado',   1, 89000,  '2020-11-30', 1),
  ('Stefanía', 'Navarro',   2, 71000,  '2021-09-14', 3),
  ('Rodrigo',  'Cabrera',   1, 84000,  '2019-04-22', 1),
  ('Ana Paula','Soto',      3, 76000,  '2022-01-08', 5),
  ('Marcos',   'Fuentes',   5, 80000,  '2018-10-16', 8),
  ('Elena',    'Castillo',  4, 61000,  '2023-03-20', 7),
  ('Nicolás',  'Pinto',     1, 93000,  '2019-07-11', 1),
  ('Alejandra','Quispe',    2, 66000,  '2021-12-03', 3),
  ('Tomás',    'Huanca',    1, 82000,  '2020-08-27', 1),
  ('Renata',   'Chávez',    3, 71000,  '2022-06-14', 5),
  ('Alonso',   'Mamani',    5, 78000,  '2018-12-29', 8),
  ('Pamela',   'Cárdenas',  4, 57000,  '2023-07-04', 7),
  ('Hugo',     'Lozano',    1, 87000,  '2020-03-18', 1),
  ('Adriana',  'Noriega',   2, 68000,  '2021-08-09', 3),
  ('Gabriel',  'Espinoza',  1, 90000,  '2019-09-05', 1),
  ('Roxana',   'Cornejo',   3, 72000,  '2022-10-21', 5),
  ('Iván',     'Salas',     5, 76000,  '2018-04-13', 8),
  ('Milagros', 'Pacheco',   4, 60000,  '2023-08-17', 7),
  ('Ernesto',  'Miranda',   1, 85000,  '2020-05-06', 1),
  ('Karina',   'Salinas',   2, 70000,  '2021-10-28', 3),
  ('Víctor',   'Aguirre',   1, 88000,  '2019-02-14', 1),
  ('Mónica',   'Zárate',    3, 69000,  '2022-07-31', 5),
  ('César',    'Ibáñez',    5, 77000,  '2018-08-08', 8),
  ('Ximena',   'Coello',    4, 58000,  '2023-09-22', 7),
  ('Arturo',   'Fonseca',   1, 94000,  '2019-10-30', 1)
ON CONFLICT DO NOTHING;

-- Seed products
INSERT INTO products (product_name, category, price, stock) VALUES
  ('Laptop Pro 15"',     'Electronics',   1299.99, 45),
  ('Mechanical Keyboard','Electronics',    129.99, 200),
  ('4K Monitor 32"',     'Electronics',    549.99, 80),
  ('Wireless Mouse',     'Electronics',     49.99, 350),
  ('USB-C Hub 7-in-1',   'Electronics',     79.99, 120),
  ('Desk Chair Ergonomic','Furniture',      299.99, 30),
  ('Standing Desk',      'Furniture',       499.99, 15),
  ('Whiteboard 60"',     'Office',           89.99, 25),
  ('Notebook Pack x10',  'Office',           14.99, 500),
  ('Ballpoint Pen Set',  'Office',            9.99, 1000),
  ('Webcam 4K',          'Electronics',     149.99, 90),
  ('Noise Cancel Headset','Electronics',    199.99, 75),
  ('External SSD 1TB',   'Electronics',    109.99, 130),
  ('Printer Laser B&W',  'Office',          249.99, 20),
  ('Paper Ream A4',      'Office',            6.99, 2000),
  ('Coffee Maker Pro',   'Appliances',      149.99, 40),
  ('Mini Fridge',        'Appliances',      179.99, 10),
  ('Air Purifier',       'Appliances',      229.99, 20),
  ('Cable Manager Kit',  'Office',           19.99, 300),
  ('Monitor Arm Dual',   'Furniture',        89.99, 60)
ON CONFLICT DO NOTHING;

-- Seed orders (100 rows)  
INSERT INTO orders (emp_id, order_date, total, status)
SELECT
  (random() * 49 + 1)::int,
  DATE '2023-01-01' + (random() * 730)::int,
  (random() * 5000 + 50)::numeric(10,2),
  (ARRAY['pending','processing','shipped','delivered','cancelled'])[floor(random()*5+1)::int]
FROM generate_series(1, 100)
ON CONFLICT DO NOTHING;

-- Seed order_items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
  o.order_id,
  (random() * 19 + 1)::int,
  (random() * 5 + 1)::int,
  p.price * (0.9 + random() * 0.2)
FROM orders o
JOIN products p ON p.product_id = (random() * 19 + 1)::int
ON CONFLICT DO NOTHING;

-- Índices para los ejemplos del módulo
CREATE INDEX IF NOT EXISTS idx_emp_dept    ON employees(dept_id);
CREATE INDEX IF NOT EXISTS idx_emp_salary  ON employees(salary);
CREATE INDEX IF NOT EXISTS idx_order_date  ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_emp   ON orders(emp_id);
CREATE INDEX IF NOT EXISTS idx_item_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_prod_cat    ON products(category);

-- Full-text search (Módulo II)
ALTER TABLE products ADD COLUMN IF NOT EXISTS ts_name tsvector
  GENERATED ALWAYS AS (to_tsvector('english', product_name)) STORED;
CREATE INDEX IF NOT EXISTS idx_products_fts ON products USING GIN(ts_name);
`;

export async function getDB(): Promise<PGlite> {
    if (db) return db;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const instance = new PGlite();
        await instance.exec(SEED_SQL);
        db = instance;
        return db;
    })();

    return initPromise;
}

export async function runQuery(
    sql: string
): Promise<{ rows: Record<string, unknown>[]; fields: { name: string; dataTypeID: number }[]; time: number }> {
    const instance = await getDB();
    const start = performance.now();
    const result = await instance.query<Record<string, unknown>>(sql);
    const time = performance.now() - start;
    return { rows: result.rows, fields: result.fields, time };
}

export async function runExplain(
    sql: string
): Promise<{ plan: ExplainNode; time: number }> {
    const instance = await getDB();
    const start = performance.now();
    const result = await instance.query<{ "QUERY PLAN": ExplainNode[] }>(
        `EXPLAIN (ANALYZE, FORMAT JSON) ${sql}`
    );
    const time = performance.now() - start;
    const plan = (result.rows[0] as Record<string, unknown>)["QUERY PLAN"] as ExplainNode[];
    return { plan: plan[0], time };
}

export interface ExplainNode {
    "Node Type": string;
    "Relation Name"?: string;
    "Alias"?: string;
    "Startup Cost": number;
    "Total Cost": number;
    "Plan Rows": number;
    "Plan Width": number;
    "Actual Startup Time"?: number;
    "Actual Total Time"?: number;
    "Actual Rows"?: number;
    "Actual Loops"?: number;
    "Shared Hit Blocks"?: number;
    "Shared Read Blocks"?: number;
    "Plans"?: ExplainNode[];
    "Filter"?: string;
    "Index Name"?: string;
    "Index Cond"?: string;
    "Hash Cond"?: string;
    "Join Type"?: string;
    "Sort Key"?: string[];
    "Planning Time"?: number;
    "Execution Time"?: number;
}
