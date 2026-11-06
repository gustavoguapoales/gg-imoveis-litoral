"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { responder, type Contexto, type DadosChat, type Resposta } from "@/lib/chatbot";
import { IconeChat, IconeEnviar, IconeFechar } from "./Icones";

type Mensagem = { de: "bot" | "voce"; resposta: Resposta };

// Balão de resposta do assistente (também usado como modelo visual na prévia).
function Balao({ m, aoSugerir }: { m: Mensagem; aoSugerir: (t: string) => void }) {
  if (m.de === "voce") {
    return <p data-balao="voce" className="ml-10 self-end rounded-2xl rounded-br-sm bg-tinta px-4 py-2.5 text-sm text-white">{m.resposta.texto}</p>;
  }
  const r = m.resposta;
  return (
    <div data-balao="bot" className="mr-4 flex min-w-0 flex-col gap-2.5 self-stretch">
      <p className="w-fit rounded-2xl rounded-bl-sm bg-nevoa px-4 py-2.5 text-sm leading-relaxed text-tinta">{r.texto}</p>
      {r.imoveis && r.imoveis.length > 0 && (
        <div className="flex flex-col gap-2">
          {r.imoveis.map((i) => (
            <Link key={i.slug} href={`/imoveis/${i.slug}/`} data-link-chat="" className="flex gap-3 rounded-xl border border-linha bg-papel p-2 hover:border-mar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.imagem} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
              <span className="min-w-0 py-0.5">
                <span className="block truncate text-sm font-medium text-tinta">{i.titulo}</span>
                <span className="block truncate text-xs text-cinza">{i.bairro} · {i.cidade}</span>
                <span className="block text-sm font-semibold tabular-nums text-tinta">{i.precoTexto}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
      {r.links?.map((l) =>
        l.externo ? (
          <a key={l.href} href={l.href} target="_blank" rel="noopener" data-link-chat="" className="w-fit rounded-full bg-whats px-4 py-2 text-sm font-medium text-white hover:brightness-110">{l.rotulo}</a>
        ) : (
          <Link key={l.href} href={l.href} data-link-chat="" className="w-fit rounded-full border border-mar px-4 py-2 text-sm font-medium text-mar hover:bg-mar hover:text-white">{l.rotulo} →</Link>
        ),
      )}
      {r.sugestoes && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {r.sugestoes.map((s) => (
            <button key={s} type="button" data-sugestao="" onClick={() => aoSugerir(s)} className="rounded-full border border-linha bg-papel px-3 py-1.5 text-xs text-tinta hover:border-mar hover:text-mar">{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Chatbot({ dados }: { dados: DadosChat }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [msgs, setMsgs] = useState<Mensagem[]>([{ de: "bot", resposta: dados.boasVindas }]);
  const [ctx, setCtx] = useState<Contexto>({ filtros: {} });
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => { fim.current?.scrollIntoView({ block: "end" }); }, [msgs, aberto]);

  function enviar(t: string) {
    const limpo = t.trim();
    if (!limpo) return;
    const { resposta, contexto } = responder(dados, limpo, ctx);
    setCtx(contexto);
    setMsgs((m) => [...m, { de: "voce", resposta: { texto: limpo } }, { de: "bot", resposta }]);
    setTexto("");
  }

  return (
    <div data-chatbot="" data-chat={JSON.stringify(dados)}>
      <button
        type="button"
        data-abrir-chat=""
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente virtual"}
        aria-expanded={aberto}
        className="fixed z-30 flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-tinta px-4 text-white sm:px-5 shadow-[0_10px_30px_-8px_rgba(4,34,43,0.6)] transition hover:bg-mar"
        style={{ right: "calc(max(20px, env(safe-area-inset-right)) + 68px)", bottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <IconeChat width={22} height={22} />
        <span className="hidden text-sm font-medium sm:inline">Tire suas dúvidas</span>
      </button>

      <section
        data-painel-chat=""
        hidden={!aberto}
        aria-label="Assistente virtual"
        className="fixed z-40 flex h-[min(560px,calc(100dvh-120px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border border-linha bg-papel shadow-[0_30px_70px_-20px_rgba(4,34,43,0.45)]"
        style={{ right: "max(16px, env(safe-area-inset-right))", bottom: "calc(max(16px, env(safe-area-inset-bottom)) + 72px)" }}
      >
        <div className="flex items-center gap-3 bg-tinta px-4 py-3 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/icone.png" alt="" width={36} height={36} className="h-9 w-9 rounded-full bg-white p-1" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Assistente GG Imóveis</p>
            <p className="text-xs text-white/65">Respostas automáticas</p>
          </div>
          <button type="button" data-fechar-chat="" onClick={() => setAberto(false)} aria-label="Fechar assistente" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
            <IconeFechar />
          </button>
        </div>
        <div data-mensagens="" className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
          {msgs.map((m, k) => (<Balao key={k} m={m} aoSugerir={enviar} />))}
          <div ref={fim} />
        </div>
        <form
          data-form-chat=""
          onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
          className="flex items-center gap-2 border-t border-linha p-3"
        >
          <input
            id="chat-texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex.: apê 2 quartos em Santos até 600 mil"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-full border border-linha bg-papel px-4 py-2.5 text-sm outline-none focus:border-mar"
          />
          <button type="submit" aria-label="Enviar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mar text-white hover:bg-tinta">
            <IconeEnviar width={18} height={18} />
          </button>
        </form>
      </section>
    </div>
  );
}
