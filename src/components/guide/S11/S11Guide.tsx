"use client";

import GuideLayout from "@/components/guide/GuideLayout";

import {
  H2, H3, P, Bold, Code, Divider,
  Ul, Callout, Table, CompareCards,
  Collapse, Pipeline, DiagramPlaceholder, MathBlock, Pseudo,
} from "@/components/guide/blocks";

/* ─────────────────────────────────────────────────────────────────────────────
   Sections (TOC + IntersectionObserver)
   ───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "sec-secuencial", label: "1. Costo de la búsqueda secuencial" },
  { id: "sec-filtrar",    label: "2. Filtrar-y-refinar" },
  { id: "sec-lowerbound", label: "3. Cota inferior (lower bound)" },
  { id: "sec-dtw",        label: "4. DTW y LB_Keogh" },
  { id: "sec-indices",    label: "5. Índices multidimensionales" },
  { id: "sec-maldicion",  label: "6. Maldición de la dimensionalidad" },
  { id: "sec-descriptores", label: "7. Descriptores locales (SIFT)" },
  { id: "sec-similitud",  label: "8. Similitud de descriptores" },
  { id: "sec-indexacion", label: "9. Indexar descriptores locales" },
];


/* ─────────────────────────────────────────────────────────────────────────────
   Right-side Table of Contents (con toggle ocultar/mostrar)
   ───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   S11 Guide — Búsqueda Eficiente y Descriptores Locales
   ───────────────────────────────────────────────────────────────────────────── */
