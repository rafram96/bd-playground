"use client";

import { useMemo, useState } from "react";
import {
  ActionButton,
  SegmentedControl,
  StepNavigator,
  VisualizerLayout,
  VisualizerPanel,
  type LearningMode,
} from "./VisualizerLayout";

const STOP_WORDS = new Set(["a", "al", "de", "del", "el", "en", "la", "las", "los", "por", "un", "una", "y"]);
const INITIAL_DOCS = [
  "Cargamento de oro dañado por el fuego",
  "La entrega de la plata llegó en el camión color plata",
  "El cargamento de oro llegó en un camión",
];
const INITIAL_QUERY = "oro plata camión";

type TfFormula = "raw" | "log" | "binary";
type IdfFormula = "classic" | "smooth";
type Weighting = "tfidf" | "tf";

function tokenize(text: string, removeStopWords: boolean) {
  const tokens = text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z\s]/g, " ").split(/\s+/).filter((term) => term.length > 1);
  return removeStopWords ? tokens.filter((term) => !STOP_WORDS.has(term)) : tokens;
}

function countTerms(tokens: string[]) {
  const counts = new Map<string, number>();
  tokens.forEach((term) => counts.set(term, (counts.get(term) ?? 0) + 1));
  return counts;
}

function tfValue(count: number, formula: TfFormula) {
  if (count === 0) return 0;
  if (formula === "binary") return 1;
  if (formula === "log") return 1 + Math.log10(count);
  return count;
}

const norm = (vector: number[]) => Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
const dot = (left: number[], right: number[]) => left.reduce((sum, value, index) => sum + value * right[index], 0);

const PIPELINE = [
  { title: "Tokenización", description: "Normalizamos el texto, separamos términos y, si está activo, retiramos stop words." },
  { title: "Frecuencia de término", description: "Contamos las apariciones y transformamos TF con la fórmula seleccionada." },
  { title: "DF e IDF", description: "DF cuenta en cuántos documentos aparece cada término; IDF reduce el peso de los términos comunes." },
  { title: "Vectorización", description: "Cada documento y la consulta se convierten en vectores sobre el mismo vocabulario." },
  { title: "Similitud de coseno", description: "Calculamos producto punto y normas. El cociente mide cuánto se alinean los vectores." },
  { title: "Ranking", description: "Ordenamos los documentos por score y comparamos cuánto cambia el orden usando TF o TF-IDF." },
] as const;

