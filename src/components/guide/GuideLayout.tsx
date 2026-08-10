"use client";

import { useEffect, useRef, useState } from "react";

export interface GuideSection {
  id: string;
  label: string;
}

interface GuideLayoutProps {
  sections?: readonly GuideSection[];
  children: React.ReactNode;
  maxWidth?: number;
}

const EMPTY_SECTIONS: readonly GuideSection[] = [];

export default function GuideLayout({
  sections = EMPTY_SECTIONS,
  children,
  maxWidth = 820,
}: GuideLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const topmost = visible.reduce((first, current) =>
          first.boundingClientRect.top < current.boundingClientRect.top ? first : current
        );
        setActiveSection(topmost.target.id);
      },
      { root, threshold: 0, rootMargin: "-8% 0px -78% 0px" }
    );

    for (const { id } of sections) {
      const element = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sections]);

  function scrollToSection(id: string) {
    const root = scrollRef.current;
    root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="guide-layout">
      <div ref={scrollRef} className="guide-scroll-region">
        <article className="guide-content" style={{ maxWidth }}>
          {children}
        </article>
      </div>
      {sections.length > 0 ? (
        <GuideToc
          sections={sections}
          activeSection={activeSection}
          onSelect={scrollToSection}
        />
      ) : null}
    </div>
  );
}

function GuideToc({
  sections,
  activeSection,
  onSelect,
}: {
  sections: readonly GuideSection[];
  activeSection: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <aside className="guide-toc guide-toc--collapsed">
        <button
          className="guide-toc-toggle"
          onClick={() => setOpen(true)}
          title="Mostrar índice"
          aria-label="Mostrar índice"
          aria-expanded={false}
        >
          ☰
        </button>
      </aside>
    );
  }

  return (
    <aside className="guide-toc">
      <div className="guide-toc-header">
        <span>En esta página</span>
        <button
          className="guide-toc-toggle"
          onClick={() => setOpen(false)}
          title="Ocultar índice"
          aria-label="Ocultar índice"
          aria-expanded
        >
          ☰
        </button>
      </div>
      <nav aria-label="Secciones de esta página" className="guide-toc-links">
        {sections.map((section) => {
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              className="guide-toc-link"
              data-active={active || undefined}
              aria-current={active ? "location" : undefined}
              onClick={() => onSelect(section.id)}
            >
              {section.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function GuideHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="guide-header">
      <div className="guide-eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {children}
    </header>
  );
}
