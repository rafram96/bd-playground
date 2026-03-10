"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import AppNavbar, { type TabDef } from "@/components/layout/AppNavbar";
import ComingSoon from "@/components/layout/ComingSoon";

const SqlPlayground = dynamic(
  () => import("@/components/playground/SqlPlayground"),
  { ssr: false }
);

/* ─────────────────────────────────────────────────────
   Tabs activos — edita esta lista para agregar/quitar
   ───────────────────────────────────────────────────── */
const TABS: TabDef[] = [
  { id: "playground", label: "SQL Playground", icon: "⌨️", group: null },
  { id: "bptree", label: "B+Tree", icon: "🌲", group: "Visualizadores" },
  { id: "hash", label: "Hash Index", icon: "＃", group: "Visualizadores" },
  { id: "fragment", label: "Fragmentación", icon: "🧩", group: "Visualizadores" },
];

type TabId = (typeof TABS)[number]["id"];

/* ─────────────────────────────────────────────────────
   Página principal
   ───────────────────────────────────────────────────── */
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("playground");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      <AppNavbar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      />

      <main style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "playground" && <SqlPlayground />}

        {activeTab === "bptree" && (
          <ComingSoon title="B+Tree Interactivo" emoji="🌲" />
        )}

        {activeTab === "hash" && (
          <ComingSoon
            title="Hash Index (Estático + Extensible)"
            emoji="＃"
          />
        )}

        {activeTab === "fragment" && (
          <ComingSoon title="Fragmentación de Datos" emoji="🧩" />
        )}
      </main>
    </div>
  );
}
