"use client";

import { useState } from "react";
import type { ExplainNode } from "@/lib/pglite";

interface ExplainTreeProps {
    plan: ExplainNode;
    totalTime: number;
}

// Node type icons
const NODE_ICONS: Record<string, string> = {
    "Seq Scan": "⬛",
    "Index Scan": "🔍",
    "Index Only Scan": "⚡",
    "Bitmap Heap Scan": "🗺️",
    "Bitmap Index Scan": "📍",
    "Hash Join": "🔗",
    "Merge Join": "🔀",
    "Nested Loop": "🔄",
    Sort: "↕️",
    "Hash": "＃",
    Aggregate: "∑",
    "Group": "▣",
    Limit: "✂️",
    Result: "✓",
    Append: "➕",
    "Subquery Scan": "📦",
    "CTE Scan": "📋",
    "Unique": "◈",
    "WindowAgg": "🪟",
    "Gather": "⚙️",
    "Gather Merge": "⚙️",
};

function getNodeColor(
    node: ExplainNode,
    maxCost: number
): { bg: string; border: string; label: string } {
    const cost = node["Total Cost"];
    const ratio = maxCost > 0 ? cost / maxCost : 0;

    if (ratio > 0.7) {
        return {
            bg: "rgba(248,113,113,0.12)",
            border: "rgba(248,113,113,0.45)",
            label: "var(--error)",
        };
    }
    if (ratio > 0.35) {
        return {
            bg: "rgba(240,192,96,0.1)",
            border: "rgba(240,192,96,0.4)",
            label: "var(--warning)",
        };
    }
    return {
        bg: "rgba(34,211,160,0.08)",
        border: "rgba(34,211,160,0.35)",
        label: "var(--success)",
    };
}

function collectMaxCost(node: ExplainNode): number {
    let max = node["Total Cost"];
    if (node["Plans"]) {
        for (const child of node["Plans"]) {
            max = Math.max(max, collectMaxCost(child));
        }
    }
    return max;
}

interface NodeCardProps {
    node: ExplainNode;
    maxCost: number;
    depth: number;
}

