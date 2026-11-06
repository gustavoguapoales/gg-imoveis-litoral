"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cidades, tipos } from "@/data/imoveis";
import { IconeLupa } from "./Icones";

export const FAIXAS_PRECO = [
  { valor: "", rotulo: "Qualquer valor" },
  { valor: "500000", rotulo: "Até R$ 500 mil" },
  { valor: "1000000", rotulo: "Até R$ 1 milhão" },
  { valor: "2000000", rotulo: "Até R$ 2 milhões" },
  { valor: "5000000", rotulo: "Até R$ 5 milhões" },
];

const campo = "w-full appearance-none bg-transparent pt-1 text-[0.98rem] text-tinta outline-none cursor-pointer";

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
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [dorm, setDorm] = useState("");
  const [preco, setPreco] = useState("");

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (cidade) q.set("cidade", cidade);
    if (tipo) q.set("tipo", tipo);
    if (dorm) q.set("dorm", dorm);
    if (preco) q.set("preco", preco);
    router.push(`/imoveis/${q.size ? `?${q}` : ""}`);
  }

  return (
    <form
      onSubmit={buscar}
      className="grid overflow-hidden rounded-sm bg-papel shadow-[0_30px_60px_-30px_rgba(5,20,25,0.6)] md:grid-cols-[1.2fr_1fr_1fr_1.1fr_auto]"
      role="search"
      aria-label="Buscar imóveis"
    >
      <Bloco id="busca-cidade" rotulo="Cidade">
        <select id="busca-cidade" className={campo} value={cidade} onChange={(e) => setCidade(e.target.value)}>
          <option value="">Todo o litoral</option>
          {cidades.map((c) => (<option key={c.slug} value={c.slug}>{c.nome}</option>))}
        </select>
      </Bloco>
      <Bloco id="busca-tipo" rotulo="Tipo">
        <select id="busca-tipo" className={campo} value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos</option>
          {tipos.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
      </Bloco>
      <Bloco id="busca-dorm" rotulo="Dormitórios">
        <select id="busca-dorm" className={campo} value={dorm} onChange={(e) => setDorm(e.target.value)}>
          <option value="">Qualquer</option>
          {[1, 2, 3, 4].map((n) => (<option key={n} value={n}>{n}+ dormitórios</option>))}
        </select>
      </Bloco>
      <Bloco id="busca-preco" rotulo="Valor máximo">
        <select id="busca-preco" className={campo} value={preco} onChange={(e) => setPreco(e.target.value)}>
          {FAIXAS_PRECO.map((f) => (<option key={f.valor} value={f.valor}>{f.rotulo}</option>))}
        </select>
      </Bloco>
      <button type="submit" className="flex items-center justify-center gap-2 bg-tinta px-8 py-4 font-medium text-white transition hover:bg-mar">
        <IconeLupa /> Buscar
      </button>
    </form>
  );
}
