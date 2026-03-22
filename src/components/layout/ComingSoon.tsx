"use client";

export interface PlannedItem {
  label: string;
  type?: "teoria" | "lab" | "viz";
}

interface ComingSoonProps {
  title: string;
  emoji: string;
  semana?: string;
  goal?: string;
  teoria?: PlannedItem[];
  lab?: PlannedItem[];
  viz?: string[];        // visualizadores planeados (Excalidraw / interactivos)
  refs?: string[];
}

export default function ComingSoon({
  title,
  emoji,
  semana,
  goal,
  teoria = [],
  lab = [],
  viz = [],
  refs = [],
}: ComingSoonProps) {
  const hasContent = teoria.length > 0 || lab.length > 0 || viz.length > 0;

  if (!hasContent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, color: "var(--text-muted)" }}>
        <span style={{ fontSize: 64 }}>{emoji}</span>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-ui)", margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 14, fontFamily: "var(--font-ui)" }}>Próximamente</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "16px 20px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <span style={{ fontSize: 40 }}>{emoji}</span>
          <div>
            {semana && <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-code)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{semana}</div>}
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", fontFamily: "var(--font-ui)" }}>{title}</h2>
            {goal && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{goal}</p>}
          </div>
          <div style={{ marginLeft: "auto", padding: "6px 14px", background: "#1c1207", border: "1px solid #92400e", borderRadius: 8, fontSize: 12, color: "#fbbf24", fontFamily: "var(--font-code)", whiteSpace: "nowrap" }}>
            🚧 En construcción
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Teoría */}
          {teoria.length > 0 && (
            <ContentCard title="Teoría" color="#38bdf8" icon="📖">
              {teoria.map((t, i) => (
                <ItemRow key={i} label={t.label} done={false} />
              ))}
            </ContentCard>
          )}

          {/* Laboratorio */}
          {lab.length > 0 && (
            <ContentCard title="Laboratorio" color="#4ade80" icon="🔬">
              {lab.map((t, i) => (
                <ItemRow key={i} label={t.label} done={false} />
              ))}
            </ContentCard>
          )}
        </div>

        {/* Visualizadores planeados */}
        {viz.length > 0 && (
          <div style={{ marginTop: 16, background: "var(--bg-surface)", border: "1px dashed #7c3aed", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🎨</span> Visualizadores Interactivos / Excalidraw — Planeados
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {viz.map((v, i) => (
                <div key={i} style={{ padding: "6px 12px", background: "#1e1b4b", border: "1px dashed #7c3aed", borderRadius: 8, fontSize: 12, color: "#a78bfa" }}>
                  {v}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referencias */}
        {refs.length > 0 && (
          <div style={{ marginTop: 16, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10 }}>📚 Referencias</div>
            {refs.map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid var(--border)" }}>
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentCard({ title, color, icon, children }: { title: string; color: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color, display: "flex", gap: 6, alignItems: "center" }}>
        <span>{icon}</span> {title}
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function ItemRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ color: done ? "#4ade80" : "#374151", fontSize: 14, marginTop: 1, flexShrink: 0 }}>{done ? "✓" : "○"}</span>
      <span style={{ fontSize: 12, color: done ? "var(--text-secondary)" : "var(--text-muted)", lineHeight: 1.5 }}>{label}</span>
    </div>
  );
}
