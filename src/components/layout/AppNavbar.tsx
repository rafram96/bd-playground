"use client";

import { Database } from "lucide-react";

export interface TabDef {
    id: string;
    label: string;
    icon: string;
    /** Si tiene grupo, muestra el badge VIZ */
    group: string | null;
}

interface AppNavbarProps {
    tabs: TabDef[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export default function AppNavbar({
    tabs,
    activeTab,
    onTabChange,
}: AppNavbarProps) {
    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                height: 48,
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-surface)",
                flexShrink: 0,
                padding: "0 16px",
                gap: 0,
            }}
        >
            {/* ── Logo ── */}
            <NavLogo />

            {/* ── Tabs ── */}
            <nav
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                    flex: 1,
                }}
            >
                {tabs.map((tab) => (
                    <NavTab
                        key={tab.id}
                        tab={tab}
                        active={activeTab === tab.id}
                        onClick={() => onTabChange(tab.id)}
                    />
                ))}
            </nav>

            {/* ── Right badge ── */}
            <PGliteBadge />
        </header>
    );
}

/* ────────────────────────────────────────────── */
/*  Sub-components                                */
/* ────────────────────────────────────────────── */

function NavLogo() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingRight: 20,
                borderRight: "1px solid var(--border)",
                marginRight: 16,
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                }}
            >
                <Database size={14} color="#fff" />
            </div>
            <div>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-ui)",
                        lineHeight: 1,
                    }}
                >
                    DB Visualizer
                </div>
                <div
                    style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-code)",
                        lineHeight: 1,
                        marginTop: 2,
                    }}
                >
                    CS2042 · UTEC
                </div>
            </div>
        </div>
    );
}

function NavTab({
    tab,
    active,
    onClick,
}: {
    tab: TabDef;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            id={`tab-${tab.id}`}
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: "100%",
                padding: "0 14px",
                border: "none",
                borderBottom: active
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                background: "transparent",
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "color 0.15s, border-color 0.15s",
                whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
                if (!active)
                    (e.currentTarget as HTMLButtonElement).style.color =
                        "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
                if (!active)
                    (e.currentTarget as HTMLButtonElement).style.color =
                        "var(--text-muted)";
            }}
        >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.group && (
                <span
                    style={{
                        fontSize: 9,
                        fontFamily: "var(--font-code)",
                        color: "var(--text-muted)",
                        background: "var(--bg-elevated)",
                        padding: "1px 4px",
                        borderRadius: 3,
                        marginLeft: 2,
                    }}
                >
                    VIZ
                </span>
            )}
        </button>
    );
}

function PGliteBadge() {
    return (
        <div
            style={{
                marginLeft: "auto",
                background: "var(--accent-glow)",
                border: "1px solid rgba(124,106,247,0.3)",
                borderRadius: 6,
                padding: "3px 10px",
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    fontFamily: "var(--font-code)",
                    color: "var(--accent)",
                }}
            >
                PGlite WASM
            </span>
        </div>
    );
}
