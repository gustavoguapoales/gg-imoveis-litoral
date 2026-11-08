"use client";

import { useEffect, useState } from "react";
import { linkWhatsApp } from "@/lib/site";
import { registrarCliente } from "@/lib/cliente";
import { IconeFechar, IconeWhatsApp } from "./Icones";

// "Consultar pelo WhatsApp" de um imóvel: pede nome e telefone, registra o interesse e abre o WhatsApp.
export function BotaoInteresse({ refImovel, titulo, mensagem, rotulo, className }: {
  refImovel: string; titulo: string; mensagem: string; rotulo: string; className: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [aberto]);

  function continuar(e: React.FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2 || telefone.replace(/\D/g, "").length < 10) return setErro("Informe seu nome e um telefone com DDD.");
    registrarCliente({ nome, telefone, interesse: "Interesse em imóvel", ref: refImovel });
    window.open(linkWhatsApp(`Olá, meu nome é ${nome.trim()}. ${mensagem}`), "_blank", "noopener");
    setAberto(false);
  }

  const campo = "w-full rounded-sm border border-linha bg-papel px-4 py-3 text-tinta outline-none focus:border-mar";
  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={className}>
        <IconeWhatsApp /> {rotulo}
      </button>
      {aberto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-tinta/60 px-4" role="dialog" aria-modal="true" aria-label="Falar sobre este imóvel" onClick={(e) => e.target === e.currentTarget && setAberto(false)}>
          <form onSubmit={continuar} className="w-full max-w-md rounded-lg bg-papel p-6 text-left text-tinta shadow-2xl" noValidate>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="rotulo text-latao-escuro">Ref {refImovel}</p>
                <h2 className="mt-1 font-display text-2xl">{titulo}</h2>
              </div>
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-nevoa"><IconeFechar /></button>
            </div>
            <p className="mt-3 text-sm text-cinza">Informe seu nome e telefone para o Gustavo te atender pelo WhatsApp.</p>
            <label htmlFor="int-nome" className="mt-5 grid gap-1.5 text-sm">Nome
              <input id="int-nome" autoFocus autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} className={campo} />
            </label>
            <label htmlFor="int-tel" className="mt-4 grid gap-1.5 text-sm">Telefone / WhatsApp
              <input id="int-tel" type="tel" inputMode="tel" autoComplete="tel" placeholder="(13) 90000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} className={campo} />
            </label>
            {erro && <p className="mt-3 text-sm text-rose-700" role="alert">{erro}</p>}
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-whats py-3.5 font-medium text-white hover:brightness-110">
              <IconeWhatsApp /> Continuar no WhatsApp
            </button>
          </form>
        </div>
      )}
    </>
  );
}
