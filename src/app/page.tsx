import Link from "next/link";
import { BuscaRapida } from "@/components/BuscaRapida";
import { Carrossel } from "@/components/Carrossel";
import { Revelar } from "@/components/Revelar";
import { CardImovel } from "@/components/CardImovel";
import { IconeCheck, IconeChevron, IconeSeta, IconeWhatsApp } from "@/components/Icones";
import { cidades } from "@/data/imoveis";
import { listarPublicos } from "@/lib/banco";
import { linkWhatsApp, SITE } from "@/lib/site";

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

export const dynamic = "force-dynamic";

export default async function Inicio() {
  const imoveis = await listarPublicos();
  // Imóveis marcados como destaque primeiro, do mais recente para o mais antigo (o banco já vem nessa ordem).
  const destaques = [...imoveis].sort((a, b) => Number(b.destaque) - Number(a.destaque)).slice(0, 12);

  return (
    <>
      {/* ABERTURA: vídeo do litoral, logo, contato e busca */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-tinta">
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          src="/videos/abertura.mp4?v=2" poster="/videos/abertura-capa.jpg?v=2"
          autoPlay muted loop playsInline preload="metadata" aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(4,34,43,0.35)_0%,rgba(4,34,43,0.75)_75%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(4,34,43,0.9))]" />
        <div className="container-site flex flex-col items-center pb-24 pt-32 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/logo-clara.png" alt="GG Imóveis Litoral" className="h-28 w-auto animate-surgir drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)] sm:h-36 md:h-44" />
          <p className="rotulo mt-5 animate-surgir text-white/70 [animation-delay:150ms]">{SITE.creci} · Corretor Gustavo</p>
          <p className="mt-6 max-w-2xl animate-surgir font-display text-2xl leading-snug text-white [animation-delay:300ms] md:text-4xl">
            Seu imóvel no litoral paulista, com quem conhece <em className="text-[#ffd24d]">cada quadra</em>.
          </p>
          <p className="mt-4 animate-surgir text-sm text-white/75 [animation-delay:420ms] md:text-base">
            {cidades.map((c) => c.nome).join(" · ")}
          </p>
          <a href={linkWhatsApp("Olá! Vim pelo site e gostaria de falar sobre imóveis.")} target="_blank" rel="noopener"
            className="mt-7 inline-flex animate-surgir items-center gap-2 rounded-full bg-whats px-6 py-3 font-medium text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition [animation-delay:540ms] hover:brightness-110">
            <IconeWhatsApp /> (13) 99777-1730
          </a>
          <div className="mt-10 w-full max-w-5xl animate-surgir text-left [animation-delay:680ms]">
            <BuscaRapida />
          </div>
        </div>
        <a href="#disponiveis" aria-label="Ver imóveis disponíveis" className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/70 hover:text-white">
          <IconeChevron className="rotate-90" width={30} height={30} />
        </a>
      </section>

      {/* IMÓVEIS DISPONÍVEIS (carrossel) */}
      <section id="disponiveis" className="container-site scroll-mt-20 py-20 md:py-28">
        <Revelar className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="rotulo text-latao-escuro">{imoveis.length} {imoveis.length === 1 ? "imóvel disponível" : "imóveis disponíveis"}</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Imóveis à venda e para alugar</h2>
          </div>
          <Link href="/imoveis/" className="flex items-center gap-2 font-medium text-mar hover:text-latao-escuro">
            Ver todos com filtros <IconeSeta />
          </Link>
        </Revelar>
        <Revelar atraso={150} className="mt-12">
          <Carrossel rotulo="Imóveis disponíveis">
            {destaques.map((i) => (<CardImovel key={i.slug} imovel={i} />))}
          </Carrossel>
        </Revelar>
      </section>

      {/* REGIÕES (carrossel) */}
      <section id="regioes" className="scroll-mt-20 bg-nevoa py-20 md:py-28">
        <div className="container-site">
          <Revelar className="max-w-2xl">
            <p className="rotulo text-latao-escuro">Onde atuo</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Regiões que atendemos</h2>
            <p className="mt-4 text-lg text-cinza">Escolha a cidade e veja os imóveis disponíveis em cada uma.</p>
          </Revelar>
          <Revelar atraso={150} className="mt-12">
            <Carrossel rotulo="Regiões atendidas" intervalo={4500} larguraItem="min(80%,320px)">
              {cidades.map((c) => {
                const qtd = imoveis.filter((i) => i.cidade === c.nome).length;
                return (
                  <Link key={c.slug} href={`/imoveis/?cidade=${c.slug}`} className="group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-sm p-6 text-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.imagem} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,34,43,0)_35%,rgba(4,34,43,0.92)_100%)]" />
                    <h3 className="font-display text-3xl">{c.nome}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/80">{c.bairros.slice(0, 4).join(" · ")}</p>
                    <span className="mt-4 flex items-center gap-2 text-sm font-medium text-[#ffd24d]">
                      {qtd === 0 ? "Consultar imóveis" : `${qtd} ${qtd === 1 ? "imóvel disponível" : "imóveis disponíveis"}`} <IconeSeta width={16} height={16} />
                    </span>
                  </Link>
                );
              })}
            </Carrossel>
          </Revelar>
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
                <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tinta text-[#ffd24d]">
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

      {/* VENDER */}
      <section id="vender" className="scroll-mt-20 bg-tinta text-white">
        <div className="container-site grid items-center gap-14 py-24 md:py-28 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotos/varanda-gourmet.jpg" alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="rotulo text-[#ffd24d]">Para proprietários</p>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">Quer vender ou alugar seu imóvel no litoral?</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
              Faço a avaliação sem custo e apresento um plano de divulgação para vender pelo melhor valor, com segurança em cada etapa.
            </p>
            <ul className="mt-8 space-y-3">
              {["Avaliação gratuita com base no mercado do bairro", "Fotos e anúncio profissionais", "Divulgação nos principais portais e redes sociais", "Acompanhamento até a escritura"].map((t) => (
                <li key={t} className="flex items-start gap-3 text-white/85">
                  <IconeCheck className="mt-0.5 shrink-0 text-[#ffd24d]" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/anunciar/" className="inline-flex items-center justify-center gap-2 rounded-full bg-latao px-7 py-4 font-semibold text-tinta transition hover:brightness-105">
                Anunciar meu imóvel <IconeSeta />
              </Link>
              <Link href="/avaliacao/" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 font-medium text-white transition hover:border-white">
                Avaliação gratuita
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="container-site grid gap-6 pt-24 md:grid-cols-3 md:pt-28">
        {[
          { href: "/anunciar/", foto: "casa-praia", titulo: "Anuncie seu imóvel", texto: "Cadastre para vender ou alugar. Eu cuido das fotos, do anúncio e dos interessados." },
          { href: "/avaliacao/", foto: "avaliacao", titulo: "Avaliação gratuita", texto: "Saiba quanto vale seu imóvel com base em negócios reais do bairro." },
          { href: "/drone/", foto: "drone", titulo: "Fotos com drone", texto: "Imagens aéreas e vídeos que valorizam a vista e a localização." },
        ].map((s) => (
          <Link key={s.href} href={s.href} className="group flex flex-col">
            <span className="block aspect-[4/3] overflow-hidden bg-nevoa">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/fotos/${s.foto}.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            </span>
            <span className="mt-5 font-display text-2xl group-hover:text-mar">{s.titulo}</span>
            <span className="mt-2 text-cinza">{s.texto}</span>
            <span className="mt-4 flex items-center gap-2 text-sm font-medium text-mar">Saiba mais <IconeSeta width={16} height={16} /></span>
          </Link>
        ))}
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
