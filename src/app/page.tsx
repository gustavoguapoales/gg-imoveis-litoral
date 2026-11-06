import Link from "next/link";
import { BuscaRapida } from "@/components/BuscaRapida";
import { CardImovel } from "@/components/CardImovel";
import { IconeCheck, IconeSeta, IconeWhatsApp } from "@/components/Icones";
import { cidades, imoveis } from "@/data/imoveis";
import { linkWhatsApp } from "@/lib/site";

const SERVICOS = [
  { titulo: "Compra assistida", texto: "Seleciono imóveis de acordo com o seu perfil e acompanho cada visita, sem você perder tempo com opções que não servem." },
  { titulo: "Venda do seu imóvel", texto: "Fotos profissionais, divulgação nos principais portais e atendimento dos interessados até o fechamento." },
  { titulo: "Avaliação de mercado", texto: "Preço definido com base em vendas reais do bairro, para vender no prazo certo e sem deixar dinheiro na mesa." },
  { titulo: "Documentação e financiamento", texto: "Análise da matrícula, certidões e apoio na simulação e aprovação do financiamento bancário." },
];

const ETAPAS = [
  { titulo: "Conversa", texto: "Entendo o que você busca, o bairro ideal e o orçamento." },
  { titulo: "Seleção", texto: "Envio apenas os imóveis que fazem sentido para você." },
  { titulo: "Visitas", texto: "Agendo e acompanho as visitas, inclusive por vídeo." },
  { titulo: "Negociação e escritura", texto: "Cuido da proposta, do contrato e da documentação até a entrega das chaves." },
];

