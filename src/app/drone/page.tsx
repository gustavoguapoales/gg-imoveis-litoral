import type { Metadata } from "next";
import { AgendarDrone } from "@/components/AgendarDrone";
import { IconeCheck, IconeWhatsApp } from "@/components/Icones";
import { linkDrone } from "@/lib/drone";

export const metadata: Metadata = {
  title: "Filmagem com drone para imóveis e obras",
  description: "Fotos e vídeos aéreos com drone de terrenos, prédios, casas e obras no litoral paulista, com edição profissional e recursos de inteligência artificial.",
  alternates: { canonical: "/drone/" },
};

const SERVICOS = [
  { titulo: "Terrenos e lotes", texto: "Visão completa da área, dos acessos e da vizinhança. Ajuda o comprador a entender o tamanho e o potencial do terreno sem precisar visitá-lo." },
  { titulo: "Prédios e condomínios", texto: "Fachada, área de lazer, vista dos andares e a posição do empreendimento no bairro, com a distância real até a praia." },
  { titulo: "Casas prontas", texto: "Imagens do imóvel e do entorno para anúncios de venda ou locação que se destacam nos portais e nas redes sociais." },
  { titulo: "Acompanhamento de obras", texto: "Registros periódicos feitos do mesmo ponto de vista, para mostrar a evolução da construção a clientes, investidores e compradores na planta." },
];

const PACOTES = [
  { nome: "Fotos aéreas", ideal: "Apartamentos e casas", itens: ["15 fotos aéreas tratadas", "Vista da praia e do entorno", "Entrega em até 3 dias"] },
  { nome: "Fotos + vídeo", ideal: "Anúncios de alto padrão", destaque: true, itens: ["25 fotos aéreas tratadas", "Vídeo de 60 a 90 segundos com trilha", "Versão vertical para Reels e Stories"] },
  { nome: "Obras e terrenos", ideal: "Construtoras e loteamentos", itens: ["Registro mensal da obra", "Vídeo de evolução", "Projeção do imóvel pronto com IA"] },
];

export default function PaginaDrone() {
  return (
    <div className="pb-28">
      <section className="relative isolate overflow-hidden bg-tinta pb-20 pt-40 text-white md:pt-48">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fotos/drone.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,34,43,0.9)_0%,rgba(4,34,43,0.55)_55%,rgba(4,34,43,0.2)_100%)]" />
        <div className="container-site">
          <p className="rotulo text-[#ffd24d]">Filmagem com drone</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl leading-tight md:text-6xl">Mostre o imóvel e tudo o que está em volta dele.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
            Fotos e vídeos aéreos de terrenos, prédios, casas e obras no litoral paulista, com edição profissional.
          </p>
          <a href={linkDrone()} target="_blank" rel="noopener" className="mt-9 inline-flex items-center gap-2 rounded-full bg-whats px-7 py-4 font-medium text-white transition hover:brightness-110">
            <IconeWhatsApp /> Ver preço
          </a>
        </div>
      </section>

      {/* SOBRE O SERVIÇO */}
      <section className="container-site grid gap-14 py-20 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="rotulo text-latao-escuro">Como trabalho</p>
          <h2 className="mt-3 font-display text-4xl leading-tight">Imagens aéreas que ajudam a vender, alugar e acompanhar.</h2>
          <div className="mt-6 max-w-[60ch] space-y-4 text-[1.05rem] leading-relaxed text-tinta/85">
            <p>
              Sou o Gustavo, corretor da GG Imóveis Litoral, e também faço as filmagens com drone. Planejo cada voo de acordo com
              o imóvel e com o objetivo do material: anúncio, apresentação a investidores ou registro de obra.
            </p>
            <p>
              Atendo terrenos, prédios e casas prontas. Em obras, faço registros periódicos que mostram o andamento da construção
              e, com ferramentas de inteligência artificial, monto vídeos de apresentação que projetam como o imóvel ficará depois de pronto.
            </p>
          </div>
          <div className="mt-8 rounded-sm border border-latao/40 bg-latao/10 p-5">
            <p className="font-medium">Vídeos com inteligência artificial (opcional)</p>
            <p className="mt-1 text-sm leading-relaxed text-cinza">
              Edição com recursos de IA para criar vídeos de lançamento, apresentações de obra e projeções do imóvel finalizado.
            </p>
          </div>
        </div>
        <ul className="grid gap-px self-start overflow-hidden rounded-sm bg-linha sm:grid-cols-2">
          {SERVICOS.map((s) => (
            <li key={s.titulo} className="bg-papel p-7">
              <IconeCheck className="text-mar" width={22} height={22} />
              <h3 className="mt-3 font-display text-2xl">{s.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cinza">{s.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* VÍDEO DE EXEMPLO */}
      <section className="bg-tinta py-20 text-white">
        <div className="container-site">
          <p className="rotulo text-[#ffd24d]">Exemplo de vídeo</p>
          <h2 className="mt-3 font-display text-4xl">Veja como fica o resultado</h2>
          <div className="mt-10 overflow-hidden rounded-sm bg-black shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
            <video
              className="aspect-video w-full"
              src="/videos/drone-exemplo.mp4"
              poster="/videos/drone-exemplo-capa.jpg"
              controls
              muted
              playsInline
              preload="metadata"
            />
          </div>
          <p className="mt-3 text-xs text-white/55">Vídeo de demonstração montado com imagens ilustrativas.</p>
        </div>
      </section>

      {/* PACOTES */}
      <section className="container-site py-20">
        <p className="rotulo text-latao-escuro">Pacotes de exemplo</p>
        <h2 className="mt-3 font-display text-4xl">Escolha o que o seu imóvel precisa</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PACOTES.map((p) => (
            <div key={p.nome} className={`flex flex-col rounded-sm border p-7 ${p.destaque ? "border-tinta bg-tinta text-white" : "border-linha bg-papel"}`}>
              <p className={`rotulo ${p.destaque ? "text-[#ffd24d]" : "text-cinza"}`}>{p.ideal}</p>
              <h3 className="mt-2 font-display text-2xl">{p.nome}</h3>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {p.itens.map((i) => (<li key={i} className="flex items-start gap-2"><IconeCheck className={`mt-0.5 shrink-0 ${p.destaque ? "text-[#ffd24d]" : "text-mar"}`} /> {i}</li>))}
              </ul>
              <p className={`mt-6 text-sm ${p.destaque ? "text-white/70" : "text-cinza"}`}>Valor sob consulta</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARCAR SERVIÇO */}
      <section id="marcar" className="container-site scroll-mt-24">
        <div className="grid gap-10 rounded-sm border border-linha bg-nevoa p-6 md:p-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="font-display text-3xl">Consultar preço</h2>
            <p className="mt-3 text-cinza">
              Informe o que será filmado e o local. Envio pelo WhatsApp o valor e as datas disponíveis para o voo.
            </p>
          </div>
          <AgendarDrone />
        </div>
      </section>
    </div>
  );
}
