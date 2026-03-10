"use client";

import { useEffect, useRef, useState } from "react";
import type { editor } from "monaco-editor";

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
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof import("monaco-editor") | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        let cleanup: (() => void) | undefined;

        const init = async () => {
            if (!containerRef.current) return;

            // Dynamically import Monaco to avoid SSR issues
            const monaco = await import("monaco-editor");
            monacoRef.current = monaco;

            // Register SQL language theme
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

            const ed = monaco.editor.create(containerRef.current, {
                value,
                language: "sql",
                theme: "db-dark",
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
                suggest: {
                    showKeywords: true,
                    showSnippets: true,
                },
            });

            editorRef.current = ed;

            // Register table name autocompletions
            if (tableNames.length > 0) {
                monaco.languages.registerCompletionItemProvider("sql", {
                    provideCompletionItems: (model, position) => {
                        const word = model.getWordUntilPosition(position);
                        const range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn,
                        };
                        const suggestions = tableNames.map((name) => ({
                            label: name,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: name,
                            range,
                            detail: "Table",
                        }));
                        return { suggestions };
                    },
                });
            }

            // Keyboard shortcuts
            ed.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                () => onRun()
            );
            ed.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
                () => onExplain()
            );

            // Sync value changes
            ed.onDidChangeModelContent(() => {
                onChange(ed.getValue());
            });

            setMounted(true);

            cleanup = () => {
                ed.dispose();
            };
        };

        init();
        return () => cleanup?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep editor in sync when value is changed externally (snippet load)
    useEffect(() => {
        const ed = editorRef.current;
        if (ed && ed.getValue() !== value) {
            ed.setValue(value);
        }
    }, [value]);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                background: "var(--bg-surface)",
                borderRadius: "8px",
                overflow: "hidden",
            }}
        >
            {!mounted && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-code)",
                        fontSize: 13,
                    }}
                >
                    Cargando editor...
                </div>
            )}
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
