# Examen Final · CS2042 Bases de Datos II (2025-1, sección 1)

**Profesor:** Heider Sanchez
**Resolución** siguiendo el contenido de las diapositivas del curso (Módulos II y III).

> Las respuestas se redactan en el orden y puntaje del enunciado: Pregunta 1 (5 pts), Pregunta 2 (7 pts), Pregunta 3 (8 pts).

---

## Pregunta 1 (5 pts) · Preguntas cortas

### 1.1 (1 pt) ¿En qué escenarios se aplica el diseño de BD distribuidas Bottom-Up?

El enfoque **Bottom-Up** se aplica cuando **ya existen varias bases de datos** funcionando en distintos sitios y se quieren **integrar** en un esquema global, en lugar de diseñar la distribución desde cero (eso sería Top-Down).

Escenarios típicos:

- **Integración de sistemas heredados (legacy)** o bases preexistentes que nacieron de forma independiente.
- **Fusiones o adquisiciones de empresas**, donde cada organización trae su propia base.
- **Federación de bases de datos autónomas y heterogéneas** (distinto hardware/software/esquema) que deben verse como una sola.

En Bottom-Up **no hay problema de fragmentación** (los datos ya están repartidos): el reto es la **integración de esquemas**. Cada base aporta su *esquema conceptual local*, se publica un *esquema de exportación* y mediante *integración de esquemas* se construye el *esquema unificado*.

### 1.2 (1 pt) Diferencias entre respaldo (backup) y replicación; cuándo usar cada uno

| | **Backup (respaldo)** | **Replicación** |
|---|---|---|
| Qué es | Copia **puntual e histórica** de los datos | Copias **vivas y sincronizadas** en varios nodos |
| Estado | Offline / no consultable directamente | Online / consultable y activa |
| Objetivo | **Recuperación** ante desastres / durabilidad | **Disponibilidad**, tolerancia a fallos, rendimiento |
| Frecuencia | Periódica (diaria, semanal) | Continua / casi en tiempo real |
| Protege contra borrado lógico | **Sí** (se vuelve a un estado anterior) | **No** (el borrado se replica a todas las copias) |

**Diferencia funcional clave:** el backup permite **volver atrás en el tiempo** (point-in-time recovery), mientras que la replicación mantiene **el estado actual disponible** en varios lugares pero no guarda historia.

**Cuándo aplicar cada una:**

- **Backup:** retención/cumplimiento normativo, recuperación ante ransomware, corrupción o borrado accidental, y restauración a un punto en el tiempo.
- **Replicación:** sistemas que requieren **alta disponibilidad 24/7**, *failover* automático, **escalar las lecturas** (balanceo de carga) y acercar los datos al usuario (baja latencia geográfica).

> En la práctica son **complementarios**: la replicación da disponibilidad, el backup da protección histórica.

### 1.3 (1 pt) Consulta en PostgreSQL con índice GIN que aproxime la similitud de coseno

El índice **GIN** es un **índice invertido**: para cada término guarda la lista de documentos que lo contienen. Esa es exactamente la estructura del modelo vectorial, donde el coseno solo se evalúa sobre los documentos que **comparten términos** con la consulta. Por eso la búsqueda *full-text* con GIN + un ranking ponderado **aproxima** el comportamiento del coseno.

```sql
-- Índice invertido sobre el texto
CREATE INDEX idx_doc_fts ON documentos
USING GIN (to_tsvector('spanish', contenido));

-- Recuperación + ranking que aproxima el coseno
SELECT d.id,
       ts_rank_cd(to_tsvector('spanish', d.contenido), q, 32) AS score
FROM   documentos d,
       to_tsquery('spanish', 'oro & plata & camion') AS q
WHERE  to_tsvector('spanish', d.contenido) @@ q   -- usa el GIN (filtra candidatos)
ORDER  BY score DESC
LIMIT  10;
```

Por qué aproxima al coseno:

- El operador `@@` usa el **GIN** para traer **solo los documentos que comparten términos** con la consulta (igual que recorrer las *posting lists* del término en el modelo vectorial).
- `ts_rank_cd` pondera por la **frecuencia de los términos** (efecto TF) y su **cercanía** (cover density).
- El flag de **normalización `32`** divide el score por la longitud del documento, replicando la **normalización por la norma del vector** `||d||` del coseno (evita que los documentos largos dominen).
- Con `setweight()` se pueden dar pesos a campos (título vs cuerpo), acercándose más a un TF-IDF ponderado.

### 1.4 (1 pt) Dos diferencias y dos similitudes entre Cassandra y MongoDB

