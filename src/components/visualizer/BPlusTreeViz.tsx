"use client";

import { useMemo, useState } from "react";
import {
  ActionButton,
  MetricCard,
  StepNavigator,
  VisualizerLayout,
  VisualizerPanel,
  type LearningMode,
} from "./VisualizerLayout";

interface BNode {
  uid: number;
  keys: number[];
  children: BNode[];
  isLeaf: boolean;
}

interface TraceFrame {
  tree: BNode;
  title: string;
  description: string;
  highlighted: number[];
  key: number | null;
}

let nextUid = 1;
const makeNode = (isLeaf: boolean): BNode => ({ uid: nextUid++, keys: [], children: [], isLeaf });
const cloneNode = (node: BNode): BNode => ({
  uid: node.uid,
  keys: [...node.keys],
  isLeaf: node.isLeaf,
  children: node.children.map(cloneNode),
});

function maxUid(node: BNode): number {
  return Math.max(node.uid, ...node.children.map(maxUid), 0);
}

function allKeys(node: BNode): number[] {
  if (node.isLeaf) return [...node.keys];
  return node.children.flatMap(allKeys);
}

function stats(root: BNode) {
  let height = 0;
  let nodes = 0;
  let leaves = 0;
  const visit = (node: BNode, depth: number) => {
    nodes += 1;
    height = Math.max(height, depth);
    if (node.isLeaf) leaves += 1;
    node.children.forEach((child) => visit(child, depth + 1));
  };
  visit(root, 1);
  return { height, nodes, leaves, keys: allKeys(root).length };
}

function insertWithTrace(source: BNode, key: number, order: number): { root: BNode; frames: TraceFrame[]; inserted: boolean } {
  const root = cloneNode(source);
  nextUid = maxUid(root) + 1;
  if (allKeys(root).includes(key)) return { root, frames: [], inserted: false };

  const frames: TraceFrame[] = [{
    tree: cloneNode(root),
    title: "Estado inicial",
    description: `Preparando la inserción de ${key}. Cada nodo admite como máximo ${order - 1} claves.`,
    highlighted: [root.uid],
    key,
  }];

  const capture = (title: string, description: string, highlighted: number[]) => {
    frames.push({ tree: cloneNode(root), title, description, highlighted, key });
  };

  type Promotion = { separator: number; right: BNode; kind: "leaf" | "internal"; splitDescription: string } | null;

  function insert(node: BNode, path: number[]): Promotion {
    const activePath = [...path, node.uid];
    if (node.isLeaf) {
      capture("Hoja localizada", `La búsqueda termina en la hoja [${node.keys.join(", ") || "vacía"}].`, activePath);
      const position = node.keys.findIndex((value) => value > key);
      node.keys.splice(position < 0 ? node.keys.length : position, 0, key);
      capture(
        node.keys.length >= order ? "Overflow detectado" : "Clave insertada",
        node.keys.length >= order
          ? `La hoja contiene ${node.keys.length} claves y supera su capacidad de ${order - 1}. Debe dividirse.`
          : `${key} queda ordenada dentro de la hoja; no se necesita split.`,
        activePath,
      );
      if (node.keys.length < order) return null;

      const splitAt = Math.ceil(node.keys.length / 2);
      const right = makeNode(true);
      right.keys = node.keys.splice(splitAt);
      const separator = right.keys[0];
      return {
        separator,
        right,
        kind: "leaf",
        splitDescription: `La hoja se divide en [${node.keys.join(", ")}] y [${right.keys.join(", ")}].`,
      };
    }

    let childIndex = 0;
    while (childIndex < node.keys.length && key >= node.keys[childIndex]) childIndex += 1;
    capture(
      "Descenso por índice",
      childIndex === node.keys.length
        ? `${key} es mayor o igual que los separadores: seguimos el puntero derecho.`
        : `${key} es menor que ${node.keys[childIndex]}: seguimos el puntero ${childIndex + 1}.`,
      activePath,
    );

    const promotion = insert(node.children[childIndex], activePath);
    if (!promotion) return null;

    node.keys.splice(childIndex, 0, promotion.separator);
    node.children.splice(childIndex + 1, 0, promotion.right);
    capture(
      promotion.kind === "leaf" ? "Split de hoja" : "Split interno",
      `${promotion.splitDescription} El nuevo nodo ya está conectado al padre.`,
      [...activePath, node.children[childIndex].uid, promotion.right.uid],
    );
    capture(
      node.keys.length >= order ? "Overflow interno" : "Separador propagado",
      node.keys.length >= order
        ? `El separador ${promotion.separator} llegó al nodo interno y ahora este también debe dividirse.`
        : `El padre incorpora ${promotion.separator} y apunta a la nueva página derecha.`,
      [...activePath, promotion.right.uid],
    );
    if (node.keys.length < order) return null;

    const middle = Math.floor(node.keys.length / 2);
    const separator = node.keys[middle];
    const right = makeNode(false);
    right.keys = node.keys.splice(middle + 1);
    node.keys.splice(middle, 1);
    right.children = node.children.splice(middle + 1);
    return {
      separator,
      right,
      kind: "internal",
      splitDescription: `El nodo interno se divide y el separador ${separator} sale de ambos lados.`,
    };
  }

  const promotion = insert(root, []);
  let finalRoot = root;
  if (promotion) {
    finalRoot = makeNode(false);
    finalRoot.keys = [promotion.separator];
    finalRoot.children = [root, promotion.right];
    frames.push({
      tree: cloneNode(finalRoot),
      title: promotion.kind === "leaf" ? "Split de hoja raíz" : "Split de raíz interna",
      description: `${promotion.splitDescription} El separador ${promotion.separator} necesita un nivel superior.`,
      highlighted: [root.uid, promotion.right.uid],
      key,
    });
    frames.push({
      tree: cloneNode(finalRoot),
      title: "Nueva raíz",
      description: `El split alcanzó la raíz. ${promotion.separator} se convierte en el separador de una nueva raíz.`,
      highlighted: [finalRoot.uid, root.uid, promotion.right.uid],
      key,
    });
  }

  frames.push({
    tree: cloneNode(finalRoot),
    title: "Inserción completada",
    description: `${key} ya es accesible desde la raíz y permanece en una hoja enlazada.`,
    highlighted: [],
    key,
  });
  return { root: finalRoot, frames, inserted: true };
}

