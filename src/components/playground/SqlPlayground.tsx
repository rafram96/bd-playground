"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ResultTable from "./ResultTable";
import ExplainTree from "./ExplainTree";
import SnippetPanel from "./SnippetPanel";
import { runQuery, runExplain, getDB } from "@/lib/pglite";
import type { ExplainNode } from "@/lib/pglite";
import { Play, Zap } from "lucide-react";

const SqlEditor = dynamic(() => import("./SqlEditor"), { ssr: false });

const DEFAULT_SQL = `-- ¡Bienvenido a DB Visualizer!
-- Ctrl+Enter → Ejecutar   |   Ctrl+Shift+Enter → EXPLAIN ANALYZE visual

SELECT
  e.first_name || ' ' || e.last_name AS employee,
  d.dept_name,
  e.salary,
  e.hire_date
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY e.salary DESC
LIMIT 20;`;

type ResultMode = "table" | "explain";

interface QueryResult {
    rows: Record<string, unknown>[];
    fields: { name: string; dataTypeID: number }[];
    time: number;
}

interface ExplainResult {
    plan: ExplainNode;
    time: number;
}

function StatusBadge({ status }: { status: "idle" | "running" | "ready" | "error" }) {
    const colors = {
        idle: "var(--text-muted)",
        running: "var(--warning)",
        ready: "var(--success)",
        error: "var(--error)",
    };
    const labels = { idle: "idle", running: "running...", ready: "ready", error: "error" };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
                style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: colors[status],
                    boxShadow: status === "running" ? `0 0 8px ${colors[status]}` : "none",
                    animation: status === "running" ? "pulse 1s infinite" : "none",
                }}
            />
            <span
                style={{
                    fontSize: 11,
                    fontFamily: "var(--font-code)",
                    color: colors[status],
                }}
            >
                PGlite {labels[status]}
            </span>
        </div>
    );
}