**Similitudes:**

1. Ambos son **NoSQL distribuidos**, diseñados para **escalar horizontalmente** (sharding/particionamiento) y dar alta disponibilidad sobre clústeres de máquinas comunes.
2. Ambos son **schema-flexible** (sin esquema rígido como el relacional), no usan JOINs al estilo SQL y ofrecen **consistencia ajustable / eventual** (priorizan disponibilidad sobre consistencia fuerte).

**Diferencias:**

1. **Modelo de datos:** MongoDB es un **document store** (documentos JSON/BSON flexibles y anidados); Cassandra es un **wide-column store** (familias de columnas; cada fila se identifica por una *partition key* + *clustering key*).
2. **Arquitectura:** Cassandra es **masterless / peer-to-peer** (todos los nodos son iguales, replicación tunable, optimizado para **escrituras** muy rápidas); MongoDB usa **replica set master-slave** (un primario recibe escrituras, secundarios replican) con *config servers* para el sharding.

> Diferencia extra (consulta): MongoDB tiene un lenguaje de consulta **rico y ad-hoc** (aggregation pipeline, índices secundarios sobre cualquier campo); Cassandra usa **CQL**, donde las consultas deben diseñarse **alrededor de la partition key** (*query-driven modeling*).

### 1.5 (1 pt) Interpretación de la consulta MongoDB

```js
db.usuarios.aggregate([
  { $match: { edad: { $gte: 18 } } },                    // (1) filtra adultos
  { $group: { _id: "$ciudad", total: { $sum: 1 } } },    // (2) cuenta por ciudad
  { $sort:  { total: -1 } }                              // (3) ordena desc
])
```

**Interpretación:** de la colección `usuarios`, la *pipeline* de agregación:

1. **`$match`** selecciona únicamente los usuarios con **edad ≥ 18** (mayores de edad).
2. **`$group`** los agrupa **por ciudad** y cuenta cuántos hay en cada una (`$sum: 1` = un conteo por documento).
3. **`$sort`** ordena el resultado por ese conteo de **mayor a menor**.

En resumen: **devuelve las ciudades ordenadas por su cantidad de usuarios adultos, de la que más tiene a la que menos.**

Equivalente en SQL:

```sql
SELECT ciudad, COUNT(*) AS total
FROM   usuarios
WHERE  edad >= 18
GROUP  BY ciudad
ORDER  BY total DESC;
```

---

## Pregunta 2 (7 pts) · Base de Datos Multimedia

### 2.a (4 pts) Búsqueda eficiente basada en descriptores locales

**Contexto:** cada imagen (o una parte de ella) se transforma en uno o varios vectores de dimensión *d* (descriptores **locales**, p. ej. SIFT). Una imagen produce un **conjunto** de vectores, y el número **varía** por imagen.

#### Proceso (indexación + consulta)

1. **Extracción de descriptores.** Para cada imagen de la colección se detectan **puntos de interés** y se calcula un descriptor local por cada uno: `Imagenᵢ → {P₁, P₂, …, Pₘ}`. Conviene que los descriptores sean de **baja dimensión** (por la *maldición de la dimensionalidad*).
2. **Indexación.** Se inserta **cada** descriptor en un **índice multidimensional** (R\*-Tree / KD-Tree / Ball-Tree, o un índice ANN para alta dimensión) como pares `(IdImagen, Pⱼ)`. Los descriptores de una misma imagen quedan repartidos en distintas regiones (MBRs) del índice.
3. **Consulta.** De la imagen de consulta se extraen sus descriptores `{Q₁, …, Qₙ}`. Para **cada** `Qᵢ` se hace una **búsqueda k-NN** en el índice usando *filtrar-y-refinar* (un filtro barato da candidatos y la distancia real refina).
4. **Combinación de resultados parciales.** Cada `Qᵢ` "vota" por las imágenes a las que pertenecen sus vecinos. Se **combinan los votos** (conteo de coincidencias / *matching*) para producir el ranking final de imágenes más similares.

Como el problema se resuelve por partes y se combinan, el resultado es una **búsqueda aproximada (ANN)**, pero **escala** a colecciones grandes.

#### Gráfico de etapas

```
 Imagen de consulta
        │
        ▼
 [ Extracción de descriptores locales ]   Q1, Q2, …, Qn   (vectores de dim d)
        │
        ▼
 [ Índice multidimensional ]  ── k-NN por cada Qi ──►  candidatos (IdImagen, Pj)
        │                                   (filtrar-y-refinar)
        ▼
 [ Combinación de parciales / votación ]
        │
        ▼
 Ranking de imágenes más similares  (k-NN final)
```

