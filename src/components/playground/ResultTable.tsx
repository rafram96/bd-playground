"use client";

import { useMemo, useState } from "react";
import { XCircle, CheckCircle2 } from "lucide-react";

interface ResultTableProps {
    rows: Record<string, unknown>[];
    fields: { name: string; dataTypeID: number }[];
    time: number;
    error?: string;
}

const PAGE_SIZE = 50;

// PG OIDs — https://www.postgresql.org/docs/current/catalog-pg-type.html
function getTypeColor(dataTypeID: number): string {
    // int2, int4, int8, float4, float8, numeric, oid, serial
    if ([21, 23, 20, 700, 701, 1700, 26, 16, 2278].includes(dataTypeID))
        return "#60a5fa"; // blue for numbers/bool
    // date, timestamp, timestamptz, time
    if ([1082, 1114, 1184, 1083].includes(dataTypeID)) return "#f0c060"; // yellow for dates
    // bool
    if (dataTypeID === 16) return "#22d3a0";
    return "var(--text-primary)"; // default
}

function formatCell(value: unknown, dataTypeID: number): string {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function getCellStyle(value: unknown, dataTypeID: number): React.CSSProperties {
    if (value === null || value === undefined) {
        return { color: "var(--text-muted)", fontStyle: "italic" };
    }
    if (typeof value === "boolean") {
        return { color: value ? "var(--success)" : "var(--error)" };
    }
    // Numbers
    if (
        typeof value === "number" ||
        [21, 23, 20, 700, 701, 1700].includes(dataTypeID)
    ) {
        return { color: "#60a5fa" };
    }
    return {};
}

export default function ResultTable({
    rows,
    fields,
    time,
    error,
}: ResultTableProps) {
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(rows.length / PAGE_SIZE);
    const pageRows = useMemo(
        () => rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
        [rows, page]
    );

    if (error) {
        return (
            <div
                style={{
                    padding: "20px 24px",
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    borderRadius: 8,
                    margin: 16,
                }}
            >
                <div
                    style={{
                        color: "var(--error)",
                        fontFamily: "var(--font-code)",
                        fontSize: 13,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <XCircle size={14} /> Error
                    </span>
                    {error}
                </div>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div
                style={{
                    padding: "32px 24px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 14,
                }}
            >
                No rows returned.
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >
            {/* Status bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "8px 16px",
                    borderBottom: "1px solid var(--border)",
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        fontSize: 12,
                        color: "var(--success)",
                        fontFamily: "var(--font-code)",
                    }}
                >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12} /> {rows.length} row{rows.length !== 1 ? "s" : ""}</span>
                </span>
                <span
                    style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-code)",
                    }}
                >
                    {time.toFixed(1)} ms
                </span>
                {totalPages > 1 && (
                    <span
                        style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginLeft: "auto",
                        }}
                    >
                        Página {page + 1} / {totalPages}
                    </span>
                )}
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflow: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                        fontFamily: "var(--font-code)",
                    }}
                >
                    <thead>
                        <tr>
                            {fields.map((f) => (
                                <th
                                    key={f.name}
                                    style={{
                                        padding: "8px 14px",
                                        textAlign: "left",
                                        background: "var(--bg-elevated)",
                                        color: "var(--text-secondary)",
                                        fontWeight: 600,
                                        fontSize: 11,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        borderBottom: "1px solid var(--border)",
                                        whiteSpace: "nowrap",
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    {f.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((row, ri) => (
                            <tr
                                key={ri}
                                style={{
                                    background:
                                        ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                                    transition: "background 0.1s",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLTableRowElement).style.background =
                                        "var(--bg-hover)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLTableRowElement).style.background =
                                        ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)";
                                }}
                            >
                                {fields.map((f) => {
                                    const val = row[f.name];
                                    return (
                                        <td
                                            key={f.name}
                                            style={{
                                                padding: "7px 14px",
                                                borderBottom: "1px solid var(--border)",
                                                maxWidth: 300,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                ...getCellStyle(val, f.dataTypeID),
                                            }}
                                            title={formatCell(val, f.dataTypeID)}
                                        >
                                            {formatCell(val, f.dataTypeID)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        padding: "10px 16px",
                        borderTop: "1px solid var(--border)",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{
                            padding: "4px 14px",
                            borderRadius: 6,
                            border: "1px solid var(--border-bright)",
                            background: "transparent",
                            color: page === 0 ? "var(--text-muted)" : "var(--text-primary)",
                            cursor: page === 0 ? "not-allowed" : "pointer",
                            fontSize: 13,
                        }}
                    >
                        ← Prev
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        style={{
                            padding: "4px 14px",
                            borderRadius: 6,
                            border: "1px solid var(--border-bright)",
                            background: "transparent",
                            color:
                                page === totalPages - 1
                                    ? "var(--text-muted)"
                                    : "var(--text-primary)",
                            cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                            fontSize: 13,
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