function searchTrace(root: BNode, key: number): TraceFrame[] {
  const frames: TraceFrame[] = [];
  const path: number[] = [];
  let node = root;
  while (true) {
    path.push(node.uid);
    if (node.isLeaf) {
      const found = node.keys.includes(key);
      frames.push({
        tree: cloneNode(root),
        title: found ? "Clave encontrada" : "Clave ausente",
        description: found ? `${key} aparece en la hoja [${node.keys.join(", ")}].` : `La hoja [${node.keys.join(", ")}] no contiene ${key}.`,
        highlighted: [...path],
        key: found ? key : null,
      });
      break;
    }
    let index = 0;
    while (index < node.keys.length && key >= node.keys[index]) index += 1;
    frames.push({
      tree: cloneNode(root),
      title: "Comparar separadores",
      description: index === node.keys.length ? `${key} continúa por el último puntero.` : `${key} < ${node.keys[index]}, por eso baja por el puntero ${index + 1}.`,
      highlighted: [...path],
      key,
    });
    node = node.children[index];
  }
  return frames;
}

function buildTree(keys: number[], order: number): BNode {
  nextUid = 1;
  let root = makeNode(true);
  for (const key of keys) root = insertWithTrace(root, key, order).root;
  return root;
}

interface LayoutNode {
  node: BNode;
  x: number;
  y: number;
  width: number;
  children: LayoutNode[];
}

const KEY_W = 39;
const NODE_H = 42;
const GAP_X = 18;
const GAP_Y = 76;
const nodeWidth = (node: BNode) => Math.max(1, node.keys.length) * KEY_W + 10;

