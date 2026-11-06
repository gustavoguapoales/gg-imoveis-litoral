// Ponto de entrada da prévia do painel (arquivo único). Usa o mesmo componente do site.
import { createRoot } from "react-dom/client";
import { PainelApp } from "@/components/painel/PainelApp";
import { imoveis } from "@/data/imoveis";
import { privadosDemo } from "@/data/privado-demo";

const SITE_PREVIA = "https://claude.ai/artifact/WkrJuBZrsz2sXuFJHDMMM7";
createRoot(document.getElementById("painel")!).render(<PainelApp imoveis={imoveis} privados={privadosDemo} baseSite={SITE_PREVIA} siteHash />);