> Misma idea que el indexado de la colección: cada imagen base se procesó como
> `Imagenᵢ → {P1..Pm} → insertados en el índice`.

#### 2.a (parte 2) ¿Qué tipo de búsqueda soporta este esquema?

Soporta **búsqueda por similitud basada en contenido (CBIR) por objeto / sub-imagen**, es decir, encontrar imágenes que contienen **la misma región u objeto**, aunque aparezca **parcialmente, a otra escala o rotado**.

**Fundamento:** al indexar descriptores **locales** (no un único vector global de la imagen), basta con que **un subconjunto** de los descriptores haga *match* para reconocer el objeto. Esto da robustez a:

- **Oclusión** y **vistas parciales** (solo se ve parte del objeto).
- **Cambios de escala / resolución** (los descriptores tipo SIFT son *invariantes a escala*), lo que encaja directamente con el enunciado, donde **coexisten imágenes de baja y muy alta resolución**.

No es ideal para "similitud global de la imagen completa" (eso lo haría mejor un descriptor global tipo GIST/HOG), sino para **detección de objetos y de copias / near-duplicates**.

**Ejemplo de dato válido:** dar como consulta el **recorte del logotipo** de una marca (a baja resolución) y recuperar de la colección todas las fotos —incluso en muy alta resolución y con el logo parcialmente tapado— donde aparece ese logo. Otro ejemplo: una foto de un edificio tomada desde un ángulo, que recupera otras fotos del mismo edificio a distinta escala.

### 2.b (3 pts) k-NN con Distancia de Cota Inferior (Lower Bounding)

**Idea.** El algoritmo de 1 vecino mantiene `best_so_far` (la mejor distancia real hallada) y solo calcula la **distancia verdadera** (cara) cuando la **cota inferior** (barata) no permite descartar el candidato. Para extenderlo a **K vecinos** de forma eficiente:

- En lugar de un solo `best_so_far`, se mantiene un **heap máximo de tamaño K** con las K mejores distancias reales. La **raíz del heap** es la **K-ésima distancia** actual y hace de **umbral de poda**.
- Se descarta un candidato sin calcular su distancia real cuando `LB(Q, C) ≥ K-ésima_distancia`. Esto es **correcto** porque la cota inferior cumple `LB(Q,C) ≤ Dist(Q,C)`: si ni la cota cabe en el top-K, la distancia real tampoco → **no hay falsos negativos** (resultado exacto).
- A medida que el heap se llena, el umbral **se aprieta** y se poda más.

```python
import heapq

# KNN con Lower Bounding Distance
# Q: objeto de consulta ; K: nº de vecinos ; collection: objetos C_i
def Lower_Bounding_KNN(Q, K):
    heap = []                       # max-heap de tamaño K: guarda (-dist_real, id)
    kth = float('inf')              # K-ésima distancia actual (umbral de poda)

    for i, C in enumerate(collection):
        lb = LB(Q, C)               # cota inferior (barata)
        if lb >= kth:               # PODA: ni en el mejor caso entra al top-K
            continue
        d = Dist(Q, C)              # distancia verdadera (cara) solo si pasa el filtro
        if len(heap) < K:
            heapq.heappush(heap, (-d, i))
            if len(heap) == K:
                kth = -heap[0][0]   # ya hay K: fija el umbral en la K-ésima
        elif d < kth:
            heapq.heapreplace(heap, (-d, i))  # saca el peor, mete el nuevo (O(log K))
            kth = -heap[0][0]                 # actualiza la K-ésima

    # devolver los K ids ordenados del más cercano al más lejano
    return [i for (_, i) in sorted(heap, reverse=True)]
```

**Por qué es eficiente:**

- El `Dist` (caro) se evita en todos los candidatos cuya cota inferior ya supera la K-ésima distancia.
- El heap de tamaño K mantiene el umbral **lo más bajo posible** desde temprano (poda agresiva).
- Cada inserción/reemplazo es `O(log K)`; el costo dominante son los pocos `Dist` que sí se calculan.
- Garantiza el **resultado exacto** de los K-NN gracias a la propiedad de cota inferior.

---

## Pregunta 3 (8 pts) · Fragmentación y Consulta Distribuida

**Entorno:** 3 servidores **esclavos** (almacenan las particiones) + 1 servidor **central** (coordina la consulta y ensambla resultados). Tablas:

- `Pedidos(IdPedido, IdCliente, FechaPedido, Monto, Ciudad, Estado)`
- `Repartidores(IdRepartidor, Nombre, TipoVehiculo, Ciudad, Disponibilidad, Calificacion)`

