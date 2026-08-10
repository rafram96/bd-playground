"use client";

import { useMemo, useRef, useState } from "react";
import { StepNavigator, VisualizerLayout, type LearningMode } from "./VisualizerLayout";

/* ─────────────────────────────────────────────────────────────────────────────
   Geometría del lienzo (cuadrado para que las "bolas" de cada métrica se vean
   con su forma real: círculo, rombo, cuadrado).
   ───────────────────────────────────────────────────────────────────────────── */
const SIZE = 360;          // lado del área de datos (px)
const PAD = 36;            // margen para ejes
const W = SIZE + 2 * PAD;  // ancho/alto total del SVG
const SCALE = SIZE / 10;   // px por unidad de dato (grid 0..10)

const xPix = (x: number) => PAD + x * SCALE;
const yPix = (y: number) => PAD + SIZE - y * SCALE;
const xData = (px: number) => clamp((px - PAD) / SCALE, 0, 10);
const yData = (py: number) => clamp((PAD + SIZE - py) / SCALE, 0, 10);

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ─────────────────────────────────────────────────────────────────────────────
   Métricas de distancia
   ───────────────────────────────────────────────────────────────────────────── */
type Metric = "euclidiana" | "manhattan" | "chebyshev" | "coseno";

const METRIC_INFO: Record<Metric, { label: string; formula: string; rMax: number; rStep: number; rDefault: number }> = {
  euclidiana: { label: "Euclidiana (L2)", formula: "√( Σ (xᵢ − yᵢ)² )", rMax: 14, rStep: 0.5, rDefault: 3 },
  manhattan:  { label: "Manhattan (L1)",  formula: "Σ |xᵢ − yᵢ|",       rMax: 20, rStep: 0.5, rDefault: 4 },
  chebyshev:  { label: "Chebyshev (L∞)",  formula: "máx |xᵢ − yᵢ|",     rMax: 10, rStep: 0.5, rDefault: 3 },
  coseno:     { label: "Coseno (ángulo)", formula: "1 − (a·b)/(‖a‖‖b‖)", rMax: 1,  rStep: 0.02, rDefault: 0.15 },
};

type Pt = { x: number; y: number };

