import Link from "next/link";
import type { Imovel } from "@/data/imoveis";
import { formatarPreco } from "@/lib/site";
import { IconeArea, IconeBanho, IconeCama, IconeSeta, IconeSuite, IconeVaga } from "./Icones";

export function distanciaTexto(m: number) {
  return m <= 50 ? "Frente mar" : `${m} m da praia`;
}

export function Especificacoes({ imovel, compacto = false }: { imovel: Imovel; compacto?: boolean }) {
  const itens = [
    { Icone: IconeArea, valor: `${imovel.area} m²`, rotulo: "Área útil" },
    { Icone: IconeCama, valor: imovel.dormitorios, rotulo: imovel.dormitorios === 1 ? "Dormitório" : "Dormitórios" },
    { Icone: IconeSuite, valor: imovel.suites, rotulo: imovel.suites === 1 ? "Suíte" : "Suítes" },
    { Icone: IconeBanho, valor: imovel.banheiros, rotulo: imovel.banheiros === 1 ? "Banheiro" : "Banheiros" },
    { Icone: IconeVaga, valor: imovel.vagas, rotulo: imovel.vagas === 1 ? "Vaga" : "Vagas" },
  ];
  if (compacto) {
    return (
      <ul className="grid grid-cols-5 border-y border-linha py-3 text-tinta">
        {itens.map(({ Icone, valor, rotulo }) => (
          <li key={rotulo} className="flex flex-col items-center gap-1 text-center" title={rotulo}>
            <Icone className="text-mar" />
            <span className="text-sm font-medium tabular-nums">{valor}</span>
            <span className="sr-only">{rotulo}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-linha bg-linha sm:grid-cols-5">
      {itens.map(({ Icone, valor, rotulo }) => (
        <li key={rotulo} className="flex items-center gap-3 bg-papel px-4 py-4 max-sm:last:col-span-2">
          <Icone className="shrink-0 text-mar" width={22} height={22} />
          <span>
            <span className="block text-lg font-medium tabular-nums leading-tight">{valor}</span>
            <span className="text-xs text-cinza">{rotulo}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CardImovel({ imovel }: { imovel: Imovel }) {
  return (
    <article
      className="group flex flex-col"
      data-cidade={imovel.cidade}
      data-tipo={imovel.tipo}
      data-dorm={imovel.dormitorios}
      data-preco={imovel.preco}
      data-vista={imovel.vistaMar ? "1" : ""}
      data-praia={imovel.distanciaPraia}
    >
      <Link href={`/imoveis/${imovel.slug}/`} className="relative block aspect-[4/3] overflow-hidden bg-nevoa">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imovel.imagens[0]}
          alt={`${imovel.titulo}, ${imovel.bairro}, ${imovel.cidade}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-papel/92 px-3 py-1 text-xs font-medium text-tinta backdrop-blur">
          {imovel.vistaMar ? "Vista mar · " : ""}
          {distanciaTexto(imovel.distanciaPraia)}
        </span>
        <span className="rotulo absolute bottom-3 right-3 rounded-sm bg-tinta/70 px-2 py-1 !text-[0.65rem] text-white backdrop-blur">
          Ref {imovel.ref}
        </span>
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        <p className="rotulo text-cinza">
          {imovel.bairro} · {imovel.cidade}
        </p>
        <h3 className="mt-2 font-display text-[1.45rem] leading-snug">
          <Link href={`/imoveis/${imovel.slug}/`} className="hover:text-mar">
            {imovel.titulo}
          </Link>
        </h3>
        <div className="mt-4">
          <Especificacoes imovel={imovel} compacto />
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-cinza">{imovel.tipo} à venda</p>
            <p className="text-xl font-semibold tabular-nums">{formatarPreco(imovel.preco)}</p>
          </div>
          <Link
            href={`/imoveis/${imovel.slug}/`}
            className="flex items-center gap-1.5 text-sm font-medium text-mar transition group-hover:gap-2.5 hover:text-latao-escuro"
          >
            Ver detalhes <IconeSeta width={16} height={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
