"use client";

import { useState } from "react";
import { SNIPPET_GROUPS, type SnippetGroup } from "@/lib/snippets";

interface SnippetPanelProps {
    onSelect: (sql: string) => void;
}

export default function SnippetPanel({ onSelect }: SnippetPanelProps) {
    const [openGroup, setOpenGroup] = useState<string>("basic");

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}
                >
                    Snippets
                </span>
            </div>

            {/* Groups */}
            <div style={{ flex: 1, overflow: "auto" }}>
                {SNIPPET_GROUPS.map((group) => (
                    <div key={group.id}>
                        {/* Group header */}
                        <button
                            onClick={() =>
                                setOpenGroup((g) => (g === group.id ? "" : group.id))
                            }
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 16px",
                                background:
                                    openGroup === group.id
                                        ? "var(--bg-elevated)"
                                        : "transparent",
                                border: "none",
                                borderBottom: "1px solid var(--border)",
                                cursor: "pointer",
                                textAlign: "left",
                                color: "var(--text-primary)",
                                fontSize: 13,
                                fontFamily: "var(--font-ui)",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                if (openGroup !== group.id) {
                                    (e.currentTarget as HTMLButtonElement).style.background =
                                        "var(--bg-hover)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (openGroup !== group.id) {
                                    (e.currentTarget as HTMLButtonElement).style.background =
                                        "transparent";
                                }
                            }}
                        >
                            <span>{group.icon}</span>
                            <span style={{ flex: 1, fontWeight: 500 }}>{group.label}</span>
                            <span
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: 11,
                                    transform:
                                        openGroup === group.id ? "rotate(90deg)" : "none",
                                    transition: "transform 0.2s",
                                    display: "inline-block",
                                }}
                            >
                                ▶
                            </span>
                        </button>

                        {/* Snippets list */}
                        {openGroup === group.id && (
                            <div>
                                {group.snippets.map((snippet) => (
                                    <button
                                        key={snippet.id}
                                        onClick={() => onSelect(snippet.sql)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            gap: 2,
                                            padding: "10px 20px",
                                            background: "transparent",
                                            border: "none",
                                            borderBottom: "1px solid var(--border)",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "background 0.12s",
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background =
                                                "var(--accent-glow)";
                                            (e.currentTarget as HTMLButtonElement).style.borderLeft =
                                                "2px solid var(--accent)";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background =
                                                "transparent";
                                            (e.currentTarget as HTMLButtonElement).style.borderLeft =
                                                "none";
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: "var(--text-primary)",
                                                fontFamily: "var(--font-ui)",
                                            }}
                                        >
                                            {snippet.label}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: "var(--text-muted)",
                                                fontFamily: "var(--font-ui)",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {snippet.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer hint */}
            <div
                style={{
                    padding: "10px 16px",
                    borderTop: "1px solid var(--border)",
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-code)",
                    }}
                >
                    Click para cargar en el editor
                </span>
            </div>
        </div>
    );
}
