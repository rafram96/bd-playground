"use client";

import { useMemo, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Núcleo numérico
   ───────────────────────────────────────────────────────────────────────────── */
function randVec(D: number): Float64Array {
  const v = new Float64Array(D);
  for (let i = 0; i < D; i++) v[i] = Math.random();
  return v;
}
function euclid(a: Float64Array, b: Float64Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; }
  return Math.sqrt(s);
}
function pairDistances(D: number, M: number): Float64Array {
  const out = new Float64Array(M);
  for (let i = 0; i < M; i++) out[i] = euclid(randVec(D), randVec(D));
  return out;
}
function statsOf(arr: Float64Array) {
  let min = Infinity, max = -Infinity, sum = 0;
  for (const x of arr) { if (x < min) min = x; if (x > max) max = x; sum += x; }
  const mean = sum / arr.length;
  return { min, max, mean, contrast: min > 0 ? (max - min) / min : 0 };
}
function histogram(arr: Float64Array, bins: number, lo: number, hi: number): number[] {
  const h = new Array(bins).fill(0);
  const w = (hi - lo) / bins || 1;
  for (const x of arr) {
    let b = Math.floor((x - lo) / w);
    if (b < 0) b = 0; if (b >= bins) b = bins - 1;
    h[b]++;
  }
  return h;
}
/* esfera de radio 1/2 inscrita en el cubo unitario: Vol(esfera)/Vol(cubo).
   Recurrencia V_d = V_{d-2} · π/(2d), con V_0 = 1, V_1 = 1 (radio 1/2). */
function inscribedBallRatio(d: number): number {
  const V: number[] = [1, 1];
  for (let k = 2; k <= d; k++) V[k] = V[k - 2] * (Math.PI / (2 * k));
  return V[d];
}
const contrastColor = (c: number) => (c >= 1 ? "#22d3a0" : c >= 0.4 ? "#f0c060" : "#f87171");

/* ─────────────────────────────────────────────────────────────────────────────
   Histograma SVG
   ───────────────────────────────────────────────────────────────────────────── */
