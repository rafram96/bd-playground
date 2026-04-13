"use client";

import { useState, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   B+Tree data structure
   ═══════════════════════════════════════════════════════════════════════════════ */
interface BNode {
  keys: number[];
  children: BNode[];
  isLeaf: boolean;
  next?: BNode;        // leaf chaining
  uid: number;
}

let _uid = 0;
function mkNode(isLeaf: boolean): BNode {
  return { keys: [], children: [], isLeaf, uid: _uid++ };
}

class BPTree {
  root: BNode;
  order: number;

  constructor(order: number) {
    this.order = order;
    this.root = mkNode(true);
  }

  /* ── search ── */
  search(key: number): { found: boolean; path: number[] } {
    const path: number[] = [];
    let node = this.root;
    while (true) {
      path.push(node.uid);
      if (node.isLeaf) return { found: node.keys.includes(key), path };
      let i = 0;
      while (i < node.keys.length && key >= node.keys[i]) i++;
      node = node.children[i];
    }
  }

  has(key: number): boolean { return this.search(key).found; }

  /* ── insert ── */
  insert(key: number): boolean {
    if (this.has(key)) return false;
    const r = this.root;
    if (r.keys.length === this.order - 1) {
      const s = mkNode(false);
      s.children = [r];
      this._splitChild(s, 0);
      this.root = s;
    }
    this._insertNonFull(this.root, key);
    return true;
  }

  private _insertNonFull(node: BNode, key: number) {
    if (node.isLeaf) {
      const i = node.keys.findIndex(k => k > key);
      if (i === -1) node.keys.push(key);
      else node.keys.splice(i, 0, key);
      return;
    }
    let i = node.keys.length - 1;
    while (i >= 0 && key < node.keys[i]) i--;
    i++;
    if (node.children[i].keys.length === this.order - 1) {
      this._splitChild(node, i);
      if (key >= node.keys[i]) i++;
    }
    this._insertNonFull(node.children[i], key);
  }

  private _splitChild(parent: BNode, idx: number) {
    const full = parent.children[idx];
    const mid = Math.floor((this.order - 1) / 2);
    const right = mkNode(full.isLeaf);

    if (full.isLeaf) {
      right.keys = full.keys.splice(mid);
      parent.keys.splice(idx, 0, right.keys[0]);
      right.next = full.next;
      full.next = right;
    } else {
      right.keys = full.keys.splice(mid + 1);
      const upKey = full.keys.pop()!;
      right.children = full.children.splice(mid + 1);
      parent.keys.splice(idx, 0, upKey);
    }
    parent.children.splice(idx + 1, 0, right);
  }

  /* ── collect all keys via leaf scan ── */
  allKeys(): number[] {
    let leaf: BNode | undefined = this.root;
    while (!leaf.isLeaf) leaf = leaf.children[0];
    const out: number[] = [];
    while (leaf) { out.push(...leaf.keys); leaf = leaf.next; }
    return out;
  }

  /* ── stats ── */
  stats() {
    let height = 0, nodes = 0, leaves = 0, keys = 0;
    const dfs = (n: BNode, d: number) => {
      nodes++; keys += n.keys.length; height = Math.max(height, d);
      if (n.isLeaf) leaves++;
      n.children.forEach(c => dfs(c, d + 1));
    };
    dfs(this.root, 1);
    return { height, nodes, leaves, keys };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Layout engine — recursive width calculation + centering
   ═══════════════════════════════════════════════════════════════════════════════ */
interface LNode {
  node: BNode;
  x: number; y: number; w: number;
  children: LNode[];
}

const KEY_W   = 38;
const KEY_H   = 30;
const NODE_PY = 6;
const NODE_PX = 4;
const GAP_X   = 16;
const GAP_Y   = 64;

function nodeW(n: BNode) { return Math.max(n.keys.length, 1) * KEY_W + NODE_PX * 2; }

function layoutTree(root: BNode): { tree: LNode; totalW: number; totalH: number } {
  function measure(n: BNode, depth: number): LNode {
    const ch = n.children.map(c => measure(c, depth + 1));
    const selfW = nodeW(n);
    const chW = ch.length > 0
      ? ch.reduce((s, c) => s + c.w, 0) + (ch.length - 1) * GAP_X
      : 0;
    const w = Math.max(selfW, chW);
    return { node: n, x: 0, y: depth * (KEY_H + NODE_PY * 2 + GAP_Y), w, children: ch };
  }

  function position(ln: LNode, left: number) {
    if (ln.children.length === 0) {
      ln.x = left + (ln.w - nodeW(ln.node)) / 2;
    } else {
      let cx = left;
      const totalChW = ln.children.reduce((s, c) => s + c.w, 0) + (ln.children.length - 1) * GAP_X;
      const startX = left + (ln.w - totalChW) / 2;
      cx = startX;
      ln.children.forEach(c => { position(c, cx); cx += c.w + GAP_X; });
      // center parent above children
      const firstCh = ln.children[0];
      const lastCh  = ln.children[ln.children.length - 1];
      const childCenter = (firstCh.x + nodeW(firstCh.node) / 2 + lastCh.x + nodeW(lastCh.node) / 2) / 2;
      ln.x = childCenter - nodeW(ln.node) / 2;
    }
  }

  const tree = measure(root, 0);
  position(tree, 0);

  // compute total height
  let maxY = 0;
  const walk = (ln: LNode) => { maxY = Math.max(maxY, ln.y); ln.children.forEach(walk); };
  walk(tree);

  return { tree, totalW: tree.w, totalH: maxY + KEY_H + NODE_PY * 2 + 20 };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function BPlusTreeViz() {
  const [order, setOrder] = useState(4);
  const [tree, setTree]   = useState(() => new BPTree(4));
  const [input, setInput] = useState("");
  const [msg, setMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [hlPath, setHlPath]     = useState<Set<number>>(new Set());
  const [hlKey, setHlKey]       = useState<number | null>(null);
  const [logs, setLogs]         = useState<string[]>([]);

  const addLog = (s: string) => setLogs(p => [s, ...p].slice(0, 30));

  /* rebuild tree preserving keys */
  const rebuild = useCallback((keys: number[], ord: number) => {
    _uid = 0;
    const t = new BPTree(ord);
    keys.forEach(k => t.insert(k));
    return t;
  }, []);

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2000);
  };

  /* ── handlers ── */
  const doInsert = useCallback(() => {
    const v = parseInt(input);
    if (isNaN(v)) return;
    const keys = tree.allKeys();
    if (keys.includes(v)) { flash(`${v} ya existe`, false); addLog(`✗ INSERT ${v} — duplicado`); setInput(""); return; }
    const nt = rebuild([...keys, v], order);
    setTree(nt);
    setHlKey(v);
    setTimeout(() => setHlKey(null), 1200);
    flash(`Insertado ${v}`, true);
    addLog(`✓ INSERT ${v}`);
    setInput("");
  }, [input, tree, order, rebuild]);

  const doSearch = useCallback(() => {
    const v = parseInt(input);
    if (isNaN(v)) return;
    const { found, path } = tree.search(v);
    setHlPath(new Set(path));
    if (found) { setHlKey(v); flash(`Encontrado ${v}`, true); }
    else flash(`${v} no encontrado`, false);
    addLog(found ? `🔍 SEARCH ${v} — encontrado` : `🔍 SEARCH ${v} — no encontrado`);
    setTimeout(() => { setHlPath(new Set()); setHlKey(null); }, 2000);
    setInput("");
  }, [input, tree]);

  const doReset = useCallback(() => {
    setTree(rebuild([], order));
    setLogs([]);
    flash("Árbol reiniciado", true);
  }, [order, rebuild]);

  const doRandom = useCallback(() => {
    const v = Math.floor(Math.random() * 999) + 1;
    const keys = tree.allKeys();
    if (keys.includes(v)) { doRandom(); return; }
    const nt = rebuild([...keys, v], order);
    setTree(nt);
    setHlKey(v);
    setTimeout(() => setHlKey(null), 1200);
    addLog(`✓ INSERT ${v} (aleatorio)`);
  }, [tree, order, rebuild]);

  const doRandomBatch = useCallback(() => {
    const keys = tree.allKeys();
    const newKeys = [...keys];
    for (let i = 0; i < 10; i++) {
      let v: number;
      do { v = Math.floor(Math.random() * 999) + 1; } while (newKeys.includes(v));
      newKeys.push(v);
    }
    setTree(rebuild(newKeys, order));
    addLog(`✓ INSERT ×10 aleatorios`);
  }, [tree, order, rebuild]);

  const changeOrder = useCallback((o: number) => {
    setOrder(o);
    setTree(rebuild(tree.allKeys(), o));
    addLog(`Orden cambiado a ${o}`);
  }, [tree, rebuild]);

  /* ── layout ── */
  const { tree: lt, totalW, totalH } = useMemo(() => layoutTree(tree.root), [tree]);
  const st = useMemo(() => tree.stats(), [tree]);

  /* ── SVG lines & leaf chain ── */
  function svgLines(ln: LNode): React.ReactNode[] {
    const lines: React.ReactNode[] = [];
    const px = ln.x + nodeW(ln.node) / 2;
    const py = ln.y + KEY_H + NODE_PY * 2;
    ln.children.forEach(ch => {
      const cx = ch.x + nodeW(ch.node) / 2;
      const cy = ch.y;
      const isHl = hlPath.has(ln.node.uid) && hlPath.has(ch.node.uid);
      lines.push(
        <line key={`l-${ln.node.uid}-${ch.node.uid}`}
          x1={px} y1={py} x2={cx} y2={cy}
          stroke={isHl ? "#f0c060" : "rgba(255,255,255,0.12)"}
          strokeWidth={isHl ? 2.5 : 1.5}
          style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
        />
      );
      lines.push(...svgLines(ch));
    });
    return lines;
  }

  function leafChainLines(): React.ReactNode[] {
    const lines: React.ReactNode[] = [];
    // collect leaf layout nodes
    const leaves: LNode[] = [];
    const collect = (ln: LNode) => {
      if (ln.node.isLeaf) leaves.push(ln);
      ln.children.forEach(collect);
    };
    collect(lt);
    for (let i = 0; i < leaves.length - 1; i++) {
      const a = leaves[i], b = leaves[i + 1];
      const ax = a.x + nodeW(a.node) + 2;
      const bx = b.x - 2;
      const ay = a.y + (KEY_H + NODE_PY * 2) / 2;
      lines.push(
        <line key={`chain-${i}`}
          x1={ax} y1={ay} x2={bx} y2={ay}
          stroke="rgba(34,211,160,0.35)" strokeWidth={1.5} strokeDasharray="5,4"
        />
      );
      // arrow
      lines.push(
        <polygon key={`arrow-${i}`}
          points={`${bx},${ay} ${bx - 6},${ay - 3} ${bx - 6},${ay + 3}`}
          fill="rgba(34,211,160,0.5)"
        />
      );
    }
    return lines;
  }

  /* ── render nodes ── */
  function renderNodes(ln: LNode): React.ReactNode[] {
    const isHl = hlPath.has(ln.node.uid);
    const nw = nodeW(ln.node);
    const nh = KEY_H + NODE_PY * 2;
    const borderColor = ln.node.isLeaf ? "#22d3a0" : "#7c6af7";

    const nodes: React.ReactNode[] = [
      <g key={`n-${ln.node.uid}`}>
        <rect
          x={ln.x} y={ln.y} width={nw} height={nh} rx={7}
          fill={ln.node.isLeaf ? "#111118" : "#1a1a26"}
          stroke={isHl ? "#f0c060" : borderColor}
          strokeWidth={isHl ? 2.5 : 1.5}
          style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
          filter={isHl ? "url(#glow)" : undefined}
        />
        {ln.node.keys.map((k, i) => {
          const kx = ln.x + NODE_PX + i * KEY_W;
          const ky = ln.y + NODE_PY;
          const isKeyHl = hlKey === k;
          return (
            <g key={`k-${ln.node.uid}-${k}`}>
              {isKeyHl && (
                <rect x={kx} y={ky} width={KEY_W - 2} height={KEY_H} rx={4}
                  fill="#22d3a0" style={{ transition: "fill 0.3s" }}
                />
              )}
              <text
                x={kx + KEY_W / 2 - 1} y={ky + KEY_H / 2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill={isKeyHl ? "#0a0a0f" : "#e8e8f0"}
                fontSize={13} fontFamily="JetBrains Mono, monospace" fontWeight={500}
                style={{ transition: "fill 0.3s" }}
              >
                {k}
              </text>
              {/* separator */}
              {i < ln.node.keys.length - 1 && (
                <line x1={kx + KEY_W - 1} y1={ky + 4} x2={kx + KEY_W - 1} y2={ky + KEY_H - 4}
                  stroke="rgba(255,255,255,0.08)" strokeWidth={1}
                />
              )}
            </g>
          );
        })}
        {/* leaf indicator */}
        {ln.node.isLeaf && (
          <text x={ln.x + nw / 2} y={ln.y - 6} textAnchor="middle"
            fill="rgba(34,211,160,0.4)" fontSize={8} fontFamily="JetBrains Mono, monospace">
            HOJA
          </text>
        )}
      </g>,
    ];
    ln.children.forEach(ch => nodes.push(...renderNodes(ch)));
    return nodes;
  }

  /* ═════════════════════════════════════════════════════════════════════════════
     Render
     ═════════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-ui)", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "24px 32px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>B+Tree Interactivo</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.5 }}>
          Inserta claves y observa cómo el árbol crece con splits. Busca claves para ver el camino de la raíz a la hoja.
          Las hojas están enlazadas (leaf chaining) para range queries eficientes.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center", padding: "12px 32px", flexWrap: "wrap",
        background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        <input type="number" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") doInsert(); }}
          placeholder="Clave numérica..."
          style={{
            width: 140, padding: "7px 12px", background: "var(--bg-base)", color: "var(--text-primary)",
            border: "1px solid var(--border)", borderRadius: 6, fontFamily: "var(--font-code)", fontSize: 13, outline: "none",
          }}
        />
        <Btn label="INSERTAR" color="#22d3a0" onClick={doInsert} />
        <Btn label="BUSCAR"   color="#7c6af7" onClick={doSearch} />
        <div style={{ width: 1, height: 24, background: "var(--border)" }} />
        <Btn label="+1 Aleatorio" color="#3b82f6" onClick={doRandom} outline />
        <Btn label="+10"          color="#3b82f6" onClick={doRandomBatch} outline />
        <div style={{ width: 1, height: 24, background: "var(--border)" }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>
          Orden
          <select value={order} onChange={e => changeOrder(+e.target.value)} style={{
            padding: "5px 8px", background: "var(--bg-base)", color: "var(--text-primary)",
            border: "1px solid var(--border)", borderRadius: 5, fontFamily: "var(--font-code)", fontSize: 12,
          }}>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
        <Btn label="REINICIAR" color="#6b7280" onClick={doReset} outline />

        {msg && (
          <span style={{
            marginLeft: "auto", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-code)",
            color: msg.ok ? "#22d3a0" : "#f87171", transition: "opacity 0.3s",
          }}>
            {msg.text}
          </span>
        )}
      </div>

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* SVG tree */}
        <div style={{
          flex: 1, overflow: "auto", background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)", position: "relative",
        }}>
          {st.keys === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "100%", gap: 8, color: "var(--text-muted)",
            }}>
              <span style={{ fontSize: 32 }}>🌱</span>
              <span style={{ fontSize: 14 }}>Árbol vacío — inserta claves para empezar</span>
            </div>
          ) : (
            <svg width={Math.max(totalW + 60, 400)} height={Math.max(totalH + 40, 300)}
              style={{ padding: "28px 30px", display: "block" }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {svgLines(lt)}
              {leafChainLines()}
              {renderNodes(lt)}
            </svg>
          )}
        </div>

        {/* Right panel: stats + log */}
        <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "auto", background: "var(--bg-base)" }}>
          {/* Stats */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Estadísticas
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Stat label="Altura"  value={st.height} />
              <Stat label="Claves"  value={st.keys} />
              <Stat label="Nodos"   value={st.nodes} />
              <Stat label="Hojas"   value={st.leaves} />
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>
              Orden {order} → máx {order - 1} claves/nodo
            </div>
          </div>

          {/* Legend */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 14, flexWrap: "wrap" }}>
            <LegendDot color="#7c6af7" label="Interno" />
            <LegendDot color="#22d3a0" label="Hoja" />
            <LegendDot color="#f0c060" label="Búsqueda" />
          </div>

          {/* Log */}
          <div style={{ flex: 1, padding: "12px 20px", overflow: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Operaciones
            </div>
            {logs.length === 0 ? (
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Sin operaciones aún</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {logs.map((l, i) => (
                  <div key={i} style={{
                    fontSize: 11, fontFamily: "var(--font-code)", color: "var(--text-secondary)",
                    padding: "4px 8px", background: "var(--bg-surface)", borderRadius: 4,
                  }}>
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tiny sub-components
   ───────────────────────────────────────────────────────────────────────────── */
function Btn({ label, color, onClick, outline, disabled }: { label: string; color: string; onClick: () => void; outline?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "7px 14px", border: outline ? `1px solid ${color}50` : "none", borderRadius: 6,
      background: outline ? "transparent" : disabled ? "var(--bg-elevated)" : color,
      color: outline ? color : disabled ? "var(--text-muted)" : "#fff",
      fontSize: 12, fontWeight: 700, fontFamily: "var(--font-code)",
      cursor: disabled ? "not-allowed" : "pointer", transition: "opacity 0.15s", opacity: disabled ? 0.4 : 1,
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = "1")}
    >{label}</button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: "6px 10px", background: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-code)" }}>{value}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, border: `2px solid ${color}`, background: `${color}20` }} />
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>{label}</span>
    </div>
  );
}
