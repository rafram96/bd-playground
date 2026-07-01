import AppShell from "@/components/AppShell";

/* Ruta catch-all opcional: sirve tanto "/" como "/{seccion}".
   Al recargar en /s12-bdd, Next entrega esta página con la sección inicial
   tomada de la URL, evitando que la app vuelva siempre a la Semana 1. */
export default async function Page({
  params,
}: {
  params: Promise<{ seccion?: string[] }>;
}) {
  const { seccion } = await params;
  const initial = seccion?.[0] ?? "s1";
  return <AppShell initialSection={initial} />;
}
