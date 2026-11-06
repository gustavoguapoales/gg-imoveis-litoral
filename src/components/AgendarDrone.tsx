"use client";

import { useState } from "react";
import { CIDADES_DRONE, linkDrone, TIPOS_FILMAGEM } from "@/lib/drone";
import { IconeWhatsApp } from "./Icones";

const input = "w-full rounded-sm border border-linha bg-papel px-4 py-3 text-tinta outline-none transition focus:border-mar";

// Consulta de preço do drone: o botão abre o WhatsApp com a mensagem pronta, já com cidade e bairro.
export function AgendarDrone() {
  const [d, setD] = useState({ tipo: TIPOS_FILMAGEM[0], cidade: CIDADES_DRONE[0], bairro: "" });
  return (
    <div data-drone="" className="grid gap-5 sm:grid-cols-3">
      <label htmlFor="agendar-tipo" className="flex flex-col gap-2 text-sm">
        O que será filmado
        <select id="agendar-tipo" data-campo="tipo" className={input} value={d.tipo} onChange={(e) => setD({ ...d, tipo: e.target.value })}>
          {TIPOS_FILMAGEM.map((t) => (<option key={t}>{t}</option>))}
        </select>
      </label>
      <label htmlFor="agendar-cidade" className="flex flex-col gap-2 text-sm">
        Cidade
        <select id="agendar-cidade" data-campo="cidade" className={input} value={d.cidade} onChange={(e) => setD({ ...d, cidade: e.target.value })}>
          {CIDADES_DRONE.map((c) => (<option key={c}>{c}</option>))}
        </select>
      </label>
      <label htmlFor="agendar-bairro" className="flex flex-col gap-2 text-sm">
        Bairro
        <input id="agendar-bairro" data-campo="bairro" className={input} placeholder="Ex.: Enseada" value={d.bairro} onChange={(e) => setD({ ...d, bairro: e.target.value })} />
      </label>
      <div className="flex flex-col gap-3 sm:col-span-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-cinza">A conversa abre no WhatsApp com a mensagem pronta para você enviar.</p>
        <a href={linkDrone(d)} data-drone-link="" target="_blank" rel="noopener" className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-whats px-8 py-4 font-medium text-white transition hover:brightness-110">
          <IconeWhatsApp /> Ver preço
        </a>
      </div>
    </div>
  );
}
