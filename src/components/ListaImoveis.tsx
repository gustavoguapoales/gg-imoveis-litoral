"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { cidades, imoveis, tipos } from "@/data/imoveis";
import { CardImovel } from "./CardImovel";
import { exemploValor, FINALIDADES } from "./BuscaRapida";
import { CampoValor } from "./CampoValor";

const ORDENS = [
  { valor: "", rotulo: "Mais recentes" },
  { valor: "menor", rotulo: "Menor preço" },
  { valor: "maior", rotulo: "Maior preço" },
  { valor: "praia", rotulo: "Mais perto da praia" },
];

const sel = "w-full appearance-none rounded-sm border border-linha bg-papel px-3.5 py-2.5 text-sm text-tinta outline-none focus:border-mar cursor-pointer";

type Filtros = { finalidade: string; cidade: string; tipo: string; dorm: string; preco: string; vista: string; ordem: string };
const SEM_FILTROS: Filtros = { finalidade: "", cidade: "", tipo: "", dorm: "", preco: "", vista: "", ordem: "" };

export function ListaImoveis() {
  const router = useRouter();
  const params = useSearchParams();
  const f = {
    finalidade: params.get("finalidade") ?? "",
    cidade: params.get("cidade") ?? "",
    tipo: params.get("tipo") ?? "",
    dorm: params.get("dorm") ?? "",
    preco: params.get("preco") ?? "",
    vista: params.get("vista") ?? "",
    ordem: params.get("ordem") ?? "",
  };

  function definir(chave: keyof typeof f, valor: string) {
    const q = new URLSearchParams(params.toString());
    if (valor) q.set(chave, valor);
    else q.delete(chave);
    if (chave === "finalidade") q.delete("preco");
    router.replace(`/imoveis/${q.size ? `?${q}` : ""}`, { scroll: false });
  }

  const lista = useMemo(() => {
    const cidadeNome = cidades.find((c) => c.slug === f.cidade)?.nome;
    // Faixa de preço sem finalidade escolhida vale para imóveis à venda.
    const finalidade = f.finalidade || (f.preco ? "venda" : "");
    const r = imoveis.filter(
      (i) =>
        (!finalidade || i.finalidade === finalidade) &&
        (!cidadeNome || i.cidade === cidadeNome) &&
        (!f.tipo || i.tipo === f.tipo) &&
        (!f.dorm || i.dormitorios >= Number(f.dorm)) &&
        (!f.preco || i.preco <= Number(f.preco)) &&
        (!f.vista || i.vistaMar),
    );
    if (f.ordem === "menor") r.sort((a, b) => a.preco - b.preco);
    if (f.ordem === "maior") r.sort((a, b) => b.preco - a.preco);
    if (f.ordem === "praia") r.sort((a, b) => a.distanciaPraia - b.distanciaPraia);
    return r;
  }, [f.finalidade, f.cidade, f.tipo, f.dorm, f.preco, f.vista, f.ordem]);

  const limpar = () => router.replace("/imoveis/", { scroll: false });

  const ativos = [f.finalidade, f.cidade, f.tipo, f.dorm, f.preco, f.vista].filter(Boolean).length;

  return <ListaVisual f={f} lista={lista} ativos={ativos} definir={definir} limpar={limpar} />;
}

// Versão sem filtros, usada no HTML pré-renderizado (todos os imóveis visíveis para o Google).
export function ListaImoveisEstatica() {
  return <ListaVisual f={SEM_FILTROS} lista={imoveis} ativos={0} definir={() => {}} limpar={() => {}} />;
}

function ListaVisual({ f, lista, ativos, definir, limpar }: {
  f: Filtros;
  lista: typeof imoveis;
  ativos: number;
  definir: (chave: keyof Filtros, valor: string) => void;
  limpar: () => void;
}) {
  return (
    <>
      <div className="sticky top-20 z-20 -mx-[max(20px,env(safe-area-inset-left,0px))] border-b border-linha bg-papel/95 px-[max(20px,env(safe-area-inset-left,0px))] py-4 backdrop-blur md:-mx-10 md:px-10">
        <div className="mb-3 flex w-fit overflow-hidden rounded-full border border-linha text-sm" role="radiogroup" aria-label="Finalidade">
          {[{ valor: "", rotulo: "Todos" }, ...FINALIDADES].map((o) => (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={f.finalidade === o.valor}
              data-finalidade={o.valor}
              onClick={() => definir("finalidade", o.valor)}
              className={`px-5 py-2 font-medium transition ${f.finalidade === o.valor ? "bg-tinta text-white" : "text-tinta hover:bg-nevoa"}`}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
          <select aria-label="Cidade" className={sel} value={f.cidade} onChange={(e) => definir("cidade", e.target.value)}>
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (<option key={c.slug} value={c.slug}>{c.nome}</option>))}
          </select>
          <select aria-label="Tipo de imóvel" className={sel} value={f.tipo} onChange={(e) => definir("tipo", e.target.value)}>
            <option value="">Todos os tipos</option>
            {tipos.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          <select aria-label="Dormitórios" className={sel} value={f.dorm} onChange={(e) => definir("dorm", e.target.value)}>
            <option value="">Dormitórios</option>
            {[1, 2, 3, 4].map((n) => (<option key={n} value={n}>{n}+ dormitórios</option>))}
          </select>
          <CampoValor
            id="filtro-preco"
            rotuloAcessivel="Valor máximo"
            valor={f.preco}
            aoMudar={(v) => definir("preco", v)}
            placeholder={`Valor máximo (${exemploValor(f.finalidade).replace("Ex.: ", "ex. ")})`}
            className={`${sel} cursor-text placeholder:text-cinza`}
          />
          <select aria-label="Ordenar por" className={`${sel} max-md:col-span-2`} value={f.ordem} onChange={(e) => definir("ordem", e.target.value)}>
            {ORDENS.map((o) => (<option key={o.valor} value={o.valor}>{o.rotulo}</option>))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-sm max-md:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-mar" checked={!!f.vista} onChange={(e) => definir("vista", e.target.checked ? "1" : "")} />
            Só vista mar
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between py-8">
        <p className="text-sm text-cinza" aria-live="polite">
          <strong className="font-semibold text-tinta">{lista.length}</strong> {lista.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </p>
        {ativos > 0 && (
          <button type="button" onClick={limpar} className="text-sm text-mar underline underline-offset-4 hover:text-latao-escuro">
            Limpar filtros
          </button>
        )}
      </div>

      {lista.length > 0 ? (
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((i) => (<CardImovel key={i.slug} imovel={i} />))}
        </div>
      ) : (
        <div className="rounded-sm border border-dashed border-linha px-6 py-16 text-center">
          <p className="font-display text-2xl">Nenhum imóvel com esses filtros agora.</p>
          <p className="mx-auto mt-3 max-w-md text-cinza">
            Me conte o que você procura pelo WhatsApp. Muitos imóveis chegam antes de serem anunciados.
          </p>
        </div>
      )}
    </>
  );
}