function layoutTree(root: BNode) {
  function measure(node: BNode, depth: number): LayoutNode {
    const children = node.children.map((child) => measure(child, depth + 1));
    const childrenWidth = children.reduce((sum, child) => sum + child.width, 0) + Math.max(0, children.length - 1) * GAP_X;
    return { node, x: 0, y: depth * (NODE_H + GAP_Y), width: Math.max(nodeWidth(node), childrenWidth), children };
  }
  function position(item: LayoutNode, left: number) {
    if (item.children.length === 0) item.x = left + (item.width - nodeWidth(item.node)) / 2;
    else {
      const childrenWidth = item.children.reduce((sum, child) => sum + child.width, 0) + (item.children.length - 1) * GAP_X;
      let cursor = left + (item.width - childrenWidth) / 2;
      item.children.forEach((child) => { position(child, cursor); cursor += child.width + GAP_X; });
      const first = item.children[0];
      const last = item.children[item.children.length - 1];
      item.x = (first.x + nodeWidth(first.node) / 2 + last.x + nodeWidth(last.node) / 2) / 2 - nodeWidth(item.node) / 2;
    }
  }
  const tree = measure(root, 0);
  position(tree, 0);
  let maxY = 0;
  const walk = (item: LayoutNode) => { maxY = Math.max(maxY, item.y); item.children.forEach(walk); };
  walk(tree);
  return { tree, width: tree.width + 60, height: maxY + NODE_H + 70 };
}

function TreeCanvas({ root, highlighted, activeKey }: { root: BNode; highlighted: number[]; activeKey: number | null }) {
  const layout = useMemo(() => layoutTree(root), [root]);
  const active = useMemo(() => new Set(highlighted), [highlighted]);
  const lines: React.ReactNode[] = [];
  const nodes: React.ReactNode[] = [];
  const leaves: LayoutNode[] = [];

  function render(item: LayoutNode) {
    const width = nodeWidth(item.node);
    if (item.node.isLeaf) leaves.push(item);
    item.children.forEach((child) => {
      lines.push(<line key={`edge-${item.node.uid}-${child.node.uid}`} x1={item.x + width / 2} y1={item.y + NODE_H} x2={child.x + nodeWidth(child.node) / 2} y2={child.y} stroke={active.has(item.node.uid) && active.has(child.node.uid) ? "var(--warning)" : "var(--border-bright)"} strokeWidth={active.has(item.node.uid) && active.has(child.node.uid) ? 2.5 : 1.5} />);
      render(child);
    });
    const border = active.has(item.node.uid) ? "var(--warning)" : item.node.isLeaf ? "var(--success)" : "var(--accent)";
    nodes.push(
      <g key={`node-${item.node.uid}`}>
        <text x={item.x + width / 2} y={item.y - 7} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-code)">{item.node.isLeaf ? "HOJA" : "ÍNDICE"}</text>
        <rect x={item.x} y={item.y} width={width} height={NODE_H} rx={8} fill={item.node.isLeaf ? "var(--bg-surface)" : "var(--bg-elevated)"} stroke={border} strokeWidth={active.has(item.node.uid) ? 2.5 : 1.5} />
        {item.node.keys.map((key, index) => {
          const x = item.x + 5 + index * KEY_W;
          return (
            <g key={`${item.node.uid}-${key}`}>
              {activeKey === key ? <rect x={x + 2} y={item.y + 6} width={KEY_W - 4} height={30} rx={5} fill="var(--success)" /> : null}
              <text x={x + KEY_W / 2} y={item.y + 22} dominantBaseline="middle" textAnchor="middle" fill={activeKey === key ? "#07130f" : "var(--text-primary)"} fontSize="13" fontWeight="600" fontFamily="var(--font-code)">{key}</text>
              {index < item.node.keys.length - 1 ? <line x1={x + KEY_W} y1={item.y + 8} x2={x + KEY_W} y2={item.y + 34} stroke="var(--border-bright)" /> : null}
            </g>
          );
        })}
      </g>,
    );
  }
  render(layout.tree);
  leaves.sort((a, b) => a.x - b.x);
  leaves.slice(0, -1).forEach((leaf, index) => {
    const next = leaves[index + 1];
    const y = leaf.y + NODE_H / 2;
    lines.push(<g key={`leaf-link-${leaf.node.uid}`}><line x1={leaf.x + nodeWidth(leaf.node) + 2} y1={y} x2={next.x - 5} y2={y} stroke="var(--success)" strokeOpacity=".45" strokeDasharray="5 4" /><path d={`M ${next.x - 5} ${y} l -6 -4 v 8 z`} fill="var(--success)" opacity=".55" /></g>);
  });

  return (
    <div style={{ minHeight: 330, overflow: "auto", padding: 18 }}>
      {allKeys(root).length === 0 ? <div style={{ minHeight: 290, display: "grid", placeItems: "center", color: "var(--text-muted)", fontSize: 13 }}>Árbol vacío · inserta una clave para comenzar</div> : (
        <svg role="img" aria-label={`Árbol B+ con ${allKeys(root).length} claves`} width={Math.max(layout.width, 520)} height={Math.max(layout.height, 300)} style={{ display: "block", margin: "0 auto" }}>
          <title>Estructura actual del árbol B+</title>
          <desc>Los nodos morados son índices, los verdes son hojas y las líneas discontinuas enlazan las hojas.</desc>
          {lines}{nodes}
        </svg>
      )}
    </div>
  );
}

