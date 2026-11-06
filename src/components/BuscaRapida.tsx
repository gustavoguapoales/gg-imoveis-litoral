"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cidades, tipos } from "@/data/imoveis";
import { CIDADES_DRONE, linkDrone, TIPOS_FILMAGEM } from "@/lib/drone";
import { CampoValor } from "./CampoValor";
import { IconeLupa, IconeWhatsApp } from "./Icones";

export const FINALIDADES = [
  { valor: "venda", rotulo: "Comprar" },
  { valor: "aluguel", rotulo: "Alugar" },
] as const;

export const exemploValor = (finalidade: string) => (finalidade === "aluguel" ? "Ex.: R$ 3.000" : "Ex.: R$ 500.000");

type Aba = "venda" | "aluguel" | "drone";
const ABAS: { valor: Aba; rotulo: string }[] = [...FINALIDADES, { valor: "drone", rotulo: "Drone" }];

const campo = "w-full appearance-none bg-transparent pt-1 text-[0.98rem] text-tinta outline-none placeholder:text-cinza/70";

function Bloco({ id, rotulo, children }: { id: string; rotulo: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex flex-col border-linha px-5 py-3.5 max-md:border-b md:border-r">
      <span className="rotulo !text-[0.64rem] text-cinza">{rotulo}</span>
      {children}
    </label>
  );
}

export function BuscaRapida() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("venda");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [dorm, setDorm] = useState("");
  const [preco, setPreco] = useState("");
  const [drone, setDrone] = useState({ tipo: TIPOS_FILMAGEM[0], cidade: CIDADES_DRONE[0], bairro: "" });

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (aba === "drone") return;
    const q = new URLSearchParams({ finalidade: aba });
    if (cidade) q.set("cidade", cidade);
    if (tipo) q.set("tipo", tipo);
    if (dorm) q.set("dorm", dorm);
    if (preco) q.set("preco", preco);
    router.push(`/imoveis/?${q}`);
  }

  const caixa = "grid overflow-hidden rounded-sm rounded-tl-none bg-papel shadow-[0_30px_60px_-30px_rgba(5,20,25,0.6)]";

  return (
    <form onSubmit={buscar} role="search" aria-label="Buscar imóveis ou marcar filmagem com drone">
      <div className="mb-px flex w-fit overflow-hidden rounded-t-sm" role="radiogroup" aria-label="O que você procura">
        {ABAS.map((f) => (
          <button
            key={f.valor}
            type="button"
            role="radio"
            aria-checked={aba === f.valor}
            data-finalidade={f.valor}
            onClick={() => { setAba(f.valor); setPreco(""); }}
            className={`px-6 py-3 text-sm font-semibold transition ${aba === f.valor ? "bg-papel text-tinta" : "bg-tinta/70 text-white/80 backdrop-blur hover:text-white"}`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      <div data-painel="imoveis" hidden={aba === "drone"} className={`${caixa} md:grid-cols-[1.2fr_1fr_1fr_1.1fr_auto]`}>
        <Bloco id="busca-cidade" rotulo="Cidade">
          <select id="busca-cidade" className={`${campo} cursor-pointer`} value={cidade} onChange={(e) => setCidade(e.target.value)}>
            <option value="">Todo o litoral</option>
            {cidades.map((c) => (<option key={c.slug} value={c.slug}>{c.nome}</option>))}
          </select>
        </Bloco>
        <Bloco id="busca-tipo" rotulo="Tipo">
          <select id="busca-tipo" className={`${campo} cursor-pointer`} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {tipos.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </Bloco>
        <Bloco id="busca-dorm" rotulo="Dormitórios">
          <select id="busca-dorm" className={`${campo} cursor-pointer`} value={dorm} onChange={(e) => setDorm(e.target.value)}>
            <option value="">Qualquer</option>
            {[1, 2, 3, 4].map((n) => (<option key={n} value={n}>{n}+ dormitórios</option>))}
          </select>
        </Bloco>
        <Bloco id="busca-preco" rotulo={aba === "aluguel" ? "Aluguel máximo" : "Valor máximo"}>
          <CampoValor id="busca-preco" valor={preco} aoMudar={setPreco} placeholder={exemploValor(aba)} className={campo} />
        </Bloco>
        <button type="submit" className="flex items-center justify-center gap-2 bg-tinta px-8 py-4 font-medium text-white transition hover:bg-mar">
          <IconeLupa /> Buscar
        </button>
      </div>

      <div data-painel="drone" data-drone="" hidden={aba !== "drone"} className={`${caixa} md:grid-cols-[1.1fr_1fr_1.2fr_auto]`}>
        <Bloco id="drone-busca-tipo" rotulo="O que filmar">
          <select id="drone-busca-tipo" data-campo="tipo" className={`${campo} cursor-pointer`} value={drone.tipo} onChange={(e) => setDrone({ ...drone, tipo: e.target.value })}>
            {TIPOS_FILMAGEM.map((t) => (<option key={t}>{t}</option>))}
          </select>
        </Bloco>
        <Bloco id="drone-busca-cidade" rotulo="Cidade">
          <select id="drone-busca-cidade" data-campo="cidade" className={`${campo} cursor-pointer`} value={drone.cidade} onChange={(e) => setDrone({ ...drone, cidade: e.target.value })}>
            {CIDADES_DRONE.map((c) => (<option key={c}>{c}</option>))}
          </select>
        </Bloco>
        <Bloco id="drone-busca-bairro" rotulo="Bairro">
          <input id="drone-busca-bairro" data-campo="bairro" className={campo} placeholder="Ex.: Gonzaga" value={drone.bairro} onChange={(e) => setDrone({ ...drone, bairro: e.target.value })} />
        </Bloco>
        <a
          href={linkDrone(drone)}
          data-drone-link=""
          target="_blank"
          rel="noopener"
          className="flex items-center justify-center gap-2 whitespace-nowrap bg-whats px-7 py-4 font-medium text-white transition hover:brightness-110"
        >
          <IconeWhatsApp /> Marcar serviço
        </a>
      </div>
    </form>
  );
}
