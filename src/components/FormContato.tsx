"use client";

import { useState } from "react";
import { linkWhatsApp } from "@/lib/site";
import { registrarCliente } from "@/lib/cliente";
import { IconeWhatsApp } from "./Icones";

const input = "w-full rounded-sm border border-linha bg-papel px-4 py-3 text-tinta outline-none transition focus:border-mar";

// Por enquanto o formulário monta a mensagem e abre o WhatsApp.
// Na próxima etapa podemos enviar também por e-mail ou para um CRM.
export function FormContato({ imovelRef }: { imovelRef?: string }) {
  const [erro, setErro] = useState("");

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const nome = String(d.get("nome") ?? "").trim();
    const telefone = String(d.get("telefone") ?? "").trim();
    if (!nome || telefone.replace(/\D/g, "").length < 10) {
      setErro("Informe seu nome e um telefone com DDD.");
      return;
    }
    setErro("");
    const linhas = [
      `Olá! Meu nome é ${nome}.`,
      `Interesse: ${d.get("interesse")}`,
      d.get("cidade") ? `Cidade: ${d.get("cidade")}` : "",
      imovelRef ? `Imóvel: Ref ${imovelRef}` : "",
      d.get("mensagem") ? `Mensagem: ${d.get("mensagem")}` : "",
      `Telefone: ${telefone}`,
      d.get("email") ? `E-mail: ${d.get("email")}` : "",
    ].filter(Boolean);
    registrarCliente({
      nome, telefone, email: String(d.get("email") ?? ""), interesse: String(d.get("interesse") ?? "Contato pelo site"),
      ref: imovelRef, cidade: String(d.get("cidade") ?? ""), mensagem: String(d.get("mensagem") ?? ""),
    });
    window.open(linkWhatsApp(linhas.join("\n")), "_blank", "noopener");
  }

  return (
    <form onSubmit={enviar} className="grid gap-5 sm:grid-cols-2" noValidate>
      <label className="flex flex-col gap-2 text-sm sm:col-span-2" htmlFor="ct-nome">
        Nome
        <input id="ct-nome" name="nome" autoComplete="name" className={input} placeholder="Como você se chama?" />
      </label>
      <label className="flex flex-col gap-2 text-sm" htmlFor="ct-telefone">
        Telefone / WhatsApp
        <input id="ct-telefone" name="telefone" type="tel" autoComplete="tel" inputMode="tel" className={input} placeholder="(13) 90000-0000" />
      </label>
      <label className="flex flex-col gap-2 text-sm" htmlFor="ct-email">
        E-mail <span className="sr-only">(opcional)</span>
        <input id="ct-email" name="email" type="email" autoComplete="email" className={input} placeholder="opcional" />
      </label>
      <label className="flex flex-col gap-2 text-sm" htmlFor="ct-interesse">
        Tenho interesse em
        <select id="ct-interesse" name="interesse" className={input} defaultValue="Comprar um imóvel">
          <option>Comprar um imóvel</option>
          <option>Alugar um imóvel</option>
          <option>Vender meu imóvel</option>
          <option>Avaliar meu imóvel</option>
          <option>Investir no litoral</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm" htmlFor="ct-cidade">
        Cidade de interesse
        <select id="ct-cidade" name="cidade" className={input} defaultValue="">
          <option value="">Ainda não sei</option>
          <option>Santos</option>
          <option>São Vicente</option>
          <option>Praia Grande</option>
          <option>Guarujá</option>
          <option>Mongaguá</option>
          <option>Itanhaém</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm sm:col-span-2" htmlFor="ct-mensagem">
        Mensagem
        <textarea id="ct-mensagem" name="mensagem" rows={4} className={input} placeholder="Conte o que você procura: bairro, número de quartos, faixa de valor..." />
      </label>
      {erro && <p className="text-sm text-red-700 sm:col-span-2" role="alert">{erro}</p>}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-cinza">Ao enviar, a mensagem abre no WhatsApp para você confirmar.</p>
        <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-whats px-7 py-3.5 font-medium text-white transition hover:brightness-110">
          <IconeWhatsApp /> Enviar pelo WhatsApp
        </button>
      </div>
    </form>
  );
}