export default function S8RankingViz() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [weighting, setWeighting] = useState<Weighting>("tfidf");
  const [tfFormula, setTfFormula] = useState<TfFormula>("raw");
  const [idfFormula, setIdfFormula] = useState<IdfFormula>("classic");
  const [removeStopWords, setRemoveStopWords] = useState(true);
  const [mode, setMode] = useState<LearningMode>("guided");
  const [stage, setStage] = useState(0);

  const model = useMemo(() => {
    const documentTokens = docs.map((document) => tokenize(document, removeStopWords));
    const queryTokens = tokenize(query, removeStopWords);
    const documentCounts = documentTokens.map(countTerms);
    const queryCounts = countTerms(queryTokens);
    const vocabulary = [...new Set(documentCounts.flatMap((counts) => [...counts.keys()]))].sort();
    const vocabularySet = new Set(vocabulary);
    const documentFrequency = new Map<string, number>();
    const inverseDocumentFrequency = new Map<string, number>();
    const total = docs.length;

    vocabulary.forEach((term) => {
      const df = documentCounts.reduce((sum, counts) => sum + Number(counts.has(term)), 0);
      documentFrequency.set(term, df);
      inverseDocumentFrequency.set(term, idfFormula === "smooth" ? Math.log10((total + 1) / (df + 1)) + 1 : Math.log10(total / Math.max(df, 1)));
    });

    function calculate(kind: Weighting) {
      const termWeight = (term: string, count: number) => tfValue(count, tfFormula) * (kind === "tfidf" ? inverseDocumentFrequency.get(term) ?? 0 : 1);
      const documentVectors = documentCounts.map((counts) => vocabulary.map((term) => termWeight(term, counts.get(term) ?? 0)));
      const queryVector = vocabulary.map((term) => termWeight(term, queryCounts.get(term) ?? 0));
      const queryNorm = norm(queryVector);
      const scores = documentVectors.map((vector, documentIndex) => {
        const documentNorm = norm(vector);
        const product = dot(queryVector, vector);
        return {
          documentIndex,
          score: queryNorm === 0 || documentNorm === 0 ? 0 : product / (queryNorm * documentNorm),
          product,
          documentNorm,
          contributions: vocabulary.map((term, termIndex) => ({ term, value: queryVector[termIndex] * vector[termIndex] })).filter((item) => item.value > 0),
        };
      });
      return { documentVectors, queryVector, queryNorm, scores, ranked: [...scores].sort((a, b) => b.score - a.score || a.documentIndex - b.documentIndex) };
    }

    return {
      documentTokens,
      queryTokens,
      documentCounts,
      queryCounts,
      vocabulary,
      documentFrequency,
      inverseDocumentFrequency,
      oov: [...new Set(queryTokens.filter((term) => !vocabularySet.has(term)))],
      tf: calculate("tf"),
      tfidf: calculate("tfidf"),
    };
  }, [docs, query, removeStopWords, tfFormula, idfFormula]);

  const activeModel = model[weighting];
  const show = (minimumStage: number) => mode === "free" || stage >= minimumStage;

  function reset() {
    setDocs(INITIAL_DOCS);
    setQuery(INITIAL_QUERY);
    setWeighting("tfidf");
    setTfFormula("raw");
    setIdfFormula("classic");
    setRemoveStopWords(true);
    setStage(0);
  }

  return (
    <VisualizerLayout
      eyebrow="Semana 8 · Recuperación textual · Visualizador interactivo"
      title="Del texto al ranking"
      description="Desarma TF‑IDF y la similitud de coseno etapa por etapa; después compara el ranking contra un modelo que usa solamente frecuencia de término."
      mode={mode}
      onModeChange={(value) => { setMode(value); if (value === "guided") setStage(0); }}
    >
      <div style={{ display: "grid", gap: 14 }}>
        <VisualizerPanel title="Configuración del modelo">
          <div className="ranking-controls" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(170px, 1fr))", gap: 14, padding: 14 }}>
            <SegmentedControl label="Ranking principal" value={weighting} options={[{ value: "tfidf", label: "TF-IDF" }, { value: "tf", label: "Solo TF" }]} onChange={setWeighting} />
            <SegmentedControl label="Transformación de TF" value={tfFormula} options={[{ value: "raw", label: "Crudo" }, { value: "log", label: "Log" }, { value: "binary", label: "Binario" }]} onChange={setTfFormula} />
            <SegmentedControl label="Fórmula de IDF" value={idfFormula} options={[{ value: "classic", label: "Clásico" }, { value: "smooth", label: "Suavizado" }]} onChange={setIdfFormula} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 12 }}>
              <input type="checkbox" checked={removeStopWords} onChange={(event) => setRemoveStopWords(event.target.checked)} /> Quitar stop words
            </label>
            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}><ActionButton onClick={reset}>Reiniciar ejemplo</ActionButton></div>
          </div>
        </VisualizerPanel>

        {mode === "guided" ? (
          <StepNavigator current={stage} total={PIPELINE.length} title={PIPELINE[stage].title} description={PIPELINE[stage].description} onPrevious={() => setStage((value) => Math.max(0, value - 1))} onNext={() => setStage((value) => Math.min(PIPELINE.length - 1, value + 1))} onStart={() => setStage(0)} onEnd={() => setStage(PIPELINE.length - 1)} />
        ) : null}

        <div className="ranking-workspace" style={{ display: "grid", gridTemplateColumns: "minmax(300px, .92fr) minmax(340px, 1.08fr)", gap: 14, alignItems: "start" }}>
          <VisualizerPanel title="Corpus y consulta" meta={`${docs.length} documentos · ${model.vocabulary.length} términos`}>
            <div style={{ display: "grid", gap: 10, padding: 14 }}>
              {docs.map((document, index) => (
                <label key={index} style={{ display: "grid", gridTemplateColumns: "30px 1fr auto", gap: 7, alignItems: "start" }}>
                  <span style={docLabelStyle}>D{index + 1}</span>
                  <span>
                    <textarea aria-label={`Documento ${index + 1}`} value={document} rows={2} onChange={(event) => setDocs((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} style={textStyle} />
                    {show(0) ? <TokenRow tokens={model.documentTokens[index]} /> : null}
                  </span>
                  <ActionButton variant="danger" aria-label={`Eliminar documento ${index + 1}`} disabled={docs.length <= 2} onClick={() => setDocs((items) => items.filter((_, itemIndex) => itemIndex !== index))}>×</ActionButton>
                </label>
              ))}
              <ActionButton onClick={() => setDocs((items) => [...items, "Nuevo documento"])}>+ Documento</ActionButton>
              <label style={{ display: "grid", gap: 6, marginTop: 5 }}>
                <span className="viz-label">Consulta Q</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} style={{ ...textStyle, resize: "none" }} />
                {show(0) ? <TokenRow tokens={model.queryTokens} accent /> : null}
              </label>
              {model.oov.length ? <div role="status" style={{ padding: "8px 10px", border: "1px solid var(--cal-warning-border)", borderRadius: 7, background: "var(--cal-warning-bg)", color: "var(--cal-warning-label)", fontSize: 11 }}><strong>Fuera del vocabulario:</strong> {model.oov.join(", ")}. No aportan al vector porque no aparecen en el corpus.</div> : null}
            </div>
          </VisualizerPanel>

          {show(5) ? (
            <VisualizerPanel title="Ranking comparado" meta={`principal: ${weighting === "tfidf" ? "TF-IDF" : "TF"}`}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 14 }}>
                <RankingColumn title="Solo TF" ranked={model.tf.ranked} docs={docs} active={weighting === "tf"} />
                <RankingColumn title="TF-IDF" ranked={model.tfidf.ranked} docs={docs} active={weighting === "tfidf"} />
              </div>
            </VisualizerPanel>
          ) : (
            <VisualizerPanel title={`Etapa ${stage + 1}: ${PIPELINE[stage].title}`}>
              <div style={{ minHeight: 250, display: "grid", placeItems: "center", padding: 28, color: "var(--text-muted)", textAlign: "center", fontSize: 13, lineHeight: 1.6 }}>
                Sigue avanzando para construir el ranking. La salida final aparecerá después de calcular los vectores y el coseno.
              </div>
            </VisualizerPanel>
          )}
        </div>

        {show(2) ? (
          <VisualizerPanel title="Matriz de pesos" meta={weighting === "tfidf" ? `tf × idf · ${idfFormula === "classic" ? "log₁₀(N/df)" : "log₁₀((N+1)/(df+1))+1"}` : "solo tf"}>
            <div style={{ overflowX: "auto" }}>
              <table className="ranking-table">
                <thead><tr><th>término</th><th>df</th><th>idf</th>{docs.map((_, index) => <th key={index}>D{index + 1}</th>)}<th>Q</th></tr></thead>
                <tbody>
                  {model.vocabulary.map((term, termIndex) => {
                    const queryTerm = model.queryCounts.has(term);
                    return (
                      <tr key={term} data-query={queryTerm || undefined}>
                        <td>{term}</td><td>{model.documentFrequency.get(term)}</td><td>{model.inverseDocumentFrequency.get(term)?.toFixed(3)}</td>
                        {activeModel.documentVectors.map((vector, index) => <td key={index}>{formatWeight(vector[termIndex])}</td>)}
                        <td>{formatWeight(activeModel.queryVector[termIndex])}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </VisualizerPanel>
        ) : null}

        {show(4) ? (
          <VisualizerPanel title="Cálculo de coseno y aporte por término" meta="producto punto / (‖Q‖ · ‖D‖)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(225px, 1fr))", gap: 10, padding: 14 }}>
              {activeModel.scores.map((score) => (
                <div key={score.documentIndex} style={{ padding: 11, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-base)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, font: "600 11px var(--font-code)" }}><span style={{ color: "var(--accent)" }}>Q · D{score.documentIndex + 1} = {score.product.toFixed(3)}</span><span style={{ color: "var(--success)" }}>cos {score.score.toFixed(3)}</span></div>
                  <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 10 }}>‖Q‖ {activeModel.queryNorm.toFixed(3)} · ‖D{score.documentIndex + 1}‖ {score.documentNorm.toFixed(3)}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                    {score.contributions.length ? score.contributions.map((item) => <span key={item.term} title={`aporte al producto punto: ${item.value.toFixed(4)}`} style={chipStyle}>{item.term} +{item.value.toFixed(2)}</span>) : <span style={{ color: "var(--text-muted)", fontSize: 10 }}>Sin términos compartidos con peso positivo.</span>}
                  </div>
                </div>
              ))}
            </div>
          </VisualizerPanel>
        ) : null}
      </div>
      <style>{`
        .ranking-table{width:100%;border-collapse:collapse;font:500 11px var(--font-code)}
        .ranking-table th,.ranking-table td{padding:7px 10px;border-bottom:1px solid var(--border);text-align:center;white-space:nowrap}
        .ranking-table th{position:sticky;top:0;background:var(--bg-elevated);color:var(--text-muted);font-size:10px;text-transform:uppercase}
        .ranking-table td{color:var(--text-secondary)}.ranking-table td:first-child,.ranking-table th:first-child{text-align:left}
        .ranking-table tr[data-query]{background:var(--accent-glow)}.ranking-table tr[data-query] td:first-child{color:var(--accent);font-weight:700}
        @media(max-width:900px){.ranking-workspace,.ranking-controls{grid-template-columns:1fr!important}}
      `}</style>
    </VisualizerLayout>
  );
}