export default function Inicio() {
  const destaques = [...imoveis].sort((a, b) => Number(b.destaque) - Number(a.destaque)).slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-tinta">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ilustracoes/hero-orla.svg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(14,43,51,0.55)_0%,rgba(14,43,51,0.15)_40%,rgba(14,43,51,0.85)_100%)] max-md:bg-[linear-gradient(180deg,rgba(14,43,51,0.7)_0%,rgba(14,43,51,0.45)_45%,rgba(14,43,51,0.9)_100%)]" />
        <div className="container-site flex min-h-[640px] flex-col justify-end pb-14 pt-36 md:min-h-[760px] md:pb-20">
          <p className="rotulo animate-surgir text-white/75">Santos · São Vicente · Praia Grande · Guarujá</p>
          <h1 className="mt-5 max-w-4xl animate-surgir font-display text-[2.7rem] leading-[1.05] text-white [animation-delay:120ms] sm:text-6xl md:text-[5.2rem]">
            Morar perto do mar, com quem conhece <em className="text-[#f0d3a4]">cada quadra</em>.
          </h1>
          <p className="mt-6 max-w-xl animate-surgir text-lg leading-relaxed text-white/80 [animation-delay:240ms]">
            Apartamentos, coberturas e casas no litoral paulista, com atendimento direto do corretor do começo ao fim.
          </p>
          <div className="mt-10 animate-surgir [animation-delay:360ms]">
            <BuscaRapida />
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container-site py-24 md:py-32">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="rotulo text-latao-escuro">Selecionados</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Imóveis em destaque</h2>
          </div>
          <Link href="/imoveis/" className="flex items-center gap-2 font-medium text-mar hover:text-latao-escuro">
            Ver todos os imóveis <IconeSeta />
          </Link>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {destaques.map((i) => (<CardImovel key={i.slug} imovel={i} />))}
        </div>
      </section>

      {/* ATUAÇÃO */}
      <section id="atuacao" className="scroll-mt-20 bg-nevoa">
        <div className="container-site grid gap-16 py-24 md:py-32 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="rotulo text-latao-escuro">Como trabalho</p>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-[3.2rem]">
              Atendimento de corretor, não de central de atendimento.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cinza">
              Na GG Imóveis Litoral você fala sempre com a mesma pessoa. Conheço os bairros, os prédios e o preço real de cada
              região, e isso faz diferença na hora de comprar bem ou vender rápido.
            </p>
            <ol className="mt-12 grid gap-6 sm:grid-cols-2">
              {ETAPAS.map((e, k) => (
                <li key={e.titulo} className="border-t border-tinta/20 pt-4">
                  <span className="rotulo text-latao-escuro">Etapa {k + 1}</span>
                  <p className="mt-2 font-display text-xl">{e.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-cinza">{e.texto}</p>
                </li>
              ))}
            </ol>
          </div>
          <ul className="grid content-start gap-px self-start overflow-hidden rounded-sm bg-linha">
            {SERVICOS.map((s) => (
              <li key={s.titulo} className="flex gap-5 bg-papel p-7 md:p-9">
                <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tinta text-[#f0d3a4]">
                  <IconeCheck width={17} height={17} />
                </span>
                <div>
                  <h3 className="font-display text-2xl">{s.titulo}</h3>
                  <p className="mt-2 leading-relaxed text-cinza">{s.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* REGIÕES */}
      <section id="regioes" className="container-site scroll-mt-20 py-24 md:py-32">
        <div className="max-w-2xl">
          <p className="rotulo text-latao-escuro">Onde atuo</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Quatro cidades, cada uma com seu jeito de viver o litoral</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {cidades.map((c) => {
            const qtd = imoveis.filter((i) => i.cidade === c.nome).length;
            return (
              <Link key={c.slug} href={`/imoveis/?cidade=${c.slug}`} className="group relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden p-7 text-white md:p-9">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imagem} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(14,43,51,0)_20%,rgba(14,43,51,0.92)_100%)]" />
                <p className="rotulo text-white/70">{c.coordenadas}</p>
                <h3 className="mt-2 font-display text-4xl md:text-5xl">{c.nome}</h3>
                <p className="mt-3 max-w-md text-white/80">{c.texto}</p>
                <p className="mt-4 text-sm text-white/65">{c.bairros.join(" · ")}</p>
                <span className="mt-6 flex items-center gap-2 text-sm font-medium text-[#f0d3a4]">
                  {qtd} {qtd === 1 ? "imóvel disponível" : "imóveis disponíveis"} <IconeSeta width={16} height={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* VENDER */}
      <section id="vender" className="scroll-mt-20 bg-tinta text-white">
        <div className="container-site grid items-center gap-14 py-24 md:py-28 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ilustracoes/sala-entardecer.svg" alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="rotulo text-[#f0d3a4]">Para proprietários</p>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">Quer vender seu imóvel no litoral?</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
              Faço a avaliação sem custo e apresento um plano de divulgação para vender pelo melhor valor, com segurança em cada etapa.
            </p>
            <ul className="mt-8 space-y-3">
              {["Avaliação gratuita com base no mercado do bairro", "Fotos e anúncio profissionais", "Divulgação nos principais portais e redes sociais", "Acompanhamento até a escritura"].map((t) => (
                <li key={t} className="flex items-start gap-3 text-white/85">
                  <IconeCheck className="mt-0.5 shrink-0 text-[#f0d3a4]" /> {t}
                </li>
              ))}
            </ul>
            <a
              href={linkWhatsApp("Olá! Tenho um imóvel no litoral e gostaria de uma avaliação para venda.")}
              target="_blank"
              rel="noopener"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-whats px-7 py-4 font-medium text-white transition hover:brightness-110"
            >
              <IconeWhatsApp /> Solicitar avaliação gratuita
            </a>
          </div>
        </div>
      </section>

      {/* CONTATO RÁPIDO */}
      <section className="container-site py-24 text-center md:py-28">
        <h2 className="mx-auto max-w-3xl font-display text-4xl leading-tight md:text-5xl">
          Não encontrou o imóvel ideal? <em className="text-mar">Eu procuro para você.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-cinza">
          Diga o bairro, o tamanho e o valor que você tem em mente. Muitos imóveis chegam até mim antes de irem para os portais.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={linkWhatsApp("Olá! Estou procurando um imóvel no litoral e gostaria de ajuda.")} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 rounded-full bg-whats px-7 py-4 font-medium text-white transition hover:brightness-110">
            <IconeWhatsApp /> Falar no WhatsApp
          </a>
          <Link href="/contato/" className="inline-flex items-center justify-center gap-2 rounded-full border border-tinta/25 px-7 py-4 font-medium transition hover:border-tinta">
            Preencher formulário
          </Link>
        </div>
      </section>
    </>
  );
}