const INITIAL_KEYS = [10, 20, 5, 15, 25, 30, 12];

export default function BPlusTreeViz() {
  const [order, setOrder] = useState(4);
  const [root, setRoot] = useState(() => buildTree(INITIAL_KEYS, 4));
  const [input, setInput] = useState("18");
  const [mode, setMode] = useState<LearningMode>("guided");
  const [frames, setFrames] = useState<TraceFrame[]>([]);
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>(["Ejemplo inicial cargado"]);
  const [message, setMessage] = useState("");

  const frame = frames[step];
  const shownRoot = frame?.tree ?? root;
  const treeStats = useMemo(() => stats(shownRoot), [shownRoot]);

  function runInsert(value = Number(input)) {
    if (!Number.isFinite(value)) { setMessage("Ingresa una clave numérica válida."); return; }
    const result = insertWithTrace(root, value, order);
    if (!result.inserted) { setMessage(`${value} ya existe en el árbol.`); return; }
    setRoot(result.root);
    setFrames(result.frames);
    setStep(mode === "guided" ? 0 : result.frames.length - 1);
    setLogs((items) => [`INSERT ${value} · ${result.frames.length - 2} etapas`, ...items].slice(0, 20));
    setMessage("");
  }

  function runSearch() {
    const value = Number(input);
    if (!Number.isFinite(value)) { setMessage("Ingresa una clave numérica válida."); return; }
    const trace = searchTrace(root, value);
    setFrames(trace);
    setStep(mode === "guided" ? 0 : trace.length - 1);
    setLogs((items) => [`SEARCH ${value} · ${trace.at(-1)?.title}`, ...items].slice(0, 20));
    setMessage("");
  }

  function reset(keys = INITIAL_KEYS) {
    setRoot(buildTree(keys, order));
    setFrames([]);
    setStep(0);
    setLogs([keys.length ? "Ejemplo inicial cargado" : "Árbol reiniciado"]);
    setMessage("");
  }

  function changeOrder(value: number) {
    const keys = allKeys(root);
    setOrder(value);
    setRoot(buildTree(keys, value));
    setFrames([]);
    setStep(0);
    setLogs((items) => [`Orden cambiado a ${value}`, ...items]);
  }

  function randomKey() {
    const used = new Set(allKeys(root));
    const candidates = Array.from({ length: 99 }, (_, index) => index + 1).filter((value) => !used.has(value));
    if (candidates.length) runInsert(candidates[Math.floor(Math.random() * candidates.length)]);
  }

  return (
    <VisualizerLayout
      eyebrow="Semana 3 · Índices · Visualizador interactivo"
      title="B+Tree: de la búsqueda al split"
      description="Inserta claves y observa la mutación estructural completa. Las hojas conservan los datos ordenados y el nivel interno solo guía la búsqueda."
      mode={mode}
      onModeChange={(value) => { setMode(value); if (frames.length) setStep(value === "guided" ? 0 : frames.length - 1); }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 270px", gap: 16, alignItems: "start" }} className="bpt-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <VisualizerPanel>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: 12 }}>
              <label className="viz-label" htmlFor="bpt-key">Clave</label>
              <input id="bpt-key" type="number" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") runInsert(); }} style={inputStyle} />
              <ActionButton variant="success" onClick={() => runInsert()}>Insertar</ActionButton>
              <ActionButton variant="primary" onClick={runSearch}>Buscar</ActionButton>
              <ActionButton onClick={randomKey}>Clave aleatoria</ActionButton>
              <span style={{ width: 1, height: 24, background: "var(--border)" }} />
              <label className="viz-label" htmlFor="bpt-order">Orden</label>
              <select id="bpt-order" value={order} onChange={(event) => changeOrder(Number(event.target.value))} style={inputStyle}>
                <option value={3}>3</option><option value={4}>4</option><option value={5}>5</option>
              </select>
              <ActionButton onClick={() => reset([])}>Vaciar</ActionButton>
              <ActionButton onClick={() => reset()}>Ejemplo</ActionButton>
              {message ? <span role="alert" style={{ marginLeft: "auto", color: "var(--error)", fontSize: 11 }}>{message}</span> : null}
            </div>
          </VisualizerPanel>

          {mode === "guided" && frame ? (
            <StepNavigator current={step} total={frames.length} title={frame.title} description={frame.description} onPrevious={() => setStep((value) => Math.max(0, value - 1))} onNext={() => setStep((value) => Math.min(frames.length - 1, value + 1))} onStart={() => setStep(0)} onEnd={() => setStep(frames.length - 1)} />
          ) : null}

          <VisualizerPanel title="Estructura del árbol" meta={`orden ${order} · máximo ${order - 1} claves por nodo`}>
            <TreeCanvas root={shownRoot} highlighted={frame?.highlighted ?? []} activeKey={frame?.key ?? null} />
          </VisualizerPanel>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <VisualizerPanel title="Estado">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 12 }}>
              <MetricCard label="Altura" value={treeStats.height} />
              <MetricCard label="Claves" value={treeStats.keys} />
              <MetricCard label="Nodos" value={treeStats.nodes} />
              <MetricCard label="Hojas" value={treeStats.leaves} />
            </div>
          </VisualizerPanel>
          <VisualizerPanel title="Cómo leerlo">
            <div style={{ display: "grid", gap: 9, padding: 12, color: "var(--text-secondary)", fontSize: 11, lineHeight: 1.45 }}>
              <Legend color="var(--accent)" label="Nodo índice: contiene separadores" />
              <Legend color="var(--success)" label="Hoja: contiene las claves" />
              <Legend color="var(--warning)" label="Ruta o nodos de la etapa actual" />
              <p style={{ margin: "5px 0 0", color: "var(--text-muted)" }}>“Orden {order}” se usa aquí como máximo {order} hijos y {order - 1} claves por nodo.</p>
            </div>
          </VisualizerPanel>
          <VisualizerPanel title="Operaciones">
            <div aria-live="polite" style={{ display: "grid", gap: 5, padding: 12, maxHeight: 210, overflow: "auto" }}>
              {logs.map((log, index) => <div key={`${log}-${index}`} style={{ padding: "6px 8px", borderRadius: 5, background: "var(--bg-base)", color: "var(--text-secondary)", font: "500 10px/1.35 var(--font-code)" }}>{log}</div>)}
            </div>
          </VisualizerPanel>
        </aside>
      </div>
      <style>{`@media(max-width:980px){.bpt-grid{grid-template-columns:1fr!important}.bpt-grid aside{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}}`}</style>
    </VisualizerLayout>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 11, height: 11, borderRadius: 3, border: `2px solid ${color}` }} />{label}</div>;
}

const inputStyle: React.CSSProperties = {
  width: 105,
  minHeight: 32,
  padding: "6px 9px",
  border: "1px solid var(--border-bright)",
  borderRadius: 7,
  outline: "none",
  background: "var(--bg-base)",
  color: "var(--text-primary)",
  font: "500 12px var(--font-code)",
};
