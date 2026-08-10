"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type LearningMode = "guided" | "free";

interface VisualizerLayoutProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  mode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
  children: ReactNode;
  className?: string;
}

export function VisualizerLayout({
  eyebrow,
  title,
  description,
  mode,
  onModeChange,
  children,
  className = "",
}: VisualizerLayoutProps) {
  return (
    <div className={`viz-shell ${className}`.trim()}>
      <header className="viz-header">
        <div className="viz-heading">
          <div className="viz-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <ModeSwitch value={mode} onChange={onModeChange} />
      </header>
      <main className="viz-main">{children}</main>
    </div>
  );
}

export function ModeSwitch({ value, onChange }: { value: LearningMode; onChange: (mode: LearningMode) => void }) {
  return (
    <div className="viz-mode" role="group" aria-label="Modo de aprendizaje">
      <div className="viz-mode-label">Modo de aprendizaje</div>
      <div className="viz-mode-options">
        <button type="button" data-active={value === "guided" || undefined} onClick={() => onChange("guided")}>
          <span aria-hidden="true">◎</span> Guiado
        </button>
        <button type="button" data-active={value === "free" || undefined} onClick={() => onChange("free")}>
          <span aria-hidden="true">↗</span> Libre
        </button>
      </div>
      <small>{value === "guided" ? "Avanza por cada etapa y entiende el porqué." : "Experimenta y observa el resultado al instante."}</small>
    </div>
  );
}

export function VisualizerPanel({ title, meta, children, className = "" }: { title?: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`viz-panel ${className}`.trim()}>
      {title || meta ? (
        <div className="viz-panel-heading">
          {title ? <h2>{title}</h2> : <span />}
          {meta ? <div className="viz-panel-meta">{meta}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function SegmentedControl<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="viz-field">
      <span className="viz-label">{label}</span>
      <div className="viz-segmented" role="group" aria-label={label}>
        {options.map((option) => (
          <button key={option.value} type="button" data-active={value === option.value || undefined} onClick={() => onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActionButton({ variant = "default", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "success" | "danger" }) {
  return <button type="button" className="viz-action" data-variant={variant} {...props} />;
}

export function MetricCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="viz-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function StepNavigator({ current, total, title, description, onPrevious, onNext, onStart, onEnd }: {
  current: number;
  total: number;
  title: string;
  description: string;
  onPrevious: () => void;
  onNext: () => void;
  onStart?: () => void;
  onEnd?: () => void;
}) {
  const progress = total <= 1 ? 100 : (current / (total - 1)) * 100;
  return (
    <div className="viz-stepper" aria-live="polite">
      <div className="viz-stepper-top">
        <span>Paso {Math.min(current + 1, total)} de {total}</span>
        <strong>{title}</strong>
      </div>
      <div className="viz-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <p>{description}</p>
      <div className="viz-stepper-actions">
        {onStart ? <ActionButton onClick={onStart} disabled={current === 0} aria-label="Ir al primer paso">«</ActionButton> : null}
        <ActionButton onClick={onPrevious} disabled={current === 0}>← Anterior</ActionButton>
        <ActionButton variant="primary" onClick={onNext} disabled={current >= total - 1}>Siguiente →</ActionButton>
        {onEnd ? <ActionButton onClick={onEnd} disabled={current >= total - 1} aria-label="Ir al último paso">»</ActionButton> : null}
      </div>
    </div>
  );
}

