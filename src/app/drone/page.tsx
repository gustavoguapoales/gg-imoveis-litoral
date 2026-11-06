import type { Metadata } from "next";
import { FormWhatsApp } from "@/components/FormWhatsApp";
import { IconeCheck } from "@/components/Icones";

export const metadata: Metadata = {
  title: "Fotos e vídeos com drone para imóveis",
  description: "Fotos aéreas e vídeos com drone para anúncios de imóveis, condomínios e terrenos no litoral paulista.",
  alternates: { canonical: "/drone/" },
};

const PACOTES = [
  { nome: "Fotos aéreas", ideal: "Apartamentos e casas", itens: ["15 fotos aéreas tratadas", "Vista da praia e do entorno", "Entrega em até 3 dias"] },
  { nome: "Fotos + vídeo", ideal: "Anúncios de alto padrão", destaque: true, itens: ["25 fotos aéreas tratadas", "Vídeo de 60 a 90 segundos com trilha", "Versão vertical para Reels e Stories"] },
  { nome: "Terrenos e obras", ideal: "Loteamentos e construtoras", itens: ["Fotos com marcação do lote", "Acompanhamento mensal de obra", "Vídeo de evolução"] },
];

export default function PaginaDrone() {
  return (
    <div className="pb-28">
      <section className="relative isolate overflow-hidden bg-tinta pb-20 pt-40 text-white md:pt-48">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fotos/drone.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,34,43,0.9)_0%,rgba(4,34,43,0.55)_55%,rgba(4,34,43,0.2)_100%)]" />
        <div className="container-site">
          <p className="rotulo text-[#ffd24d]">Serviço de drone</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl leading-tight md:text-6xl">Mostre o imóvel e tudo o que está em volta dele.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
            Fotos aéreas e vídeos que mostram a vista, a distância da praia e o bairro. Anúncios com imagens de drone chamam mais atenção nos portais.
          </p>
        </div>
      </section>

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

        <div className="mt-16 grid gap-3 sm:grid-cols-3">
          {["hero", "praia-grande", "guaruja"].map((f) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f} src={`/fotos/${f}.jpg`} alt="Exemplo de foto aérea do litoral" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          ))}
        </div>
        <p className="mt-3 text-xs text-cinza">Exemplos de enquadramento aéreo. Imagens ilustrativas.</p>
      </section>

      <section className="container-site">
        <div className="grid gap-10 rounded-sm border border-linha bg-nevoa p-6 md:p-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-3xl">Solicite um orçamento</h2>
            <p className="mt-3 text-cinza">Informe o tipo de imóvel e o local. Respondo com o valor e a data disponível para o voo.</p>
          </div>
          <FormWhatsApp
            id="drone"
            cabecalho="Olá! Gostaria de um orçamento de fotos/vídeo com drone."
            botao="Pedir orçamento"
            campos={[
              { nome: "pacote", rotulo: "Pacote", tipo: "select", opcoes: PACOTES.map((p) => p.nome) },
              { nome: "imovel", rotulo: "Tipo de imóvel", tipo: "select", opcoes: ["Apartamento", "Casa", "Condomínio", "Terreno", "Obra", "Comercial"] },
              { nome: "local", rotulo: "Cidade e bairro", obrigatorio: true, inteiro: true, placeholder: "Ex.: Guarujá, Enseada" },
              { nome: "nome", rotulo: "Seu nome", obrigatorio: true },
              { nome: "telefone", rotulo: "Telefone / WhatsApp", tipo: "tel", obrigatorio: true, placeholder: "(13) 90000-0000" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
