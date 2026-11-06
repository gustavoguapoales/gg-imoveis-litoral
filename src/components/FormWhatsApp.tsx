"use client";

import { useState } from "react";
import { linkWhatsApp } from "@/lib/site";
import { IconeWhatsApp } from "./Icones";

export type Campo = {
  nome: string;
  rotulo: string;
  tipo?: "text" | "tel" | "email" | "number" | "select" | "textarea";
  opcoes?: string[];
  placeholder?: string;
  obrigatorio?: boolean;
  inteiro?: boolean; // ocupa a linha toda
};

const input = "w-full rounded-sm border border-linha bg-papel px-4 py-3 text-tinta outline-none transition focus:border-mar";

// Formulário genérico: monta uma mensagem com todos os campos e abre o WhatsApp.
export function FormWhatsApp({ id, cabecalho, campos, botao = "Enviar pelo WhatsApp" }: { id: string; cabecalho: string; campos: Campo[]; botao?: string }) {
  const [erro, setErro] = useState("");

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const faltando = campos.filter((c) => c.obrigatorio && !String(d.get(c.nome) ?? "").trim());
    if (faltando.length) {
      setErro(`Preencha: ${faltando.map((c) => c.rotulo.toLowerCase()).join(", ")}.`);
      return;
    }
    setErro("");
    const linhas = [cabecalho, ...campos.map((c) => [c.rotulo, String(d.get(c.nome) ?? "").trim()]).filter(([, v]) => v).map(([r, v]) => `${r}: ${v}`)];
    window.open(linkWhatsApp(linhas.join("\n")), "_blank", "noopener");
  }

  return (
    <form onSubmit={enviar} className="grid gap-5 sm:grid-cols-2" noValidate data-cabecalho={cabecalho}>
      {campos.map((c) => {
        const cid = `${id}-${c.nome}`;
        const comum = { id: cid, name: c.nome, className: input, "data-rotulo": c.rotulo, required: c.obrigatorio };
        return (
          <label key={c.nome} htmlFor={cid} className={`flex flex-col gap-2 text-sm ${c.inteiro || c.tipo === "textarea" ? "sm:col-span-2" : ""}`}>
            <span>{c.rotulo}{c.obrigatorio || c.tipo === "select" ? "" : <span className="text-cinza"> (opcional)</span>}</span>
            {c.tipo === "select" ? (
              <select {...comum} defaultValue={c.opcoes?.[0]}>
                {c.opcoes?.map((o) => (<option key={o}>{o}</option>))}
              </select>
            ) : c.tipo === "textarea" ? (
              <textarea {...comum} rows={4} placeholder={c.placeholder} />
            ) : (
              <input {...comum} type={c.tipo ?? "text"} placeholder={c.placeholder} inputMode={c.tipo === "number" ? "numeric" : undefined} />
            )}
          </label>
        );
      })}
      {erro && <p className="text-sm text-red-700 sm:col-span-2" role="alert">{erro}</p>}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-cinza">Ao enviar, a mensagem abre pronta no WhatsApp para você confirmar.</p>
        <button type="submit" className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-whats px-7 py-3.5 font-medium text-white transition hover:brightness-110">
          <IconeWhatsApp /> {botao}
        </button>
      </div>
    </form>
  );
}
