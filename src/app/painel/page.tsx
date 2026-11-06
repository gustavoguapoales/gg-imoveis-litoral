import type { Metadata } from "next";
import { PainelApp } from "@/components/painel/PainelApp";
import { imoveis } from "@/data/imoveis";
import { privadosDemo } from "@/data/privado-demo";

// Protótipo do painel do corretor. Fora do Google e sem link no site público.
export const metadata: Metadata = {
  title: "Painel do corretor",
  robots: { index: false, follow: false },
};

export default function PaginaPainel() {
  return <PainelApp imoveis={imoveis} privados={privadosDemo} baseSite="" />;
}
