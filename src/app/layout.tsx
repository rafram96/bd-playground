import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guía BD2",
  description:
    "Herramienta de aprendizaje visual para el curso CS2042 de UTEC. SQL Playground con PGlite + visualizaciones interactivas de estructuras de datos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('theme')==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
