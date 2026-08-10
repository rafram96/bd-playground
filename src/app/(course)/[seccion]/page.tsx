import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionContent from "@/components/SectionContent";
import { isPageId, PAGE_IDS, PAGE_TITLES } from "@/lib/navigation";

interface SectionPageProps {
  params: Promise<{ seccion: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return PAGE_IDS.map((seccion) => ({ seccion }));
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { seccion } = await params;
  if (!isPageId(seccion)) return {};

  return {
    title: `${PAGE_TITLES[seccion]} · Guía BD2`,
    description: `Material interactivo de ${PAGE_TITLES[seccion]} para Base de Datos II.`,
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { seccion } = await params;
  if (!isPageId(seccion)) notFound();

  return <SectionContent section={seccion} />;
}