function Hist({ dists, width, height, color = "#7c6af7", bins = 30, showAxis = false }:
  { dists: Float64Array; width: number; height: number; color?: string; bins?: number; showAxis?: boolean }) {
  const st = statsOf(dists);
  const hi = st.max * 1.05 || 1;
  const counts = histogram(dists, bins, 0, hi);
  const maxCount = Math.max(1, ...counts);
  const padB = showAxis ? 18 : 4;
  const plotH = height - padB - 4;
  const bw = width / bins;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {counts.map((c, i) => {
        const h = (c / maxCount) * plotH;
        return <rect key={i} x={i * bw + 0.5} y={4 + plotH - h} width={bw - 1} height={h} fill={color} fillOpacity={0.85} rx={1} />;
      })}
      <line x1={0} y1={4 + plotH} x2={width} y2={4 + plotH} stroke="var(--border)" />
      {showAxis && (
        <>
          <text x={2} y={height - 5} fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-code)">0</text>
          <text x={width - 2} y={height - 5} textAnchor="end" fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-code)">{hi.toFixed(1)}</text>
        </>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Line chart genérico
   ───────────────────────────────────────────────────────────────────────────── */
function LineChart({ series, xLabels, width = 480, height = 260, yMin, yMax, yRef }:
  {
    series: { name: string; color: string; values: number[] }[];
    xLabels: string[]; width?: number; height?: number; yMin: number; yMax: number; yRef?: number;
  }) {
  const padL = 40, padB = 26, padT = 12, padR = 12;
  const plotW = width - padL - padR, plotH = height - padT - padB;
  const n = xLabels.length;
  const xp = (i: number) => padL + (n === 1 ? 0 : (i / (n - 1)) * plotW);
  const yp = (v: number) => padT + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;
  const yticks = 4;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* grid + y labels */}
      {Array.from({ length: yticks + 1 }).map((_, i) => {
        const v = yMin + (i / yticks) * (yMax - yMin);
        const y = yp(v);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="var(--border)" strokeOpacity={0.5} />
            <text x={padL - 5} y={y + 3} textAnchor="end" fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-code)">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {/* reference line */}
      {yRef !== undefined && (
        <line x1={padL} y1={yp(yRef)} x2={width - padR} y2={yp(yRef)} stroke="var(--text-muted)" strokeDasharray="4 3" strokeOpacity={0.7} />
      )}
      {/* x labels */}
      {xLabels.map((lb, i) => (i % 2 === 0 || i === n - 1) && (
        <text key={i} x={xp(i)} y={height - 7} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-code)">{lb}</text>
      ))}
      {/* series */}
      {series.map((s) => (
        <g key={s.name}>
          <polyline points={s.values.map((v, i) => `${xp(i)},${yp(v)}`).join(" ")} fill="none" stroke={s.color} strokeWidth={2} />
          {s.values.map((v, i) => <circle key={i} cx={xp(i)} cy={yp(v)} r={2.5} fill={s.color} />)}
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Mini barras (volumen / esparsidad)
   ───────────────────────────────────────────────────────────────────────────── */
function Bars({ data, color, width = 460, height = 200 }:
  { data: { label: string; value: number; tag: string }[]; color: string; width?: number; height?: number }) {
  const padB = 30, padT = 8;
  const plotH = height - padB - padT;
  const max = Math.max(...data.map((d) => d.value), 1e-9);
  const bw = width / data.length;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {data.map((d, i) => {
        const h = (d.value / max) * plotH;
        const x = i * bw;
        return (
          <g key={i}>
            <rect x={x + 4} y={padT + plotH - h} width={bw - 8} height={Math.max(h, 1)} fill={color} fillOpacity={0.85} rx={2} />
            <text x={x + bw / 2} y={padT + plotH - h - 4} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="var(--font-code)">{d.tag}</text>
            <text x={x + bw / 2} y={height - 16} textAnchor="middle" fontSize={9.5} fill="var(--text-muted)" fontFamily="var(--font-code)">{d.label}</text>
          </g>
        );
      })}
      <line x1={0} y1={padT + plotH} x2={width} y2={padT + plotH} stroke="var(--border)" />
    </svg>
  );
}

const FIXED_DIMS = [2, 5, 20, 100, 500];
const SWEEP = [1, 2, 3, 5, 8, 13, 20, 35, 60, 100, 200, 400, 700, 1000];
type Tab = "histograma" | "convergencia" | "volumen" | "esparsidad";

/* ─────────────────────────────────────────────────────────────────────────────
   Visualizador
   ───────────────────────────────────────────────────────────────────────────── */
export default function S11CurseViz() {
  const [tab, setTab] = useState<Tab>("histograma");
  const [dim, setDim] = useState(2);
  const [seed, setSeed] = useState(0);
  const M = 1500;

  /* histograma */
  const minis = useMemo(() => FIXED_DIMS.map((D) => { const d = pairDistances(D, 1000); return { D, dists: d, st: statsOf(d) }; }), [seed]);
  const dists = useMemo(() => pairDistances(dim, M), [dim, seed]);
  const st = statsOf(dists);

  /* convergencia: para cada D, distancia de una consulta al cercano/lejano, normalizada por la media */
  const conv = useMemo(() => SWEEP.map((D) => {
    const N = 300, q = randVec(D);
    let min = Infinity, max = -Infinity, sum = 0;
    for (let i = 0; i < N; i++) { const d = euclid(q, randVec(D)); if (d < min) min = d; if (d > max) max = d; sum += d; }
    const mean = sum / N;
    return { D, near: min / mean, far: max / mean };
  }), [seed]);
  const convMax = Math.max(...conv.map((c) => c.far)) * 1.08;

  /* volumen */
  const VDIMS = [1, 2, 3, 4, 6, 8, 10, 12, 15];
  const ballData = VDIMS.map((d) => { const r = inscribedBallRatio(d); return { label: `d=${d}`, value: r, tag: r >= 0.001 ? `${(r * 100).toFixed(r >= 0.1 ? 0 : 1)}%` : `${(r * 100).toExponential(0)}%` }; });
  const shellData = VDIMS.map((d) => { const f = 1 - Math.pow(0.9, d); return { label: `d=${d}`, value: f, tag: `${(f * 100).toFixed(0)}%` }; });

  /* esparsidad: 10^d puntos para densidad fija (10 por eje) */
  const SDIMS = [1, 2, 3, 4, 5, 6, 7, 8];
  const sparseData = SDIMS.map((d) => ({ label: `d=${d}`, value: d, tag: `10^${d}` }));

  return (
    <div style={{ height: "100%", overflow: "auto", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 32px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Semana 11 · Visualizador interactivo
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px", fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
            La maldición de la dimensionalidad
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, fontFamily: "var(--font-ui)" }}>
            Cuatro vistas del mismo fenómeno: en alta dimensión, el espacio se comporta de forma
            contraintuitiva y la búsqueda por similitud se rompe.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
          {([
            ["histograma", "Histograma"],
            ["convergencia", "Convergencia"],
            ["volumen", "Volumen"],
            ["esparsidad", "Esparsidad"],
          ] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={tabBtn(tab === id)}>{label}</button>
          ))}
        </div>

        {/* ═════════ HISTOGRAMA ═════════ */}
        {tab === "histograma" && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-ui)", marginBottom: 10 }}>
              Las distancias se concentran al subir la dimensión
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              {minis.map(({ D, dists: dd, st: ms }) => (
                <div key={D} style={{ flex: "1 1 150px", minWidth: 140, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-code)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>D = {D}</span>
                    <span style={{ fontFamily: "var(--font-code)", fontSize: 11, color: contrastColor(ms.contrast) }}>contraste {ms.contrast.toFixed(2)}</span>
                  </div>
                  <Hist dists={dd} width={130} height={66} showAxis />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 24 }}>
              De campana ancha (D pequeño, distancias diversas) a pico estrecho (D grande, distancias casi iguales).
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 420px", minWidth: 320 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-ui)", marginBottom: 8 }}>Histograma en D = {dim}</div>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                  <Hist dists={dists} width={420} height={240} bins={40} showAxis />
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                    <span>Dimensión D</span><span style={{ fontFamily: "var(--font-code)", color: "var(--accent)" }}>D = {dim}</span>
                  </div>
                  <input type="range" min={1} max={1000} value={dim} onChange={(e) => setDim(+e.target.value)} style={{ width: "100%" }} />
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {[2, 10, 50, 200, 1000].map((d) => <button key={d} onClick={() => setDim(d)} style={presetBtn(dim === d)}>D={d}</button>)}
                    <button onClick={() => setSeed((s) => s + 1)} style={actBtn()}>↻ Regenerar</button>
                  </div>
                </div>
              </div>
              <div style={{ flex: "1 1 240px", minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "var(--bg-surface)", border: `1px solid ${contrastColor(st.contrast)}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-ui)", marginBottom: 4 }}>Contraste relativo</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: contrastColor(st.contrast), fontFamily: "var(--font-code)", lineHeight: 1 }}>{st.contrast.toFixed(3)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-code)", marginTop: 6 }}>(dₘₐₓ − dₘᵢₙ) / dₘᵢₙ</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.5 }}>Cuanto más cerca de <b>0</b>, menos se distingue el vecino más cercano del más lejano.</div>
                </div>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <Stat label="d mínima" value={st.min.toFixed(3)} color="#22d3a0" />
                  <Stat label="d media" value={st.mean.toFixed(3)} color="var(--text-secondary)" />
                  <Stat label="d máxima" value={st.max.toFixed(3)} color="#f87171" />
                  <Stat label="rango (máx − mín)" value={(st.max - st.min).toFixed(3)} color="var(--text-muted)" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═════════ CONVERGENCIA ═════════ */}
        {tab === "convergencia" && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-ui)", marginBottom: 4 }}>
              Vecino más cercano vs más lejano (distancia ÷ media)
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" }}>
              Distancia de una consulta a su vecino <b style={{ color: "#22d3a0" }}>más cercano</b> y al{" "}
              <b style={{ color: "#f87171" }}>más lejano</b>, dividida por la media. Al subir D, ambas convergen
              a <b>1</b>: todas las distancias se vuelven iguales.
            </p>
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, maxWidth: 540 }}>
              <LineChart
                width={500} height={260} yMin={0} yMax={convMax} yRef={1}
                xLabels={conv.map((c) => String(c.D))}
                series={[
                  { name: "más lejano", color: "#f87171", values: conv.map((c) => c.far) },
                  { name: "más cercano", color: "#22d3a0", values: conv.map((c) => c.near) },
                ]}
              />
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, fontFamily: "var(--font-ui)" }}>
                <Legend color="#22d3a0" label="más cercano" />
                <Legend color="#f87171" label="más lejano" />
                <Legend color="var(--text-muted)" label="media (= 1)" dashed />
                <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontFamily: "var(--font-code)", fontSize: 11 }}>eje X: dimensión D</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", marginTop: 10 }}>
              “Every point’s neighborhood is the same”: el cercano y el lejano colapsan sobre la media.
            </div>
          </>
        )}

        {/* ═════════ VOLUMEN ═════════ */}
        {tab === "volumen" && (
          <>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
              Una mirada <b>geométrica</b>: en alta dimensión, una esfera ocupa casi nada del cubo, y casi todo
              el volumen vive pegado a la <b>superficie</b>.
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 360px", minWidth: 300, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, fontFamily: "var(--font-ui)" }}>Esfera inscrita ÷ cubo</div>
                <Bars data={ballData} color="#7c6af7" width={420} height={190} />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
                  De <b>78.5%</b> en 2D a <b>~0.0002%</b> en 15D: la esfera inscrita se vuelve insignificante.
                </div>
              </div>
              <div style={{ flex: "1 1 360px", minWidth: 300, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, fontFamily: "var(--font-ui)" }}>Volumen en la cáscara exterior (10%)</div>
                <Bars data={shellData} color="#22d3a0" width={420} height={190} />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
                  <code style={{ fontFamily: "var(--font-code)", color: "#a5d6ff" }}>1 − 0.9ᵈ</code> → casi 100%: todo el volumen está cerca del borde.
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═════════ ESPARSIDAD ═════════ */}
        {tab === "esparsidad" && (
          <>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
              Para mantener la misma <b>densidad</b> de muestreo (10 puntos por eje), necesitas{" "}
              <code style={{ fontFamily: "var(--font-code)", color: "#a5d6ff" }}>10ᵈ</code> puntos. Crece de forma
              <b> exponencial</b>: te quedas sin datos.
            </p>
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, maxWidth: 540 }}>
              <Bars data={sparseData} color="#f0c060" width={500} height={200} />
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
                Altura ∝ exponente. d=6 ya son <b>1,000,000</b> de puntos; d=8, cien millones.
              </div>
            </div>
          </>
        )}

        {/* Nota fija */}
        <div style={{ marginTop: 24, padding: "12px 16px", background: "#0c1a26", border: "1px solid #1d4ed8", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 820 }}>
          <b style={{ color: "#60a5fa" }}>Por qué importa:</b> en alta dimensión todas las distancias se
          parecen, el espacio está casi vacío y necesitas exponencialmente más datos. El k-NN pierde sentido y
          los índices multidimensionales degeneran a búsqueda secuencial. Por eso se buscan{" "}
          <b>descriptores de baja dimensión</b> y <b>búsqueda aproximada (ANN)</b>.
        </div>
      </div>
    </div>
  );
}

/* ── helpers UI ── */
function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12.5 }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-code)", fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)" }}>
      <span style={{ width: 14, height: 0, borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}` }} />
      {label}
    </span>
  );
}
function tabBtn(active: boolean): React.CSSProperties {
  return {
    padding: "7px 14px", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-ui)", borderRadius: 7,
    cursor: "pointer", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-glow)" : "transparent", color: active ? "var(--accent)" : "var(--text-muted)",
  };
}
function presetBtn(active: boolean): React.CSSProperties {
  return {
    padding: "5px 10px", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-ui)", borderRadius: 7,
    cursor: "pointer", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-glow)" : "transparent", color: active ? "var(--accent)" : "var(--text-muted)",
  };
}
function actBtn(): React.CSSProperties {
  return {
    padding: "5px 10px", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-ui)", borderRadius: 7,
    cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-secondary)",
  };
}
