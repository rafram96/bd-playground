import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DB Visualizer — CS2042 Base de Datos II",
  description:
    "Herramienta de aprendizaje visual para el curso CS2042 de UTEC. SQL Playground con PGlite + visualizaciones interactivas de estructuras de datos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
