import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardImovel, distanciaTexto, Especificacoes } from "@/components/CardImovel";
import { FormContato } from "@/components/FormContato";
import { Galeria } from "@/components/Galeria";
import { IconeCheck, IconeOnda, IconePino, IconeWhatsApp } from "@/components/Icones";
import { getImovel, imoveis } from "@/data/imoveis";
import { formatarPreco, linkWhatsApp, SITE } from "@/lib/site";

export function generateStaticParams() {
  return imoveis.map((i) => ({ slug: i.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/imoveis/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const i = getImovel(slug);
  if (!i) return {};
  return {
    title: `${i.titulo}, ${i.bairro}, ${i.cidade}`,
    description: `${i.tipo} à venda em ${i.bairro}, ${i.cidade}: ${i.area} m², ${i.dormitorios} dormitórios, ${i.vagas} vagas. ${formatarPreco(i.preco)}. ${i.resumo}`,
    alternates: { canonical: `/imoveis/${i.slug}/` },
    openGraph: { images: [i.imagens[0]] },
  };
}

export default async function PaginaImovel({ params }: PageProps<"/imoveis/[slug]">) {
  const { slug } = await params;
  const i = getImovel(slug);
  if (!i) notFound();

  const msg = `Olá! Tenho interesse no imóvel Ref ${i.ref} (${i.titulo}, ${i.bairro}, ${i.cidade}). Pode me passar mais informações?`;
  const semelhantes = imoveis.filter((o) => o.slug !== i.slug && (o.cidade === i.cidade || o.tipo === i.tipo)).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: i.titulo,
    url: `${SITE.url}/imoveis/${i.slug}/`,
    offers: { "@type": "Offer", price: i.preco, priceCurrency: "BRL" },
    address: { "@type": "PostalAddress", addressLocality: i.cidade, addressRegion: "SP", addressCountry: "BR" },
  };

  return (
    <div className="pt-24 md:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-site">
        <nav aria-label="Você está em" className="rotulo flex flex-wrap gap-2 py-5 text-cinza">
          <Link href="/" className="hover:text-tinta">Início</Link> /
          <Link href="/imoveis/" className="hover:text-tinta">Imóveis</Link> /
          <Link href={`/imoveis/?cidade=${i.cidade.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ /g, "-")}`} className="hover:text-tinta">{i.cidade}</Link> /
          <span className="text-tinta">Ref {i.ref}</span>
        </nav>
        <Galeria imagens={i.imagens} titulo={i.titulo} />
      </div>

      <div className="container-site grid gap-14 py-12 lg:grid-cols-[1fr_380px] lg:py-16">
        <div className="min-w-0">
          <p className="rotulo text-latao-escuro">{i.tipo} à venda · Ref {i.ref}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{i.titulo}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-cinza">
            <span className="flex items-center gap-1.5"><IconePino /> {i.bairro}, {i.cidade} · SP</span>
            <span className="flex items-center gap-1.5"><IconeOnda /> {distanciaTexto(i.distanciaPraia)}{i.vistaMar ? " · vista mar" : ""}</span>
          </p>

          <div className="mt-6 flex items-center justify-between gap-4 border-y border-linha py-5 lg:hidden">
            <div>
              <p className="text-xs text-cinza">Valor de venda</p>
              <p className="text-2xl font-semibold tabular-nums">{formatarPreco(i.preco)}</p>
            </div>
            <a href={linkWhatsApp(msg)} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-full bg-whats px-5 py-3 text-sm font-medium text-white">
              <IconeWhatsApp width={17} height={17} /> Consultar
            </a>
          </div>

          <div className="mt-8"><Especificacoes imovel={i} /></div>

          <section className="mt-12">
            <h2 className="font-display text-3xl">Sobre o imóvel</h2>
            <div className="mt-5 max-w-[68ch] space-y-4 text-[1.05rem] leading-relaxed text-tinta/85">
              {i.descricao.map((p) => (<p key={p.slice(0, 20)}>{p}</p>))}
            </div>
          </section>

          <section className="mt-12 grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl">Características</h2>
              <ul className="mt-5 space-y-2.5">
                {i.caracteristicas.map((c) => (<li key={c} className="flex items-center gap-3"><IconeCheck className="text-mar" /> {c}</li>))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl">Lazer do condomínio</h2>
              <ul className="mt-5 space-y-2.5">
                {i.lazer.map((c) => (<li key={c} className="flex items-center gap-3"><IconeCheck className="text-mar" /> {c}</li>))}
              </ul>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-3xl">Localização</h2>
            <div className="mt-5 flex flex-col gap-5 rounded-sm border border-linha bg-nevoa p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-medium">{i.bairro}, {i.cidade} · SP</p>
                <p className="mt-1 text-sm text-cinza">O endereço exato é informado no agendamento da visita.</p>
              </div>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${i.bairro}, ${i.cidade}, SP`)}`} target="_blank" rel="noopener" className="shrink-0 rounded-full border border-tinta/25 px-5 py-2.5 text-sm font-medium hover:border-tinta">
                Ver bairro no mapa
              </a>
            </div>
          </section>

          <section className="mt-12" id="interesse">
            <h2 className="font-display text-3xl">Tenho interesse</h2>
            <p className="mt-2 text-cinza">Deixe seus dados e eu retorno com fotos, vídeo e horários de visita.</p>
            <div className="mt-6"><FormContato imovelRef={i.ref} /></div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-sm border border-linha bg-papel p-7 shadow-[0_24px_50px_-30px_rgba(14,43,51,0.35)]">
            <p className="text-sm text-cinza">Valor de venda</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums">{formatarPreco(i.preco)}</p>
            <dl className="mt-6 space-y-2 border-t border-linha pt-5 text-sm">
              {i.condominio && (<div className="flex justify-between"><dt className="text-cinza">Condomínio</dt><dd className="tabular-nums">{formatarPreco(i.condominio)}/mês</dd></div>)}
              {i.iptu && (<div className="flex justify-between"><dt className="text-cinza">IPTU</dt><dd className="tabular-nums">{formatarPreco(i.iptu)}/mês</dd></div>)}
              <div className="flex justify-between"><dt className="text-cinza">Valor por m²</dt><dd className="tabular-nums">{formatarPreco(Math.round(i.preco / i.area))}</dd></div>
            </dl>
            <a href={linkWhatsApp(msg)} target="_blank" rel="noopener" className="mt-7 flex items-center justify-center gap-2 rounded-full bg-whats py-4 font-medium text-white transition hover:brightness-110">
              <IconeWhatsApp /> Consultar pelo WhatsApp
            </a>
            <a href="#interesse" className="mt-3 flex items-center justify-center rounded-full border border-tinta/25 py-3.5 text-sm font-medium hover:border-tinta">
              Agendar visita
            </a>
            <p className="mt-5 text-center text-xs text-cinza">Atendimento direto com o corretor · {SITE.whatsappExibicao}</p>
          </div>
        </aside>
      </div>

      {semelhantes.length > 0 && (
        <section className="border-t border-linha bg-nevoa">
          <div className="container-site py-20">
            <h2 className="font-display text-3xl md:text-4xl">Você também pode gostar</h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {semelhantes.map((s) => (<CardImovel key={s.slug} imovel={s} />))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
