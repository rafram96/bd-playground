"use client";

import { useState, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Data model
   ───────────────────────────────────────────────────────────────────────────── */
interface Slot {
  id: number;
  content: string;
  sizeBytes: number;   // content.length + TUPLE_HDR
  alive: boolean;
}

const PAGE_SIZE      = 8192;
const PAGE_HDR       = 24;
const ITEMID_BYTES   = 4;
const TUPLE_HDR      = 23;   // HeapTupleHeaderData

/* ─────────────────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────────────────── */
export default function SlottedPageViz() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [input, setInput]  = useState("");
  const [nextId, setNextId] = useState(0);
  const [flash, setFlash]   = useState<number | null>(null);

  /* ── derived stats ── */
  const itemIdBytes  = slots.length * ITEMID_BYTES;
  const liveTupleBytes = slots.filter(s => s.alive).reduce((a, s) => a + s.sizeBytes, 0);
  const deadTupleBytes = slots.filter(s => !s.alive).reduce((a, s) => a + s.sizeBytes, 0);
  const freeSpace    = PAGE_SIZE - PAGE_HDR - itemIdBytes - liveTupleBytes - deadTupleBytes;
  const liveCount    = slots.filter(s => s.alive).length;
  const deadCount    = slots.filter(s => !s.alive).length;

  /* ── insert ── */
  const handleInsert = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const size = text.length + TUPLE_HDR;
    if (freeSpace < size + ITEMID_BYTES) return;       // page full

    const newSlot: Slot = { id: nextId, content: text, sizeBytes: size, alive: true };
    setSlots(prev => [...prev, newSlot]);
    setNextId(n => n + 1);
    setInput("");
    setFlash(nextId);
    setTimeout(() => setFlash(null), 600);
  }, [input, freeSpace, nextId]);

  /* ── delete ── */
  const handleDelete = useCallback((id: number) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, alive: false } : s));
  }, []);

  /* ── compact (vacuum) ── */
  const handleCompact = useCallback(() => {
    setSlots(prev => prev.filter(s => s.alive));
  }, []);

  /* ── reset ── */
  const handleReset = useCallback(() => {
    setSlots([]);
    setNextId(0);
  }, []);

  /* ── seed quick data ── */
  const handleSeed = useCallback(() => {
    const names = [
      '{id:1,nom:"Ana",dep:"ENG"}',
      '{id:2,nom:"Alejandro Garcia",dep:"MKT"}',
      '{id:3,nom:"Bo",dep:"FIN"}',
      '{id:4,nom:"María López Fernández",dep:"HR"}',
      '{id:5,nom:"Carlos",dep:"ENG"}',
    ];
    const newSlots: Slot[] = names.map((n, i) => ({
      id: nextId + i,
      content: n,
      sizeBytes: n.length + TUPLE_HDR,
      alive: true,
    }));
    setSlots(prev => [...prev, ...newSlots]);
    setNextId(n => n + names.length);
  }, [nextId]);

  /* ═══════════════════════════════════════════════════════════════════════════
     Page diagram — proportional bars inside a fixed-height container
     ═══════════════════════════════════════════════════════════════════════════ */
  const PAGE_VIZ_H = 520;                // px total height for the page
  const pxPerByte  = PAGE_VIZ_H / PAGE_SIZE;
  const clamp = (bytes: number, min: number) => Math.max(bytes * pxPerByte, min);

  const hdrH      = clamp(PAGE_HDR, 28);
  const itemIdH   = clamp(itemIdBytes, slots.length > 0 ? 22 : 0);
  const deadH     = clamp(deadTupleBytes, deadCount > 0 ? 8 : 0);
  const liveH     = clamp(liveTupleBytes, liveCount > 0 ? 8 : 0);
  const tupleH    = deadH + liveH;
  const freeH     = Math.max(PAGE_VIZ_H - hdrH - itemIdH - tupleH, 0);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "var(--bg-base)", color: "var(--text-primary)",
      fontFamily: "var(--font-ui)", overflow: "auto",
    }}>
      {/* ── Header ── */}
      <div style={{ padding: "24px 32px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          Slotted Page · 8 KB
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.5 }}>
          Estructura interna de una página PostgreSQL. Inserta registros y observa cómo crece el ItemId Array
          desde arriba y las tuplas desde abajo. Elimina registros para crear dead tuples, luego compacta.
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center", padding: "12px 32px",
        background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", flexShrink: 0, flexWrap: "wrap",
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleInsert()}
          placeholder='Contenido del registro (ej: {"id":1,"name":"Ana"})'
          style={{
            flex: 1, minWidth: 200, padding: "7px 12px",
            background: "var(--bg-base)", color: "var(--text-primary)",
            border: "1px solid var(--border)", borderRadius: 6,
            fontFamily: "var(--font-code)", fontSize: 13, outline: "none",
          }}
        />
        <Btn label="INSERT" color="#7c6af7" onClick={handleInsert} disabled={!input.trim() || freeSpace < input.trim().length + TUPLE_HDR + ITEMID_BYTES} />
        <Btn label="SEED 5" color="#3b82f6" onClick={handleSeed} />
        <Btn label="COMPACT" color="#22d3a0" onClick={handleCompact} disabled={deadCount === 0} />
        <Btn label="RESET"   color="#6b7280" onClick={handleReset} disabled={slots.length === 0} />
      </div>

      {/* ── Main area ── */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", flex: 1, minHeight: 0, overflow: "auto" }}>

        {/* ═══ LEFT: Page diagram ═══ */}
        <div style={{
          padding: "24px 24px 24px 32px", display: "flex", flexDirection: "column", alignItems: "center",
          borderRight: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            Página 0 — {PAGE_SIZE.toLocaleString()} bytes
          </div>

          {/* The page rectangle */}
          <div style={{
            width: 260, height: PAGE_VIZ_H, borderRadius: 8,
            border: "2px solid var(--border-bright, rgba(255,255,255,0.13))",
            display: "flex", flexDirection: "column", overflow: "hidden",
            background: "var(--bg-base)",
          }}>
            {/* Page Header */}
            <PageSection
              label={`Page Header  (${PAGE_HDR}B)`}
              height={hdrH}
              bg="#3b82f6"
              textColor="#fff"
            />

            {/* ItemId Array */}
            {slots.length > 0 && (
              <div style={{
                height: itemIdH, background: "#f59e0b18",
                borderBottom: "1px solid rgba(245,158,11,0.3)",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "0 12px", transition: "height 0.3s ease",
              }}>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
                  {slots.map(s => (
                    <div key={s.id} style={{
                      width: 22, height: 18, borderRadius: 3,
                      background: s.alive ? "#f59e0b" : "#f87171",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: "#fff",
                      fontFamily: "var(--font-code)",
                      opacity: s.alive ? 1 : 0.6,
                      transition: "all 0.3s ease",
                    }}>
                      {s.id}
                    </div>
                  ))}
                  <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "var(--font-code)", marginLeft: 4 }}>
                    ItemId ({itemIdBytes}B)
                  </span>
                </div>
              </div>
            )}

            {/* Free Space */}
            <div style={{
              flex: 1, minHeight: freeH,
              borderTop: "1px dashed var(--text-muted)",
              borderBottom: "1px dashed var(--text-muted)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 4,
              transition: "all 0.3s ease",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>
                FREE SPACE
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: freeSpace < 500 ? "#f87171" : "var(--text-muted)", fontFamily: "var(--font-code)", transition: "color 0.3s" }}>
                {freeSpace.toLocaleString()}B
              </span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                {((freeSpace / PAGE_SIZE) * 100).toFixed(1)}% libre
              </span>
            </div>

            {/* Dead Tuples */}
            {deadCount > 0 && (
              <div style={{
                height: deadH, transition: "height 0.3s ease",
                background: "repeating-linear-gradient(45deg, #f8717118, #f8717118 4px, #f8717108 4px, #f8717108 8px)",
                borderTop: "1px solid rgba(248,113,113,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <span style={{ fontSize: 10, color: "#f87171", fontFamily: "var(--font-code)", fontWeight: 600 }}>
                  DEAD ({deadCount}) — {deadTupleBytes}B
                </span>
              </div>
            )}

            {/* Live Tuples */}
            {liveCount > 0 && (
              <div style={{
                height: liveH, transition: "height 0.3s ease",
                display: "flex", flexDirection: "column", overflow: "hidden",
              }}>
                {slots.filter(s => s.alive).reverse().map(s => {
                  const h = Math.max(s.sizeBytes * pxPerByte, 22);
                  return (
                    <div key={s.id} style={{
                      height: h, minHeight: 22,
                      background: flash === s.id ? "#22d3a0" : "#22d3a028",
                      borderTop: "1px solid rgba(34,211,160,0.25)",
                      display: "flex", alignItems: "center", padding: "0 10px", gap: 6,
                      transition: "background 0.3s ease",
                      overflow: "hidden",
                    }}>
                      <span style={{ fontSize: 9, color: "#22d3a0", fontFamily: "var(--font-code)", fontWeight: 700, flexShrink: 0 }}>
                        t{s.id}
                      </span>
                      <span style={{
                        fontSize: 10, color: "var(--text-secondary)", fontFamily: "var(--font-code)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {s.content}
                      </span>
                      <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-code)", marginLeft: "auto", flexShrink: 0 }}>
                        {s.sizeBytes}B
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend below page */}
          <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <Legend color="#3b82f6"  label="Header" />
            <Legend color="#f59e0b"  label="ItemId" />
            <Legend color="var(--text-muted)" label="Free" dashed />
            <Legend color="#f87171"  label="Dead" striped />
            <Legend color="#22d3a0"  label="Tuple" />
          </div>
        </div>

        {/* ═══ RIGHT: Record table + stats ═══ */}
        <div style={{ padding: "24px 32px", overflow: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatBadge label="Slots"  value={slots.length}  color="var(--accent)" />
            <StatBadge label="Live"   value={liveCount}     color="#22d3a0" />
            <StatBadge label="Dead"   value={deadCount}     color="#f87171" />
            <StatBadge label="Free"   value={`${freeSpace.toLocaleString()}B`} color="#f0c060" />
            <StatBadge label="Fill"   value={`${(((PAGE_SIZE - freeSpace) / PAGE_SIZE) * 100).toFixed(1)}%`} color="var(--text-secondary)" />
          </div>

          {/* Byte breakdown bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Distribución de bytes
            </div>
            <div style={{ display: "flex", height: 20, borderRadius: 6, overflow: "hidden", background: "var(--bg-elevated)" }}>
              <BarSegment pct={(PAGE_HDR / PAGE_SIZE) * 100} color="#3b82f6" title={`Header ${PAGE_HDR}B`} />
              <BarSegment pct={(itemIdBytes / PAGE_SIZE) * 100} color="#f59e0b" title={`ItemId ${itemIdBytes}B`} />
              <BarSegment pct={(liveTupleBytes / PAGE_SIZE) * 100} color="#22d3a0" title={`Tuples ${liveTupleBytes}B`} />
              <BarSegment pct={(deadTupleBytes / PAGE_SIZE) * 100} color="#f87171" title={`Dead ${deadTupleBytes}B`} />
            </div>
          </div>

          {/* Records table */}
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>
            Registros ({slots.length})
          </div>

          {slots.length === 0 ? (
            <div style={{
              padding: "32px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13,
              border: "1px dashed var(--border)", borderRadius: 8,
            }}>
              Inserta un registro o usa SEED 5 para comenzar
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "40px 1fr 60px 60px 56px",
                gap: 8, padding: "6px 10px", fontFamily: "var(--font-code)", fontSize: 10,
                color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5,
                borderBottom: "1px solid var(--border)",
              }}>
                <span>Slot</span><span>Contenido</span><span>Bytes</span><span>Estado</span><span></span>
              </div>

              {slots.map(s => (
                <div key={s.id} style={{
                  display: "grid", gridTemplateColumns: "40px 1fr 60px 60px 56px",
                  gap: 8, padding: "8px 10px", alignItems: "center",
                  background: !s.alive ? "rgba(248,113,113,0.06)" : flash === s.id ? "rgba(34,211,160,0.1)" : "transparent",
                  borderRadius: 6, transition: "background 0.3s ease",
                  borderLeft: `3px solid ${s.alive ? "#22d3a0" : "#f87171"}`,
                }}>
                  <span style={{ fontFamily: "var(--font-code)", fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                    {s.id}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-code)", fontSize: 12, color: s.alive ? "var(--text-primary)" : "var(--text-muted)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    textDecoration: s.alive ? "none" : "line-through",
                  }}>
                    {s.content}
                  </span>
                  <span style={{ fontFamily: "var(--font-code)", fontSize: 11, color: "var(--text-muted)" }}>
                    {s.sizeBytes}B
                  </span>
                  <span style={{
                    fontFamily: "var(--font-code)", fontSize: 10, fontWeight: 600,
                    color: s.alive ? "#22d3a0" : "#f87171",
                  }}>
                    {s.alive ? "LIVE" : "DEAD"}
                  </span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={!s.alive}
                    style={{
                      padding: "3px 8px", border: "none", borderRadius: 4,
                      fontSize: 10, fontWeight: 700, fontFamily: "var(--font-code)",
                      background: s.alive ? "#f8717120" : "transparent",
                      color: s.alive ? "#f87171" : "var(--text-muted)",
                      cursor: s.alive ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => s.alive && (e.currentTarget.style.background = "#f8717140")}
                    onMouseLeave={e => s.alive && (e.currentTarget.style.background = "#f8717120")}
                  >
                    DEL
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Educational note */}
          <div style={{
            marginTop: "auto", padding: "12px 14px",
            background: "rgba(124,106,247,0.08)", border: "1px solid rgba(124,106,247,0.2)",
            borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.65,
          }}>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>Nota:</span>{" "}
            En PostgreSQL, DELETE no libera espacio inmediatamente — la tupla se marca como dead.
            El espacio se recupera con <code style={{ fontFamily: "var(--font-code)", color: "#a5d6ff" }}>VACUUM</code> (equivalente a COMPACT).
            Mientras tanto, los dead tuples ocupan espacio pero el ItemId slot se mantiene
            para no invalidar índices que referencian ese <code style={{ fontFamily: "var(--font-code)", color: "#a5d6ff" }}>ctid</code>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────────────────── */
function PageSection({ label, height, bg, textColor }: { label: string; height: number; bg: string; textColor: string }) {
  return (
    <div style={{
      height, background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 600, color: textColor, fontFamily: "var(--font-code)",
      letterSpacing: 0.3, flexShrink: 0, transition: "height 0.3s ease",
    }}>
      {label}
    </div>
  );
}

function Legend({ color, label, dashed, striped }: { color: string; label: string; dashed?: boolean; striped?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{
        width: 12, height: 12, borderRadius: 3,
        background: striped
          ? `repeating-linear-gradient(45deg, ${color}40, ${color}40 2px, transparent 2px, transparent 4px)`
          : dashed ? "transparent" : color + "60",
        border: dashed ? `1.5px dashed ${color}` : `1px solid ${color}`,
      }} />
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>{label}</span>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      padding: "6px 12px", background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-code)", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "var(--font-code)" }}>{value}</span>
    </div>
  );
}

function BarSegment({ pct, color, title }: { pct: number; color: string; title: string }) {
  if (pct < 0.2) return null;
  return (
    <div
      title={title}
      style={{
        width: `${pct}%`, height: "100%", background: color,
        transition: "width 0.4s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, color: "#fff", fontFamily: "var(--font-code)", fontWeight: 600,
        overflow: "hidden", whiteSpace: "nowrap",
      }}
    >
      {pct > 5 ? title : ""}
    </div>
  );
}

function Btn({ label, color, onClick, disabled }: { label: string; color: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 14px", border: "none", borderRadius: 6,
        background: disabled ? "var(--bg-elevated)" : color,
        color: disabled ? "var(--text-muted)" : "#fff",
        fontSize: 12, fontWeight: 700, fontFamily: "var(--font-code)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s, background 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = "1")}
    >
      {label}
    </button>
  );
}
