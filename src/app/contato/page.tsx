import type { Metadata } from "next";
import { FormContato } from "@/components/FormContato";
import { IconeWhatsApp } from "@/components/Icones";
import { linkWhatsApp, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a GG Imóveis Litoral pelo WhatsApp ou formulário. Compra, venda e avaliação de imóveis em Santos, São Vicente, Praia Grande e Guarujá.",
  alternates: { canonical: "/contato/" },
};

export default function PaginaContato() {
  return (
    <div className="container-site grid gap-16 pb-28 pt-32 md:pt-40 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="rotulo text-latao-escuro">Contato</p>
        <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">Vamos conversar sobre o seu imóvel.</h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-cinza">
          Para comprar, vender ou avaliar, o caminho mais rápido é o WhatsApp. Respondo pessoalmente.
        </p>

        <a href={linkWhatsApp()} target="_blank" rel="noopener" className="mt-10 flex max-w-md items-center gap-5 rounded-sm bg-tinta p-6 text-white transition hover:bg-mar">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-whats"><IconeWhatsApp width={28} height={28} /></span>
          <span>
            <span className="rotulo block text-white/60">WhatsApp comercial</span>
            <span className="mt-1 block text-2xl font-medium tabular-nums">{SITE.whatsappExibicao}</span>
          </span>
        </a>

        <dl className="mt-10 grid max-w-md gap-6 border-t border-linha pt-8 sm:grid-cols-2">
          <div><dt className="rotulo text-cinza">Atendimento</dt><dd className="mt-2">{SITE.horario}</dd></div>
          <div><dt className="rotulo text-cinza">E-mail</dt><dd className="mt-2 break-words">{SITE.email}</dd></div>
          <div><dt className="rotulo text-cinza">Região</dt><dd className="mt-2">Santos, São Vicente, Praia Grande e Guarujá</dd></div>
          <div><dt className="rotulo text-cinza">Registro</dt><dd className="mt-2">{SITE.creci}</dd></div>
        </dl>
      </div>

      <div className="rounded-sm border border-linha bg-nevoa p-6 md:p-10">
        <h2 className="font-display text-3xl">Formulário de interesse</h2>
        <p className="mt-2 text-cinza">Preencha e a mensagem abre pronta no WhatsApp.</p>
        <div className="mt-8"><FormContato /></div>
      </div>
    </div>
  );
}
