import type { Metadata } from "next";
import { Suspense } from "react";
import { ListaImoveis, ListaImoveisEstatica } from "@/components/ListaImoveis";
import { listarPublicos } from "@/lib/banco";

export const metadata: Metadata = {
  title: "Imóveis para comprar e alugar no litoral paulista",
  description: "Apartamentos, casas, coberturas e salas comerciais para comprar ou alugar em Santos, São Vicente, Praia Grande, Guarujá, Mongaguá e Itanhaém.",
  alternates: { canonical: "/imoveis/" },
};

export const dynamic = "force-dynamic";

export default async function PaginaImoveis() {
  const imoveis = await listarPublicos();
  return (
    <div className="container-site pb-28 pt-32 md:pt-40">
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="rotulo text-latao-escuro">Catálogo</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">Imóveis para comprar e alugar</h1>
          <p className="mt-4 max-w-xl text-lg text-cinza">Santos, São Vicente, Praia Grande, Guarujá, Mongaguá e Itanhaém. Use os filtros para encontrar o imóvel certo.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/logo.png" alt="GG Imóveis Litoral" width={980} height={410} className="h-24 w-auto self-start md:h-32 md:self-auto" />
      </div>
      <div className="mt-10">
        <Suspense fallback={<ListaImoveisEstatica imoveis={imoveis} />}>
          <ListaImoveis imoveis={imoveis} />
        </Suspense>
      </div>
    </div>
  );
}