export default function SqlPlayground() {
    const [sql, setSql] = useState(DEFAULT_SQL);
    const [dbStatus, setDbStatus] = useState<"idle" | "running" | "ready" | "error">("idle");
    const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
    const [explainResult, setExplainResult] = useState<ExplainResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [resultMode, setResultMode] = useState<ResultMode>("table");
    const [isRunning, setIsRunning] = useState(false);
    const [tableNames] = useState([
        "employees", "departments", "products", "orders", "order_items",
    ]);

    // Init PGlite on mount
    useEffect(() => {
        setDbStatus("running");
        getDB()
            .then(() => setDbStatus("ready"))
            .catch(() => setDbStatus("error"));
    }, []);

    const handleRun = useCallback(async () => {
        if (isRunning || !sql.trim()) return;
        setIsRunning(true);
        setError(null);
        try {
            const result = await runQuery(sql);
            setQueryResult(result);
            setResultMode("table");
        } catch (e: unknown) {
            setError((e as Error).message ?? String(e));
            setResultMode("table");
        } finally {
            setIsRunning(false);
        }
    }, [sql, isRunning]);

    const handleExplain = useCallback(async () => {
        if (isRunning || !sql.trim()) return;
        setIsRunning(true);
        setError(null);
        try {
            const result = await runExplain(sql);
            setExplainResult(result);
            setResultMode("explain");
        } catch (e: unknown) {
            setError((e as Error).message ?? String(e));
            setResultMode("table");
        } finally {
            setIsRunning(false);
        }
    }, [sql, isRunning]);

    const handleSnippetSelect = useCallback((snippetSql: string) => {
        setSql(snippetSql);
    }, []);

    const hasResult = queryResult || explainResult || error;

    return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 220px",
                    gridTemplateRows: "1fr",
                    height: "100%",
                    overflow: "hidden",
                    gap: 0,
                }}
            >
                {/* LEFT — Editor + Results */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateRows: "auto 2fr auto 1fr",
                        overflow: "hidden",
                    }}
                >
                    {/* Toolbar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px",
                            borderBottom: "1px solid var(--border)",
                            background: "var(--bg-surface)",
                            flexShrink: 0,
                        }}
                    >
                        <StatusBadge status={dbStatus} />
                        <div style={{ flex: 1 }} />
                        <KeyboardHint keys={["Ctrl", "Enter"]} label="Ejecutar" />
                        <KeyboardHint keys={["Ctrl", "⇧", "Enter"]} label="EXPLAIN" />
                        <div
                            style={{
                                width: 1,
                                height: 18,
                                background: "var(--border)",
                                margin: "0 4px",
                            }}
                        />
                        <Btn
                            id="btn-run"
                            icon={<Play size={13} />}
                            label={isRunning ? "Ejecutando..." : "Ejecutar"}
                            primary
                            disabled={isRunning || dbStatus !== "ready"}
                            onClick={handleRun}
                        />
                        <Btn
                            id="btn-explain"
                            icon={<Zap size={13} />}
                            label="EXPLAIN"
                            disabled={isRunning || dbStatus !== "ready"}
                            onClick={handleExplain}
                        />
                    </div>

                    {/* Editor */}
                    <div
                        style={{
                            overflow: "hidden",
                            background: "var(--bg-surface)",
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <SqlEditor
                            value={sql}
                            onChange={setSql}
                            onRun={handleRun}
                            onExplain={handleExplain}
                            tableNames={tableNames}
                        />
                    </div>

                    {/* Result tabs */}
                    {hasResult && (
                        <div
                            style={{
                                display: "flex",
                                gap: 0,
                                borderBottom: "1px solid var(--border)",
                                background: "var(--bg-surface)",
                                flexShrink: 0,
                            }}
                        >
                            <TabBtn
                                label="Resultados"
                                active={resultMode === "table"}
                                onClick={() => setResultMode("table")}
                            />
                            {explainResult && (
                                <TabBtn
                                    label="EXPLAIN"
                                    icon={<Zap size={12} />}
                                    active={resultMode === "explain"}
                                    onClick={() => setResultMode("explain")}
                                />
                            )}
                        </div>
                    )}

                    {/* Results area */}
                    <div
                        style={{
                            overflow: "hidden",
                            background: "var(--bg-surface)",
                            display: hasResult ? "block" : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {!hasResult && (
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: 13,
                                    fontFamily: "var(--font-code)",
                                }}
                            >
                                Ejecuta una query para ver los resultados
                            </p>
                        )}

                        {hasResult && resultMode === "table" && (
                            <ResultTable
                                rows={queryResult?.rows ?? []}
                                fields={queryResult?.fields ?? []}
                                time={queryResult?.time ?? 0}
                                error={error ?? undefined}
                            />
                        )}

                        {hasResult && resultMode === "explain" && explainResult && (
                            <ExplainTree
                                plan={explainResult.plan}
                                totalTime={explainResult.time}
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT — Snippet panel */}
                <div
                    style={{
                        borderLeft: "1px solid var(--border)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <SnippetPanel onSelect={handleSnippetSelect} />
                </div>
            </div>
    );
}

function Btn({
    label,
    onClick,
    primary,
    disabled,
    id,
    icon,
}: {
    label: string;
    onClick: () => void;
    primary?: boolean;
    disabled?: boolean;
    id?: string;
    icon?: React.ReactNode;
}) {
    return (
        <button
            id={id}
            onClick={onClick}
            disabled={disabled}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 16px",
                borderRadius: 6,
                border: primary ? "none" : "1px solid var(--border-bright)",
                background: primary ? "var(--accent)" : "transparent",
                color: disabled ? "var(--text-muted)" : "var(--text-primary)",
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                fontWeight: 500,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
                }
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = disabled ? "0.5" : "1";
            }}
        >
            {icon}{label}
        </button>
    );
}

function KeyboardHint({ keys, label }: { keys: string[]; label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {keys.map((k, i) => (
                <span
                    key={i}
                    style={{
                        fontSize: 10,
                        fontFamily: "var(--font-code)",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-bright)",
                        padding: "1px 5px",
                        borderRadius: 3,
                        color: "var(--text-secondary)",
                    }}
                >
                    {k}
                </span>
            ))}
            <span
                style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginLeft: 2,
                }}
            >
                {label}
            </span>
        </div>
    );
}

function TabBtn({
    label,
    active,
    onClick,
    icon,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 18px",
                border: "none",
                borderBottom: active
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                background: "transparent",
                color: active ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
            }}
        >
            {icon}{label}
        </button>
    );
}