function distance(metric: Metric, q: Pt, p: Pt): number {
  const dx = q.x - p.x, dy = q.y - p.y;
  switch (metric) {
    case "euclidiana": return Math.hypot(dx, dy);
    case "manhattan":  return Math.abs(dx) + Math.abs(dy);
    case "chebyshev":  return Math.max(Math.abs(dx), Math.abs(dy));
    case "coseno": {
      const dot = q.x * p.x + q.y * p.y;
      const nq = Math.hypot(q.x, q.y), np = Math.hypot(p.x, p.y);
      if (nq === 0 || np === 0) return 1;
      return 1 - dot / (nq * np);
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Puntos iniciales (eco del ejemplo de los peces del curso)
   ───────────────────────────────────────────────────────────────────────────── */
const INITIAL: (Pt & { id: number })[] = [
  { id: 1, x: 2, y: 9 }, { id: 2, x: 4, y: 7.5 }, { id: 3, x: 6, y: 8.2 },
  { id: 4, x: 8.5, y: 9.3 }, { id: 5, x: 2.5, y: 5 }, { id: 6, x: 5, y: 4 },
  { id: 7, x: 7, y: 4.2 }, { id: 8, x: 9, y: 5.5 }, { id: 9, x: 2, y: 2 },
  { id: 10, x: 8, y: 1.5 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Visualizador
   ───────────────────────────────────────────────────────────────────────────── */
export default function S10KnnViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const nextId = useRef(11);

  const [points, setPoints] = useState<(Pt & { id: number })[]>(INITIAL);
  const [query, setQuery] = useState<Pt>({ x: 5.5, y: 6 });
  const [metric, setMetric] = useState<Metric>("euclidiana");
  const [mode, setMode] = useState<"knn" | "rango">("knn");
  const [k, setK] = useState(3);
  const [r, setR] = useState(METRIC_INFO.euclidiana.rDefault);
  const [drag, setDrag] = useState<number | "q" | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>("guided");
  const [learningStep, setLearningStep] = useState(0);

  const info = METRIC_INFO[metric];

  /* Distancias y ranking */
  const ranked = useMemo(() => points
    .map((p) => ({ ...p, d: distance(metric, query, p) }))
    .sort((a, b) => a.d - b.d), [points, query, metric]);

  const kClamped = Math.min(k, points.length);
  const highlighted = useMemo(() => new Set<number>(
    mode === "knn"
      ? ranked.slice(0, kClamped).map((p) => p.id)
      : ranked.filter((p) => p.d <= r).map((p) => p.id)
  ), [mode, ranked, kClamped, r]);

  /* ── Drag ── */
  function pointerToData(e: React.PointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (W / rect.width);
    const svgY = (e.clientY - rect.top) * (W / rect.height);
    return { x: xData(svgX), y: yData(svgY) };
  }
  function onMove(e: React.PointerEvent) {
    if (drag === null) return;
    const d = pointerToData(e);
    if (drag === "q") setQuery(d);
    else setPoints((ps) => ps.map((p) => (p.id === drag ? { ...p, ...d } : p)));
  }

  /* ── Métrica change: ajustar r al nuevo rango ── */
  function changeMetric(m: Metric) {
    setMetric(m);
    setR(METRIC_INFO[m].rDefault);
  }

  function addPoint() {
    const x = Math.round((1 + Math.random() * 8) * 10) / 10;
    const y = Math.round((1 + Math.random() * 8) * 10) / 10;
    setPoints((ps) => [...ps, { id: nextId.current++, x, y }]);
  }
  function removePoint() {
    setPoints((ps) => (ps.length > 3 ? ps.slice(0, -1) : ps));
  }
  function reset() {
    setPoints(INITIAL);
    setQuery({ x: 5.5, y: 6 });
    nextId.current = 11;
  }

  /* ── Geometría de la "bola" de rango ── */
  const qx = xPix(query.x), qy = yPix(query.y);
  function rangeShape() {
    if (metric === "euclidiana") {
      return <circle cx={qx} cy={qy} r={r * SCALE} fill="var(--accent)" fillOpacity={0.12} stroke="var(--accent)" strokeOpacity={0.5} strokeDasharray="4 3" />;
    }
    if (metric === "manhattan") {
      const pts = [
        [xPix(query.x), yPix(query.y + r)], [xPix(query.x + r), yPix(query.y)],
        [xPix(query.x), yPix(query.y - r)], [xPix(query.x - r), yPix(query.y)],
      ].map((p) => p.join(",")).join(" ");
      return <polygon points={pts} fill="var(--accent)" fillOpacity={0.12} stroke="var(--accent)" strokeOpacity={0.5} strokeDasharray="4 3" />;
    }
    if (metric === "chebyshev") {
      return <rect x={xPix(query.x - r)} y={yPix(query.y + r)} width={2 * r * SCALE} height={2 * r * SCALE} fill="var(--accent)" fillOpacity={0.12} stroke="var(--accent)" strokeOpacity={0.5} strokeDasharray="4 3" />;
    }
    /* coseno: sector angular desde el origen */
    const angleQ = Math.atan2(query.y, query.x);
    const tol = Math.acos(clamp(1 - r, -1, 1));
    const R = 16;
    const a0 = angleQ - tol, a1 = angleQ + tol;
    const steps = 12;
    const arc: string[] = [`${xPix(0)},${yPix(0)}`];
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (a1 - a0) * (i / steps);
      arc.push(`${xPix(R * Math.cos(a))},${yPix(R * Math.sin(a))}`);
    }
    return (
      <>
        <polygon points={arc.join(" ")} fill="var(--accent)" fillOpacity={0.1} stroke="none" />
        <line x1={xPix(0)} y1={yPix(0)} x2={xPix(R * Math.cos(a0))} y2={yPix(R * Math.sin(a0))} stroke="var(--accent)" strokeOpacity={0.5} strokeDasharray="4 3" />
        <line x1={xPix(0)} y1={yPix(0)} x2={xPix(R * Math.cos(a1))} y2={yPix(R * Math.sin(a1))} stroke="var(--accent)" strokeOpacity={0.5} strokeDasharray="4 3" />
      </>
    );
  }

  const learningSteps = [
    { title: "Define la consulta", description: "Arrastra q y los objetos. Sus coordenadas representan dos características comparables." },
    { title: "Elige la geometría", description: "Cambia la métrica: cada fórmula redefine qué significa estar cerca y la forma de la región." },
    { title: "Lee el resultado", description: "La tabla ordena las distancias; k-NN toma los primeros k y la consulta por rango usa un umbral r." },
  ];

  return (
    <VisualizerLayout
      eyebrow="Semana 10 · Bases vectoriales · Visualizador interactivo"
      title="Búsqueda por similitud: k‑NN y distancias"
      description={<>Arrastra el punto de consulta <b style={{ color: "var(--accent)" }}>q</b> o cualquier objeto. Cambia la métrica y observa cómo cambian los vecinos y la geometría del rango.</>}
      mode={learningMode}
      onModeChange={(value) => { setLearningMode(value); if (value === "guided") setLearningStep(0); }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", width: "100%" }}>
        {learningMode === "guided" ? (
          <div style={{ marginBottom: 14 }}>
            <StepNavigator current={learningStep} total={learningSteps.length} title={learningSteps[learningStep].title} description={learningSteps[learningStep].description} onPrevious={() => setLearningStep((value) => Math.max(0, value - 1))} onNext={() => setLearningStep((value) => Math.min(learningSteps.length - 1, value + 1))} onStart={() => setLearningStep(0)} onEnd={() => setLearningStep(learningSteps.length - 1)} />
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* ── Lienzo ── */}
          <svg
            ref={svgRef}
            width={W}
            height={W}
            viewBox={`0 0 ${W} ${W}`}
            role="img"
            aria-label="Plano de puntos para búsqueda por similitud"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, touchAction: "none", flexShrink: 1, maxWidth: "100%", height: "auto" }}
            onPointerMove={onMove}
            onPointerUp={() => setDrag(null)}
          >
            <title>Espacio vectorial bidimensional</title>
            <desc>Los puntos verdes satisfacen la consulta seleccionada. El punto morado q es la consulta y puede arrastrarse.</desc>
            <defs>
              <clipPath id="plotclip">
                <rect x={PAD} y={PAD} width={SIZE} height={SIZE} />
              </clipPath>
            </defs>

            {/* Grid */}
            {Array.from({ length: 11 }).map((_, i) => (
              <g key={i}>
                <line x1={xPix(i)} y1={yPix(0)} x2={xPix(i)} y2={yPix(10)} stroke="var(--border)" strokeOpacity={i % 5 === 0 ? 0.8 : 0.35} />
                <line x1={xPix(0)} y1={yPix(i)} x2={xPix(10)} y2={yPix(i)} stroke="var(--border)" strokeOpacity={i % 5 === 0 ? 0.8 : 0.35} />
              </g>
            ))}
            {/* Ejes labels */}
            <text x={PAD + SIZE / 2} y={W - 8} textAnchor="middle" fontSize={11} fill="var(--text-muted)" fontFamily="var(--font-ui)">Característica 1 (x)</text>
            <text x={12} y={PAD + SIZE / 2} textAnchor="middle" fontSize={11} fill="var(--text-muted)" fontFamily="var(--font-ui)" transform={`rotate(-90 12 ${PAD + SIZE / 2})`}>Característica 2 (y)</text>

            {/* Bola de rango */}
            {mode === "rango" && <g clipPath="url(#plotclip)">{rangeShape()}</g>}

            {/* Líneas q → resaltados */}
            <g clipPath="url(#plotclip)">
              {ranked.filter((p) => highlighted.has(p.id)).map((p) => (
                <line key={p.id} x1={qx} y1={qy} x2={xPix(p.x)} y2={yPix(p.y)} stroke="#10b981" strokeOpacity={0.55} strokeWidth={1.5} />
              ))}
            </g>

            {/* Puntos */}
            {ranked.map((p) => {
              const on = highlighted.has(p.id);
              return (
                <g key={p.id}>
                  <circle
                    cx={xPix(p.x)} cy={yPix(p.y)} r={on ? 9 : 7}
                    fill={on ? "#10b981" : "var(--bg-elevated)"}
                    stroke={on ? "#10b981" : "var(--text-muted)"}
                    strokeWidth={1.5}
                    style={{ cursor: "grab" }}
                    onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); setDrag(p.id); }}
                  />
                  {on && (
                    <text x={xPix(p.x)} y={yPix(p.y) + 3.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#04140c" style={{ pointerEvents: "none" }}>
                      {mode === "knn" ? ranked.filter((q) => highlighted.has(q.id)).findIndex((q) => q.id === p.id) + 1 : "✓"}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Punto de consulta q */}
            <g>
              <circle
                cx={qx} cy={qy} r={10}
                fill="var(--accent)" stroke="#fff" strokeWidth={2}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); setDrag("q"); }}
              />
              <text x={qx} y={qy - 15} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--accent)" style={{ pointerEvents: "none" }}>q</text>
            </g>
          </svg>

          {/* ── Controles ── */}
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Métrica */}
            <Control label="Medida de distancia">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {(Object.keys(METRIC_INFO) as Metric[]).map((m) => (
                  <button key={m} onClick={() => changeMetric(m)} style={segBtn(metric === m)}>
                    {METRIC_INFO[m].label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-code)", fontSize: 12, color: "var(--math-text)" }}>
                δ = {info.formula}
              </div>
            </Control>

            {/* Modo */}
            <Control label="Tipo de consulta">
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setMode("knn")} style={segBtn(mode === "knn")}>k-NN</button>
                <button onClick={() => setMode("rango")} style={segBtn(mode === "rango")}>Por rango</button>
              </div>

              {mode === "knn" ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                    <span>k vecinos</span><span style={{ fontFamily: "var(--font-code)", color: "var(--accent)" }}>k = {kClamped}</span>
                  </div>
                  <input type="range" min={1} max={Math.min(8, points.length)} value={kClamped} onChange={(e) => setK(+e.target.value)} style={{ width: "100%" }} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Siempre devuelve exactamente k objetos.</div>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                    <span>radio r</span><span style={{ fontFamily: "var(--font-code)", color: "var(--accent)" }}>r = {r.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0} max={info.rMax} step={info.rStep} value={r} onChange={(e) => setR(+e.target.value)} style={{ width: "100%" }} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Devuelve entre 0 y todos los objetos según el radio.</div>
                </div>
              )}
            </Control>

            {/* Ranking */}
            <Control label={`Ranking por distancia  (${highlighted.size} resaltados)`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 200, overflowY: "auto" }}>
                {ranked.map((p, i) => {
                  const on = highlighted.has(p.id);
                  return (
                    <div key={p.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      fontSize: 12, padding: "4px 8px", borderRadius: 6,
                      background: on ? "var(--cal-example-bg)" : "transparent",
                      border: `1px solid ${on ? "var(--success)" : "var(--border)"}`,
                      color: on ? "var(--cal-example-label)" : "var(--text-muted)",
                    }}>
                      <span style={{ fontFamily: "var(--font-code)" }}>
                        {mode === "knn" && on ? `#${i + 1}` : "·"} &nbsp;objeto {p.id}
                      </span>
                      <span style={{ fontFamily: "var(--font-code)" }}>{p.d.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </Control>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={addPoint} style={actBtn()}>+ Punto</button>
              <button onClick={removePoint} style={actBtn()}>− Punto</button>
              <button onClick={reset} style={actBtn()}>Reiniciar</button>
            </div>
          </div>
        </div>

        {/* Nota didáctica */}
        <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--cal-note-bg)", border: "1px solid var(--cal-note-border)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 820 }}>
          <b style={{ color: "var(--cal-note-label)" }}>Qué observar:</b> cambia entre métricas y mira la forma del rango;
          <b> círculo</b> (Euclidiana), <b>rombo</b> (Manhattan), <b>cuadrado</b> (Chebyshev). El <b>coseno</b> mide el
          ángulo desde el origen, así que su región es un <b>sector angular</b>: un objeto lejano sobre la misma
          dirección que <b style={{ color: "var(--accent)" }}>q</b> resulta “muy similar” aunque su distancia euclidiana sea grande.
        </div>
      </div>
    </VisualizerLayout>
  );
}

/* ── helpers de UI ── */
function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, fontFamily: "var(--font-ui)" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function segBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "var(--font-ui)",
    borderRadius: 7,
    cursor: "pointer",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-glow)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-muted)",
    transition: "all 0.12s",
  };
}

function actBtn(): React.CSSProperties {
  return {
    flex: 1,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "var(--font-ui)",
    borderRadius: 7,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
  };
}
