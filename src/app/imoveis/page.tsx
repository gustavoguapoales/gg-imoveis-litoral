import type { Metadata } from "next";
import { Suspense } from "react";
import { ListaImoveis, ListaImoveisEstatica } from "@/components/ListaImoveis";

export const metadata: Metadata = {
  title: "Imóveis à venda no litoral paulista",
  description: "Apartamentos, coberturas, casas e studios à venda em Santos, São Vicente, Praia Grande e Guarujá. Filtre por cidade, tipo, dormitórios e valor.",
  alternates: { canonical: "/imoveis/" },
};

export default function PaginaImoveis() {
  return (
    <div className="container-site pb-28 pt-32 md:pt-40">
      <p className="rotulo text-latao-escuro">Catálogo</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">Imóveis à venda</h1>
      <p className="mt-4 max-w-xl text-lg text-cinza">Santos, São Vicente, Praia Grande e Guarujá. Use os filtros para encontrar o imóvel certo.</p>
      <div className="mt-10">
        <Suspense fallback={<ListaImoveisEstatica />}>
          <ListaImoveis />
        </Suspense>
      </div>
    </div>
  );
}