### 3.1 (1 pt) Fragmentación horizontal de cada tabla

| Tabla | Atributo de acceso frecuente | Tipo de fragmentación | Por qué |
|---|---|---|---|
| **Pedidos** | rangos de `FechaPedido` | **Horizontal por RANGO de fecha** | las consultas filtran por intervalos de fecha → con rangos se hace *partition pruning* (se toca solo el/los fragmentos del rango) |
| **Repartidores** | `IdRepartidor` (auto-incremental) | **Horizontal por HASH de IdRepartidor** | el id es auto-incremental; el hash reparte **uniformemente** entre los 3 nodos (balance) y las búsquedas por id puntual van a un solo fragmento |

Cada tabla se parte en **3 fragmentos**, uno por servidor esclavo, para una distribución **balanceada**:

- `Pedidos`: 3 rangos de fecha elegidos para que cada esclavo reciba ~1/3 del volumen (al ser datos históricos, se pueden tomar rangos por año o ajustar los límites para igualar el conteo).
- `Repartidores`: `HASH(IdRepartidor) mod 3` → reparto uniforme. *(Alternativa válida: por RANGO de id, también balanceada por ser auto-incremental.)*

> **Observación importante para la consulta:** ninguna tabla se fragmenta por `Ciudad`. Por lo tanto el `JOIN ... ON R.Ciudad = P.Ciudad` **no es local**: es una **agregación distribuida** que el coordinador debe orquestar.

### 3.2 (4 pts) Algoritmo distribuido optimizado

**Análisis de la consulta:**

```sql
SELECT R.Ciudad,
       COUNT(DISTINCT R.IdRepartidor) AS TotalRepartidores,
       SUM(P.Monto)                   AS MontoTotal
FROM   Repartidores R JOIN Pedidos P ON R.Ciudad = P.Ciudad
GROUP  BY R.Ciudad
ORDER  BY MontoTotal DESC;
```

La métrica de repartidores viene **solo** de `Repartidores` y la de monto **solo** de `Pedidos`. Hacer primero el `JOIN` por ciudad es **caro e incorrecto** para `SUM(Monto)`: cada pedido se repetiría una vez por cada repartidor de la ciudad, inflando el monto. Por eso la versión **optimizada** calcula **dos agregaciones independientes por ciudad** (una por tabla) y las une **al final** por ciudad. Esto además **minimiza el tráfico de red** (la meta del módulo): por la red solo viajan **agregados parciales por ciudad**, no las filas crudas.

Como `Repartidores` está particionada por `HASH(IdRepartidor)`, cada repartidor está en **un único** fragmento, así que `COUNT(DISTINCT IdRepartidor)` se reduce a **sumar los conteos parciales** entre esclavos (no hay repartidores duplicados entre fragmentos). De igual modo, los fragmentos de `Pedidos` son disjuntos, así que los montos parciales se suman sin doble conteo.

**Estrategia:** *push-down* de la agregación a cada esclavo (Map) + mezcla en el coordinador (Reduce) + orden final.

```
LOCAL-AGG(Sj)                          // se ejecuta en cada esclavo j sobre sus fragmentos
 1  Rj = mapa vacío                    // repartidores por ciudad (en el fragmento local)
 2  for each r in Repartidores_j
 3      Rj[r.Ciudad] = Rj[r.Ciudad] + 1
 4  Mj = mapa vacío                    // monto por ciudad (en el fragmento local)
 5  for each p in Pedidos_j
 6      Mj[p.Ciudad] = Mj[p.Ciudad] + p.Monto
 7  return (Rj, Mj)

DISTRIBUTED-CITY-REPORT()              // se ejecuta en el servidor central (coordinador)
 1  for each esclavo Sj in {S1, S2, S3}  in parallel        // dispersión (scatter)
 2      enviar la subconsulta LOCAL-AGG a Sj
 3  R = mapa vacío                     // acumulador de repartidores por ciudad
 4  M = mapa vacío                     // acumulador de monto por ciudad
 5  for each esclavo Sj                                       // recolección (gather)
 6      (Rj, Mj) = recibir resultado de Sj
 7      for each ciudad c in Rj
 8          R[c] = R[c] + Rj[c]        // mezcla: suma de conteos parciales
 9      for each ciudad c in Mj
10          M[c] = M[c] + Mj[c]        // mezcla: suma de montos parciales
11  result = ⟨⟩
12  for each ciudad c in claves(R) ∪ claves(M)
13      ADD(result, (c, R[c], M[c]))
14  ORDER-BY-DESC(result, MontoTotal)  // ordena por M[c] descendente
15  return result
```