function TokenRow({ tokens, accent = false }: { tokens: string[]; accent?: boolean }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>{tokens.length ? tokens.map((token, index) => <span key={`${token}-${index}`} style={{ ...chipStyle, color: accent ? "var(--accent)" : "var(--text-muted)" }}>{token}</span>) : <span style={{ color: "var(--text-muted)", fontSize: 10 }}>sin tokens</span>}</div>;
}

function RankingColumn({ title, ranked, docs, active }: { title: string; ranked: { documentIndex: number; score: number }[]; docs: string[]; active: boolean }) {
  const maximum = Math.max(...ranked.map((item) => item.score), 0.0001);
  return (
    <div style={{ padding: 10, border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, borderRadius: 9, background: active ? "var(--accent-glow)" : "var(--bg-base)" }}>
      <div className="viz-label" style={{ color: active ? "var(--accent)" : undefined, marginBottom: 9 }}>{title}{active ? " · principal" : ""}</div>
      <div style={{ display: "grid", gap: 7 }}>
        {ranked.map((item, rank) => {
          const tied = rank > 0 && Math.abs(item.score - ranked[rank - 1].score) < 1e-9;
          return (
            <div key={item.documentIndex} title={docs[item.documentIndex]} style={{ padding: "8px 9px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--bg-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", font: "600 10px var(--font-code)" }}><span>#{rank + 1} · D{item.documentIndex + 1}{tied ? " · empate" : ""}</span><strong style={{ color: item.score > 0 ? "var(--success)" : "var(--text-muted)" }}>{item.score.toFixed(3)}</strong></div>
              <div style={{ height: 4, marginTop: 7, borderRadius: 2, background: "var(--bg-elevated)", overflow: "hidden" }}><span style={{ display: "block", width: `${item.score / maximum * 100}%`, height: "100%", background: "var(--success)", transition: "width .2s" }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const formatWeight = (value: number) => value === 0 ? "·" : value.toFixed(2);
const chipStyle: React.CSSProperties = { padding: "3px 6px", border: "1px solid var(--border)", borderRadius: 4, background: "var(--bg-elevated)", color: "var(--text-secondary)", font: "500 9px/1.2 var(--font-code)" };
const docLabelStyle: React.CSSProperties = { paddingTop: 8, color: "var(--accent)", font: "700 11px var(--font-code)" };
const textStyle: React.CSSProperties = { width: "100%", minHeight: 36, padding: "8px 9px", border: "1px solid var(--border-bright)", borderRadius: 7, outline: "none", resize: "vertical", background: "var(--bg-base)", color: "var(--text-primary)", font: "400 12px/1.45 var(--font-ui)" };
