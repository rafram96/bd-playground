"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Procesamiento de texto
   ───────────────────────────────────────────────────────────────────────────── */
const STOP = new Set(
  "de la el en un una unos unas los las y o u por con para del al lo le su se es a que como mas más"
    .split(" ")
);

function tokenize(text: string, removeStop: boolean): string[] {
  const toks = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")  // quitar acentos (marcas combinantes)
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
  return removeStop ? toks.filter((t) => !STOP.has(t)) : toks;
}

function counts(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

const log10 = (x: number) => Math.log(x) / Math.LN10;

/* ─────────────────────────────────────────────────────────────────────────────
   Defaults — ejemplo clásico del curso (resultado esperado: D2 > D3 > D1)
   ───────────────────────────────────────────────────────────────────────────── */
const INITIAL_DOCS = [
  "Cargamento de oro dañado por el fuego",
  "La entrega de la plata llegó en el camión color plata",
  "El cargamento de oro llegó en un camión",
];
const INITIAL_QUERY = "oro plata camión";

/* ─────────────────────────────────────────────────────────────────────────────
   Visualizador
   ───────────────────────────────────────────────────────────────────────────── */
export default function S8RankingViz() {
  const [docs, setDocs] = useState<string[]>(INITIAL_DOCS);
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [weighting, setWeighting] = useState<"tfidf" | "tf">("tfidf");
  const [removeStop, setRemoveStop] = useState(true);

  /* ── Cómputo del pipeline ── */
  const N = docs.length;
  const docCounts = docs.map((d) => counts(tokenize(d, removeStop)));
  const queryCounts = counts(tokenize(query, removeStop));

  // vocabulario a partir de los documentos
  const vocab = Array.from(
    new Set(docCounts.flatMap((m) => [...m.keys()]))
  ).sort();

  // df e idf
  const df = new Map<string, number>();
  for (const t of vocab) df.set(t, docCounts.filter((m) => m.has(t)).length);
  const idf = new Map<string, number>();
  for (const t of vocab) idf.set(t, log10(N / (df.get(t) || 1)));

  // peso de un término en un conteo dado
  function weight(t: string, tf: number): number {
    if (tf === 0) return 0;
    return weighting === "tfidf" ? tf * (idf.get(t) ?? 0) : tf;
  }

  // vectores de pesos (sobre el vocabulario)
  const docVecs = docCounts.map((m) => vocab.map((t) => weight(t, m.get(t) ?? 0)));
  const queryVec = vocab.map((t) => weight(t, queryCounts.get(t) ?? 0));

  const norm = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
  const qNorm = norm(queryVec);

  const scores = docVecs.map((v, i) => {
    const nv = norm(v);
    const cos = qNorm === 0 || nv === 0 ? 0 : dot(queryVec, v) / (qNorm * nv);
    return { i, cos };
  });
  const ranked = [...scores].sort((a, b) => b.cos - a.cos);
  const maxCos = Math.max(0.0001, ...scores.map((s) => s.cos));

  const queryTerms = new Set([...queryCounts.keys()].filter((t) => vocab.includes(t)));

  /* ── UI ── */
  return (
    <div style={{ height: "100%", background: "var(--bg-base)", overflow: "auto" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 32px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Semana 8 · Visualizador interactivo
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-ui)", lineHeight: 1.2 }}>
              Ranked Retrieval: TF-IDF y similitud de coseno
            </h1>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#fbbf24", background: "#1a0f05",
              border: "1px solid #92400e", borderRadius: 999, padding: "3px 10px",
              fontFamily: "var(--font-ui)", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap",
            }}>
              Working On
            </span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, fontFamily: "var(--font-ui)" }}>
            Edita los documentos y la consulta. Observa cómo se calculan los pesos y cómo se reordenan
            los documentos por relevancia. El ejemplo inicial reproduce el resultado del curso:{" "}
            <b>D2 &gt; D3 &gt; D1</b>.
          </p>
        </div>

        {/* Controles globales */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={lblStyle}>Ponderación:</span>
            <button onClick={() => setWeighting("tfidf")} style={segBtn(weighting === "tfidf")}>TF-IDF</button>
            <button onClick={() => setWeighting("tf")} style={segBtn(weighting === "tf")}>Solo TF</button>
          </div>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
            <input type="checkbox" checked={removeStop} onChange={(e) => setRemoveStop(e.target.checked)} />
            Quitar stop words
          </label>
          <button onClick={() => { setDocs(INITIAL_DOCS); setQuery(INITIAL_QUERY); }} style={actBtn()}>Reiniciar ejemplo</button>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* ── Columna izquierda: entradas ── */}
          <div style={{ flex: "1 1 340px", minWidth: 300, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={lblStyle}>Documentos</div>
            {docs.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-code)", fontSize: 12, color: "var(--accent)", width: 26, flexShrink: 0, paddingTop: 8 }}>D{i + 1}</span>
                <textarea
                  value={d}
                  onChange={(e) => setDocs((ds) => ds.map((x, j) => (j === i ? e.target.value : x)))}
                  rows={2}
                  style={taStyle}
                />
                {docs.length > 2 && (
                  <button onClick={() => setDocs((ds) => ds.filter((_, j) => j !== i))} style={xBtn()}>×</button>
                )}
              </div>
            ))}
            <button onClick={() => setDocs((ds) => [...ds, ""])} style={actBtn()}>+ Documento</button>

            <div style={{ ...lblStyle, marginTop: 8 }}>Consulta</div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} style={{ ...taStyle, height: 38 }} />

            <div style={{ marginTop: 4, fontFamily: "var(--font-code)", fontSize: 12, color: "#a78bfa", lineHeight: 1.6 }}>
              {weighting === "tfidf" ? "w(t,d) = tf · idf" : "w(t,d) = tf"}{"  ·  "}idf = log₁₀(N/df){"  ·  "}N = {N}
            </div>
          </div>

          {/* ── Columna derecha: ranking ── */}
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div style={lblStyle}>Ranking por similitud de coseno</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {ranked.map((s, rank) => (
                <div key={s.i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}>
                      <span style={{ color: "var(--accent)", fontFamily: "var(--font-code)" }}>#{rank + 1}</span>{"  "}D{s.i + 1}
                    </span>
                    <span style={{ fontFamily: "var(--font-code)", fontSize: 13, color: s.cos > 0 ? "#4ade80" : "var(--text-muted)" }}>
                      cos = {s.cos.toFixed(3)}
                    </span>
                  </div>
                  <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(s.cos / maxCos) * 100}%`, height: "100%", background: "#10b981", borderRadius: 4, transition: "width 0.2s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {docs[s.i] || "(vacío)"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabla de pesos ── */}
        <div style={{ marginTop: 24 }}>
          <div style={lblStyle}>Vocabulario y pesos {weighting === "tfidf" ? "(tf · idf)" : "(tf)"}</div>
          <div style={{ overflowX: "auto", marginTop: 6, border: "1px solid var(--border)", borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontFamily: "var(--font-ui)" }}>
              <thead>
                <tr>
                  <th style={thStyle("left")}>término</th>
                  <th style={thStyle()}>df</th>
                  <th style={thStyle()}>idf</th>
                  {docs.map((_, i) => <th key={i} style={thStyle()}>D{i + 1}</th>)}
                  <th style={{ ...thStyle(), color: "var(--accent)" }}>Q</th>
                </tr>
              </thead>
              <tbody>
                {vocab.map((t) => {
                  const isQ = queryTerms.has(t);
                  return (
                    <tr key={t} style={{ background: isQ ? "var(--accent-glow)" : "transparent" }}>
                      <td style={{ ...tdStyle("left"), fontWeight: isQ ? 700 : 400, color: isQ ? "var(--accent)" : "var(--text-secondary)" }}>{t}</td>
                      <td style={tdStyle()}>{df.get(t)}</td>
                      <td style={tdStyle()}>{(idf.get(t) ?? 0).toFixed(3)}</td>
                      {docCounts.map((m, i) => {
                        const w = weight(t, m.get(t) ?? 0);
                        return <td key={i} style={{ ...tdStyle(), color: w > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>{w > 0 ? w.toFixed(2) : "·"}</td>;
                      })}
                      {(() => {
                        const w = weight(t, queryCounts.get(t) ?? 0);
                        return <td style={{ ...tdStyle(), color: w > 0 ? "var(--accent)" : "var(--text-muted)" }}>{w > 0 ? w.toFixed(2) : "·"}</td>;
                      })()}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nota */}
        <div style={{ marginTop: 20, padding: "12px 16px", background: "#0c1a26", border: "1px solid #1d4ed8", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <b style={{ color: "#60a5fa" }}>Prueba esto:</b> cambia a <b>“Solo TF”</b> y observa cómo,
          sin idf, los términos comunes pesan igual que los raros y el ranking puede empeorar. Vuelve a
          <b> TF-IDF</b>: los términos que aparecen en <b>todos</b> los documentos tienen idf = 0 (no
          discriminan), y los <b>raros</b> dominan el score. Agrega un documento o edita la consulta y mira
          el ranking recalcularse en vivo.
        </div>
      </div>
    </div>
  );
}

/* ── estilos ── */
const lblStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase",
  letterSpacing: 0.5, fontFamily: "var(--font-ui)",
};
const taStyle: React.CSSProperties = {
  flex: 1, width: "100%", resize: "vertical", padding: "8px 10px", fontSize: 13,
  fontFamily: "var(--font-ui)", lineHeight: 1.5, color: "var(--text-primary)",
  background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 7, outline: "none",
};

function thStyle(align: "left" | "center" = "center"): React.CSSProperties {
  return {
    padding: "7px 10px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)",
    color: "var(--text-secondary)", fontWeight: 600, textAlign: align, position: "sticky", top: 0,
    fontFamily: "var(--font-code)", fontSize: 11.5, whiteSpace: "nowrap",
  };
}
function tdStyle(align: "left" | "center" = "center"): React.CSSProperties {
  return {
    padding: "5px 10px", borderBottom: "1px solid var(--border)", textAlign: align,
    fontFamily: "var(--font-code)", color: "var(--text-secondary)",
  };
}
function segBtn(active: boolean): React.CSSProperties {
  return {
    padding: "6px 12px", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-ui)", borderRadius: 7,
    cursor: "pointer", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-glow)" : "transparent", color: active ? "var(--accent)" : "var(--text-muted)",
  };
}
function actBtn(): React.CSSProperties {
  return {
    padding: "7px 12px", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-ui)", borderRadius: 7,
    cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-secondary)",
    alignSelf: "flex-start",
  };
}
function xBtn(): React.CSSProperties {
  return {
    flexShrink: 0, width: 26, height: 26, marginTop: 4, borderRadius: 6, cursor: "pointer",
    border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-muted)", fontSize: 15, lineHeight: 1,
  };
}