**Optimizaciones aplicadas:**

- **Agregación parcial en el origen** (cada esclavo reduce sus filas a un mapa por ciudad) → solo viajan los agregados, no las filas.
- **Evita el join distribuido** (y el doble conteo de `Monto`): dos agregaciones por ciudad que se mezclan por clave.
- **Paralelismo**: los 3 esclavos trabajan a la vez; el coordinador solo mezcla (`O(#ciudades)`).

### 3.3 (3 pts) Sentencias SQL derivadas del diseño

**(a) DDL de fragmentación (particionamiento declarativo de PostgreSQL):**

```sql
-- Pedidos: fragmentación horizontal por RANGO de FechaPedido
CREATE TABLE Pedidos (
  IdPedido    int,
  IdCliente   int,
  FechaPedido date,
  Monto       numeric,
  Ciudad      text,
  Estado      text
) PARTITION BY RANGE (FechaPedido);

CREATE TABLE Pedidos_s1 PARTITION OF Pedidos     -- esclavo 1
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE Pedidos_s2 PARTITION OF Pedidos     -- esclavo 2
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE Pedidos_s3 PARTITION OF Pedidos     -- esclavo 3
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Repartidores: fragmentación horizontal por HASH de IdRepartidor
CREATE TABLE Repartidores (
  IdRepartidor  int,
  Nombre        text,
  TipoVehiculo  text,
  Ciudad        text,
  Disponibilidad boolean,
  Calificacion  numeric
) PARTITION BY HASH (IdRepartidor);

CREATE TABLE Repartidores_s1 PARTITION OF Repartidores
  FOR VALUES WITH (MODULUS 3, REMAINDER 0);
CREATE TABLE Repartidores_s2 PARTITION OF Repartidores
  FOR VALUES WITH (MODULUS 3, REMAINDER 1);
CREATE TABLE Repartidores_s3 PARTITION OF Repartidores
  FOR VALUES WITH (MODULUS 3, REMAINDER 2);
```

**(b) Subconsultas locales (se ejecutan en cada esclavo, sobre su fragmento):**

```sql
-- Parcial de repartidores por ciudad
SELECT Ciudad, COUNT(*) AS parcial_repartidores
FROM   Repartidores          -- fragmento local del esclavo
GROUP  BY Ciudad;

-- Parcial de monto por ciudad
SELECT Ciudad, SUM(Monto) AS parcial_monto
FROM   Pedidos               -- fragmento local del esclavo
GROUP  BY Ciudad;
```

**(c) Mezcla final en el coordinador** (combina los parciales de los 3 esclavos):

```sql
-- parciales_repartidores(Ciudad, parcial_repartidores)  -- unión de los 3 esclavos
-- parciales_monto(Ciudad, parcial_monto)                -- unión de los 3 esclavos

SELECT  COALESCE(r.Ciudad, m.Ciudad)        AS Ciudad,
        COALESCE(SUM(r.parcial_repartidores), 0) AS TotalRepartidores,
        COALESCE(SUM(m.parcial_monto), 0)        AS MontoTotal
FROM        parciales_repartidores r
FULL JOIN   parciales_monto m ON r.Ciudad = m.Ciudad
GROUP BY    COALESCE(r.Ciudad, m.Ciudad)
ORDER BY    MontoTotal DESC;
```

> El `FULL JOIN` por ciudad asegura incluir ciudades que solo tengan repartidores o solo pedidos. Como PostgreSQL hace *partition pruning*, si la consulta llevara un filtro por `FechaPedido` solo se tocarían los fragmentos de `Pedidos` correspondientes, reforzando la optimización.

---

## Resumen de conceptos del curso aplicados

- **Diseño de BDD:** Top-Down vs Bottom-Up, fragmentación + asignación (Módulo III).
- **Replicación vs backup**, NoSQL (MongoDB *document store* / aggregation pipeline, Cassandra *wide-column* / masterless).
- **Índice invertido GIN** y su relación con el modelo vectorial / coseno (Módulos II).
- **Descriptores locales (SIFT)**, indexación multidimensional, *filtrar-y-refinar*, combinación de parciales (búsqueda aproximada).
- **Cota inferior (lower bounding)** y k-NN exacto con poda + heap de tamaño K.
- **Fragmentación horizontal** por rango y por hash, **consulta distribuida optimizada** (push-down de agregación, minimizar costo de red), pseudocódigo estilo CLRS.
