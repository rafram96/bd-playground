"use client";

import { useRef, useCallback } from "react";
import Editor, { loader, type OnMount, type BeforeMount } from "@monaco-editor/react";
import type { editor, Position } from "monaco-editor";

/* ── Use local monaco-editor core + SQL only (avoids importing ALL languages) ── */
// @ts-expect-error — ESM deep import has no .d.ts; runtime is fine
import * as monacoCore from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution";
loader.config({ monaco: monacoCore });

interface SqlEditorProps {
    value: string;
    onChange: (val: string) => void;
    onRun: () => void;
    onExplain: () => void;
    tableNames?: string[];
}

export default function SqlEditor({
    value,
    onChange,
    onRun,
    onExplain,
    tableNames = [],
}: SqlEditorProps) {
    const onRunRef = useRef(onRun);
    const onExplainRef = useRef(onExplain);
    onRunRef.current = onRun;
    onExplainRef.current = onExplain;

    const handleBeforeMount: BeforeMount = useCallback((monaco) => {
        monaco.editor.defineTheme("db-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "keyword", foreground: "7c6af7", fontStyle: "bold" },
                { token: "string", foreground: "22d3a0" },
                { token: "number", foreground: "60a5fa" },
                { token: "comment", foreground: "4a4a6a", fontStyle: "italic" },
                { token: "operator", foreground: "f0c060" },
                { token: "identifier", foreground: "e8e8f0" },
            ],
            colors: {
                "editor.background": "#111118",
                "editor.foreground": "#e8e8f0",
                "editor.lineHighlightBackground": "#1a1a26",
                "editor.selectionBackground": "#7c6af730",
                "editorCursor.foreground": "#7c6af7",
                "editorLineNumber.foreground": "#4a4a6a",
                "editorLineNumber.activeForeground": "#8888aa",
                "editor.findMatchBackground": "#7c6af740",
                "editorWidget.background": "#111118",
                "editorSuggestWidget.background": "#111118",
                "editorSuggestWidget.border": "#1a1a26",
                "editorSuggestWidget.selectedBackground": "#1a1a26",
            },
        });

        if (tableNames.length > 0) {
            monaco.languages.registerCompletionItemProvider("sql", {
                provideCompletionItems: (model: editor.ITextModel, position: Position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                    };
                    return {
                        suggestions: tableNames.map((name) => ({
                            label: name,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: name,
                            range,
                            detail: "Table",
                        })),
                    };
                },
            });
        }
    }, [tableNames]);

    const handleMount: OnMount = useCallback((ed, monaco) => {
        ed.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => onRunRef.current()
        );
        ed.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
            () => onExplainRef.current()
        );

        ed.focus();
    }, []);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "var(--bg-surface)",
                borderRadius: "8px",
                overflow: "hidden",
            }}
        >
            <Editor
                value={value}
                language="sql"
                theme="db-dark"
                onChange={(val) => onChange(val ?? "")}
                beforeMount={handleBeforeMount}
                onMount={handleMount}
                options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontLigatures: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: false,
                    renderLineHighlight: "line",
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                    padding: { top: 16, bottom: 16 },
                    fixedOverflowWidgets: true,
                    suggest: {
                        showKeywords: true,
                        showSnippets: true,
                    },
                }}
                loading={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-code)",
                            fontSize: 13,
                        }}
                    >
                        Cargando editor...
                    </div>
                }
            />
        </div>
    );
}