function NodeCard({ node, maxCost, depth }: NodeCardProps) {
    const [collapsed, setCollapsed] = useState(false);
    const color = getNodeColor(node, maxCost);
    const hasChildren = node["Plans"] && node["Plans"].length > 0;
    const icon = NODE_ICONS[node["Node Type"]] ?? "◆";

    const actualTime = node["Actual Total Time"];
    const estimatedTime = node["Startup Cost"];
    const estimation_error =
        actualTime !== undefined && node["Plan Rows"] !== undefined
            ? Math.abs(
                (node["Actual Rows"] ?? 0) - node["Plan Rows"]
            ) / Math.max(node["Plan Rows"], 1)
            : null;

    return (
        <div
            style={{
                marginLeft: depth > 0 ? 24 : 0,
                position: "relative",
            }}
        >
            {/* Vertical connector line */}
            {depth > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: -16,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: "var(--border-bright)",
                    }}
                />
            )}

            {/* Node card */}
            <div
                style={{
                    background: color.bg,
                    border: `1px solid ${color.border}`,
                    borderRadius: 8,
                    marginBottom: 8,
                    overflow: "hidden",
                    transition: "opacity 0.2s",
                }}
            >
                {/* Card header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        cursor: hasChildren ? "pointer" : "default",
                    }}
                    onClick={() => hasChildren && setCollapsed((c) => !c)}
                >
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "var(--font-code)",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    color: color.label,
                                }}
                            >
                                {node["Node Type"]}
                            </span>
                            {node["Relation Name"] && (
                                <span
                                    style={{
                                        fontFamily: "var(--font-code)",
                                        fontSize: 12,
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    on {node["Relation Name"]}
                                    {node["Alias"] &&
                                        node["Alias"] !== node["Relation Name"] &&
                                        ` (${node["Alias"]})`}
                                </span>
                            )}
                            {node["Index Name"] && (
                                <span
                                    style={{
                                        fontFamily: "var(--font-code)",
                                        fontSize: 11,
                                        color: "var(--accent)",
                                        background: "var(--accent-glow)",
                                        padding: "1px 6px",
                                        borderRadius: 4,
                                    }}
                                >
                                    idx: {node["Index Name"]}
                                </span>
                            )}
                        </div>
                        {/* Metrics row */}
                        <div
                            style={{
                                display: "flex",
                                gap: 16,
                                marginTop: 4,
                                flexWrap: "wrap",
                            }}
                        >
                            <MetricBadge
                                label="cost"
                                value={`${node["Startup Cost"].toFixed(2)}..${node["Total Cost"].toFixed(2)}`}
                                color="var(--text-secondary)"
                            />
                            {actualTime !== undefined && (
                                <MetricBadge
                                    label="actual"
                                    value={`${node["Actual Total Time"]!.toFixed(2)} ms`}
                                    color="var(--text-secondary)"
                                />
                            )}
                            <MetricBadge
                                label="rows est."
                                value={String(node["Plan Rows"])}
                                color="var(--text-secondary)"
                            />
                            {node["Actual Rows"] !== undefined && (
                                <MetricBadge
                                    label="rows actual"
                                    value={String(node["Actual Rows"])}
                                    color={
                                        estimation_error !== null && estimation_error > 2
                                            ? "var(--warning)"
                                            : "var(--text-secondary)"
                                    }
                                />
                            )}
                            {estimation_error !== null && estimation_error > 2 && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontFamily: "var(--font-code)",
                                        color: "var(--warning)",
                                        background: "rgba(240,192,96,0.1)",
                                        padding: "1px 6px",
                                        borderRadius: 4,
                                        border: "1px solid rgba(240,192,96,0.3)",
                                    }}
                                >
                                    ⚠ est. error ×{estimation_error.toFixed(1)}
                                </span>
                            )}
                        </div>
                        {/* Conditions */}
                        {(node["Filter"] ||
                            node["Index Cond"] ||
                            node["Hash Cond"]) && (
                                <div
                                    style={{
                                        marginTop: 6,
                                        fontFamily: "var(--font-code)",
                                        fontSize: 11,
                                        color: "var(--text-muted)",
                                        background: "rgba(0,0,0,0.2)",
                                        padding: "3px 8px",
                                        borderRadius: 4,
                                        display: "inline-block",
                                    }}
                                >
                                    {node["Filter"] && `filter: ${node["Filter"]}`}
                                    {node["Index Cond"] && `idx cond: ${node["Index Cond"]}`}
                                    {node["Hash Cond"] && `hash cond: ${node["Hash Cond"]}`}
                                </div>
                            )}
                    </div>

                    {/* Collapse toggle */}
                    {hasChildren && (
                        <span
                            style={{
                                color: "var(--text-muted)",
                                fontSize: 11,
                                transform: collapsed ? "rotate(-90deg)" : "none",
                                transition: "transform 0.2s",
                                display: "inline-block",
                                userSelect: "none",
                            }}
                        >
                            ▼
                        </span>
                    )}
                </div>
            </div>

            {/* Children */}
            {!collapsed && hasChildren && (
                <div style={{ paddingLeft: 0 }}>
                    {node["Plans"]!.map((child, i) => (
                        <NodeCard key={i} node={child} maxCost={maxCost} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

function MetricBadge({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color: string;
}) {
    return (
        <span
            style={{
                display: "flex",
                gap: 4,
                fontFamily: "var(--font-code)",
                fontSize: 11,
            }}
        >
            <span style={{ color: "var(--text-muted)" }}>{label}:</span>
            <span style={{ color }}>{value}</span>
        </span>
    );
}

export default function ExplainTree({ plan, totalTime }: ExplainTreeProps) {
    const maxCost = collectMaxCost(plan);

    const totalCost = plan["Total Cost"];
    const execTime = plan["Actual Total Time"];
    const planTime = plan["Planning Time"];

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >
            {/* Summary bar */}
            <div
                style={{
                    display: "flex",
                    gap: 24,
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg-elevated)",
                    flexShrink: 0,
                    flexWrap: "wrap",
                    alignItems: "center",
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
                    EXPLAIN ANALYZE
                </span>
                <SummaryItem label="Total cost" value={totalCost.toFixed(2)} />
                {execTime !== undefined && (
                    <SummaryItem
                        label="Execution"
                        value={`${execTime.toFixed(2)} ms`}
                        color="var(--success)"
                    />
                )}
                {planTime !== undefined && (
                    <SummaryItem label="Planning" value={`${planTime.toFixed(2)} ms`} />
                )}
                <SummaryItem label="Query time" value={`${totalTime.toFixed(1)} ms`} />
                <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
                    <LegendItem color="rgba(34,211,160,0.6)" label="Low cost" />
                    <LegendItem color="rgba(240,192,96,0.6)" label="Medium" />
                    <LegendItem color="rgba(248,113,113,0.6)" label="High cost" />
                </div>
            </div>

            {/* Tree */}
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                <NodeCard node={plan} maxCost={maxCost} depth={0} />
            </div>
        </div>
    );
}

function SummaryItem({
    label,
    value,
    color = "var(--text-primary)",
}: {
    label: string;
    value: string;
    color?: string;
}) {
    return (
        <div
            style={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
            <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
            </span>
            <span style={{ fontSize: 13, fontFamily: "var(--font-code)", color }}>
                {value}
            </span>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
                style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: color,
                }}
            />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
        </div>
    );
}