export default function S11Guide() {
  return (
    <GuideLayout sections={SECTIONS}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Semana 11 · Módulo II · Motores Especializados
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Búsqueda Eficiente y Descriptores Locales
            </h1>
            <P>
              En la Semana 10 vimos <Bold>qué</Bold> buscamos (similitud por distancia). Ahora resolvemos el
              <Bold> cómo hacerlo rápido</Bold>: comparar la consulta contra <Bold>todos</Bold> los objetos es
              prohibitivo, así que usamos <Bold>filtrar-y-refinar</Bold> con <Bold>cotas inferiores</Bold>,{" "}
              <Bold>índices multidimensionales</Bold>, y representaciones por <Bold>descriptores locales</Bold>{" "}
              (SIFT), siempre peleando contra la <Bold>maldición de la dimensionalidad</Bold>.
            </P>
          </div>

          <Callout variant="note" title="Hilo de la semana">
            Búsqueda secuencial (cara) → filtrar-y-refinar → la garantía de la cota inferior (DTW + LB_Keogh)
            → índices multidimensionales (R*-Tree, KD-Tree, Ball-Tree) → por qué fallan en alta dimensión →
            descriptores locales como alternativa.
          </Callout>

          <Divider />

          {/* ══ 1. SECUENCIAL ══ */}
          <H2 id="sec-secuencial">1. El costo de la búsqueda secuencial</H2>
          <P>
            La forma más simple de responder una consulta es <Bold>recorrer toda la colección</Bold>,
            calculando la distancia a cada objeto. Funciona, pero no escala.
          </P>

          <H3>Búsqueda por rango</H3>
          <Pseudo>{`RANGE-SEARCH(Q, r)
1  result = ⟨⟩
2  for each object Cᵢ in the collection
3      dist = DIST(Q, Cᵢ)
4      if dist < r
5          ADD(result, Cᵢ)
6  return result`}</Pseudo>

          <H3>k vecinos más cercanos</H3>
          <Pseudo>{`KNN-SEARCH(Q, k)
1  result = ⟨⟩
2  for each object Cᵢ in the collection
3      dist = DIST(Q, Cᵢ)
4      ADD(result, (Cᵢ, dist))
5  ORDER-BY-DIST(result)
6  return result[1..k]`}</Pseudo>

          <Callout variant="warning" title="¿Por qué no escala?">
            La complejidad depende de dos factores:
            <MathBlock>{String.raw`\text{rango: } O(N \cdot D^{p}) \qquad\qquad k\text{-NN: } O(N \cdot D^{p}) + O(N \log N)`}</MathBlock>
            <Ul items={[
              <><Code>O(N)</Code>: la colección puede ser <Bold>enorme</Bold>.</>,
              <><Code>O(Dᵖ)</Code>: la función de distancia puede ser <Bold>cuadrática</Bold> (p ≥ 1, con D = dimensión y p = tipo de distancia).</>,
            ]} />
            Se necesitan <Bold>índices y algoritmos</Bold> para no comparar contra todo.
          </Callout>

          <Divider />

          {/* ══ 2. FILTRAR-Y-REFINAR ══ */}
          <H2 id="sec-filtrar">2. Filtrar-y-refinar (multi-step)</H2>
          <P>
            La <Bold>distancia verdadera</Bold> suele ser cara de calcular (a veces ni siquiera es métrica). La
            idea: usar un <Bold>filtro barato</Bold> para reducir la colección a un puñado de <Bold>candidatos</Bold>,
            y solo a esos aplicarles la distancia verdadera (refinamiento).
          </P>
          <Pipeline steps={[
            { label: "Filtro (índice)", sub: "distancia barata → candidatos", color: "#3b82f6" },
            { label: "Refinamiento", sub: "distancia verdadera (cara)", color: "#10b981" },
            { label: "Resultado", sub: "the chosen ones", color: "#f59e0b" },
          ]} />
          <Callout variant="note" title="Objetos del índice = candidatos, no el resultado">
            Lo que devuelve el índice <Bold>no es la respuesta final</Bold>, sino candidatos que luego se
            verifican con la distancia real.
          </Callout>

          <H3>Selectividad del filtro</H3>
          <P>Mide qué tan agresivo es el filtro. Cuanto menor, mejor (menos candidatos que refinar):</P>
          <MathBlock>{String.raw`\sigma_F = \frac{\#\ \text{de candidatos}}{\#\ \text{de objetos en la BD}}`}</MathBlock>

          <H3>Filtrado en cascada</H3>
          <Ul items={[
            <><Bold>Filtro 1:</Bold> el índice determina un primer conjunto de candidatos.</>,
            <><Bold>Filtros siguientes</Bold> (ej. una cota inferior <Code>LB</Code>) reducen aún más los candidatos.</>,
            <><Bold>Refinamiento:</Bold> la distancia verdadera <Code>Dist</Code> determina la respuesta correcta.</>,
          ]} />
          <DiagramPlaceholder label="Diagrama: Q → INDEX (Filter 1) → candidatos → LB (Filter 2) → fewer candidates → Dist (Refine) → resultado" height={170} />

          <Divider />

          {/* ══ 3. LOWER BOUND ══ */}
          <H2 id="sec-lowerbound">3. La garantía: cota inferior (lower bound)</H2>
          <Callout variant="definition" title="Condición de corrección">
            Para que filtrar-y-refinar sea <Bold>correcto</Bold>, la distancia del filtro debe ser una{" "}
            <Bold>cota inferior</Bold> de la distancia verdadera:
          </Callout>
          <MathBlock>{String.raw`d_{\text{filtro}}(Q, C) \;\le\; d_{\text{verdadera}}(Q, C)`}</MathBlock>
          <Ul items={[
            <><Bold>Si el filtro es cota inferior</Bold> → se garantiza que <Bold>no se pierde ningún objeto relevante</Bold> (no hay falsos negativos): si la cota ya supera el umbral, la distancia real también lo hará.</>,
            <><Bold>Si NO es cota inferior</Bold> → pueden aparecer <Bold>falsos negativos</Bold> y el resultado no está garantizado como completo.</>,
          ]} />
          <Callout variant="note">
            Esta es la idea central de la búsqueda eficiente <Bold>exacta</Bold>: podar con una cota barata sin
            arriesgar la completitud del resultado.
          </Callout>

          <Divider />

          {/* ══ 4. DTW ══ */}
          <H2 id="sec-dtw">4. Dynamic Time Warping (DTW) y LB_Keogh</H2>
          <P>
            <Bold>DTW</Bold> es una distancia para <Bold>series de tiempo</Bold> (también formas, audio/voz) que
            permite <Bold>alinear</Bold> dos secuencias aunque estén desfasadas o estiradas en el tiempo, algo
            que la distancia euclidiana punto-a-punto no logra.
          </P>
          <DiagramPlaceholder label="Diagrama: Euclidean matching (vertical) vs DTW matching (alineación flexible) entre dos series" height={160} />

          <H3>Definición y recurrencia</H3>
          <P>DTW busca el <Bold>camino de alineación (warping path)</Bold> de costo mínimo:</P>
          <MathBlock>{String.raw`DTW(Q, C) = \min\left\{ \frac{\sqrt{\sum_{k=1}^{K} w_k}}{K} \right\}`}</MathBlock>
          <P>Se calcula con programación dinámica (matriz de costos acumulados):</P>
          <MathBlock>{String.raw`M(i, j) = d(q_i, c_j) + \min\bigl\{\, M(i\!-\!1, j\!-\!1),\; M(i\!-\!1, j),\; M(i, j\!-\!1) \,\bigr\}`}</MathBlock>
          <Callout variant="warning" title="DTW es exacta pero lenta">
            Calcular DTW contra toda la base es <Code>O(N · D²)</Code>. Por eso necesitamos una cota inferior barata.
          </Callout>

          <Collapse title="Pseudocódigo: búsqueda secuencial con DTW" defaultOpen>
            <Pseudo>{`SEQUENTIAL-SCAN(Q)
1  best_so_far = ∞
2  for i = 1 to N
3      true_dist = DTW(Cᵢ, Q)
4      if true_dist < best_so_far
5          best_so_far = true_dist
6          index_of_best_match = i
7  return index_of_best_match`}</Pseudo>
          </Collapse>

          <H3>LB_Keogh: la cota inferior rápida</H3>
          <P>
            <Bold>LB_Keogh</Bold> es una cota inferior de DTW basada en una <Bold>envolvente (envelope)</Bold>{" "}
            superior <Code>U</Code> e inferior <Code>L</Code> alrededor de la consulta. Es <Bold>muy rápida</Bold>{" "}
            y cumple la garantía:
          </P>
          <MathBlock>{String.raw`LB\_Keogh(Q, C) \;\le\; DTW(Q, C)`}</MathBlock>
          <MathBlock>{String.raw`LB\_Keogh(Q, C) = \sum_{i=1}^{n} \begin{cases} (c_i - U_i)^2 & \text{si } c_i > U_i \\[2pt] (c_i - L_i)^2 & \text{si } c_i < L_i \\[2pt] 0 & \text{en otro caso} \end{cases}`}</MathBlock>

          <Collapse title="Pseudocódigo: scan con cota inferior (filtrar-y-refinar)">
            <Pseudo>{`LB-SEQUENTIAL-SCAN(Q)
 1  best_so_far = ∞
 2  for i = 1 to N
 3      lb_dist = LB-KEOGH(Cᵢ, Q)          // filtro barato
 4      if lb_dist < best_so_far
 5          true_dist = DTW(Cᵢ, Q)         // refinamiento (solo si pasa el filtro)
 6          if true_dist < best_so_far
 7              best_so_far = true_dist
 8              index_of_best_match = i
 9  return index_of_best_match`}</Pseudo>
            <P>
              Solo se calcula el DTW caro cuando la cota barata <Code>LB_Keogh</Code> no permite descartar el
              candidato. La mayoría se poda sin tocar el DTW.
            </P>
          </Collapse>

          <Divider />

          {/* ══ 5. ÍNDICES MULTIDIM ══ */}
          <H2 id="sec-indices">5. Índices multidimensionales</H2>
          <P>
            Generalizan la idea de los índices del Módulo I a <Bold>varias dimensiones</Bold>: organizan el
            espacio en <Bold>regiones</Bold> para que puntos cercanos queden juntos.
          </P>
          <Ul items={[
            <><Bold>Región espacial:</Bold> garantiza que puntos cercanos se almacenen, en lo posible, en la misma página/subárbol.</>,
            <><Bold>Jerarquía contenida:</Bold> la región de un nodo hijo está <Bold>completamente contenida</Bold> en la de su padre.</>,
            <><Bold>Dinámicos:</Bold> inserción y borrado eficientes en <Code>O(log n)</Code>.</>,
          ]} />

          <H3>Variantes con soporte k-NN</H3>
          <Table
            headers={["Índice", "Idea", "Cuándo conviene"]}
            rows={[
              ["R*-Tree", "Variante optimizada del R-Tree; minimiza el solapamiento de nodos (MBRs)", "Vectores de baja dimensión"],
              ["KD-Tree", "Árbol binario que particiona el espacio dimensión por dimensión", "Baja a moderada dimensión"],
              ["Ball-Tree", "Divide el espacio en hiperesferas (ball nodes)", "Mejor que KD-Tree en alta dimensión"],
            ]}
          />
          <DiagramPlaceholder label="Diagrama: KD-Tree (particiones + árbol binario) y Ball-Tree (hiperesferas anidadas)" height={170} />

          <Divider />

          {/* ══ 6. MALDICIÓN ══ */}
          <H2 id="sec-maldicion">6. Maldición de la dimensionalidad</H2>
          <P>
            El gran enemigo de todos estos índices. A medida que crece la dimensión <Code>D</Code>, ocurre algo
            contraintuitivo: <Bold>las distancias entre puntos se vuelven casi todas iguales</Bold>.
          </P>
          <Callout variant="warning" title="Las distancias se concentran">
            Si graficas el histograma de distancias entre pares de puntos aleatorios, a más dimensiones la
            distribución se <Bold>concentra en un rango muy estrecho</Bold>. En el límite,{" "}
            <Bold>el vecindario de cada punto es el mismo</Bold>: ya no hay un "más cercano" claramente distinto
            del "más lejano".
          </Callout>
          <Ul items={[
            <>La distancia al vecino más cercano y al más lejano <Bold>convergen</Bold>.</>,
            <>El índice termina <Bold>visitando casi todas las páginas</Bold> → degenera a búsqueda secuencial (R*-Tree, Hybrid Tree, iDistance pierden eficacia al subir D).</>,
          ]} />
          <Callout variant="note" title="Consecuencia práctica">
            Por esto los <Bold>descriptores locales de baja dimensión</Bold> (siguiente sección) y la{" "}
            <Bold>búsqueda aproximada</Bold> (ANN) se vuelven necesarios en datos de alta dimensión.
          </Callout>

          <Divider />

          {/* ══ 7. DESCRIPTORES LOCALES ══ */}
          <H2 id="sec-descriptores">7. Descriptores locales (SIFT)</H2>
          <CompareCards
            items={[
              {
                label: "Descriptor GLOBAL",
                color: "#10b981",
                bg: "#051a0f",
                pros: [
                  "Un solo vector por objeto (GIST, HOG, VGG-GAP)",
                  "Comparación directa y simple",
                ],
                cons: [
                  "Sensible a oclusión y cambios parciales",
                  "Suele ser de alta dimensión",
                ],
              },
              {
                label: "Descriptores LOCALES",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: [
                  "Varios vectores por objeto (SIFT, ORB, FREAK)",
                  "Robustos a oclusión y a vistas parciales",
                ],
                cons: [
                  "Número variable de vectores por imagen",
                  "Comparar dos conjuntos de vectores es no trivial",
                ],
              },
            ]}
          />

          <H3>SIFT</H3>
          <Ul items={[
            <><Bold>SIFT</Bold> (Scale Invariant Feature Transform): detecta puntos de interés <Bold>invariantes a escala y rotación</Bold>.</>,
            <>Cada imagen se representa por un <Bold>conjunto</Bold> de vectores: <Code>A = {`{A₁, …, Aₙ}`}</Code>, con cada <Code>Aᵢ</Code> de <Bold>128 dimensiones</Bold>.</>,
            <>El número de vectores <Bold>varía por imagen</Bold> → ¿cómo definir <Code>δ(SIFT(A), SIFT(B))</Code>? Ese es el reto de la similitud (sección 8).</>,
          ]} />
          <Collapse title="Extraer SIFT con OpenCV (Python)">
            <Pseudo>{`import cv2

# Cargar imagen en escala de grises
image = cv2.imread('imagen.jpg', cv2.IMREAD_GRAYSCALE)

# Crear detector SIFT
sift = cv2.SIFT_create()

# Detectar keypoints y descriptores
keypoints, descriptors = sift.detectAndCompute(image, None)

print(f"Número de keypoints: {len(keypoints)}")
print(f"Forma del array: {descriptors.shape}")   # (n_puntos, 128)`}</Pseudo>
          </Collapse>

          <Divider />

          {/* ══ 8. SIMILITUD ══ */}
          <H2 id="sec-similitud">8. Similitud de descriptores locales</H2>
          <P>
            Para comparar dos imágenes representadas por <Bold>conjuntos</Bold> de descriptores hay dos
            estrategias:
          </P>
          <CompareCards
            items={[
              {
                label: "Forma AGREGADA",
                color: "#3b82f6",
                bg: "#0c1a26",
                pros: [
                  "Histograma de cuantización (k-means)",
                  "Árboles de cuantización (Hierarchical k-means)",
                  "Índice invertido para descriptores locales",
                ],
                cons: ["Resume el conjunto en un vector → pierde detalle"],
              },
              {
                label: "Forma DIRECTA",
                color: "#10b981",
                bg: "#051a0f",
                pros: [
                  "Índice multidimensional para los descriptores",
                  "Índices de alta dimensión para búsqueda aproximada",
                  "Búsqueda lineal con distancia apropiada (DTW, ED)",
                ],
                cons: ["Más vectores que indexar y combinar"],
              },
            ]}
          />
          <Callout variant="note">
            La <Bold>agregada</Bold> convierte el conjunto de descriptores en un único vector (ej. concatenar
            histogramas por bloques). La <Bold>directa</Bold> indexa cada descriptor y combina los resultados.
          </Callout>

          <Divider />

          {/* ══ 9. INDEXACIÓN ══ */}
          <H2 id="sec-indexacion">9. Indexar descriptores locales (un solo índice)</H2>
          <P>
            Estrategia directa: extraer los descriptores locales <Code>Pⱼ</Code> de cada objeto y{" "}
            <Bold>insertar cada uno en un índice multidimensional</Bold> como pares <Code>(Objᵢ, Pⱼ)</Code>. Los
            descriptores de un mismo objeto quedan repartidos en <Bold>distintos MBRs</Bold> del índice.
          </P>
          <DiagramPlaceholder label="Diagrama: Objᵢ → vectores P1..P6 → insertados en el índice (cada Pj en un MBR distinto)" height={170} />

          <H3>Búsqueda y combinación de resultados parciales</H3>
          <Pipeline steps={[
            { label: "Extraer", sub: "query → Q1..Qn descriptores", color: "#3b82f6" },
            { label: "Filtrar (índice)", sub: "k-NN por cada Qᵢ", color: "#8b5cf6" },
            { label: "Combinar parciales", sub: "votación → k-NN final", color: "#10b981" },
          ]} />
          <P>
            Se aplica <Bold>k-NN a cada descriptor de la consulta</Bold> por separado, y luego una estrategia de{" "}
            <Bold>combinación de resultados parciales</Bold> (p. ej. votación) para obtener los k vecinos finales.
          </P>

          <Callout variant="warning" title="Por qué es búsqueda aproximada">
            Al segmentar el problema en subespacios y combinar parciales, <Bold>el resultado no será exactamente
            igual</Bold> al de una búsqueda lineal. Por eso se clasifica como <Bold>método de búsqueda
            aproximada</Bold> (ANN); a cambio, escala a grandes volúmenes.
          </Callout>

          <Callout variant="lab" title="Condiciones para que funcione">
            <Ul items={[
              <>Los descriptores locales deben ser de <Bold>baja dimensión</Bold> (por la maldición de la dimensionalidad).</>,
              <>Un solo índice para todos los descriptores, o uno por tipo de descriptor (depende de su naturaleza).</>,
              <>Una buena estrategia de <Bold>combinación de resultados parciales</Bold> es clave para la calidad.</>,
            ]} />
          </Callout>

          <Callout variant="note" title="Cierre del bloque vectorial">
            Con S10 (similitud y distancias) y S11 (búsqueda eficiente + descriptores) cerramos las BD
            vectoriales: el reto siempre es el mismo: <Bold>representación</Bold> + <Bold>distancia</Bold> +
            <Bold>índice</Bold> que evite comparar contra todo, equilibrando exactitud y escala.
          </Callout>

    </GuideLayout>
  );
}
